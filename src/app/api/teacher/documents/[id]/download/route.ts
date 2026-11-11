import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { streamTeacherDocument } from "@/server/services/teacher/documents";
import { isFeatureEnabled } from "@/server/services/admin/settings";
import { fail, handleApiError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const downloadEnabled = await isFeatureEnabled("resume_download");
    if (!downloadEnabled) {
      return fail(
        "FORBIDDEN",
        "Document and resume downloads are currently disabled by platform administrators.",
        403,
      );
    }

    const auth = await getAuthContext();
    if (!auth) return fail("UNAUTHORIZED", "Authentication required", 401);
    const { id } = await params;
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return fail("INVALID_ID", "Invalid document id", 400);

    const isAdmin = auth.role === "admin";
    const doc = await streamTeacherDocument(auth.userId, id, isAdmin);
    if (!doc) return fail("NOT_FOUND", "Document not found", 404);
    const body = new Uint8Array(doc.buffer);
    return new NextResponse(body, {
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${doc.fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
