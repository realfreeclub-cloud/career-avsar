import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const notificationTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    event: {
      type: String,
      required: true,
      enum: [
        "registration",
        "profile_verification",
        "application_submission",
        "application_status_update",
        "shortlisting",
        "interview_invitation",
        "interview_rescheduling",
        "selection",
        "announcement",
      ],
      index: true,
    },
    channels: [{ type: String, enum: ["in_app", "email", "sms", "whatsapp"] }],
    subject: { type: String, trim: true },
    inAppBody: { type: String, trim: true },
    emailHtml: { type: String, trim: true },
    smsText: { type: String, trim: true },
    whatsappText: { type: String, trim: true },
    availableVariables: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

notificationTemplateSchema.index({ event: 1, status: 1 });

export type NotificationTemplate = InferSchemaType<typeof notificationTemplateSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const NotificationTemplateModel: Model<NotificationTemplate> =
  (mongoose.models.NotificationTemplate as Model<NotificationTemplate>) ??
  mongoose.model<NotificationTemplate>("NotificationTemplate", notificationTemplateSchema);
