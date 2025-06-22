import mongoose, { Document, Schema } from "mongoose";

export interface IPortalSettings extends Document {
  userId: mongoose.Types.ObjectId;
  instituteName: string;
  instituteType: "school" | "college" | "university";
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  portalPermissions: {
    adminPortal: {
      enabled: boolean;
      features: string[];
    };
    teacherPortal: {
      enabled: boolean;
      features: string[];
    };
    studentPortal: {
      enabled: boolean;
      features: string[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const PortalSettingsSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    instituteName: {
      type: String,
      default: "My Institute",
    },
    instituteType: {
      type: String,
      enum: ["school", "college", "university"],
      default: "school",
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
      default: "",
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
    portalPermissions: {
      adminPortal: {
        enabled: { type: Boolean, default: true },
        features: [{ type: String }],
      },
      teacherPortal: {
        enabled: { type: Boolean, default: false },
        features: [{ type: String }],
      },
      studentPortal: {
        enabled: { type: Boolean, default: false },
        features: [{ type: String }],
      },
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
