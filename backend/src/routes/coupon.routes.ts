import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';

const router = Router();

router.post('/validate', CouponController.validateCoupon);

export default router;

