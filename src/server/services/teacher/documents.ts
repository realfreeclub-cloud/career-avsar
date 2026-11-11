import "server-only";
import path from "node:path";
import crypto from "node:crypto";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import { DOCUMENT_RULES, type DocumentKind } from "@/data/teacher-options";
import { teacherDocKey, writeLocalFile, readLocalFile, deleteLocalFile } from "@/lib/storage/local";

export type UploadResult =
  | { ok: true; document: { id: string; kind: string; originalName: string; mimeType: string; size: number; uploadedAt: string } }
  | { ok: false; status: number; code: string; message: string };

export function validateDocument(kind: DocumentKind, file: { name: string; type: string; size: number }): UploadResult | null {
  const rule = DOCUMENT_RULES[kind];
  if (!rule) return { ok: false, status: 400, code: "INVALID_KIND", message: "Invalid document type" };
  if (!file.size || file.size > rule.maxBytes) {
    return { ok: false, status: 400, code: "FILE_TOO_LARGE", message: `${rule.label} must be ${Math.round(rule.maxBytes / 1024 / 1024)}MB or smaller` };
  }
  const ext = path.extname(file.name || "").toLowerCase();
  const mimeOk = rule.mimes.includes(file.type) || (file.type === "" && rule.accept.includes(ext));
  const extOk = rule.accept.includes(ext);
  if (!mimeOk || !extOk) {
    return { ok: false, status: 400, code: "INVALID_FILE_TYPE", message: `${rule.label} accepts: ${rule.accept.join(", ")}` };
  }
  return null;
}

export async function saveTeacherDocument(userId: string, kind: DocumentKind, file: File): Promise<UploadResult> {
  const invalid = validateDocument(kind, { name: file.name, type: file.type, size: file.size });
  if (invalid) return invalid;
  await connectToDatabase();
  const id = crypto.randomBytes(12).toString("hex");
  const ext = path.extname(file.name).toLowerCase() || (file.type === "application/pdf" ? ".pdf" : ".bin");
  const storageKey = teacherDocKey(userId, id, ext);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeLocalFile(storageKey, buf);
  const doc = { kind, originalName: file.name.slice(0, 200), mimeType: file.type || "application/octet-stream", size: file.size, storageKey, uploadedAt: new Date() };
  const updated = await TeacherProfileModel.findOneAndUpdate(
    { userId },
    { $push: { documents: doc }, $set: { "registration.draftSavedAt": new Date() }, $setOnInsert: { userId } },
    { upsert: true, new: true, projection: { documents: { $slice: -1 } } },
  ).lean<{ documents?: Array<{ _id: unknown; kind: string; originalName: string; mimeType: string; size: number; uploadedAt?: Date }> } | null>();
  const saved = updated?.documents?.[0];
  const outId = saved?._id ? String(saved._id) : id;
  return { ok: true, document: { id: outId, kind, originalName: doc.originalName, mimeType: doc.mimeType, size: doc.size, uploadedAt: doc.uploadedAt.toISOString() } };
}

export async function getTeacherDocumentForOwner(userId: string, docId: string) {
  await connectToDatabase();
  const profile = await TeacherProfileModel.findOne(
    { userId, "documents._id": docId },
    { documents: { $elemMatch: { _id: docId } } },
  ).lean<{ documents?: Array<{ _id: unknown; kind: string; originalName: string; mimeType: string; storageKey: string }> } | null>();
  const doc = profile?.documents?.[0];
  if (!doc || !doc.storageKey) return null;
  return { ...doc, id: String(doc._id) };
}

export async function getTeacherDocumentById(docId: string) {
  await connectToDatabase();
  const profile = await TeacherProfileModel.findOne(
    { "documents._id": docId },
    { documents: { $elemMatch: { _id: docId } } },
  ).lean<{ documents?: Array<{ _id: unknown; kind: string; originalName: string; mimeType: string; storageKey: string }> } | null>();
  const doc = profile?.documents?.[0];
  if (!doc || !doc.storageKey) return null;
  return { ...doc, id: String(doc._id) };
}

export async function streamTeacherDocument(userId: string, docId: string, isAdmin?: boolean): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
  const doc = isAdmin ? await getTeacherDocumentById(docId) : await getTeacherDocumentForOwner(userId, docId);
  if (!doc) return null;
  const buffer = await readLocalFile(doc.storageKey).catch(() => null);
  if (!buffer) return null;
  return { buffer, mimeType: doc.mimeType, fileName: doc.originalName };
}

export async function deleteTeacherDocument(userId: string, docId: string): Promise<boolean> {
  const doc = await getTeacherDocumentForOwner(userId, docId);
  if (!doc) return false;
  await connectToDatabase();
  await TeacherProfileModel.updateOne({ userId }, { $pull: { documents: { _id: docId } } });
  await deleteLocalFile(doc.storageKey);
  return true;
}
