import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken, AdminTokenPayload } from '../utils/token';
import { dbStore } from '../data/dbStore';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
      adminId?: string;
    }
  }
}

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access. Administrator privileges required.',
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAdminToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired administrator token. Access denied.',
    });
  }

  // Verify that the admin account is still active in database
  const admin = dbStore.findAdminById(payload.adminId);
  if (!admin || !admin.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Administrator account is deactivated or not found.',
    });
  }

  req.admin = payload;
  req.adminId = payload.adminId;
  next();
};

