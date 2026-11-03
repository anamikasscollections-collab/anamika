import { Request, Response } from 'express';
import { dbStore, OrderEntity, OrderItemEntity, AddressEntity } from '../data/dbStore';
import { shiprocketService } from '../services/shiprocket.service';
import { logger } from '../utils/logger';

export class OrderController {
  public static async createCheckoutOrder(req: Request, res: Response) {
    try {
      const userId = req.userId || null;
      const {
        customerName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        items,
        couponCode,
        customerNotes,
      } = req.body;

      // Validate customer information
      if (!customerName || !phone || !addressLine1 || !city || !state || !pincode) {
        return res.status(400).json({
          success: false,
          message: 'All delivery address fields and contact details are required.',
        });
      }

      if (!/^\d{6}$/.test(pincode.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid 6-digit delivery PIN code.',
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your cart is empty. Please add items before checkout.',
        });
      }

      // 1. PIN code serviceability check via Shiprocket
      const serviceability = await shiprocketService.checkServiceability(pincode);
      if (!serviceability.isServiceable) {
        return res.status(400).json({
          success: false,
          message: `Delivery is currently not available for PIN code ${pincode}.`,
        });
      }

      // 2. Validate product variants, stock, and calculate subtotal securely on server
      let subtotalAmount = 0;
      const orderItems: OrderItemEntity[] = [];

      for (const item of items) {
        const pv = dbStore.getProductVariant(item.productId, item.variantId);
        if (!pv) {
          return res.status(400).json({
            success: false,
            message: `Product variant with SKU ${item.variantSku || item.variantId} is no longer available.`,
          });
        }

        const { product, variant } = pv;
        const quantity = Math.max(1, parseInt(item.quantity, 10));

        if (variant.stockQuantity < quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}" (${variant.size}). Only ${variant.stockQuantity} item(s) left.`,
          });
        }

        const unitPrice = product.discountedPrice + variant.additionalPrice;
        const lineTotal = unitPrice * quantity;
        subtotalAmount += lineTotal;

        orderItems.push({
          id: 'oi-' + Math.random().toString(36).substring(2, 9),
          orderId: '', // populated below
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variantSku: variant.sku,
          size: variant.size,
          color: variant.color,
          quantity,
          unitPrice,
          totalAmount: lineTotal,
          imageUrl: product.images[0]?.url,
        });
      }

      // 3. Coupon validation & discount calculation
      let discountAmount = 0;
      let appliedCouponCode: string | null = null;

      if (couponCode) {
        const coupon = dbStore.findCouponByCode(couponCode);
        if (coupon && coupon.isActive) {
          if (subtotalAmount >= coupon.minOrderAmount) {
            if (coupon.discountType === 'PERCENTAGE') {
              let calcDiscount = Math.round((subtotalAmount * coupon.discountValue) / 100);
              if (coupon.maxDiscountAmount && calcDiscount > coupon.maxDiscountAmount) {
                calcDiscount = coupon.maxDiscountAmount;
              }
              discountAmount = calcDiscount;
            } else {
              // FIXED discount
              discountAmount = Math.min(coupon.discountValue, subtotalAmount);
            }
            appliedCouponCode = coupon.code;
            coupon.usedCount += 1;
            dbStore.save();
          }
        }
      }

      // 4. Shipping rate calculated from Shiprocket (paid by customer)
      const shippingAmount = serviceability.ratePaise;

      // 5. Total amount strictly computed on server
      const totalAmount = Math.max(0, subtotalAmount - discountAmount + shippingAmount);

      const orderNumber = `AC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderId = 'ord-' + Math.random().toString(36).substring(2, 10);

      // Link orderId to orderItems
      orderItems.forEach((i) => (i.orderId = orderId));

      const shippingAddress: AddressEntity = {
        id: 'addr-' + Math.random().toString(36).substring(2, 9),
        userId: userId || 'guest',
        fullName: customerName,
        phone,
        alternatePhone: req.body.alternatePhone,
        addressLine1,
        addressLine2,
        landmark: req.body.landmark,
        city,
        state,
        pincode,
        isDefault: false,
        addressType: req.body.addressType || 'HOME',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const order: OrderEntity = {
        id: orderId,
        orderNumber,
        userId,
        guestEmail: email || null,
        guestPhone: phone,
        customerName,
        shippingAddress,
        status: 'AWAITING_PAYMENT',
        subtotalAmount,
        discountAmount,
        shippingAmount,
        totalAmount,
        couponCode: appliedCouponCode,
        customerNotes,
        items: orderItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dbStore.createOrder(order);
      logger.info(`Created order #${order.orderNumber} for ₹${totalAmount / 100} - Status: AWAITING_PAYMENT`);

      return res.status(201).json({
        success: true,
        message: 'Order created successfully. Proceed to payment.',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          subtotalAmount,
          discountAmount,
          shippingAmount,
          totalAmount,
          status: order.status,
          courierInfo: serviceability.courierName,
          estimatedDeliveryDate: serviceability.estimatedDeliveryDate,
        },
      });
    } catch (err: any) {
      logger.error('Order creation error', err);
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }
  }

  public static async getOrderDetails(req: Request, res: Response) {
    const { idOrNumber } = req.params;
    let order = dbStore.getOrderById(idOrNumber);
    if (!order) {
      order = dbStore.getOrderByNumber(idOrNumber);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, data: order });
  }

  public static async getCustomerOrders(req: Request, res: Response) {
    const userId = req.userId!;
    const orders = dbStore.getOrdersByUserId(userId);
    return res.json({ success: true, data: orders });
  }

  public static async getInvoice(req: Request, res: Response) {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Invoice structure with brand headers and tax/pricing breakdowns
    const invoice = {
      invoiceNumber: `INV-${order.orderNumber}`,
      invoiceDate: order.createdAt,
      brand: {
        name: 'ANAMIKA COLLECTIONS',
        tagline: 'Elegance in Every Thread',
        address: '14, Royal Silk Arcade, Connaught Place, New Delhi 110001',
        gstin: '07AAAAA0000A1Z5',
        contact: 'care@anamikacollections.com | +91 98765 43210',
      },
      customer: {
        name: order.customerName,
        phone: order.guestPhone || order.shippingAddress.phone,
        email: order.guestEmail,
        address: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
      },
      payment: {
        method: 'UPI (Razorpay Verified)',
        transactionId: order.payment?.razorpayPaymentId || 'N/A',
        status: order.payment?.status || 'PENDING',
      },
      items: order.items.map((i) => ({
        description: i.productName,
        sku: i.variantSku,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unitPrice: i.unitPrice / 100,
        total: i.totalAmount / 100,
      })),
      pricing: {
        subtotalRupees: order.subtotalAmount / 100,
        discountRupees: order.discountAmount / 100,
        shippingRupees: order.shippingAmount / 100,
        totalRupees: order.totalAmount / 100,
      },
      policyNotice: 'All sales are final with No Returns or Exchanges. For defective or damaged items, contact support within 48h.',
    };

    return res.json({ success: true, data: invoice });
  }
}

