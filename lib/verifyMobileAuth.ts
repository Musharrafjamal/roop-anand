import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Verify JWT token from Authorization header
 * Returns the decoded user payload if valid, or an error response if invalid
 */
export function verifyMobileAuth(request: NextRequest): {
  success: true;
  user: JWTPayload;
} | {
  success: false;
  response: NextResponse;
} {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Authorization header is required' },
        { status: 401 }
      ),
    };
  }

  // Extract token from "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid authorization header format. Use: Bearer <token>' },
        { status: 401 }
      ),
    };
  }

  const token = parts[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  return {
    success: true,
    user: decoded,
  };
}
