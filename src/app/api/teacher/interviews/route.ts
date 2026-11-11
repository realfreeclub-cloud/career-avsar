import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher } from "@/lib/auth";
import { listTeacherInterviews } from "@/server/services/teacher/dashboard";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InterviewModel } from "@/lib/db/models/teacher/interview";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const items = await listTeacherInterviews(auth.userId);
    return ok({ items, total: items.length });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    const { id, action, note } = body;
    if (!id || typeof id !== "string") {
      return fail("BAD_REQUEST", "Interview ID is required", 400);
    }

    if (action === "confirm") {
      await connectToDatabase();
      const iv = await InterviewModel.findOne({ _id: id, teacherUserId: auth.userId });
      if (!iv) return fail("NOT_FOUND", "Interview round not found", 404);

      if (iv.status === "cancelled") {
        return fail("BAD_REQUEST", "Cannot confirm attendance for a cancelled interview round.", 400);
      }

      iv.status = "confirmed";
      iv.candidateConfirmedAt = new Date();
      if (typeof note === "string" && note.trim()) {
        iv.candidateAttendanceNote = note.trim();
      }
      await iv.save();

      return ok({ confirmed: true, status: "confirmed" });
    }

    return fail("BAD_REQUEST", "Unsupported action parameter", 400);
  } catch (err) {
    return handleApiError(err);
  }
}
