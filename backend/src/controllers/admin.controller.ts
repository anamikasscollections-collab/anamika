import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbStore, InitialProduct, InitialCoupon, InitialSiteBanner } from '../data/dbStore';
import { generateAdminToken } from '../utils/token';
import { shiprocketService } from '../services/shiprocket.service';
import { notificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

export const adminLoginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export class AdminController {
  public static async login(req: Request, res: Response) {
    try {
      const { usernameOrEmail, password } = req.body;

      const admin = dbStore.findAdminByUsernameOrEmail(usernameOrEmail);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid administrator credentials.',
        });
      }

      const isMatch = bcrypt.compareSync(password, admin.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid administrator credentials.',
        });
      }

      admin.lastLoginAt = new Date().toISOString();
      dbStore.save();

      const token = generateAdminToken({
        adminId: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      });

      return res.json({
        success: true,
        message: 'Admin access authorized.',
        data: {
          token,
          admin: {
            id: admin.id,
            fullName: admin.fullName,
            username: admin.username,
            email: admin.email,
            role: admin.role,
          },
        },
      });
    } catch (err: any) {
      logger.error('Admin login error', err);
      return res.status(500).json({ success: false, message: 'Authentication failed' });
    }
  }

  public static async getOverview(_req: Request, res: Response) {
    const stats = dbStore.getAdminStats();
    return res.json({ success: true, data: stats });
  }

  public static async getProducts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const search = req.query.search as string;

    const result = dbStore.getProducts({ page, limit, search });
    return res.json({ success: true, data: result });
  }

  public static async createProduct(req: Request, res: Response) {
    try {
      const {
        name,
        slug,
        description,
        categoryId,
        fabric,
        careInstructions,
        pattern,
        occasion,
        originalPrice, // paise
        discountedPrice, // paise
        discountPercent,
        isFeatured,
        isBestseller,
        isNewArrival,
        metaTitle,
        metaDescription,
        images,
        variants,
      } = req.body;

      const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const existing = dbStore.getProductBySlug(productSlug);
      if (existing) {
        return res.status(409).json({ success: false, message: 'A product with this slug already exists.' });
      }

      const newProduct: InitialProduct = {
        id: 'prod-' + Math.random().toString(36).substring(2, 10),
        name,
        slug: productSlug,
        description,
        categoryId: categoryId || 'cat-sarees',
        fabric: fabric || 'Pure Silk',
        careInstructions: careInstructions || 'Dry Clean Only',
        pattern,
        occasion,
        originalPrice: Number(originalPrice),
        discountedPrice: Number(discountedPrice),
        discountPercent: Number(discountPercent || 0),
        isFeatured: Boolean(isFeatured),
        isBestseller: Boolean(isBestseller),
        isNewArrival: Boolean(isNewArrival ?? true),
        isActive: true,
        metaTitle: metaTitle || `${name} | ANAMIKA COLLECTIONS`,
        metaDescription: metaDescription || description.substring(0, 150),
        images: images || [],
        variants: (variants || []).map((v: any, idx: number) => ({
          id: 'var-' + Math.random().toString(36).substring(2, 9),
          sku: v.sku || `ANAM-PROD-${idx + 1}-${Math.floor(100 + Math.random() * 900)}`,
          size: v.size || 'Free Size',
          color: v.color || 'Ivory',
          colorCode: v.colorCode || '#FAF7F2',
          additionalPrice: Number(v.additionalPrice || 0),
          stockQuantity: Number(v.stockQuantity || 10),
        })),
      };

      const created = dbStore.addProduct(newProduct);
      return res.status(201).json({ success: true, message: 'Product added successfully', data: created });
    } catch (err: any) {
      logger.error('Failed to create product', err);
      return res.status(500).json({ success: false, message: 'Failed to create product' });
    }
  }

  public static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        slug,
        description,
        categoryId,
        fabric,
        careInstructions,
        pattern,
        occasion,
        originalPrice,
        discountedPrice,
        discountPercent,
        isFeatured,
        isBestseller,
        isNewArrival,
        images,
        variants,
      } = req.body;

      const existing = dbStore.getProductById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const updates: Partial<InitialProduct> = {};
      if (name !== undefined) updates.name = name;
      if (slug !== undefined) updates.slug = slug;
      if (description !== undefined) updates.description = description;
      if (categoryId !== undefined) updates.categoryId = categoryId;
      if (fabric !== undefined) updates.fabric = fabric;
      if (careInstructions !== undefined) updates.careInstructions = careInstructions;
      if (pattern !== undefined) updates.pattern = pattern;
      if (occasion !== undefined) updates.occasion = occasion;
      if (originalPrice !== undefined) updates.originalPrice = Number(originalPrice);
      if (discountedPrice !== undefined) updates.discountedPrice = Number(discountedPrice);
      if (discountPercent !== undefined) updates.discountPercent = Number(discountPercent);
      if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);
      if (isBestseller !== undefined) updates.isBestseller = Boolean(isBestseller);
      if (isNewArrival !== undefined) updates.isNewArrival = Boolean(isNewArrival);
      if (images !== undefined && Array.isArray(images)) {
        updates.images = images.map((img: any, idx: number) => {
          if (typeof img === 'string') {
            return {
              id: 'img-' + Math.random().toString(36).substring(2, 9),
              url: img,
              altText: updates.name || existing.name,
              isPrimary: idx === 0,
              displayOrder: idx + 1,
            };
          }
          return {
            id: img.id || ('img-' + Math.random().toString(36).substring(2, 9)),
            url: img.url,
            altText: img.altText || updates.name || existing.name,
            isPrimary: img.isPrimary !== undefined ? Boolean(img.isPrimary) : idx === 0,
            displayOrder: img.displayOrder || idx + 1,
          };
        });
      }
      if (variants !== undefined && Array.isArray(variants)) {
        updates.variants = variants.map((v: any, idx: number) => ({
          id: v.id || ('var-' + Math.random().toString(36).substring(2, 9)),
          sku: v.sku || `${(updates.name || existing.name).substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X')}-${idx + 1}-${Math.floor(100 + Math.random() * 900)}`,
          size: v.size || 'Free Size',
          color: v.color || 'Standard',
          colorCode: v.colorCode || '#58111A',
          additionalPrice: Number(v.additionalPrice || 0),
          stockQuantity: Number(v.stockQuantity !== undefined ? v.stockQuantity : 10),
        }));
      }

      const updated = dbStore.updateProduct(id, updates);
      return res.json({ success: true, message: 'Product updated successfully', data: updated });
    } catch (err: any) {
      logger.error('Failed to update product', err);
      return res.status(500).json({ success: false, message: 'Failed to update product' });
    }
  }

  public static async deleteProduct(req: Request, res: Response) {
    const { id } = req.params;
    const deleted = dbStore.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, message: 'Product deleted successfully' });
  }

  public static async adjustInventory(req: Request, res: Response) {
    const { variantId, delta } = req.body;
    if (!variantId || delta === undefined) {
      return res.status(400).json({ success: false, message: 'variantId and delta are required' });
    }

    const success = dbStore.adjustInventory(variantId, Number(delta));
    if (!success) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    return res.json({ success: true, message: 'Inventory adjusted successfully' });
  }

  public static async getOrders(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const data = dbStore.getAllOrdersAdmin({ page, limit, status, search });
    return res.json({ success: true, data });
  }

  public static async updateOrderStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'AWAITING_PAYMENT',
      'PAYMENT_SUCCESSFUL',
      'ORDER_CONFIRMED',
      'PROCESSING',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status transition' });
    }

    const order = dbStore.updateOrderStatus(id, status);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Trigger notification on delivery or cancellation
    if (status === 'DELIVERED') {
      logger.info(`Order #${order.orderNumber} marked as Delivered`);
    }

    return res.json({ success: true, message: `Order status updated to ${status}`, data: order });
  }

  public static async createShipmentForOrder(req: Request, res: Response) {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'AWAITING_PAYMENT') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create shipment for order awaiting payment.',
      });
    }

    try {
      const shipment = await shiprocketService.createShipment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.shippingAddress.phone || order.guestPhone || '',
        customerEmail: order.guestEmail || '',
        addressLine1: order.shippingAddress.addressLine1,
        addressLine2: order.shippingAddress.addressLine2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
        items: order.items.map((i) => ({
          name: i.productName,
          sku: i.variantSku,
          units: i.quantity,
          selling_price: i.unitPrice / 100,
        })),
        subtotalPaise: order.subtotalAmount,
      });

      const savedShipment = dbStore.saveShipment({
        id: 'shp-' + Math.random().toString(36).substring(2, 9),
        orderId: order.id,
        shippingProvider: 'SHIPROCKET',
        shiprocketOrderId: shipment.shiprocketOrderId,
        shiprocketShipmentId: shipment.shiprocketShipmentId,
        awbCode: shipment.awbCode || undefined,
        courierName: shipment.courierName,
        trackingUrl: shipment.trackingUrl,
        status: 'PICKUP_SCHEDULED',
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      dbStore.updateOrderStatus(order.id, 'SHIPPED');

      // Send dispatch notification to customer
      if (savedShipment.awbCode) {
        notificationService.sendShippingUpdate({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.guestEmail,
          customerPhone: order.shippingAddress.phone || order.guestPhone,
          courierName: savedShipment.courierName || 'Blue Dart Air Express',
          awbCode: savedShipment.awbCode,
          trackingUrl: savedShipment.trackingUrl || `https://shiprocket.co/tracking/${savedShipment.awbCode}`,
          estimatedDeliveryDate: savedShipment.estimatedDeliveryDate || '3 Days',
        });
      }

      return res.json({
        success: true,
        message: 'Shipment created and dispatched via Shiprocket',
        data: savedShipment,
      });
    } catch (err: any) {
      logger.error('Failed to create shipment', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to create Shiprocket shipment',
      });
    }
  }

  public static async getCoupons(_req: Request, res: Response) {
    const coupons = dbStore.getAllCouponsAdmin();
    return res.json({ success: true, data: coupons });
  }

  public static async createCoupon(req: Request, res: Response) {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, validUntil } = req.body;

    const existing = dbStore.findCouponByCode(code);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists.' });
    }

    const coupon: InitialCoupon = {
      id: 'coup-' + Math.random().toString(36).substring(2, 9),
      code: code.toUpperCase().trim(),
      description,
      discountType: discountType || 'PERCENTAGE',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      usedCount: 0,
      validFrom: new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    };

    const saved = dbStore.createCoupon(coupon);
    return res.status(201).json({ success: true, message: 'Coupon created successfully', data: saved });
  }

  public static async toggleCoupon(req: Request, res: Response) {
    const { id } = req.params;
    const { isActive } = req.body;
    const updated = dbStore.updateCoupon(id, { isActive: Boolean(isActive) });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    return res.json({ success: true, message: 'Coupon updated', data: updated });
  }

  public static async getBanners(_req: Request, res: Response) {
    const banners = dbStore.getBanners();
    return res.json({ success: true, data: banners });
  }

  public static async updateBanner(req: Request, res: Response) {
    const { id } = req.params;
    const updated = dbStore.updateBanner(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    return res.json({ success: true, message: 'Banner updated successfully', data: updated });
  }

  public static async getSupportTickets(_req: Request, res: Response) {
    const tickets = dbStore.getAllSupportTicketsAdmin();
    return res.json({ success: true, data: tickets });
  }

  public static async updateSupportTicket(req: Request, res: Response) {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const updated = dbStore.updateSupportTicketStatus(id, status, adminNotes);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    return res.json({ success: true, message: 'Ticket updated', data: updated });
  }
}

