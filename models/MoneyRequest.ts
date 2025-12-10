import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IMoneyRequest extends Document {
  employee: Types.ObjectId;
  amount: number;
  method: "Cash" | "Online";
  referenceNumber?: string;
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MoneyRequestSchema = new Schema<IMoneyRequest>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1"],
    },
    method: {
      type: String,
      enum: ["Cash", "Online"],
      required: [true, "Payment method is required"],
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const MoneyRequest: Model<IMoneyRequest> =
  mongoose.models.MoneyRequest ||
  mongoose.model<IMoneyRequest>("MoneyRequest", MoneyRequestSchema);

export default MoneyRequest;
