import { Schema, model, InferSchemaType, Document } from "mongoose";

const TeacherSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  instituteId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  type: { type: String, default: "teacher" },
  department: { type: String, required: true },
  mobile: { type: String, required: true },
  emergencyContact: { type: String },
  address: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  joiningDate: { type: Date },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  degree: { type: String, enum: ["Bachelors", "Masters", "PhD"] },
  section: { type: String, enum: ["A", "B", "C", "D", "E", "F"], default: "A" },
});

// Remove any existing indexes
TeacherSchema.indexes().forEach((index) => {
  TeacherSchema.index(index[0], { unique: false });
});

export type TeacherType = InferSchemaType<typeof TeacherSchema> & Document;
const Teacher = model<TeacherType>("teacher", TeacherSchema);

export default Teacher;
