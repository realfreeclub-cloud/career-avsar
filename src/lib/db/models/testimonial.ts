import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const testimonialSchema = new Schema(
  {
    authorName: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    organization: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "archived"],
      default: "pending",
      index: true,
    },
    approvedAt: { type: Date, index: true },
  },
  { timestamps: true },
);

export type Testimonial = InferSchemaType<typeof testimonialSchema> & { _id: mongoose.Types.ObjectId };

export const TestimonialModel: Model<Testimonial> =
  (mongoose.models.Testimonial as Model<Testimonial>) ??
  mongoose.model<Testimonial>("Testimonial", testimonialSchema);
