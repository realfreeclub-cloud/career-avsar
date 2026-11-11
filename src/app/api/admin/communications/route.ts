import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import {
  listCommunicationsUnifiedAdmin,
  logSchoolCommunicationAdmin,
  getPendingFollowUpsAdmin,
} from "@/server/services/admin/communication";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const sp = new URL(req.url).searchParams;
    const view = sp.get("view");

    if (view === "followups") {
      const followups = await getPendingFollowUpsAdmin(Number(sp.get("limit") || 15));
      return ok({ items: followups });
    }

    const data = await listCommunicationsUnifiedAdmin({
      recipientType: (sp.get("recipientType") as "school" | "teacher" | "all") || "all",
      schoolId: sp.get("schoolId") || undefined,
      channel: sp.get("channel") || undefined,
      status: sp.get("status") || undefined,
      event: sp.get("event") || undefined,
      q: sp.get("q") || undefined,
      page: Number(sp.get("page") || 1),
      limit: Number(sp.get("limit") || 20),
    });

    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    const {
      schoolId,
      schoolName,
      contactPerson,
      contactRole,
      contactEmail,
      contactPhone,
      channel,
      subject,
      body: messageBody,
      relatedJobId,
      relatedJobTitle,
      followUpDate,
      followUpStatus,
    } = body;

    if (!schoolId && !schoolName) {
      return fail("VALIDATION_ERROR", "School affiliation or name is required", 400);
    }

    if (!contactPerson || typeof contactPerson !== "string" || !contactPerson.trim()) {
      return fail("VALIDATION_ERROR", "A contact person name is required", 400);
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return fail("VALIDATION_ERROR", "Communication subject is required", 400);
    }

    if (!messageBody || typeof messageBody !== "string" || !messageBody.trim()) {
      return fail("VALIDATION_ERROR", "Message summary / communication notes are required", 400);
    }

    const res = await logSchoolCommunicationAdmin({
      schoolId: schoolId || "",
      schoolName,
      contactPerson: contactPerson.trim(),
      contactRole,
      contactEmail,
      contactPhone,
      channel: channel || "phone",
      subject: subject.trim(),
      body: messageBody.trim(),
      relatedJobId,
      relatedJobTitle,
      followUpDate,
      followUpStatus,
      actorUserId: auth.userId,
      actorName: "Admin Officer",
    });

    return ok(res, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
