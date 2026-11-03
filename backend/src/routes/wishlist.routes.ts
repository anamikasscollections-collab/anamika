import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { requireCustomerAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireCustomerAuth);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggleItem);
router.post('/move-to-cart', WishlistController.moveToCart);

export default router;

