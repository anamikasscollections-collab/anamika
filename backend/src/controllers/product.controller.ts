import { Request, Response } from 'express';
import { dbStore, ReviewEntity } from '../data/dbStore';

export class ProductController {
  public static async getCategories(_req: Request, res: Response) {
    const categories = dbStore.getCategories();
    return res.json({ success: true, data: categories });
  }

  public static async getCategoryBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    const category = dbStore.getCategoryBySlug(slug);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.json({ success: true, data: category });
  }

  public static async getProducts(req: Request, res: Response) {
    const {
      category,
      isFeatured,
      isBestseller,
      isNewArrival,
      minPrice,
      maxPrice,
      fabric,
      size,
      search,
      sortBy,
      page,
      limit,
    } = req.query;

    const result = dbStore.getProducts({
      categorySlug: category as string,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      isBestseller: isBestseller !== undefined ? isBestseller === 'true' : undefined,
      isNewArrival: isNewArrival !== undefined ? isNewArrival === 'true' : undefined,
      minPrice: minPrice ? parseInt(minPrice as string, 10) * 100 : undefined, // Convert Rs to paise if filtered
      maxPrice: maxPrice ? parseInt(maxPrice as string, 10) * 100 : undefined,
      fabric: fabric as string,
      size: size as string,
      search: search as string,
      sortBy: sortBy as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 24,
    });

    return res.json({ success: true, data: result });
  }

  public static async getProductBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    const product = dbStore.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = dbStore.getReviewsForProduct(product.id);
    const relatedProducts = dbStore
      .getProducts({ categorySlug: product.categoryId, limit: 4 })
      .products.filter((p) => p.id !== product.id);

    return res.json({
      success: true,
      data: {
        product,
        reviews,
        relatedProducts,
      },
    });
  }

  public static async getProductById(req: Request, res: Response) {
    const { id } = req.params;
    const product = dbStore.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, data: product });
  }

  public static async addReview(req: Request, res: Response) {
    const { id } = req.params;
    const { customerName, rating, title, comment } = req.body;

    const product = dbStore.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Name, rating, and review comment are required' });
    }

    const review: ReviewEntity = {
      id: 'rev-' + Math.random().toString(36).substring(2, 9),
      productId: product.id,
      userId: req.userId || null,
      customerName,
      rating: Math.min(5, Math.max(1, Number(rating))),
      title,
      comment,
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = dbStore.addReview(review);
    return res.status(201).json({ success: true, message: 'Review submitted successfully', data: saved });
  }

  public static async getBanners(_req: Request, res: Response) {
    const banners = dbStore.getBanners();
    return res.json({ success: true, data: banners });
  }
}

