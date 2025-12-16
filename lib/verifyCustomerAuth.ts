import { NextRequest, NextResponse } from 'next/server';
import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';

export interface CustomerJWTPayload {
  id: string;
  name: string;
  phone: string;
  email?: string;
  authType: 'guest' | 'registered';
}

/**
 * Generate a JWT token for customer authentication
 */
export function generateCustomerToken(payload: CustomerJWTPayload, expiresIn: SignOptions['expiresIn'] = '30d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

/**
 * Verify JWT token from Authorization header for customer routes
 */
export function verifyCustomerAuth(request: NextRequest): {
  success: true;
  customer: CustomerJWTPayload;
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
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomerJWTPayload;
    return {
      success: true,
      customer: decoded,
    };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }
}
