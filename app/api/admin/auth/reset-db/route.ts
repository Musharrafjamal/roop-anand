import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

/**
 * DELETE endpoint to clear all admin users
 * This is for development purposes only - allows reseeding
 */
export async function DELETE() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not allowed in production' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    // Delete all admins
    const result = await Admin.deleteMany({});
    
    return NextResponse.json(
      {
        success: true,
        message: `Deleted ${result.deletedCount} admin user(s)`,
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete admins error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
