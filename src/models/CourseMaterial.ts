import { Schema, model, InferSchemaType, Document } from "mongoose";

const CourseMaterialSchema = new Schema({
  courseSchedule: {
    type: Schema.Types.ObjectId,
    ref: "courseSchedule",
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  storedName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "teacher",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export type CourseMaterialType = InferSchemaType<typeof CourseMaterialSchema> &
  Document;

const CourseMaterial = model<CourseMaterialType>(
  "courseMaterial",
  CourseMaterialSchema
);
export default CourseMaterial;
