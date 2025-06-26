// models/Student.ts
import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  instituteId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  rollNo: { type: String, required: true, unique: true },
  // Department is primarily used for university institutes
  department: { type: String },
  // Program is used for university and college institutes
  program: { type: String },
  // Semester applies only to university programs
  semester: { type: Number },
  // College year applies only to college institutes
  collegeYear: { type: String },
  // School class applies only to school institutes
  schoolClass: { type: String },
  gender: { type: String, required: true },
  mobile: { type: String, required: true },
  admissionDate: { type: Date, required: true },
  section: { type: String, enum: ["A", "B", "C", "D", "E", "F"], default: "A" },
  // ...any other student-specific fields
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
