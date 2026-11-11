"use client";
import * as React from "react";
import { UploadCloud, FileText, Trash2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOCUMENT_RULES, type DocumentKind } from "@/data/teacher-options";
import type { TeacherDocument } from "@/types/teacher";

type Doc = TeacherDocument;

export function DocumentUploader({
  kind,
  documents,
  onUploaded,
  onDeleted,
}: {
  kind: DocumentKind;
  documents: Doc[];
  onUploaded: (doc: Doc) => void;
  onDeleted: (id: string) => void;
}) {
  const rule = DOCUMENT_RULES[kind];
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const existing = documents.filter((d) => d.kind === kind);

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (file.size > rule.maxBytes) return setError(`${rule.label} must be ${Math.round(rule.maxBytes / 1024 / 1024)}MB or smaller.`);
    if (!rule.mimes.includes(file.type) && !rule.accept.includes(ext)) return setError(`Invalid file type. Allowed: ${rule.accept.join(", ")}`);
    setBusy(true);
    setProgress(10);
    try {
      const fd = new FormData();
      fd.set("kind", kind);
      fd.set("file", file);
      const xhr = new XMLHttpRequest();
      const res: { ok: boolean; data?: Doc; error?: { message: string } } = await new Promise((resolve, reject) => {
        xhr.open("POST", "/api/teacher/documents");
        xhr.withCredentials = true;
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.max(10, Math.round((e.loaded / e.total) * 100))); };
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error("Invalid upload response")); }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(fd);
      });
      if (!res.ok || !res.data) throw new Error(res.error?.message || "Upload failed");
      onUploaded(res.data);
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
      window.setTimeout(() => setProgress(0), 600);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/documents/${id}`, { method: "DELETE", credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message || "Delete failed");
      onDeleted(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-primary">{rule.label}</p>
          <p className="mt-0.5 text-xs text-muted">Allowed: {rule.accept.join(", ")} &bull; Max {Math.round(rule.maxBytes / 1024 / 1024)}MB</p>
        </div>
        <input ref={inputRef} type="file" accept={rule.accept.join(",")} className="sr-only" aria-label={`Upload ${rule.label}`} onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
          <UploadCloud aria-hidden className="size-4" /> Upload File
        </Button>
      </div>
      {progress > 0 ? (
        <div className="mt-3" aria-label="Upload progress">
          <div className="h-2 overflow-hidden rounded-full bg-[#E8E4DA]"><div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} /></div>
          <p className="mt-1 text-xs text-muted font-medium">{progress}%</p>
        </div>
      ) : null}
      {error ? <p className="mt-2 flex items-start gap-2 text-sm text-danger"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />{error}</p> : null}
      {existing.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {existing.map((d) => (
            <li key={d.id} className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-[#FAF9F5] px-3.5 py-2.5">
              {d.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/teacher/documents/${d.id}/download`} alt="" className="size-10 shrink-0 rounded-md object-cover border border-border" />
              ) : (
                <FileText aria-hidden className="size-5 shrink-0 text-secondary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{d.originalName}</p>
                <p className="text-xs text-muted">{Math.max(1, Math.round(d.size / 1024))} KB</p>
              </div>
              <a href={`/api/teacher/documents/${d.id}/download`} target="_blank" rel="noreferrer" className="touch-target inline-flex items-center justify-center rounded-md px-2 text-muted hover:text-primary" aria-label={`Download ${d.originalName}`}>
                <Download className="size-4" aria-hidden />
              </a>
              <button type="button" onClick={() => remove(d.id)} disabled={busy} className="touch-target inline-flex items-center justify-center rounded-md px-2 text-muted hover:text-danger disabled:opacity-50" aria-label={`Delete ${d.originalName}`}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted"><CheckCircle2 className="size-4 text-muted/60" aria-hidden />No file uploaded yet.</p>
      )}
    </div>
  );
}
