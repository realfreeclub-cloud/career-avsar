import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const locationSchema = new Schema(
  {
    country: { type: String, required: true, default: "India", trim: true },
    state: { type: String, required: true, default: "Uttar Pradesh", trim: true, index: true },
    district: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0, index: true },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    headquarterCity: { type: String, trim: true },
    majorTowns: [{ type: String, trim: true }],
    searchAliases: [{ type: String, trim: true }],
    description: { type: String, trim: true },
    bannerImage: { type: String, trim: true },
    landingPageVisible: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

locationSchema.index({ state: 1, district: 1 }, { unique: true });
locationSchema.index({ isActive: 1, displayOrder: 1 });

export type LocationDoc = InferSchemaType<typeof locationSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const LocationModel: Model<LocationDoc> =
  (mongoose.models.Location as Model<LocationDoc>) ??
  mongoose.model<LocationDoc>("Location", locationSchema);
