import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "recruiter", "school", "candidate"], default: "candidate", index: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const UserModel: Model<User> = (mongoose.models.User as Model<User>) ?? mongoose.model<User>("User", userSchema);
