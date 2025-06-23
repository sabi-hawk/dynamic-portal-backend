import { Schema, model, InferSchemaType, Document } from "mongoose";

const CourseSchema = new Schema({
  instituteId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CourseSchema.index({ courseCode: 1, instituteId: 1 }, { unique: true });

export type CourseType = InferSchemaType<typeof CourseSchema> & Document;
const Course = model<CourseType>("course", CourseSchema);

export default Course;
