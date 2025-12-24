import mongoose, { Schema, Model, Document } from 'mongoose';

// All permission actions including special ones
const PERMISSION_ACTIONS = [
  'read', 
  'create', 
  'update', 
  'delete',
  'toggleStatus',    // Products, Employees
  'assignProducts',  // Employees
  'updateStatus',    // Product Requests
  'manageNotes',     // Product Requests
  'approve',         // Requests (Stock/Money)
  'reject',          // Requests (Stock/Money)
  'orgSettings',     // Invoices
] as const;

export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  role: 'super-admin' | 'sub-admin';
  permissions: {
    dashboard?: string[];
    products?: string[];
    employees?: string[];
    customers?: string[];
    productRequests?: string[];
    sales?: string[];
    invoices?: string[];
    requests?: string[];
    admins?: string[];
  };
  isActive: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    name: {
      type: String,
      default: 'Admin',
      trim: true,
    },
    role: {
      type: String,
      enum: ['super-admin', 'sub-admin'],
      default: 'sub-admin',
    },
    permissions: {
      dashboard: [{ type: String, enum: PERMISSION_ACTIONS }],
      products: [{ type: String, enum: PERMISSION_ACTIONS }],
      employees: [{ type: String, enum: PERMISSION_ACTIONS }],
      customers: [{ type: String, enum: PERMISSION_ACTIONS }],
      productRequests: [{ type: String, enum: PERMISSION_ACTIONS }],
      sales: [{ type: String, enum: PERMISSION_ACTIONS }],
      invoices: [{ type: String, enum: PERMISSION_ACTIONS }],
      requests: [{ type: String, enum: PERMISSION_ACTIONS }],
      admins: [{ type: String, enum: PERMISSION_ACTIONS }],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetToken: {
      type: String,
      default: undefined,
    },
    resetTokenExpiry: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
