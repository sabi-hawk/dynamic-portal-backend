import { Schema, model, InferSchemaType, Document } from "mongoose";

const UserSchema = new Schema({
  name: {
    first: { type: String, trim: true },
    last: { type: String, trim: true },
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true,
  },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "student", "teacher"],
    default: "student",
  },

  // Optional references
  studentProfile: { type: Schema.Types.ObjectId, ref: "Student" },
  teacherProfile: { type: Schema.Types.ObjectId, ref: "Teacher" },

  loggedInAt: { type: Date },
  lastLoggedInAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Infer the type and extend with Document
export type UserType = InferSchemaType<typeof UserSchema> & Document;

// Create the model
const User = model<UserType>("user", UserSchema);

export default User;
