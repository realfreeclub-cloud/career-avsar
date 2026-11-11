import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const masterItemSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["category", "qualification", "board", "employment_type", "status", "subject"],
      index: true,
    },
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

masterItemSchema.index({ type: 1, key: 1 }, { unique: true });

export type MasterItemDoc = InferSchemaType<typeof masterItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MasterItemModel: Model<MasterItemDoc> =
  (mongoose.models.MasterItem as Model<MasterItemDoc>) ??
  mongoose.model<MasterItemDoc>("MasterItem", masterItemSchema);
