// models/Student.ts
import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  instituteId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  rollNo: { type: String, required: true, unique: true },

  // ===== UNIVERSITY & COLLEGE FIELDS (unchanged) =====
  // Department is primarily used for university institutes
  department: { type: String },
  // Program is used for university and college institutes
  program: { type: String },
  // Semester applies only to university programs
  semester: { type: Number },
  // College year applies only to college institutes
  collegeYear: { type: String },

  // ===== SCHOOL-SPECIFIC FIELDS (new structure) =====
  // Reference to Class model (for schools only)
  classId: { type: Schema.Types.ObjectId, ref: "class" },
  // Reference to Section model (for schools only)
  sectionId: { type: Schema.Types.ObjectId, ref: "section" },

  // Legacy fields for backward compatibility
  // schoolClass field kept for migration purposes (deprecated)
  schoolClass: { type: String },
  // section field changed to String (no enum) for flexibility
  // This is now deprecated for schools in favor of sectionId
  section: { type: String },

  // ===== COMMON FIELDS (for all institute types) =====
  gender: { type: String, required: true },
  mobile: { type: String, required: true },
  admissionDate: { type: Date, required: true },

  // Additional fields
  fullName: { type: String }, // Full name of the student
  dateOfBirth: { type: Date },
  address: { type: String },
  guardianName: { type: String },
  guardianContact: { type: String },
  bloodGroup: { type: String },
  status: {
    type: String,
    enum: ["active", "inactive", "graduated"],
    default: "active",
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for faster queries
studentSchema.index({ instituteId: 1, rollNo: 1 }, { unique: true });
studentSchema.index({ classId: 1, sectionId: 1 });

const Student = mongoose.model("Student", studentSchema);
export default Student;
