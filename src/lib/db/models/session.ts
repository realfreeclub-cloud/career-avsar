import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type Session = InferSchemaType<typeof sessionSchema> & { _id: mongoose.Types.ObjectId };
export const SessionModel: Model<Session> =
  (mongoose.models.Session as Model<Session>) ?? mongoose.model<Session>("Session", sessionSchema);
