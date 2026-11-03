import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import shippingRoutes from './shipping.routes';
import paymentRoutes from './payment.routes';
import orderRoutes from './order.routes';
import couponRoutes from './coupon.routes';
import supportRoutes from './support.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/shipping', shippingRoutes);
router.use('/payments', paymentRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/support', supportRoutes);

router.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    brand: 'ANAMIKA COLLECTIONS',
    tagline: 'Elegance in Every Thread',
    timestamp: new Date().toISOString(),
  });
});

export default router;

