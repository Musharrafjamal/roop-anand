import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IStockRequest extends Document {
  employee: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StockRequestSchema = new Schema<IStockRequest>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
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

const StockRequest: Model<IStockRequest> =
  mongoose.models.StockRequest ||
  mongoose.model<IStockRequest>("StockRequest", StockRequestSchema);

export default StockRequest;
