import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { authOptions } from "@/lib/authOptions";

// GET all products
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const products = await Product.find({}).sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      photo,
      title,
      description,
      price,
      status,
      stockQuantity,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Product title is required" },
        { status: 400 }
      );
    }

    if (!price?.base || !price?.lowestSellingPrice) {
      return NextResponse.json(
        { error: "Both base price and lowest selling price are required" },
        { status: 400 }
      );
    }

    // Validate price logic
    if (price.lowestSellingPrice > price.base) {
      return NextResponse.json(
        { error: "Lowest selling price cannot be greater than base price" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      photo: photo || undefined,
      title,
      description: description || undefined,
      price: {
        base: price.base,
        lowestSellingPrice: price.lowestSellingPrice,
      },
      status: status || "Active",
      stockQuantity: stockQuantity || 0,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating product:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
