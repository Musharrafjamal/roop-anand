import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import StockRequest from "@/models/StockRequest";
import Employee from "@/models/Employee";
import Product from "@/models/Product";
import { authOptions } from "@/lib/authOptions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single stock request
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const stockRequest = await StockRequest.findById(id)
      .populate("employee", "fullName profilePhoto phoneNumber")
      .populate("product", "title photo price stockQuantity");

    if (!stockRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(stockRequest);
  } catch (error) {
    console.error("Error fetching stock request:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}

// PUT update stock request (approve/reject)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const stockRequest = await StockRequest.findById(id);
    if (!stockRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (stockRequest.status !== "Pending") {
      return NextResponse.json(
        { error: "Request has already been processed" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }

      stockRequest.status = "Rejected";
      stockRequest.rejectionReason = rejectionReason;
      stockRequest.processedAt = new Date();
      await stockRequest.save();
    } else {
      // Approve - add stock to employee
      const employee = await Employee.findById(stockRequest.employee);
      if (!employee) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        );
      }

      const product = await Product.findById(stockRequest.product);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Check product stock
      if (product.stockQuantity < stockRequest.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock. Only ${product.stockQuantity} available.` },
          { status: 400 }
        );
      }

      // Deduct from product stock
      product.stockQuantity -= stockRequest.quantity;
      await product.save();

      // Add to employee's products
      const existingAssignment = employee.products.find(
        (p: { product: { toString: () => string } }) => 
          p.product.toString() === stockRequest.product.toString()
      );

      if (existingAssignment) {
        existingAssignment.quantity += stockRequest.quantity;
      } else {
        employee.products.push({
          product: stockRequest.product,
          quantity: stockRequest.quantity,
          assignedAt: new Date(),
        });
      }
      await employee.save();

      stockRequest.status = "Approved";
      stockRequest.processedAt = new Date();
      await stockRequest.save();
    }

    const populatedRequest = await StockRequest.findById(id)
      .populate("employee", "fullName profilePhoto phoneNumber")
      .populate("product", "title photo price stockQuantity");

    return NextResponse.json(populatedRequest);
  } catch (error) {
    console.error("Error updating stock request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

// DELETE stock request
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const stockRequest = await StockRequest.findById(id);
    if (!stockRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    await StockRequest.findByIdAndDelete(id);

    return NextResponse.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting stock request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
