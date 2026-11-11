import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const recruiterSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    organization: { type: String, trim: true },
    role: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    state: { type: String, trim: true, index: true },
    city: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    internalNotes: { type: String, trim: true },
  },
  { timestamps: true },
);

recruiterSchema.index({ createdAt: -1 });
recruiterSchema.index({ name: "text", organization: "text", email: "text", phone: "text" });

export type RecruiterContact = InferSchemaType<typeof recruiterSchema> & { _id: mongoose.Types.ObjectId };
export const RecruiterContactModel: Model<RecruiterContact> =
  (mongoose.models.RecruiterContact as Model<RecruiterContact>) ??
  mongoose.model<RecruiterContact>("RecruiterContact", recruiterSchema);
