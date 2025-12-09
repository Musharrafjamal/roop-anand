import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { generateResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    // But only send email if admin exists
    if (admin) {
      // Generate reset token
      const resetToken = generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save reset token to database
      admin.resetToken = resetToken;
      admin.resetTokenExpiry = resetTokenExpiry;
      await admin.save();

      // Send password reset email
      try {
        await sendPasswordResetEmail(admin.email, resetToken);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        return NextResponse.json(
          { error: 'Failed to send reset email. Please check email configuration.' },
          { status: 500 }
        );
      }
    }

    // Always return success message
    return NextResponse.json(
      {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
