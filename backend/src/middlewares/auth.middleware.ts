import { Request, Response, NextFunction } from 'express';
import { verifyCustomerToken, CustomerTokenPayload } from '../utils/token';
import { dbStore } from '../data/dbStore';

declare global {
  namespace Express {
    interface Request {
      user?: CustomerTokenPayload;
      userId?: string;
    }
  }
}

export const requireCustomerAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login or continue as guest.',
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyCustomerToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }

  req.user = payload;
  req.userId = payload.userId;
  next();
};

export const optionalCustomerAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyCustomerToken(token);
    if (payload) {
      req.user = payload;
      req.userId = payload.userId;
    }
  }
  next();
};

