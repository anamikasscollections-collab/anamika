import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface SendOrderConfirmationParams {
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  totalAmountPaise: number;
  items: { productName: string; size: string; color: string; quantity: number; unitPrice: number }[];
  deliveryAddress: string;
}

export interface SendShippingUpdateParams {
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  courierName: string;
  awbCode: string;
  trackingUrl: string;
  estimatedDeliveryDate: string;
}

class NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_USER && !env.SMTP_USER.includes('sample_')) {
      try {
        this.emailTransporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: parseInt(env.SMTP_PORT, 10),
          secure: parseInt(env.SMTP_PORT, 10) === 465,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });
        logger.info('Nodemailer SMTP email transporter initialized');
      } catch (err) {
        logger.error('Failed to configure email transporter', err);
      }
    }
  }

  public async sendOrderConfirmation(params: SendOrderConfirmationParams) {
    const totalRupees = (params.totalAmountPaise / 100).toLocaleString('en-IN');
    logger.info(
      `[NOTIFICATION] Sending Order & Payment Confirmation for ${params.orderNumber} to ${params.customerEmail || params.customerPhone}`
    );

    // 1. WhatsApp notification (Official API / Mock Logger)
    if (params.customerPhone) {
      this.sendWhatsAppMessage({
        recipientPhone: params.customerPhone,
        templateName: 'order_payment_confirmed',
        bodyText: `Namaste ${params.customerName}! ✨ Your order #${params.orderNumber} for ₹${totalRupees} at ANAMIKA COLLECTIONS is confirmed. We are carefully hand-inspecting and packing your exquisite drapes. Track status anytime on our website. Elegance in Every Thread.`,
      });
    }

    // 2. Email notification with Luxury Brand HTML template
    if (params.customerEmail) {
      const itemsListHtml = params.items
        .map(
          (i) => `
          <tr style="border-bottom: 1px solid #EADBC8;">
            <td style="padding: 12px 8px; font-family: 'Georgia', serif; color: #2A1810;">
              <strong>${i.productName}</strong><br/>
              <span style="font-size: 12px; color: #721B27;">Size: ${i.size} | Shade: ${i.color} | Qty: ${i.quantity}</span>
            </td>
            <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #58111A;">
              ₹${((i.unitPrice * i.quantity) / 100).toLocaleString('en-IN')}
            </td>
          </tr>`
        )
        .join('');

      const htmlContent = `
        <div style="background-color: #FAF7F2; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #2A1810;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EADBC8; border-top: 4px solid #58111A; box-shadow: 0 4px 12px rgba(88,17,26,0.08); padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="font-family: 'Georgia', serif; font-size: 26px; letter-spacing: 3px; color: #58111A; margin: 0; text-transform: uppercase;">ANAMIKA COLLECTIONS</h1>
              <p style="color: #D4AF37; font-size: 13px; letter-spacing: 2px; margin-top: 4px; text-transform: uppercase;">Elegance in Every Thread</p>
            </div>

            <h2 style="font-family: 'Georgia', serif; color: #58111A; font-size: 20px; border-bottom: 1px solid #EADBC8; padding-bottom: 12px;">Payment Successful & Order Confirmed</h2>
            <p>Dear ${params.customerName},</p>
            <p>Thank you for shopping with <strong>ANAMIKA COLLECTIONS</strong>. Your payment via verified UPI has been successfully received, and your order <strong>#${params.orderNumber}</strong> has been confirmed.</p>

            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <thead>
                <tr style="background-color: #FAF7F2; border-bottom: 2px solid #58111A;">
                  <th style="padding: 10px 8px; text-align: left; font-size: 13px; color: #58111A;">Ensemble</th>
                  <th style="padding: 10px 8px; text-align: right; font-size: 13px; color: #58111A;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding: 16px 8px; text-align: right; font-weight: bold; font-size: 16px;">Total Paid:</td>
                  <td style="padding: 16px 8px; text-align: right; font-weight: bold; font-size: 18px; color: #58111A;">₹${totalRupees}</td>
                </tr>
              </tfoot>
            </table>

            <div style="background-color: #FDFBF8; border-left: 3px solid #D4AF37; padding: 12px 16px; margin-bottom: 24px;">
              <strong style="color: #58111A; font-size: 13px;">Delivery Address:</strong><br/>
              <span style="font-size: 13px; color: #42281D;">${params.deliveryAddress}</span>
            </div>

            <div style="background-color: #FAF7F2; padding: 12px; font-size: 12px; color: #555; text-align: center; border-radius: 4px;">
              <strong>Store Policy:</strong> We uphold an uncompromising standard of purity. All sales are final with <em>No Returns or Exchanges</em>. For defective or damaged in-transit items, please contact support within 48 hours with unboxing video proof.
            </div>

            <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #888;">
              <p>With Warmth & Royal Regards,<br/><strong>ANAMIKA COLLECTIONS Concierge</strong></p>
            </div>
          </div>
        </div>
      `;

      await this.sendEmail({
        to: params.customerEmail,
        subject: `Order Confirmed: #${params.orderNumber} | ANAMIKA COLLECTIONS`,
        html: htmlContent,
      });
    }
  }

  public async sendShippingUpdate(params: SendShippingUpdateParams) {
    logger.info(
      `[NOTIFICATION] Shipment Dispatched: Order #${params.orderNumber}, AWB: ${params.awbCode}`
    );

    if (params.customerPhone) {
      this.sendWhatsAppMessage({
        recipientPhone: params.customerPhone,
        templateName: 'shipment_dispatched',
        bodyText: `Your ANAMIKA COLLECTIONS order #${params.orderNumber} has been dispatched via ${params.courierName}! Tracking AWB: ${params.awbCode}. Expected Delivery: ${params.estimatedDeliveryDate}. Track here: ${params.trackingUrl}`,
      });
    }

    if (params.customerEmail) {
      const htmlContent = `
        <div style="background-color: #FAF7F2; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFF; border: 1px solid #EADBC8; border-top: 4px solid #58111A; padding: 32px;">
            <h1 style="font-family: 'Georgia', serif; font-size: 22px; color: #58111A; text-align: center;">ANAMIKA COLLECTIONS</h1>
            <p style="color: #D4AF37; text-align: center; font-size: 12px; letter-spacing: 2px;">Elegance in Every Thread</p>
            <h3 style="color: #58111A;">Your Royal Package is On Its Way! 🚚</h3>
            <p>Dear ${params.customerName},</p>
            <p>Your order <strong>#${params.orderNumber}</strong> has been carefully packed and handed over to <strong>${params.courierName}</strong>.</p>
            <div style="background-color: #FAF7F2; padding: 16px; margin: 20px 0; border: 1px dashed #D4AF37;">
              <p style="margin: 4px 0;"><strong>Courier:</strong> ${params.courierName}</p>
              <p style="margin: 4px 0;"><strong>Air Waybill (AWB):</strong> ${params.awbCode}</p>
              <p style="margin: 4px 0;"><strong>Estimated Delivery:</strong> ${params.estimatedDeliveryDate}</p>
              <p style="margin: 12px 0 4px 0;"><a href="${params.trackingUrl}" style="background-color: #58111A; color: #FFF; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">Track Live Shipment</a></p>
            </div>
            <p style="font-size: 12px; color: #888;">Thank you for choosing ANAMIKA COLLECTIONS.</p>
          </div>
        </div>
      `;

      await this.sendEmail({
        to: params.customerEmail,
        subject: `Dispatched: Order #${params.orderNumber} | Track Your Shipment`,
        html: htmlContent,
      });
    }
  }

  public async sendOtpEmail(email: string, otp: string, customerName?: string) {
    logger.info(`[NOTIFICATION] Sending Live Email OTP to ${email}`);
    const name = customerName || 'Valued Patron';

    const htmlContent = `
      <div style="background-color: #FAF7F2; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #2A1810;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EADBC8; border-top: 4px solid #58111A; box-shadow: 0 4px 16px rgba(88,17,26,0.08); padding: 32px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-family: 'Georgia', serif; font-size: 26px; letter-spacing: 3px; color: #58111A; margin: 0; text-transform: uppercase;">ANAMIKA COLLECTIONS</h1>
            <p style="color: #D4AF37; font-size: 12px; letter-spacing: 2px; margin-top: 4px; text-transform: uppercase;">Elegance in Every Thread</p>
          </div>

          <h2 style="font-family: 'Georgia', serif; color: #58111A; font-size: 20px; text-align: center; margin-bottom: 16px;">Email Verification Code</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #42281D;">Namaste ${name},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #42281D;">Please use the following 6-digit verification code to complete your secure login / registration with ANAMIKA COLLECTIONS:</p>

          <div style="background-color: #FAF7F2; border: 2px dashed #D4AF37; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #58111A;">${otp}</span>
            <p style="font-size: 11px; color: #721B27; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Valid for 10 minutes</p>
          </div>

          <p style="font-size: 12px; line-height: 1.5; color: #777;">If you did not request this verification code, please ignore this email or reach out to our concierge at <a href="mailto:anamikasscollections@gmail.com" style="color: #58111A;">anamikasscollections@gmail.com</a>.</p>

          <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #EADBC8; font-size: 11px; color: #999;">
            <p style="margin: 0;">With Royal Regards,<br/><strong>ANAMIKA COLLECTIONS</strong><br/>Luxury Handwoven Sarees & Designer Kurtis</p>
          </div>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Your ANAMIKA COLLECTIONS Verification Code is ${otp}`,
      text: `Namaste ${name},\n\nYour 6-digit email verification code for ANAMIKA COLLECTIONS is: ${otp}\n\nThis code is valid for 10 minutes.\n\nElegance in Every Thread.\nANAMIKA COLLECTIONS\nanamikasscollections@gmail.com`,
      html: htmlContent,
    });
  }

  private sendWhatsAppMessage(data: { recipientPhone: string; templateName: string; bodyText: string }) {
    if (env.WHATSAPP_DEV_MODE === 'true' || !env.WHATSAPP_API_TOKEN || env.WHATSAPP_API_TOKEN.includes('sample_')) {
      logger.info(`[WHATSAPP-DEV-SIMULATOR] -> To: ${data.recipientPhone} | Template: ${data.templateName}`);
      logger.info(`[WHATSAPP-DEV-SIMULATOR] Content: "${data.bodyText}"`);
      return;
    }

    // When live WhatsApp Cloud API credentials are provided:
    // POST https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages
    logger.info(`Sending live WhatsApp message to ${data.recipientPhone}`);
  }

  private async sendEmail(options: { to: string; subject: string; html: string; text?: string }) {
    if (!this.emailTransporter || env.EMAIL_DEV_MODE === 'true') {
      logger.info(`[EMAIL-DEV-SIMULATOR] -> To: ${options.to} | Subject: "${options.subject}"`);
      logger.info(`[EMAIL-DEV-SIMULATOR] (HTML body generated with brand styling)`);
      return;
    }

    try {
      await this.emailTransporter.sendMail({
        from: env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text || options.subject,
        html: options.html,
      });
      logger.info(`Live email successfully sent to ${options.to}`);
    } catch (err) {
      logger.error(`Failed to send email to ${options.to}`, err);
    }
  }
}

export const notificationService = new NotificationService();

