import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import {
  triggerDatabaseBackupAdmin,
  listBackupsAdmin,
} from "@/server/services/admin/backup";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const backups = await listBackupsAdmin();
    return ok({ backups });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const backup = await triggerDatabaseBackupAdmin(auth.userId);
    return ok({ backup, message: `Backup created successfully (${backup.totalRecords} records)` }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
