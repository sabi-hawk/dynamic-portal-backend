import mongoose, { Document, Schema } from "mongoose";

export interface IPortalSettings extends Document {
  userId: mongoose.Types.ObjectId;
  instituteName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

const PortalSettingsSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instituteName: {
      type: String,
      default: "My Institute",
    },
    primaryColor: {
      type: String,
      default: "#1890ff",
    },
    secondaryColor: {
      type: String,
      default: "#13c2c2",
    },
    logoUrl: {
      type: String,
      default: "https://placeholder.com/150",
    },
    address: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPortalSettings>(
  "PortalSettings",
  PortalSettingsSchema
);
