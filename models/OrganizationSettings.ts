import mongoose, { Schema, Model, Document } from "mongoose";

export interface IOrganizationSettings extends Document {
  companyName: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSettingsSchema = new Schema<IOrganizationSettings>(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    logo: {
      type: String,
      default: undefined,
    },
    address: {
      street: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      pincode: {
        type: String,
        default: "",
      },
      country: {
        type: String,
        default: "India",
      },
    },
    phone: {
      type: String,
      default: undefined,
    },
    email: {
      type: String,
      default: undefined,
    },
    gstin: {
      type: String,
      default: undefined,
    },
    pan: {
      type: String,
      default: undefined,
    },
    bankDetails: {
      accountName: {
        type: String,
        default: undefined,
      },
      accountNumber: {
        type: String,
        default: undefined,
      },
      bankName: {
        type: String,
        default: undefined,
      },
      ifscCode: {
        type: String,
        default: undefined,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const OrganizationSettings: Model<IOrganizationSettings> =
  mongoose.models.OrganizationSettings ||
  mongoose.model<IOrganizationSettings>("OrganizationSettings", OrganizationSettingsSchema);

export default OrganizationSettings;
