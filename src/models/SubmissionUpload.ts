import { Schema, model, InferSchemaType, Document } from "mongoose";

const FileSchema = new Schema(
  {
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const SubmissionUploadSchema = new Schema({
  submission: {
    type: Schema.Types.ObjectId,
    ref: "submission",
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  file: {
    type: FileSchema,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

SubmissionUploadSchema.index({ submission: 1, student: 1 }, { unique: true }); // prevent multiple uploads

export type SubmissionUploadType = InferSchemaType<
  typeof SubmissionUploadSchema
> &
  Document;

const SubmissionUpload = model<SubmissionUploadType>(
  "submissionUpload",
  SubmissionUploadSchema
);
export default SubmissionUpload;
