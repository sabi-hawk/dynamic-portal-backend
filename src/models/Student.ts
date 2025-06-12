// models/Student.ts
import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  rollNo: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  gender: { type: String, required: true },
  mobile: { type: String, required: true },
  admissionDate: { type: Date, required: true },
  section: { type: String, enum: ["A", "B", "C", "D", "E", "F"], default: "A" },
  // ...any other student-specific fields
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
