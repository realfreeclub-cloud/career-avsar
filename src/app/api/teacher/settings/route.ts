import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher } from "@/lib/auth";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/user";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    await connectToDatabase();
    const user = await UserModel.findById(auth.userId).lean<{ email?: string; role?: string } | null>();
    return ok({ email: user?.email ?? "", role: user?.role ?? "candidate" });
  } catch (err) {
    return handleApiError(err);
  }
}

const settingsSchema = z.object({
  email: z.string().trim().email().max(200).optional(),
});

export async function PUT(req: Request) {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const body = await req.json().catch(() => null);
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid settings", 400, parsed.error.flatten());
    await connectToDatabase();
    if (parsed.data.email) {
      await UserModel.updateOne({ _id: auth.userId }, { $set: { email: parsed.data.email.toLowerCase() } });
    }
    return ok({ saved: true });
  } catch (err) {
    return handleApiError(err);
  }
}
