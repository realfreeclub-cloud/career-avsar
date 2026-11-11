import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const statusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    previousStatus: { type: String, trim: true },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    changedByRole: { type: String, default: "system" },
    internalReason: { type: String, trim: true },
    candidateVisibleExplanation: { type: String, trim: true },
    note: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const candidateDossierShareSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School" },
    schoolName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    sharedAt: { type: Date, default: Date.now },
    sharedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    sharedByName: { type: String, default: "Admin Officer", trim: true },
    includedFields: [{ type: String }],
    authorizationNote: { type: String, trim: true },
  },
  { _id: true },
);

const internalNoteSchema = new Schema(
  {
    authorUserId: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, default: "Admin" },
    note: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const candidateMessageSchema = new Schema(
  {
    senderUserId: { type: Schema.Types.ObjectId, ref: "User" },
    senderName: { type: String, default: "Recruitment Team" },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const snapshotSchema = new Schema(
  {
    fullName: { type: String, trim: true },
    email: { type: String, trim: true },
    mobile: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    highestQualification: { type: String, trim: true },
    bed: { type: Boolean, default: false },
    ctet: { type: Boolean, default: false },
    ctetDetails: { type: String, trim: true },
    totalExperienceYears: { type: Number, default: 0 },
    previousSchool: { type: String, trim: true },
    previousDesignation: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },
    resumeOriginalName: { type: String, trim: true },
  },
  { _id: false },
);

const applicationSchema = new Schema(
  {
    teacherUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    jobTitle: { type: String, required: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "shortlisted",
        "on_hold",
        "interview_scheduled",
        "interview_completed",
        "selected",
        "rejected",
        "withdrawn",
        "applied",
        "pending",
        "interview",
        "offered",
      ],
      default: "submitted",
      index: true,
    },
    coverNote: { type: String, trim: true },
    withdrawalReason: { type: String, trim: true },
    appliedAt: { type: Date, default: Date.now },
    snapshot: { type: snapshotSchema },
    statusHistory: [statusHistorySchema],
    internalNotes: [internalNoteSchema],
    candidateMessages: [candidateMessageSchema],
    sharedWithSchools: [candidateDossierShareSchema],
    interviewId: { type: Schema.Types.ObjectId, ref: "Interview" },
    interviewScheduledAt: { type: Date },
    interviewMode: { type: String, trim: true },
  },
  { timestamps: true },
);

applicationSchema.index({ teacherUserId: 1, jobId: 1 }, { unique: true, sparse: true });
applicationSchema.index({ teacherUserId: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, status: 1 });

export type Application = InferSchemaType<typeof applicationSchema> & { _id: mongoose.Types.ObjectId };
export const ApplicationModel: Model<Application> =
  (mongoose.models.Application as Model<Application>) ?? mongoose.model<Application>("Application", applicationSchema);
