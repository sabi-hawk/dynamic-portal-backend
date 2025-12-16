import { Schema, model, InferSchemaType, Document } from "mongoose";

/**
 * Section Model - Specific to School institutes only
 * Represents sections within a class (e.g., Section A, Section B, Red Section, Blue Section, etc.)
 * Section names are dynamic and configurable by the admin
 */
const SectionSchema = new Schema({
  instituteId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  classId: { type: Schema.Types.ObjectId, ref: "class", required: true },
  sectionName: {
    type: String,
    required: true,
    // Admin can name sections anything: "A", "B", "Red", "Blue", "Morning", etc.
  },
  description: { type: String, default: "" },
  capacity: { type: Number, default: 0 }, // Optional: maximum students allowed
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure unique section names per class per institute
SectionSchema.index(
  { sectionName: 1, classId: 1, instituteId: 1 },
  { unique: true }
);

export type SectionType = InferSchemaType<typeof SectionSchema> & Document;
const Section = model<SectionType>("section", SectionSchema);

export default Section;
