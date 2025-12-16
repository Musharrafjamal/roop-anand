import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { generateCustomerToken } from "@/lib/verifyCustomerAuth";

/**
 * POST /api/mobile/customer/auth/login
 * Login with email and password
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find customer by email
    const customer = await Customer.findOne({ 
      email: email.toLowerCase(), 
      authType: "registered" 
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password!);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

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
      message: "Login successful",
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
