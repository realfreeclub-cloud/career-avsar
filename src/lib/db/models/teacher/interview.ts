import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const rescheduleEntrySchema = new Schema(
  {
    previousScheduledAt: { type: Date, required: true },
    newScheduledAt: { type: Date, required: true },
    reason: { type: String, trim: true },
    rescheduledByRole: { type: String, default: "admin" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const feedbackSchema = new Schema(
  {
    rating: { type: Number, min: 1, max: 5 },
    recommendation: {
      type: String,
      enum: ["hire", "strong_hire", "consider", "reject", "re_evaluate", ""],
      default: "",
    },
    strengths: { type: String, trim: true },
    improvements: { type: String, trim: true },
    notes: { type: String, trim: true },
    interviewerName: { type: String, trim: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const interviewSchema = new Schema(
  {
    teacherUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    candidateName: { type: String, trim: true },
    candidateEmail: { type: String, trim: true, lowercase: true },
    candidateMobile: { type: String, trim: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", index: true },
    jobTitle: { type: String, required: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    schoolId: { type: Schema.Types.ObjectId, ref: "School" },
    scheduledAt: { type: Date, required: true, index: true },
    mode: {
      type: String,
      enum: ["online", "in_person", "phone", "hybrid", "other"],
      default: "online",
      index: true,
    },
    locationOrLink: { type: String, trim: true },
    instructions: { type: String, trim: true },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "rescheduled", "completed", "cancelled", "no_show"],
      default: "scheduled",
      index: true,
    },
    feedback: feedbackSchema,
    result: {
      type: String,
      enum: ["pending", "selected", "rejected", "on_hold", "reschedule_needed"],
      default: "pending",
      index: true,
    },
    candidateConfirmedAt: { type: Date },
    candidateAttendanceNote: { type: String, trim: true },
    rescheduleHistory: [rescheduleEntrySchema],
    cancellationReason: { type: String, trim: true },
    cancelledAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

interviewSchema.index({ teacherUserId: 1, scheduledAt: -1 });
interviewSchema.index({ status: 1, scheduledAt: 1 });
interviewSchema.index({ scheduledAt: 1 });
interviewSchema.index({ result: 1 });

export type Interview = InferSchemaType<typeof interviewSchema> & { _id: mongoose.Types.ObjectId };
export const InterviewModel: Model<Interview> =
  (mongoose.models.Interview as Model<Interview>) ?? mongoose.model<Interview>("Interview", interviewSchema);
