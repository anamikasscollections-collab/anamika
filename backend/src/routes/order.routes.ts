import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { optionalCustomerAuth, requireCustomerAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/checkout', optionalCustomerAuth, OrderController.createCheckoutOrder);
router.get('/my-orders', requireCustomerAuth, OrderController.getCustomerOrders);
router.get('/:idOrNumber', OrderController.getOrderDetails);
router.get('/:id/invoice', OrderController.getInvoice);

export default router;

