import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ICustomer extends Document {
  deviceId?: string;
  email?: string;
  password?: string;
  name: string;
  phone: string;
  address?: string;
  authType: "guest" | "registered";
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    deviceId: {
      type: String,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    authType: {
      type: String,
      enum: ["guest", "registered"],
      required: true,
      default: "guest",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CustomerSchema.index({ authType: 1 });
CustomerSchema.index({ name: "text", email: "text", phone: "text" });

// Prevent model recompilation in development
const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
