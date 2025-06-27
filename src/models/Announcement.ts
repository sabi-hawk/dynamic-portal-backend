import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
  expiryDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  instituteId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    tags: [{ type: String }],
    expiryDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    instituteId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema); 