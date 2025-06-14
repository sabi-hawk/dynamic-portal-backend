import { Schema, model, InferSchemaType, Document } from "mongoose";

const CourseSchema = new Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type CourseType = InferSchemaType<typeof CourseSchema> & Document;
const Course = model<CourseType>("course", CourseSchema);

export default Course;
