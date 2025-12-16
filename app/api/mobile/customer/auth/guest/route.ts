import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { generateCustomerToken } from "@/lib/verifyCustomerAuth";

/**
 * POST /api/mobile/customer/auth/guest
 * Guest login - creates or retrieves customer based on device ID
 * 
 * If device exists: returns existing customer with token (no name/phone required)
 * If device is new: creates new customer (name and phone required)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { deviceId, name, phone, address } = body;

    // Validate device ID is always required
    if (!deviceId) {
      return NextResponse.json(
        { success: false, message: "Device ID is required" },
        { status: 400 }
      );
    }

    // Check if guest customer already exists with this device
    let customer = await Customer.findOne({ deviceId, authType: "guest" });

    if (customer) {
      // Existing customer - just return with new token
      // Optionally update info if provided
      if (name) customer.name = name;
      if (phone) customer.phone = phone;
      if (address) customer.address = address;
      if (name || phone || address) {
        await customer.save();
      }

      // Generate JWT token (1 year for guest - essentially non-expiring)
      const token = generateCustomerToken({
        id: customer._id.toString(),
        name: customer.name,
        phone: customer.phone,
        authType: "guest",
      }, "365d");

      return NextResponse.json({
        success: true,
        message: "Welcome back!",
        isNewUser: false,
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          authType: customer.authType,
          createdAt: customer.createdAt,
        },
      });
    }

    // New customer - name and phone are required
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Name and phone are required for new account" },
        { status: 400 }
      );
    }

    // Create new guest customer
    customer = await Customer.create({
      deviceId,
      name,
      phone,
      address,
      authType: "guest",
    });

    // Generate JWT token (1 year for guest - essentially non-expiring)
    const token = generateCustomerToken({
      id: customer._id.toString(),
      name: customer.name,
      phone: customer.phone,
      authType: "guest",
    }, "365d");

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      isNewUser: true,
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        authType: customer.authType,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    console.error("Guest login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
