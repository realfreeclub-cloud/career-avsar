import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorRole: { type: String, trim: true },
    action: { type: String, required: true, trim: true, index: true },
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: String, trim: true, index: true },
    summary: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export type AuditLog = InferSchemaType<typeof auditLogSchema> & { _id: mongoose.Types.ObjectId };
export const AuditLogModel: Model<AuditLog> =
  (mongoose.models.AuditLog as Model<AuditLog>) ?? mongoose.model<AuditLog>("AuditLog", auditLogSchema);
