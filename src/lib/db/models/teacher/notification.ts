import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const notificationSchema = new Schema(
  {
    teacherUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["application", "interview", "profile", "system", "message", "announcement"],
      default: "system",
      index: true,
    },
    channel: {
      type: String,
      enum: ["in_app", "email", "sms", "whatsapp"],
      default: "in_app",
    },
    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    href: { type: String, trim: true },
  },
  { timestamps: true },
);

notificationSchema.index({ teacherUserId: 1, createdAt: -1 });
notificationSchema.index({ teacherUserId: 1, read: 1 });

export type Notification = InferSchemaType<typeof notificationSchema> & { _id: mongoose.Types.ObjectId };
export const NotificationModel: Model<Notification> =
  (mongoose.models.Notification as Model<Notification>) ??
  mongoose.model<Notification>("Notification", notificationSchema);
