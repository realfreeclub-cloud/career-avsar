import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { shareCandidateWithSchoolAdmin } from "@/server/services/admin/applications";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const { id } = await params;
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return fail("VALIDATION_ERROR", "Invalid application ID format", 400);
    }

    const body = await req.json().catch(() => ({}));
    const {
      schoolId,
      schoolName,
      contactPerson,
      contactEmail,
      contactPhone,
      channel,
      includedFields,
      authorizationNote,
    } = body;

    if (!contactPerson || typeof contactPerson !== "string" || !contactPerson.trim()) {
      return fail("VALIDATION_ERROR", "A target school contact person is required", 400);
    }

    if (!authorizationNote || typeof authorizationNote !== "string" || !authorizationNote.trim()) {
      return fail("VALIDATION_ERROR", "An admin authorization note is mandatory for auditing candidate dossier shares", 400);
    }

    const result = await shareCandidateWithSchoolAdmin(id, {
      schoolId,
      schoolName,
      contactPerson: contactPerson.trim(),
      contactEmail,
      contactPhone,
      channel: channel || "email",
      includedFields: Array.isArray(includedFields) ? includedFields : ["name", "qualifications", "experience", "resume"],
      authorizationNote: authorizationNote.trim(),
      actorUserId: auth.userId,
      actorName: "Admin Officer",
    });

    if (!result.ok) {
      return fail("BAD_REQUEST", result.message, 400);
    }

    return ok({ shared: true, message: result.message });
  } catch (err) {
    return handleApiError(err);
  }
}
