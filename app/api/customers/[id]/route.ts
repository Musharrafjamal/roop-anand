import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import ProductRequest from "@/models/ProductRequest";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/customers/[id]
 * Get a single customer by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const customer = await Customer.findById(id).select("-password").lean();

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    // Get customer's request count
    const requestCount = await ProductRequest.countDocuments({ customer: id });

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
        requestCount,
      },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customers/[id]
 * Update a customer
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    delete body.password;
    delete body.deviceId;
    delete body.authType;

    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).select("-password");

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete a customer and their requests
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    // Delete associated product requests
    await ProductRequest.deleteMany({ customer: id });

    return NextResponse.json({
      success: true,
      message: "Customer and associated requests deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
