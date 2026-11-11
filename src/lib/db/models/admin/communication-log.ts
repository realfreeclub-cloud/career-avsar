import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const communicationLogSchema = new Schema(
  {
    recipientType: {
      type: String,
      enum: ["teacher", "school"],
      default: "teacher",
      index: true,
    },
    recipientUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    recipientName: { type: String, required: true, trim: true },
    recipientEmail: { type: String, trim: true, lowercase: true },
    recipientMobile: { type: String, trim: true },

    // School CRM specific fields
    schoolId: { type: Schema.Types.ObjectId, ref: "School", index: true },
    schoolName: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    contactRole: { type: String, trim: true },

    channel: {
      type: String,
      required: true,
      enum: ["in_app", "email", "sms", "whatsapp", "phone", "meeting", "other"],
      index: true,
    },
    event: {
      type: String,
      required: true,
      index: true,
    },
    templateCode: { type: String, trim: true },
    subject: { type: String, trim: true },
    body: { type: String, required: true, trim: true },
    provider: {
      type: String,
      enum: ["in_app", "email_gateway", "sms_dlt", "whatsapp_biz", "manual_crm"],
      default: "in_app",
      index: true,
    },
    providerMessageId: { type: String, sparse: true, index: true },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed", "opted_out", "logged"],
      default: "pending",
      index: true,
    },
    failureReason: { type: String, trim: true },
    retryCount: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: Date.now, index: true },
    deliveredAt: { type: Date },

    // Linkage & Follow-ups
    relatedJobId: { type: Schema.Types.ObjectId, ref: "Job", index: true },
    relatedJobTitle: { type: String, trim: true },
    relatedApplicationId: { type: Schema.Types.ObjectId, ref: "Application", index: true },
    followUpDate: { type: Date, index: true },
    followUpStatus: {
      type: String,
      enum: ["pending", "completed", "none"],
      default: "none",
      index: true,
    },
    recordedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    recordedByName: { type: String, trim: true, default: "Admin Officer" },
    candidateSharingDetails: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

communicationLogSchema.index({ recipientUserId: 1, createdAt: -1 });
communicationLogSchema.index({ schoolId: 1, createdAt: -1 });
communicationLogSchema.index({ recipientType: 1, createdAt: -1 });
communicationLogSchema.index({ status: 1, lastAttemptAt: -1 });
communicationLogSchema.index({ channel: 1, event: 1 });
communicationLogSchema.index({ followUpStatus: 1, followUpDate: 1 });

export type CommunicationLog = InferSchemaType<typeof communicationLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CommunicationLogModel: Model<CommunicationLog> =
  (mongoose.models.CommunicationLog as Model<CommunicationLog>) ??
  mongoose.model<CommunicationLog>("CommunicationLog", communicationLogSchema);
