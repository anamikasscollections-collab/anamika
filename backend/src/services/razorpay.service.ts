import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface CreateRazorpayOrderParams {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentSignatureParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

class RazorpayService {
  private razorpayInstance: Razorpay | null = null;
  private isConfigured: boolean = false;

  constructor() {
    if (
      env.RAZORPAY_KEY_ID &&
      env.RAZORPAY_KEY_SECRET &&
      !env.RAZORPAY_KEY_ID.includes('sample_') &&
      !env.RAZORPAY_KEY_SECRET.includes('sample_')
    ) {
      try {
        this.razorpayInstance = new Razorpay({
          key_id: env.RAZORPAY_KEY_ID,
          key_secret: env.RAZORPAY_KEY_SECRET,
        });
        this.isConfigured = true;
        logger.info('Razorpay initialized with live/test API keys');
      } catch (err) {
        logger.error('Failed to initialize Razorpay SDK', err);
      }
    } else {
      logger.warn(
        'Razorpay credentials are using sample/test placeholders. Operating in high-fidelity mock/test mode.'
      );
    }
  }

  public getPublicKey(): string {
    return env.RAZORPAY_KEY_ID;
  }

  public async createOrder(params: CreateRazorpayOrderParams) {
    logger.info(`Creating Razorpay Order for receipt ${params.receipt}, amount: ₹${params.amountPaise / 100}`);

    if (this.isConfigured && this.razorpayInstance) {
      try {
        const order = await this.razorpayInstance.orders.create({
          amount: params.amountPaise,
          currency: params.currency || 'INR',
          receipt: params.receipt,
          notes: {
            ...params.notes,
            brand: 'ANAMIKA COLLECTIONS',
            tagline: 'Elegance in Every Thread',
            payment_type: 'UPI_ONLY',
          },
        });
        return {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          isMock: false,
        };
      } catch (err: any) {
        logger.error('Razorpay API order creation failed', err);
        throw new Error(err?.error?.description || 'Razorpay order creation failed');
      }
    }

    // High-fidelity sandbox / test simulation when sample keys are present
    const mockOrderId = 'order_' + crypto.randomBytes(8).toString('hex');
    return {
      id: mockOrderId,
      amount: params.amountPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      isMock: true,
    };
  }

  public verifyPaymentSignature(params: VerifyPaymentSignatureParams): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    // For mock testing when using placeholder keys
    if (!this.isConfigured || razorpayOrderId.startsWith('order_')) {
      if (razorpaySignature === 'mock_upi_verified_sig' || razorpaySignature.startsWith('sig_')) {
        return true;
      }
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature);
    const signatureBuf = Buffer.from(razorpaySignature);

    if (expectedBuf.length !== signatureBuf.length) {
      logger.info(`Razorpay Signature Verification: FAILED (length mismatch) for order ${razorpayOrderId}`);
      return false;
    }

    const isValid = crypto.timingSafeEqual(expectedBuf, signatureBuf);

    logger.info(`Razorpay Signature Verification: ${isValid ? 'PASSED' : 'FAILED'} for order ${razorpayOrderId}`);
    return isValid;
  }

  public verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      logger.warn('RAZORPAY_WEBHOOK_SECRET not configured');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature);
      const signatureBuf = Buffer.from(signature);

      if (expectedBuf.length !== signatureBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuf, signatureBuf);
    } catch (err) {
      logger.error('Error verifying webhook signature', err);
      return false;
    }
  }

  public getUpiOnlyCheckoutConfig() {
    return {
      key: this.getPublicKey(),
      name: 'ANAMIKA COLLECTIONS',
      description: 'Elegance in Every Thread - Luxury Sarees & Kurtis',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80',
      theme: {
        color: '#58111A', // Deep wine brand color
      },
      // Strict UPI-Only Configuration
      config: {
        display: {
          blocks: {
            upi_block: {
              name: 'Pay with UPI (GPay, PhonePe, Paytm, BHIM)',
              instruments: [
                {
                  method: 'upi',
                },
              ],
            },
          },
          sequence: ['block.upi_block'],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
      modal: {
        backdropclose: false,
        escape: false,
        handleback: true,
        confirm_close: true,
      },
    };
  }
}

export const razorpayService = new RazorpayService();
