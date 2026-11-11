import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const docSchema = new Schema(
  {
    kind: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storageKey: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const teacherProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    fullName: { type: String, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    mobile: { type: String, trim: true, index: true },
    whatsapp: { type: String, trim: true },
    dob: { type: String, trim: true },
    gender: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    location: {
      state: { type: String, trim: true, index: true },
      district: { type: String, trim: true, index: true },
      city: { type: String, trim: true },
      currentAddress: { type: String, trim: true },
      preferredJobDistricts: [{ type: String, trim: true }],
      preferredJobLocations: [{ type: String, trim: true }],
      serviceAreaStatus: {
        type: String,
        enum: ["in_service_area", "outside_service_area", "review_needed"],
        default: "in_service_area",
        index: true,
      },
    },
    education: {
      highestQualification: { type: String, trim: true, index: true },
      graduation: { type: String, trim: true },
      postGraduation: { type: String, trim: true },
      bed: { type: Boolean, default: false },
      deled: { type: Boolean, default: false },
      btc: { type: Boolean, default: false },
      ctet: { type: Boolean, default: false, index: true },
      ctetPaperI: { type: Boolean, default: false },
      ctetPaperII: { type: Boolean, default: false },
      uptet: { type: Boolean, default: false, index: true },
      otherTet: { type: String, trim: true },
    },
    experience: {
      status: { type: String, enum: ["fresher", "experienced", ""], default: "", index: true },
      totalYears: { type: Number, min: 0, index: true },
      previousSchool: { type: String, trim: true },
      previousDesignation: { type: String, trim: true },
      currentEmploymentStatus: { type: String, trim: true },
      expectedSalaryInr: { type: Number, min: 0, index: true },
    },
    preferences: {
      categories: [{ type: String, trim: true }],
      subjects: [{ type: String, trim: true, index: true }],
      preferredClasses: [{ type: String, trim: true }],
      preferredBoard: { type: String, trim: true },
      employmentType: { type: String, trim: true },
      preferredLocations: [{ type: String, trim: true }],
    },
    documents: [docSchema],
    registration: {
      currentStep: { type: Number, default: 1, min: 1, max: 6 },
      completed: { type: Boolean, default: false },
      draftSavedAt: { type: Date },
    },
    verification: {
      status: { type: String, enum: ["unverified", "pending", "verified", "rejected"], default: "unverified", index: true },
      note: { type: String, trim: true },
      verifiedAt: { type: Date },
      verifiedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    },
    adminNotes: [
      {
        authorUserId: { type: Schema.Types.ObjectId, ref: "User" },
        body: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    communicationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      jobAlerts: { type: Boolean, default: true },
      interviewReminders: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

teacherProfileSchema.index({ userId: 1 }, { unique: true });
teacherProfileSchema.index({ createdAt: -1 });
teacherProfileSchema.index({ fullName: "text", email: "text", mobile: "text" });
teacherProfileSchema.index({ "location.state": 1, "location.district": 1, "verification.status": 1 });

export type TeacherProfile = InferSchemaType<typeof teacherProfileSchema> & { _id: mongoose.Types.ObjectId };
export type TeacherDocument = TeacherProfile["documents"][number];
export const TeacherProfileModel: Model<TeacherProfile> =
  (mongoose.models.TeacherProfile as Model<TeacherProfile>) ??
  mongoose.model<TeacherProfile>("TeacherProfile", teacherProfileSchema);
