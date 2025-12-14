import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";

// GET - Get all invoices with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.product", "title photo price"),
      Invoice.countDocuments(query),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();

    // Validate required fields
    if (!data.customer?.name?.trim()) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    if (!data.dueDate) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum: number, item: { amount: number }) => sum + item.amount,
      0
    );
    const taxAmount = data.taxRate ? (subtotal * data.taxRate) / 100 : 0;
    const discount = data.discount || 0;
    const total = subtotal + taxAmount - discount;
    const amountDue = total;

    const invoice = await Invoice.create({
      dateOfIssue: data.dateOfIssue || new Date(),
      dueDate: data.dueDate,
      customer: {
        name: data.customer.name,
        address: data.customer.address || "",
        city: data.customer.city || "",
        state: data.customer.state || "",
        pincode: data.customer.pincode || "",
        phone: data.customer.phone || undefined,
        email: data.customer.email || undefined,
      },
      items: data.items.map(
        (item: {
          product?: string;
          description: string;
          quantity: number;
          unitPrice: number;
          amount: number;
        }) => ({
          product: item.product || undefined,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })
      ),
      subtotal,
      taxRate: data.taxRate || 0,
      taxAmount,
      discount,
      total,
      amountDue,
      notes: data.notes || undefined,
      status: data.status || "Draft",
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
