import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed },
    updatedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export type SystemSetting = InferSchemaType<typeof settingsSchema> & { _id: mongoose.Types.ObjectId };
export const SystemSettingModel: Model<SystemSetting> =
  (mongoose.models.SystemSetting as Model<SystemSetting>) ??
  mongoose.model<SystemSetting>("SystemSetting", settingsSchema);
