import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import { env } from "@/lib/env";

export function storageRoot(): string {
  return path.resolve(process.cwd(), env.FILE_STORAGE_LOCAL_DIR);
}

function assertSafeSegment(seg: string): string {
  if (!seg || seg.includes("..") || seg.includes("/") || seg.includes("\\") || path.isAbsolute(seg)) {
    throw new Error("Invalid storage path segment");
  }
  return seg;
}

export function teacherDocKey(userId: string, docId: string, ext: string): string {
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 12) || ".bin";
  return path.join("teachers", assertSafeSegment(userId), "documents", `${assertSafeSegment(docId)}${safeExt.startsWith(".") ? "" : "."}${safeExt}`);
}

export async function writeLocalFile(key: string, data: Buffer): Promise<void> {
  const full = path.resolve(storageRoot(), key);
  if (!full.startsWith(storageRoot())) throw new Error("Invalid storage path");
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, data);
}

export async function readLocalFile(key: string): Promise<Buffer> {
  const full = path.resolve(storageRoot(), key);
  if (!full.startsWith(storageRoot())) throw new Error("Invalid storage path");
  return fs.readFile(full);
}

export async function deleteLocalFile(key: string): Promise<void> {
  const full = path.resolve(storageRoot(), key);
  if (!full.startsWith(storageRoot())) return;
  await fs.unlink(full).catch(() => {});
}
