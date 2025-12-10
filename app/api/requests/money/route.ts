import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import MoneyRequest from "@/models/MoneyRequest";
import Employee from "@/models/Employee";
import { authOptions } from "@/lib/authOptions";

// GET all money requests
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

    const requests = await MoneyRequest.find(query)
      .populate("employee", "fullName profilePhoto phoneNumber holdings")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching money requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// POST create new money request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { employeeId, amount, method, referenceNumber } = body;

    if (!employeeId || !amount || !method) {
      return NextResponse.json(
        { error: "Employee, amount, and method are required" },
        { status: 400 }
      );
    }

    if (method === "Online" && !referenceNumber) {
      return NextResponse.json(
        { error: "Reference number is required for online payments" },
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

    // Check if employee has enough holdings
    const holdingsField = method === "Cash" ? "cash" : "online";
    const availableAmount = employee.holdings?.[holdingsField] || 0;

    if (availableAmount < amount) {
      return NextResponse.json(
        { error: `Insufficient ${method.toLowerCase()} holdings. Available: ₹${availableAmount}` },
        { status: 400 }
      );
    }

    const moneyRequest = await MoneyRequest.create({
      employee: employeeId,
      amount,
      method,
      referenceNumber: method === "Online" ? referenceNumber : undefined,
      status: "Pending",
    });

    const populatedRequest = await MoneyRequest.findById(moneyRequest._id)
      .populate("employee", "fullName profilePhoto phoneNumber holdings");

    return NextResponse.json(populatedRequest, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating money request:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
