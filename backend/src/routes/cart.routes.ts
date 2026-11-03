import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { optionalCustomerAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(optionalCustomerAuth);

router.get('/', CartController.getCart);
router.post('/items', CartController.updateItem);
router.delete('/items/:variantId', CartController.removeItem);
router.delete('/clear', CartController.clearCart);

export default router;

