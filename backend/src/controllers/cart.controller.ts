import { Request, Response } from 'express';
import { dbStore, CartEntity } from '../data/dbStore';
import { shiprocketService } from '../services/shiprocket.service';

export class CartController {
  // Helper to enrich cart items with fresh product data and recalculated prices
  public static enrichCart(cart: CartEntity, pincode?: string) {
    let subtotalPaise = 0;
    const enrichedItems = cart.items
      .map((item) => {
        const pv = dbStore.getProductVariant(item.productId, item.variantId);
        if (!pv) return null;

        const { product, variant } = pv;
        const unitPrice = product.discountedPrice + variant.additionalPrice;
        const lineTotal = unitPrice * item.quantity;
        subtotalPaise += lineTotal;

        return {
          id: item.id,
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0]?.url || '',
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          colorCode: variant.colorCode,
          quantity: item.quantity,
          stockAvailable: variant.stockQuantity,
          unitPricePaise: unitPrice,
          originalPricePaise: product.originalPrice + variant.additionalPrice,
          lineTotalPaise: lineTotal,
        };
      })
      .filter(Boolean);

    // Shipping calculation (paid by customer)
    let shippingPaise = 0;
    let shippingNote = 'Enter PIN code to calculate shipping charges';

    if (pincode && /^\d{6}$/.test(pincode)) {
      const isDelhiNCR = pincode.startsWith('11') || pincode.startsWith('20') || pincode.startsWith('12');
      shippingPaise = isDelhiNCR ? 9900 : 14900; // Rs 99 or Rs 149
      shippingNote = 'Calculated via Shiprocket Logistics';
    }

    const totalPaise = subtotalPaise + shippingPaise;

    return {
      cartId: cart.id,
      items: enrichedItems,
      itemCount: enrichedItems.reduce((acc, i: any) => acc + i.quantity, 0),
      subtotalPaise,
      shippingPaise,
      shippingNote,
      totalPaise,
    };
  }

  public static async getCart(req: Request, res: Response) {
    const userId = req.userId;
    const guestSessionId = req.headers['x-guest-session-id'] as string;
    const pincode = req.query.pincode as string;

    const cart = dbStore.getOrCreateCart(userId, guestSessionId);
    const enriched = CartController.enrichCart(cart, pincode);

    return res.json({ success: true, data: enriched });
  }

  public static async updateItem(req: Request, res: Response) {
    const userId = req.userId;
    const guestSessionId = req.headers['x-guest-session-id'] as string;
    const { productId, variantId, quantity } = req.body;

    if (!productId || !variantId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'productId, variantId, and quantity are required' });
    }

    const pv = dbStore.getProductVariant(productId, variantId);
    if (!pv) {
      return res.status(404).json({ success: false, message: 'Product or variant not found' });
    }

    if (quantity > 0 && pv.variant.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${pv.variant.stockQuantity} item(s) available in stock for this variant.`,
      });
    }

    const cart = dbStore.getOrCreateCart(userId, guestSessionId);
    const updatedCart = dbStore.updateCartItem(cart.id, variantId, productId, Number(quantity));

    if (!updatedCart) {
      return res.status(400).json({ success: false, message: 'Failed to update cart' });
    }

    const enriched = CartController.enrichCart(updatedCart);
    return res.json({ success: true, message: 'Cart updated', data: enriched });
  }

  public static async removeItem(req: Request, res: Response) {
    const userId = req.userId;
    const guestSessionId = req.headers['x-guest-session-id'] as string;
    const { variantId } = req.params;

    const cart = dbStore.getOrCreateCart(userId, guestSessionId);
    const existingItem = cart.items.find((i) => i.variantId === variantId);

    if (existingItem) {
      dbStore.updateCartItem(cart.id, variantId, existingItem.productId, 0);
    }

    const enriched = CartController.enrichCart(cart);
    return res.json({ success: true, message: 'Item removed from cart', data: enriched });
  }

  public static async clearCart(req: Request, res: Response) {
    const userId = req.userId;
    const guestSessionId = req.headers['x-guest-session-id'] as string;

    const cart = dbStore.getOrCreateCart(userId, guestSessionId);
    dbStore.clearCart(cart.id);

    return res.json({ success: true, message: 'Cart cleared' });
  }
}

