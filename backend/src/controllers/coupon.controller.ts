import { Request, Response } from 'express';
import { dbStore } from '../data/dbStore';

export class CouponController {
  public static async validateCoupon(req: Request, res: Response) {
    const { code, subtotalPaise } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = dbStore.findCouponByCode(code);
    if (!coupon || !coupon.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive promo coupon code.',
      });
    }

    const now = new Date();
    if (new Date(coupon.validUntil) < now) {
      return res.status(400).json({
        success: false,
        message: 'This promo coupon has expired.',
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This promo coupon usage limit has been reached.',
      });
    }

    const subtotal = Number(subtotalPaise || 0);
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderAmount / 100} required to apply this coupon.`,
      });
    }

    let discountPaise = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountPaise = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountPaise > coupon.maxDiscountAmount) {
        discountPaise = coupon.maxDiscountAmount;
      }
    } else {
      discountPaise = Math.min(coupon.discountValue, subtotal);
    }

    return res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You save ₹${discountPaise / 100}.`,
      data: {
        code: coupon.code,
        discountPaise,
        discountRupees: discountPaise / 100,
        description: coupon.description,
      },
    });
  }
}

