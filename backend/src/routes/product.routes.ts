import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { optionalCustomerAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/categories', ProductController.getCategories);
router.get('/categories/:slug', ProductController.getCategoryBySlug);
router.get('/banners', ProductController.getBanners);

router.get('/', ProductController.getProducts);
router.get('/slug/:slug', ProductController.getProductBySlug);
router.get('/:id', ProductController.getProductById);
router.post('/:id/reviews', optionalCustomerAuth, ProductController.addReview);

export default router;

