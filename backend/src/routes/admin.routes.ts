import { Router } from 'express';
import { AdminController, adminLoginSchema } from '../controllers/admin.controller';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { requireAdminAuth } from '../middlewares/adminAuth.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Secure Admin Authentication (NO public admin registration)
router.post('/login', authRateLimiter, validateRequest(adminLoginSchema), AdminController.login);

// Admin Overview
router.get('/overview', requireAdminAuth, AdminController.getOverview);

// Products & Inventory Management
router.get('/products', requireAdminAuth, AdminController.getProducts);
router.post('/products', requireAdminAuth, AdminController.createProduct);
router.put('/products/:id', requireAdminAuth, AdminController.updateProduct);
router.delete('/products/:id', requireAdminAuth, AdminController.deleteProduct);
router.post('/inventory/adjust', requireAdminAuth, AdminController.adjustInventory);

// Orders Management
router.get('/orders', requireAdminAuth, AdminController.getOrders);
router.put('/orders/:id/status', requireAdminAuth, AdminController.updateOrderStatus);
router.post('/orders/:id/shipment', requireAdminAuth, AdminController.createShipmentForOrder);

// Coupons Management
router.get('/coupons', requireAdminAuth, AdminController.getCoupons);
router.post('/coupons', requireAdminAuth, AdminController.createCoupon);
router.put('/coupons/:id/toggle', requireAdminAuth, AdminController.toggleCoupon);

// Banners & Content Management
router.get('/banners', requireAdminAuth, AdminController.getBanners);
router.put('/banners/:id', requireAdminAuth, AdminController.updateBanner);

// Customer Complaints / Defective & Damaged Support Management
router.get('/support', requireAdminAuth, AdminController.getSupportTickets);
router.put('/support/:id', requireAdminAuth, AdminController.updateSupportTicket);

export default router;

