import { Request, Response } from 'express';
import { dbStore, PaymentEntity } from '../data/dbStore';
import { razorpayService } from '../services/razorpay.service';
import { notificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

export class PaymentController {
  public static async getCheckoutConfig(_req: Request, res: Response) {
    const config = razorpayService.getUpiOnlyCheckoutConfig();
    return res.json({ success: true, data: config });
  }

  public static async createRazorpayOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ success: false, message: 'orderId is required' });
      }

      const order = dbStore.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.status !== 'AWAITING_PAYMENT') {
        return res.status(400).json({
          success: false,
          message: `Order cannot be paid in current status: ${order.status}`,
        });
      }

      // Check if active payment record exists
      let payment = dbStore.getPaymentByOrderId(order.id);
      if (payment && payment.razorpayOrderId && payment.status === 'PENDING') {
        return res.json({
          success: true,
          data: {
            razorpayOrderId: payment.razorpayOrderId,
            amount: payment.amount,
            currency: payment.currency,
            keyId: razorpayService.getPublicKey(),
            orderNumber: order.orderNumber,
          },
        });
      }

      // Create new Razorpay order on server with exact calculated total amount in paise
      const rzpOrder = await razorpayService.createOrder({
        amountPaise: order.totalAmount,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          paymentPreference: 'UPI_ONLY',
        },
      });

      const paymentRecord: PaymentEntity = {
        id: 'pay-' + Math.random().toString(36).substring(2, 9),
        orderId: order.id,
        paymentProvider: 'RAZORPAY',
        razorpayOrderId: rzpOrder.id,
        amount: order.totalAmount,
        currency: 'INR',
        status: 'PENDING',
        method: 'UPI',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dbStore.savePayment(paymentRecord);

      return res.json({
        success: true,
        data: {
          razorpayOrderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          keyId: razorpayService.getPublicKey(),
          orderNumber: order.orderNumber,
        },
      });
    } catch (err: any) {
      logger.error('Failed to create Razorpay payment order', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Payment initiation failed',
      });
    }
  }

  public static async verifyPayment(req: Request, res: Response) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId, upiVpa } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required Razorpay payment verification fields.',
        });
      }

      const order = dbStore.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Verify cryptographic HMAC SHA256 signature on backend
      const isValid = razorpayService.verifyPaymentSignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!isValid) {
        // Mark payment as failed / verification failed
        const payment = dbStore.getPaymentByOrderId(order.id);
        if (payment) {
          payment.status = 'FAILED';
          payment.failureReason = 'Cryptographic signature verification failed';
          dbStore.savePayment(payment);
        }

        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid transaction signature.',
        });
      }

      // Successful verification
      const payment: PaymentEntity = {
        id: 'pay-' + Math.random().toString(36).substring(2, 9),
        orderId: order.id,
        paymentProvider: 'RAZORPAY',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: order.totalAmount,
        currency: 'INR',
        status: 'SUCCESS',
        method: 'UPI',
        upiVpa: upiVpa || 'upi@bank',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dbStore.savePayment(payment);
      dbStore.updateOrderStatus(order.id, 'PAYMENT_SUCCESSFUL');

      // Deduct inventory quantities safely
      for (const item of order.items) {
        dbStore.adjustInventory(item.variantId, -item.quantity);
      }

      // Clear customer's cart if exists
      if (order.userId) {
        const cart = dbStore.getOrCreateCart(order.userId);
        dbStore.clearCart(cart.id);
      }

      // Dispatch order & payment confirmation notifications (WhatsApp + Email)
      notificationService.sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.guestEmail,
        customerPhone: order.shippingAddress.phone || order.guestPhone,
        totalAmountPaise: order.totalAmount,
        items: order.items,
        deliveryAddress: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
      });

      return res.json({
        success: true,
        message: 'UPI payment verified successfully. Order is now confirmed!',
        data: {
          orderNumber: order.orderNumber,
          orderId: order.id,
          status: 'PAYMENT_SUCCESSFUL',
          paymentId: razorpayPaymentId,
          totalAmount: order.totalAmount,
        },
      });
    } catch (err: any) {
      logger.error('Payment verification exception', err);
      return res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
  }

  public static async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      // Verify webhook signature
      const isSignatureValid = razorpayService.verifyWebhookSignature(rawBody, signature);
      if (!isSignatureValid) {
        logger.warn('Razorpay webhook signature verification failed');
        return res.status(400).json({ status: 'invalid_signature' });
      }

      const event = req.body;
      const eventId = event?.id || `${event.event}_${Date.now()}`;

      // Idempotency check: prevent duplicate webhook executions
      if (dbStore.isWebhookEventProcessed(eventId)) {
        logger.info(`Webhook event ${eventId} already processed (idempotent ignore)`);
        return res.status(200).json({ status: 'already_processed' });
      }

      logger.info(`Received Razorpay webhook event: ${event.event} [${eventId}]`);

      if (event.event === 'payment.captured' || event.event === 'order.paid') {
        const payloadOrder = event.payload?.order?.entity;
        const payloadPayment = event.payload?.payment?.entity;
        const rzpOrderId = payloadOrder?.id || payloadPayment?.order_id;

        if (rzpOrderId) {
          const payment = dbStore.getPaymentByRazorpayOrderId(rzpOrderId);
          if (payment && payment.status !== 'SUCCESS') {
            payment.status = 'SUCCESS';
            payment.razorpayPaymentId = payloadPayment?.id;
            payment.upiVpa = payloadPayment?.vpa;
            payment.method = 'UPI';
            dbStore.savePayment(payment);

            const order = dbStore.getOrderById(payment.orderId);
            if (order && order.status === 'AWAITING_PAYMENT') {
              dbStore.updateOrderStatus(order.id, 'PAYMENT_SUCCESSFUL');

              // Deduct stock
              for (const item of order.items) {
                dbStore.adjustInventory(item.variantId, -item.quantity);
              }
            }
          }
        }
      } else if (event.event === 'payment.failed') {
        const payloadPayment = event.payload?.payment?.entity;
        const rzpOrderId = payloadPayment?.order_id;
        if (rzpOrderId) {
          const payment = dbStore.getPaymentByRazorpayOrderId(rzpOrderId);
          if (payment) {
            payment.status = 'FAILED';
            payment.failureReason = payloadPayment?.error_description || 'Payment failed';
            dbStore.savePayment(payment);
          }
        }
      }

      dbStore.markWebhookEventProcessed(eventId);
      return res.status(200).json({ status: 'ok' });
    } catch (err: any) {
      logger.error('Webhook error', err);
      return res.status(500).json({ status: 'error' });
    }
  }
}

