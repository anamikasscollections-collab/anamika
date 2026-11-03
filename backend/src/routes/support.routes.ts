import { Router } from 'express';
import { SupportController } from '../controllers/support.controller';

const router = Router();

router.post('/complaint', SupportController.submitComplaint);
router.get('/ticket/:ticketNumber', SupportController.checkTicketStatus);

export default router;

