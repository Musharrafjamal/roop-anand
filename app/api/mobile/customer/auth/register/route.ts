import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { generateCustomerToken } from "@/lib/verifyCustomerAuth";

/**
 * POST /api/mobile/customer/auth/register
 * Register a new customer with email and password
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, name, phone, address } = body;

    // Validate required fields
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { success: false, message: "Email, password, name, and phone are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Email is already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new registered customer
    const customer = await Customer.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone,
      address,
      authType: "registered",
    });

    // Generate JWT token
    const token = generateCustomerToken({
      id: customer._id.toString(),
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      authType: "registered",
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        authType: customer.authType,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
