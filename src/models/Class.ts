import { Schema, model, InferSchemaType, Document } from "mongoose";

/**
 * Class Model - Specific to School institutes only
 * Represents grade levels like Playgroup, Nursery, Prep, 1-10, etc.
 * This is the school equivalent of "Course" for universities/colleges
 */
const ClassSchema = new Schema({
  instituteId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  className: {
    type: String,
    required: true,
    // Examples: "Playgroup", "Nursery", "Prep", "1", "2", "3", etc. up to "10"
  },
  description: { type: String, default: "" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure unique class names per institute
ClassSchema.index({ className: 1, instituteId: 1 }, { unique: true });

export type ClassType = InferSchemaType<typeof ClassSchema> & Document;
const Class = model<ClassType>("class", ClassSchema);

export default Class;
