import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, trim: true, index: true },
    schoolName: { type: String, required: true, trim: true },
    institutionId: { type: Schema.Types.ObjectId, ref: "School", index: true },
    location: {
      city: { type: String, required: true, trim: true, index: true },
      district: { type: String, trim: true, index: true },
      state: { type: String, required: true, trim: true, index: true },
    },
    subject: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    qualification: { type: String, required: true, trim: true },
    trainingRequirements: { type: String, trim: true },
    ctetRequired: { type: String, trim: true },
    minExperience: { type: Number, min: 0, default: 0 },
    maxExperience: { type: Number, min: 0 },
    experience: { type: String, trim: true },
    salaryMinInr: { type: Number, min: 0 },
    salaryMaxInr: { type: Number, min: 0 },
    salaryPeriod: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    vacanciesCount: { type: Number, min: 1, default: 1 },
    employmentType: { type: String, trim: true, default: "Full-time" },
    board: { type: String, trim: true },
    description: { type: String, trim: true },
    responsibilities: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    applicationDeadline: { type: Date, index: true },
    extendedDeadlineAt: { type: Date },
    interviewMode: { type: String, enum: ["Online", "In-person", "Hybrid"], default: "Online" },
    status: {
      type: String,
      enum: ["draft", "published", "paused", "expired", "closed", "archived"],
      default: "draft",
      index: true,
    },
    isPublic: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, index: true },
  },
  { timestamps: true },
);

jobSchema.index({ title: "text", subject: "text", schoolName: "text", "location.city": "text", "location.state": "text" });

export type Job = InferSchemaType<typeof jobSchema> & { _id: mongoose.Types.ObjectId };

export const JobModel: Model<Job> =
  (mongoose.models.Job as Model<Job>) ?? mongoose.model<Job>("Job", jobSchema);
