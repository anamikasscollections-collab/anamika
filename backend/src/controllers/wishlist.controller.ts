import { Request, Response } from 'express';
import { dbStore } from '../data/dbStore';

export class WishlistController {
  public static async getWishlist(req: Request, res: Response) {
    const userId = req.userId!;
    const wishlist = dbStore.getOrCreateWishlist(userId);

    const products = wishlist.productIds
      .map((id) => dbStore.getProductById(id))
      .filter((p) => p && p.isActive);

    return res.json({
      success: true,
      data: {
        wishlistId: wishlist.id,
        items: products,
        totalItems: products.length,
      },
    });
  }

  public static async toggleItem(req: Request, res: Response) {
    const userId = req.userId!;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const product = dbStore.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const result = dbStore.toggleWishlist(userId, productId);
    return res.json({
      success: true,
      message: result.inWishlist
        ? 'Added to your wishlist'
        : 'Removed from your wishlist',
      data: {
        inWishlist: result.inWishlist,
        totalWishlistItems: result.wishlist.productIds.length,
      },
    });
  }

  public static async moveToCart(req: Request, res: Response) {
    const userId = req.userId!;
    const { productId, variantId } = req.body;

    const pv = dbStore.getProductVariant(productId, variantId);
    if (!pv) {
      return res.status(404).json({ success: false, message: 'Product variant not found' });
    }

    // Add to cart
    const cart = dbStore.getOrCreateCart(userId);
    dbStore.updateCartItem(cart.id, variantId, productId, 1);

    // Remove from wishlist
    const wishlist = dbStore.getOrCreateWishlist(userId);
    const idx = wishlist.productIds.indexOf(productId);
    if (idx > -1) {
      wishlist.productIds.splice(idx, 1);
      dbStore.save();
    }

    return res.json({
      success: true,
      message: 'Moved product from Wishlist to Cart',
    });
  }
}

