import { Router } from 'express';
import { ShippingController } from '../controllers/shipping.controller';

const router = Router();

router.get('/serviceability', ShippingController.checkServiceability);
router.get('/track/:awb', ShippingController.trackShipment);

export default router;

