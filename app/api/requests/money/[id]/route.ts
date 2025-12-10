import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import MoneyRequest from "@/models/MoneyRequest";
import Employee from "@/models/Employee";
import { authOptions } from "@/lib/authOptions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single money request
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const moneyRequest = await MoneyRequest.findById(id)
      .populate("employee", "fullName profilePhoto phoneNumber holdings");

    if (!moneyRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(moneyRequest);
  } catch (error) {
    console.error("Error fetching money request:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}

// PUT update money request (approve/reject)
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

    const moneyRequest = await MoneyRequest.findById(id);
    if (!moneyRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (moneyRequest.status !== "Pending") {
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

      moneyRequest.status = "Rejected";
      moneyRequest.rejectionReason = rejectionReason;
      moneyRequest.processedAt = new Date();
      await moneyRequest.save();
    } else {
      // Approve - deduct from employee holdings
      const employee = await Employee.findById(moneyRequest.employee);
      if (!employee) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        );
      }

      // Initialize holdings if not exists
      if (!employee.holdings) {
        employee.holdings = { cash: 0, online: 0, total: 0 };
      }

      const holdingsField = moneyRequest.method === "Cash" ? "cash" : "online";
      const availableAmount = employee.holdings[holdingsField] || 0;

      if (availableAmount < moneyRequest.amount) {
        return NextResponse.json(
          { error: `Insufficient ${moneyRequest.method.toLowerCase()} holdings. Available: ₹${availableAmount}` },
          { status: 400 }
        );
      }

      // Deduct from holdings
      employee.holdings[holdingsField] -= moneyRequest.amount;
      employee.holdings.total -= moneyRequest.amount;
      await employee.save();

      moneyRequest.status = "Approved";
      moneyRequest.processedAt = new Date();
      await moneyRequest.save();
    }

    const populatedRequest = await MoneyRequest.findById(id)
      .populate("employee", "fullName profilePhoto phoneNumber holdings");

    return NextResponse.json(populatedRequest);
  } catch (error) {
    console.error("Error updating money request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

// DELETE money request
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const moneyRequest = await MoneyRequest.findById(id);
    if (!moneyRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    await MoneyRequest.findByIdAndDelete(id);

    return NextResponse.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting money request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
