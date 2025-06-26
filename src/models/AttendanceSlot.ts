import { Schema, model, InferSchemaType, Document } from "mongoose";

const StatusEnum = ["present", "absent", "late"] as const;

const StudentStatusSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    status: { type: String, enum: StatusEnum, required: true },
  },
  { _id: false }
);

const AttendanceSlotSchema = new Schema({
  courseSchedule: {
    type: Schema.Types.ObjectId,
    ref: "courseSchedule",
    required: true,
  },
  date: { type: String, required: true }, // YYYY-MM-DD
  slot: { type: String, required: true }, // e.g. "08:00-09:00"
  statuses: [StudentStatusSchema],
  markedBy: { type: Schema.Types.ObjectId, ref: "teacher", required: true },
  markedAt: { type: Date, default: Date.now },
});

AttendanceSlotSchema.index(
  { courseSchedule: 1, date: 1, slot: 1 },
  { unique: true }
);

export type AttendanceSlotType = InferSchemaType<typeof AttendanceSlotSchema> &
  Document;
const AttendanceSlot = model<AttendanceSlotType>(
  "attendanceSlot",
  AttendanceSlotSchema
);
export default AttendanceSlot;
