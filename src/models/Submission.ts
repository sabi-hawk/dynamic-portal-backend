import { Schema, model, InferSchemaType, Document } from "mongoose";

const SubmissionSchema = new Schema({
  courseSchedule: {
    type: Schema.Types.ObjectId,
    ref: "courseSchedule",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "teacher",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export type SubmissionType = InferSchemaType<typeof SubmissionSchema> &
  Document;

const Submission = model<SubmissionType>("submission", SubmissionSchema);
export default Submission;
