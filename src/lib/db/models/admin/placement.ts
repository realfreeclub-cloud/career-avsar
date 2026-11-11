import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const placementSchema = new Schema(
  {
    teacherUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teacherName: { type: String, required: true, trim: true },
    candidateEmail: { type: String, trim: true, lowercase: true },
    candidateMobile: { type: String, trim: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    jobTitle: { type: String, required: true, trim: true },
    schoolId: { type: Schema.Types.ObjectId, ref: "School", index: true },
    schoolName: { type: String, required: true, trim: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", index: true },
    interviewId: { type: Schema.Types.ObjectId, ref: "Interview", index: true },
    selectionDate: { type: Date, default: Date.now, index: true },
    joiningDate: { type: Date, required: true, index: true },
    actualJoiningDate: { type: Date },
    salaryOfferedInr: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["offered", "offer_accepted", "joined", "declined", "deferred", "backed_out", "completed"],
      default: "offered",
      index: true,
    },
    offerLetterUrl: { type: String, trim: true },
    joiningStatusRemarks: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

placementSchema.index({ createdAt: -1 });
placementSchema.index({ status: 1, joiningDate: 1 });
placementSchema.index({ schoolName: "text", jobTitle: "text", teacherName: "text" });

export type Placement = InferSchemaType<typeof placementSchema> & { _id: mongoose.Types.ObjectId };
export const PlacementModel: Model<Placement> =
  (mongoose.models.Placement as Model<Placement>) ?? mongoose.model<Placement>("Placement", placementSchema);
