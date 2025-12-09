import { NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await getAdminFromCookies();

    if (!admin) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        admin: {
          id: admin.adminId,
          email: admin.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
