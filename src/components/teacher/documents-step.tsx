"use client";
import { GlassPanel } from "@/components/teacher/glass-panel";
import { DocumentUploader } from "@/components/teacher/document-uploader";
import type { TeacherDocument } from "@/types/teacher";

export function DocumentsStep({ docs, onChange }: { docs: TeacherDocument[]; onChange: (docs: TeacherDocument[]) => void }) {
  return (
    <GlassPanel title="Documents" description="Upload supporting documents. Files are stored privately and are accessible only to your authenticated account.">
      <div className="grid gap-4 lg:grid-cols-2">
        {(["resume", "educational", "experience", "training", "tet", "photo"] as const).map((kind) => (
          <DocumentUploader
            key={kind}
            kind={kind}
            documents={docs}
            onUploaded={(doc) => onChange([...docs.filter((d) => !(kind === "photo" && d.kind === "photo")), doc])}
            onDeleted={(id) => onChange(docs.filter((d) => d.id !== id))}
          />
        ))}
      </div>
    </GlassPanel>
  );
}
