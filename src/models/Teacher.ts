import { Schema, model, InferSchemaType, Document } from "mongoose";

const TeacherSchema = new Schema({
  name: { type: String, required: true, trim: true },
  department: { type: String, required: true },
  role: { type: String, default: "teacher" }, // Optional
  mobile: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  address: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  joiningDate: { type: Date },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  degree: { type: String, enum: ["Bachelors", "Masters", "PhD"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type TeacherType = InferSchemaType<typeof TeacherSchema> & Document;
const Teacher = model<TeacherType>("teacher", TeacherSchema);

export default Teacher;