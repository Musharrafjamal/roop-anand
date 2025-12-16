import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IRequestProduct {
  product: Types.ObjectId;
  quantity: number;
}

export interface ICustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface IProductRequest extends Document {
  customer: Types.ObjectId;
  products: IRequestProduct[];
  status: "pending" | "ongoing" | "delivered";
  customerDetails: ICustomerDetails;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequestProductSchema = new Schema<IRequestProduct>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false }
);

const CustomerDetailsSchema = new Schema<ICustomerDetails>(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  { _id: false }
);

const ProductRequestSchema = new Schema<IProductRequest>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    products: {
      type: [RequestProductSchema],
      required: true,
      validate: {
        validator: function (v: IRequestProduct[]) {
          return v && v.length > 0;
        },
        message: "At least one product is required",
      },
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "delivered"],
      default: "pending",
    },
    customerDetails: {
      type: CustomerDetailsSchema,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ProductRequestSchema.index({ customer: 1 });
ProductRequestSchema.index({ status: 1 });
ProductRequestSchema.index({ createdAt: -1 });
ProductRequestSchema.index({ "customerDetails.name": "text" });

// Prevent model recompilation in development
const ProductRequest: Model<IProductRequest> =
  mongoose.models.ProductRequest ||
  mongoose.model<IProductRequest>("ProductRequest", ProductRequestSchema);

export default ProductRequest;
