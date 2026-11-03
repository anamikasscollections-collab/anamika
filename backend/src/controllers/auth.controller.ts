import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbStore, UserEntity, AddressEntity } from '../data/dbStore';
import { generateCustomerToken } from '../utils/token';
import { notificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

interface PendingAuth {
  code: string;
  expiresAt: number;
  fullName?: string;
  phone?: string;
  passwordHash?: string;
}

// In-memory OTP storage with 10 minute expiration
const otpStore = new Map<string, PendingAuth>();

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const requestOtpSchema = z.object({
  email: z.string().email('Valid email address is required'),
  fullName: z.string().optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number').optional(),
  password: z.string().min(6).optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Valid email address is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  phone: z.string().optional(),
});

export class AuthController {
  /**
   * Initiate Registration: Collects Full Name, Email, Phone Number, Password.
   * Sends 6-digit OTP to the customer's email via Gmail SMTP.
   */
  public static async register(req: Request, res: Response) {
    try {
      const { fullName, email, password, phone } = req.body;
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();

      // Check existing email
      const existingUser = dbStore.findUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please login.',
        });
      }

      if (dbStore.findUserByPhone(cleanPhone)) {
        return res.status(409).json({
          success: false,
          message: 'An account with this mobile number already exists.',
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStore.set(cleanEmail, {
        code: otp,
        expiresAt,
        fullName,
        phone: cleanPhone,
        passwordHash,
      });

      // Send live OTP email via Gmail
      await notificationService.sendOtpEmail(cleanEmail, otp, fullName);

      return res.status(200).json({
        success: true,
        message: `A 6-digit verification code has been sent to ${cleanEmail}. Please enter the code to complete registration.`,
        data: {
          email: cleanEmail,
          requiresOtp: true,
        },
      });
    } catch (err: any) {
      logger.error('Registration initiate failed', err);
      return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
  }

  /**
   * Login with Email and Password
   */
  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const cleanEmail = email.trim().toLowerCase();

      const user = dbStore.findUserByEmail(cleanEmail);
      if (!user || !user.passwordHash) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
      }

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
      }

      const token = generateCustomerToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });

      return res.json({
        success: true,
        message: 'Welcome back to ANAMIKA COLLECTIONS.',
        data: {
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        },
      });
    } catch (err: any) {
      logger.error('Login error', err);
      return res.status(500).json({ success: false, message: 'Login failed' });
    }
  }

  /**
   * Request OTP directly to Email (for OTP login or passwordless verification)
   */
  public static async requestOtp(req: Request, res: Response) {
    try {
      const { email, fullName, phone, password } = req.body;
      const cleanEmail = email.trim().toLowerCase();

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

      let passwordHash: string | undefined;
      if (password) {
        passwordHash = bcrypt.hashSync(password, 10);
      }

      otpStore.set(cleanEmail, {
        code: otp,
        expiresAt,
        fullName,
        phone,
        passwordHash,
      });

      // Send live email via Gmail
      await notificationService.sendOtpEmail(cleanEmail, otp, fullName);

      return res.json({
        success: true,
        message: `Verification code sent to ${cleanEmail}. Check your inbox.`,
        data: {
          email: cleanEmail,
        },
      });
    } catch (err: any) {
      logger.error('Failed to send email OTP', err);
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }
  }

  /**
   * Verify Email OTP & Finalize Registration / Login
   */
  public static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp, phone: newPhone } = req.body;
      const cleanEmail = email.trim().toLowerCase();

      const stored = otpStore.get(cleanEmail);
      if (!stored || stored.expiresAt < Date.now()) {
        return res.status(400).json({
          success: false,
          message: 'Verification code expired or not found. Please request a new code.',
        });
      }

      if (stored.code !== otp.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code. Please check your email and try again.',
        });
      }

      otpStore.delete(cleanEmail);

      // Find or create customer
      let user = dbStore.findUserByEmail(cleanEmail);

      const resolvedPhone = stored.phone || newPhone || null;

      if (!user) {
        user = {
          id: 'usr-' + Math.random().toString(36).substring(2, 10),
          email: cleanEmail,
          phone: resolvedPhone,
          passwordHash: stored.passwordHash || null,
          fullName: stored.fullName || 'Valued Patron',
          role: 'CUSTOMER',
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dbStore.createUser(user);
      } else {
        // Update user if new phone or password was supplied
        if (stored.passwordHash || resolvedPhone) {
          dbStore.updateUser(user.id, {
            ...(stored.passwordHash && { passwordHash: stored.passwordHash }),
            ...(resolvedPhone && { phone: resolvedPhone }),
            isVerified: true,
          });
        }
      }

      const token = generateCustomerToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });

      return res.json({
        success: true,
        message: 'Email verified successfully. Welcome to ANAMIKA COLLECTIONS.',
        data: {
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        },
      });
    } catch (err: any) {
      logger.error('OTP verification error', err);
      return res.status(500).json({ success: false, message: 'Verification failed' });
    }
  }

  public static async getProfile(req: Request, res: Response) {
    const userId = req.userId!;
    const user = dbStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const addresses = dbStore.getUserAddresses(userId);
    const orders = dbStore.getOrdersByUserId(userId);
    const wishlist = dbStore.getOrCreateWishlist(userId);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
        addresses,
        orderCount: orders.length,
        wishlistCount: wishlist.productIds.length,
      },
    });
  }

  public static async updateProfile(req: Request, res: Response) {
    const userId = req.userId!;
    const { fullName, phone } = req.body;

    const updated = dbStore.updateUser(userId, {
      fullName,
      ...(phone && { phone }),
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  }

  public static async getAddresses(req: Request, res: Response) {
    const userId = req.userId!;
    const addresses = dbStore.getUserAddresses(userId);
    return res.json({ success: true, data: addresses });
  }

  public static async addAddress(req: Request, res: Response) {
    const userId = req.userId!;
    const {
      fullName,
      phone,
      alternatePhone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode,
      isDefault,
      addressType,
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'All core address fields (Name, Phone, Address, City, State, PIN) are required.',
      });
    }

    const address: AddressEntity = {
      id: 'addr-' + Math.random().toString(36).substring(2, 10),
      userId,
      fullName,
      phone,
      alternatePhone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode,
      isDefault: Boolean(isDefault),
      addressType: addressType || 'HOME',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = dbStore.addAddress(address);
    return res.status(201).json({
      success: true,
      message: 'Delivery address added successfully.',
      data: saved,
    });
  }
}
