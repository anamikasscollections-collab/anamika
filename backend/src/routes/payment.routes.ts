import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { paymentRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.get('/razorpay/config', PaymentController.getCheckoutConfig);
router.post('/razorpay/create-order', paymentRateLimiter, PaymentController.createRazorpayOrder);
router.post('/razorpay/verify', paymentRateLimiter, PaymentController.verifyPayment);
router.post('/razorpay/webhook', PaymentController.handleWebhook);

export default router;

