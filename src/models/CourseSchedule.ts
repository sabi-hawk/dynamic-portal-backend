import { Schema, model, InferSchemaType, Document } from "mongoose";

interface ValidationProps {
  value: string;
}

const CourseScheduleSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: "course",
    required: true,
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: "teacher",
    required: true,
  },
  section: {
    type: String,
    enum: ["A", "B", "C", "D", "E", "F"],
    required: true,
  },
  schedule: {
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props: ValidationProps) =>
          `${props.value} is not a valid time format (HH:MM)`,
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props: ValidationProps) =>
          `${props.value} is not a valid time format (HH:MM)`,
      },
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
    },
    daysOfWeek: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        required: true,
      },
    ],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add compound index to prevent duplicate schedules
CourseScheduleSchema.index(
  {
    course: 1,
    instructor: 1,
    section: 1,
    "schedule.daysOfWeek": 1,
    "schedule.startTime": 1,
    "schedule.endTime": 1,
  },
  { unique: true }
);

// Pre-save middleware to calculate duration
CourseScheduleSchema.pre("save", function (next) {
  if (
    this.isModified("schedule.startTime") ||
    this.isModified("schedule.endTime")
  ) {
    const schedule = this.get("schedule");
    if (schedule && schedule.startTime && schedule.endTime) {
      const start = new Date(`2000-01-01T${schedule.startTime}`);
      const end = new Date(`2000-01-01T${schedule.endTime}`);
      this.set(
        "schedule.duration",
        Math.round((end.getTime() - start.getTime()) / (1000 * 60))
      );
    }
  }
  next();
});

export type CourseScheduleType = InferSchemaType<typeof CourseScheduleSchema> &
  Document;
const CourseSchedule = model<CourseScheduleType>(
  "courseSchedule",
  CourseScheduleSchema
);

export default CourseSchedule;
