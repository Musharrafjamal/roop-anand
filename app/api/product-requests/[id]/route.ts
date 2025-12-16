import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductRequest from "@/models/ProductRequest";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/product-requests/[id]
 * Get a single product request by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const productRequest = await ProductRequest.findById(id)
      .populate("customer", "name email phone authType address createdAt")
      .populate("products.product", "title photo description price stockQuantity")
      .lean();

    if (!productRequest) {
      return NextResponse.json(
        { success: false, message: "Product request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: productRequest,
    });
  } catch (error) {
    console.error("Error fetching product request:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/product-requests/[id]
 * Update a product request (mainly for status updates)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Only allow certain fields to be updated
    const allowedUpdates: Record<string, unknown> = {};

    if (body.status && ["pending", "ongoing", "delivered"].includes(body.status)) {
      allowedUpdates.status = body.status;
    }

    if (body.notes !== undefined) {
      allowedUpdates.notes = body.notes;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const productRequest = await ProductRequest.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    )
      .populate("customer", "name email phone authType")
      .populate("products.product", "title photo price");

    if (!productRequest) {
      return NextResponse.json(
        { success: false, message: "Product request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product request updated successfully",
      request: productRequest,
    });
  } catch (error) {
    console.error("Error updating product request:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/product-requests/[id]
 * Delete a product request
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const productRequest = await ProductRequest.findByIdAndDelete(id);

    if (!productRequest) {
      return NextResponse.json(
        { success: false, message: "Product request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product request:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
