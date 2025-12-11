import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';

export interface JWTPayload {
  id: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
}

export interface ResetTokenPayload {
  id: string;
  email: string;
  purpose: 'password-reset';
}

/**
 * Generate a JWT token for mobile authentication
 * @param payload - User data to encode in the token
 * @param expiresIn - Token expiration time (default: 7 days)
 */
export function generateToken(payload: JWTPayload, expiresIn: SignOptions['expiresIn'] = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

/**
 * Generate a temporary reset token after OTP verification
 * @param payload - Reset token data
 * @param expiresIn - Token expiration time (default: 5 minutes)
 */
export function generateResetToken(payload: ResetTokenPayload, expiresIn: SignOptions['expiresIn'] = '5m'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken<T = JWTPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

/**
 * Verify a reset token specifically
 * @param token - Reset token to verify
 * @returns Decoded payload or null if invalid/expired
 */
export function verifyResetToken(token: string): ResetTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    if (decoded.purpose !== 'password-reset') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
