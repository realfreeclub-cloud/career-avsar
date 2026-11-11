import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    designation: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true },
);

const noteSchema = new Schema(
  {
    authorUserId: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, default: "Admin Reviewer", trim: true },
    body: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const schoolSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    board: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    location: {
      state: { type: String, trim: true, default: "Uttar Pradesh", index: true },
      district: { type: String, trim: true, index: true },
      city: { type: String, trim: true, index: true },
      address: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    verificationStatus: {
      type: String,
      enum: ["verified", "pending_verification", "unverified"],
      default: "pending_verification",
      index: true,
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    hiringRequirements: { type: String, trim: true },
    followUpDate: { type: Date, index: true },
    followUpStatus: {
      type: String,
      enum: ["pending", "completed", "none"],
      default: "none",
      index: true,
    },
    contacts: [contactSchema],
    internalNotes: [noteSchema],
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

schoolSchema.index({ name: "text", "location.city": "text", "location.district": "text", "location.state": "text" });
schoolSchema.index({ createdAt: -1 });

export type School = InferSchemaType<typeof schoolSchema> & { _id: mongoose.Types.ObjectId };
export const SchoolModel: Model<School> =
  (mongoose.models.School as Model<School>) ?? mongoose.model<School>("School", schoolSchema);
