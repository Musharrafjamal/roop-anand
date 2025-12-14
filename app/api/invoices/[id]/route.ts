import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";

// GET - Get single invoice by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const invoice = await Invoice.findById(id).populate(
      "items.product",
      "title photo price"
    );

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PUT - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const data = await request.json();

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

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

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum: number, item: { amount: number }) => sum + item.amount,
      0
    );
    const taxAmount = data.taxRate ? (subtotal * data.taxRate) / 100 : 0;
    const discount = data.discount || 0;
    const total = subtotal + taxAmount - discount;
    const amountDue = total;

    // Update invoice fields
    invoice.dateOfIssue = data.dateOfIssue || invoice.dateOfIssue;
    invoice.dueDate = data.dueDate || invoice.dueDate;
    invoice.customer = {
      name: data.customer.name,
      address: data.customer.address || "",
      city: data.customer.city || "",
      state: data.customer.state || "",
      pincode: data.customer.pincode || "",
      phone: data.customer.phone || undefined,
      email: data.customer.email || undefined,
    };
    invoice.items = data.items.map(
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
    );
    invoice.subtotal = subtotal;
    invoice.taxRate = data.taxRate || 0;
    invoice.taxAmount = taxAmount;
    invoice.discount = discount;
    invoice.total = total;
    invoice.amountDue = amountDue;
    invoice.notes = data.notes || undefined;
    invoice.status = data.status || invoice.status;

    await invoice.save();

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
