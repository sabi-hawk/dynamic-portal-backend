import { Schema, model, InferSchemaType, Document } from "mongoose";

const TeacherSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  type: { type: String, default: "teacher" },
  department: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  joiningDate: { type: Date },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  degree: { type: String, enum: ["Bachelors", "Masters", "PhD"] },
  section: { type: String, enum: ["A", "B", "C", "D", "E", "F"], default: "A" },
});

export type TeacherType = InferSchemaType<typeof TeacherSchema> & Document;
const Teacher = model<TeacherType>("teacher", TeacherSchema);

export default Teacher;