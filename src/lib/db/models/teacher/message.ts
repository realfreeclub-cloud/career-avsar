import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const messageSchema = new Schema(
  {
    teacherUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User" },
    fromName: { type: String, required: true, trim: true },
    fromRole: { type: String, trim: true },
    subject: { type: String, trim: true },
    body: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

messageSchema.index({ teacherUserId: 1, createdAt: -1 });

export type Message = InferSchemaType<typeof messageSchema> & { _id: mongoose.Types.ObjectId };
export const MessageModel: Model<Message> =
  (mongoose.models.Message as Model<Message>) ?? mongoose.model<Message>("Message", messageSchema);
