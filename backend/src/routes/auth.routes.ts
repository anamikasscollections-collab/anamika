import { Router } from 'express';
import { AuthController, registerSchema, loginSchema, requestOtpSchema, verifyOtpSchema } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { requireCustomerAuth } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/otp/request', authRateLimiter, validateRequest(requestOtpSchema), AuthController.requestOtp);
router.post('/otp/verify', authRateLimiter, validateRequest(verifyOtpSchema), AuthController.verifyOtp);

router.get('/profile', requireCustomerAuth, AuthController.getProfile);
router.put('/profile', requireCustomerAuth, AuthController.updateProfile);
router.get('/addresses', requireCustomerAuth, AuthController.getAddresses);
router.post('/addresses', requireCustomerAuth, AuthController.addAddress);

export default router;

