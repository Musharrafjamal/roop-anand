import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import StockRequest from "@/models/StockRequest";
import Employee from "@/models/Employee";
import Product from "@/models/Product";
import { authOptions } from "@/lib/authOptions";

// GET all stock requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const employeeId = searchParams.get("employeeId");

    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;
    if (employeeId) query.employee = employeeId;

    const requests = await StockRequest.find(query)
      .populate("employee", "fullName profilePhoto phoneNumber")
      .populate("product", "title photo price stockQuantity")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching stock requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// POST create new stock request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { employeeId, productId, quantity, reason } = body;

    if (!employeeId || !productId || !quantity || !reason) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Verify product exists (no quantity check here - employees can request any amount)
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const stockRequest = await StockRequest.create({
      employee: employeeId,
      product: productId,
      quantity,
      reason,
      status: "Pending",
    });

    const populatedRequest = await StockRequest.findById(stockRequest._id)
      .populate("employee", "fullName profilePhoto phoneNumber")
      .populate("product", "title photo price stockQuantity");

    return NextResponse.json(populatedRequest, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating stock request:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
