import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface CustomerTokenPayload {
  userId: string;
  email?: string | null;
  phone?: string | null;
  role: 'CUSTOMER' | 'GUEST';
}

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  username: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STORE_MANAGER';
}

export const generateCustomerToken = (payload: CustomerTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const verifyCustomerToken = (token: string): CustomerTokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as CustomerTokenPayload;
  } catch (err) {
    return null;
  }
};

export const generateAdminToken = (payload: AdminTokenPayload): string => {
  return jwt.sign(payload, env.ADMIN_JWT_SECRET, {
    expiresIn: env.ADMIN_JWT_EXPIRES_IN as any,
  });
};

export const verifyAdminToken = (token: string): AdminTokenPayload | null => {
  try {
    return jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminTokenPayload;
  } catch (err) {
    return null;
  }
};

