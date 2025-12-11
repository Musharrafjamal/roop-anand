import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { generateOTP, hashPassword } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find employee by email
    const employee = await Employee.findOne({ email: email.toLowerCase() });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Email not found' },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = generateOTP();

    // Hash the OTP before storing (security best practice)
    const hashedOTP = await hashPassword(otp);

    // Set OTP expiry to 10 minutes from now
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update employee with OTP
    await Employee.findByIdAndUpdate(employee._id, {
      otp: hashedOTP,
      otpExpiry,
    }, { new: true });

    // Send OTP email
    await sendOTPEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
