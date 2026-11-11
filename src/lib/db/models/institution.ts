import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const institutionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    description: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "archived"],
      default: "pending",
      index: true,
    },
    approvedAt: { type: Date, index: true },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type Institution = InferSchemaType<typeof institutionSchema> & { _id: mongoose.Types.ObjectId };

export const InstitutionModel: Model<Institution> =
  (mongoose.models.Institution as Model<Institution>) ??
  mongoose.model<Institution>("Institution", institutionSchema);
