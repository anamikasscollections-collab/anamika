import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initialCategories, initialProducts, initialCoupons, initialBanners, InitialCategory, InitialProduct, InitialCoupon, InitialSiteBanner } from './initialSeedData';
import { logger } from '../utils/logger';

export { InitialProduct, InitialCoupon, InitialSiteBanner, InitialCategory };

export interface UserEntity {
  id: string;
  email?: string | null;
  phone?: string | null;
  passwordHash?: string | null;
  fullName: string;
  role: 'CUSTOMER' | 'GUEST';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserEntity {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STORE_MANAGER';
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddressEntity {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  createdAt: string;
  updatedAt: string;
}

export interface CartItemEntity {
  id: string;
  cartId: string;
  variantId: string;
  productId: string;
  quantity: number;
  unitPrice: number; // in paise
  createdAt: string;
  updatedAt: string;
}

export interface CartEntity {
  id: string;
  userId?: string | null;
  guestSessionId?: string | null;
  items: CartItemEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistEntity {
  id: string;
  userId: string;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemEntity {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantSku: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number; // paise
  totalAmount: number; // paise
  imageUrl?: string;
}

export interface OrderEntity {
  id: string;
  orderNumber: string;
  userId?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  customerName: string;
  shippingAddress: AddressEntity;
  status: 'AWAITING_PAYMENT' | 'PAYMENT_SUCCESSFUL' | 'ORDER_CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  subtotalAmount: number; // paise
  discountAmount: number; // paise
  shippingAmount: number; // paise
  totalAmount: number; // paise
  couponCode?: string | null;
  customerNotes?: string | null;
  cancelReason?: string | null;
  items: OrderItemEntity[];
  payment?: PaymentEntity;
  shipment?: ShipmentEntity;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEntity {
  id: string;
  orderId: string;
  paymentProvider: 'RAZORPAY';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number; // paise
  currency: 'INR';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'VERIFICATION_PENDING';
  method: 'UPI';
  upiVpa?: string;
  failureReason?: string;
  rawResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentEntity {
  id: string;
  orderId: string;
  shippingProvider: 'SHIPROCKET';
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  courierName?: string;
  courierId?: string;
  trackingUrl?: string;
  status: 'PENDING' | 'PICKUP_SCHEDULED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RTO' | 'CANCELLED';
  estimatedDeliveryDate?: string;
  labelUrl?: string;
  manifestUrl?: string;
  rawData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewEntity {
  id: string;
  productId: string;
  userId?: string | null;
  customerName: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketEntity {
  id: string;
  ticketNumber: string;
  orderId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  issueType: 'DEFECTIVE_PRODUCT' | 'DAMAGED_IN_TRANSIT' | 'WRONG_ITEM_DELIVERED' | 'GENERAL_INQUIRY';
  description: string;
  imageEvidenceUrl?: string | null;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  categories: InitialCategory[];
  products: InitialProduct[];
  coupons: InitialCoupon[];
  banners: InitialSiteBanner[];
  users: UserEntity[];
  adminUsers: AdminUserEntity[];
  addresses: AddressEntity[];
  carts: CartEntity[];
  wishlists: WishlistEntity[];
  orders: OrderEntity[];
  payments: PaymentEntity[];
  shipments: ShipmentEntity[];
  reviews: ReviewEntity[];
  supportTickets: SupportTicketEntity[];
  processedWebhookEvents: string[]; // for webhook idempotency
}

const DB_FILE_PATH = path.resolve(__dirname, '../../data/anamika_store.json');

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        logger.info(`Loaded persistent database with ${parsed.products?.length || 0} products`);
        return parsed;
      }
    } catch (err) {
      logger.error('Error loading database file, initializing defaults', err);
    }

    return this.initializeDefaults();
  }

  private initializeDefaults(): DatabaseSchema {
    logger.info('Initializing default seed data for ANAMIKA COLLECTIONS');

    // Default secure Super Admin
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('AnamikaAdmin@2026', salt);

    const defaultAdmin: AdminUserEntity = {
      id: 'admin-super-01',
      email: 'anamikasscollections@gmail.com',
      username: 'anamika_admin',
      passwordHash: adminPasswordHash,
      fullName: 'Anamika Executive Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Default sample reviews
    const defaultReviews: ReviewEntity[] = [
      {
        id: 'rev-01',
        productId: 'prod-saree-1',
        userId: null,
        customerName: 'Pooja Sharma',
        rating: 5,
        title: 'Breathtaking Katan Silk!',
        comment: 'The crimson wine color is even richer in person. The antique gold zari has an exquisite heirloom sheen. Received so many compliments at my brother’s wedding!',
        isApproved: true,
        createdAt: '2026-02-15T10:30:00Z',
        updatedAt: '2026-02-15T10:30:00Z',
      },
      {
        id: 'rev-02',
        productId: 'prod-kurti-1',
        userId: null,
        customerName: 'Radhika Mehra',
        rating: 5,
        title: 'Royal Velvet perfection',
        comment: 'The micro velvet fabric is super plush and soft, not heavy at all. The zardozi neckline is meticulously handcrafted. Totally in love with ANAMIKA COLLECTIONS!',
        isApproved: true,
        createdAt: '2026-02-20T14:45:00Z',
        updatedAt: '2026-02-20T14:45:00Z',
      },
      {
        id: 'rev-03',
        productId: 'prod-saree-2',
        userId: null,
        customerName: 'Ananya Iyer',
        rating: 5,
        title: 'Pure Kanjivaram elegance',
        comment: 'Authentic korvai border with genuine tested zari weight. The drape falls like royalty. Timely delivery with secure packaging.',
        isApproved: true,
        createdAt: '2026-03-01T09:15:00Z',
        updatedAt: '2026-03-01T09:15:00Z',
      },
    ];

    const initialData: DatabaseSchema = {
      categories: initialCategories,
      products: initialProducts,
      coupons: initialCoupons,
      banners: initialBanners,
      users: [],
      adminUsers: [defaultAdmin],
      addresses: [],
      carts: [],
      wishlists: [],
      orders: [],
      payments: [],
      shipments: [],
      reviews: defaultReviews,
      supportTickets: [],
      processedWebhookEvents: [],
    };

    this.persist(initialData);
    return initialData;
  }

  private persist(data: DatabaseSchema): void {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to write database file', err);
    }
  }

  public save(): void {
    this.persist(this.data);
  }

  // Categories
  public getCategories(): InitialCategory[] {
    return this.data.categories.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getAllCategoriesAdmin(): InitialCategory[] {
    return this.data.categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getCategoryBySlug(slug: string): InitialCategory | undefined {
    return this.data.categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase() && c.isActive);
  }

  // Products
  public getProducts(filters?: {
    categorySlug?: string;
    isFeatured?: boolean;
    isBestseller?: boolean;
    isNewArrival?: boolean;
    minPrice?: number; // paise
    maxPrice?: number; // paise
    fabric?: string;
    size?: string;
    search?: string;
    sortBy?: 'newest' | 'price_low_high' | 'price_high_low' | 'popularity';
    page?: number;
    limit?: number;
  }): { products: InitialProduct[]; total: number } {
    let list = this.data.products.filter((p) => p.isActive);

    if (filters?.categorySlug) {
      const cat = this.getCategoryBySlug(filters.categorySlug);
      if (cat) {
        if (cat.slug === 'new-arrivals') {
          list = list.filter((p) => p.isNewArrival);
        } else if (cat.slug === 'bestsellers') {
          list = list.filter((p) => p.isBestseller);
        } else if (cat.slug === 'offers') {
          list = list.filter((p) => p.discountPercent > 0);
        } else {
          list = list.filter((p) => p.categoryId === cat.id);
        }
      }
    }

    if (filters?.isFeatured !== undefined) {
      list = list.filter((p) => p.isFeatured === filters.isFeatured);
    }

    if (filters?.isBestseller !== undefined) {
      list = list.filter((p) => p.isBestseller === filters.isBestseller);
    }

    if (filters?.isNewArrival !== undefined) {
      list = list.filter((p) => p.isNewArrival === filters.isNewArrival);
    }

    if (filters?.minPrice !== undefined) {
      list = list.filter((p) => p.discountedPrice >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      list = list.filter((p) => p.discountedPrice <= filters.maxPrice!);
    }

    if (filters?.fabric) {
      const fabLower = filters.fabric.toLowerCase();
      list = list.filter((p) => p.fabric.toLowerCase().includes(fabLower));
    }

    if (filters?.size) {
      const szLower = filters.size.toLowerCase();
      list = list.filter((p) =>
        p.variants.some((v) => v.size.toLowerCase().includes(szLower) && v.stockQuantity > 0)
      );
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          (p.pattern && p.pattern.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sort = filters?.sortBy || 'newest';
    if (sort === 'price_low_high') {
      list.sort((a, b) => a.discountedPrice - b.discountedPrice);
    } else if (sort === 'price_high_low') {
      list.sort((a, b) => b.discountedPrice - a.discountedPrice);
    } else if (sort === 'popularity') {
      list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    } else {
      // newest
      list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return { products: paginated, total };
  }

  public getProductBySlug(slug: string): InitialProduct | undefined {
    return this.data.products.find((p) => p.slug.toLowerCase() === slug.toLowerCase() && p.isActive);
  }

  public getProductById(id: string): InitialProduct | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public getProductVariant(productId: string, variantId: string) {
    const product = this.getProductById(productId);
    if (!product) return undefined;
    const variant = product.variants.find((v) => v.id === variantId);
    return variant ? { product, variant } : undefined;
  }

  public addProduct(product: InitialProduct): InitialProduct {
    this.data.products.unshift(product);
    this.save();
    return product;
  }

  public updateProduct(id: string, updates: Partial<InitialProduct>): InitialProduct | undefined {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }

  public adjustInventory(variantId: string, delta: number): boolean {
    for (const product of this.data.products) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) {
        variant.stockQuantity = Math.max(0, variant.stockQuantity + delta);
        this.save();
        return true;
      }
    }
    return false;
  }

  // Users & Admin
  public findUserByEmail(email: string): UserEntity | undefined {
    return this.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  }

  public findUserByPhone(phone: string): UserEntity | undefined {
    return this.data.users.find((u) => u.phone === phone);
  }

  public findUserById(id: string): UserEntity | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: UserEntity): UserEntity {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<UserEntity>): UserEntity | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.users[idx];
  }

  public findAdminByUsernameOrEmail(identifier: string): AdminUserEntity | undefined {
    const lower = identifier.toLowerCase();
    return this.data.adminUsers.find(
      (a) => (a.username.toLowerCase() === lower || a.email.toLowerCase() === lower) && a.isActive
    );
  }

  public findAdminById(id: string): AdminUserEntity | undefined {
    return this.data.adminUsers.find((a) => a.id === id && a.isActive);
  }

  // Addresses
  public getUserAddresses(userId: string): AddressEntity[] {
    return this.data.addresses.filter((a) => a.userId === userId);
  }

  public addAddress(address: AddressEntity): AddressEntity {
    if (address.isDefault) {
      this.data.addresses
        .filter((a) => a.userId === address.userId)
        .forEach((a) => (a.isDefault = false));
    }
    this.data.addresses.push(address);
    this.save();
    return address;
  }

  // Cart
  public getOrCreateCart(userId?: string | null, guestSessionId?: string | null): CartEntity {
    let cart: CartEntity | undefined;
    if (userId) {
      cart = this.data.carts.find((c) => c.userId === userId);
    } else if (guestSessionId) {
      cart = this.data.carts.find((c) => c.guestSessionId === guestSessionId);
    }

    if (!cart) {
      cart = {
        id: 'cart-' + Math.random().toString(36).substring(2, 10),
        userId: userId || null,
        guestSessionId: guestSessionId || null,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.carts.push(cart);
      this.save();
    }
    return cart;
  }

  public updateCartItem(
    cartId: string,
    variantId: string,
    productId: string,
    quantity: number
  ): CartEntity | undefined {
    const cart = this.data.carts.find((c) => c.id === cartId);
    if (!cart) return undefined;

    const pv = this.getProductVariant(productId, variantId);
    if (!pv) return undefined;

    const unitPrice = pv.product.discountedPrice + pv.variant.additionalPrice;
    const existingIndex = cart.items.findIndex((i) => i.variantId === variantId);

    if (quantity <= 0) {
      if (existingIndex > -1) {
        cart.items.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity = quantity;
        cart.items[existingIndex].unitPrice = unitPrice;
        cart.items[existingIndex].updatedAt = new Date().toISOString();
      } else {
        cart.items.push({
          id: 'ci-' + Math.random().toString(36).substring(2, 9),
          cartId,
          variantId,
          productId,
          quantity,
          unitPrice,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    cart.updatedAt = new Date().toISOString();
    this.save();
    return cart;
  }

  public clearCart(cartId: string): void {
    const cart = this.data.carts.find((c) => c.id === cartId);
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  // Wishlist
  public getOrCreateWishlist(userId: string): WishlistEntity {
    let wl = this.data.wishlists.find((w) => w.userId === userId);
    if (!wl) {
      wl = {
        id: 'wl-' + Math.random().toString(36).substring(2, 9),
        userId,
        productIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.wishlists.push(wl);
      this.save();
    }
    return wl;
  }

  public toggleWishlist(userId: string, productId: string): { inWishlist: boolean; wishlist: WishlistEntity } {
    const wl = this.getOrCreateWishlist(userId);
    const idx = wl.productIds.indexOf(productId);
    let inWishlist = false;
    if (idx > -1) {
      wl.productIds.splice(idx, 1);
      inWishlist = false;
    } else {
      wl.productIds.push(productId);
      inWishlist = true;
    }
    wl.updatedAt = new Date().toISOString();
    this.save();
    return { inWishlist, wishlist: wl };
  }

  // Coupons
  public findCouponByCode(code: string): InitialCoupon | undefined {
    return this.data.coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
    );
  }

  public getAllCouponsAdmin(): InitialCoupon[] {
    return this.data.coupons;
  }

  public createCoupon(coupon: InitialCoupon): InitialCoupon {
    this.data.coupons.push(coupon);
    this.save();
    return coupon;
  }

  public updateCoupon(id: string, updates: Partial<InitialCoupon>): InitialCoupon | undefined {
    const idx = this.data.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.save();
    return this.data.coupons[idx];
  }

  // Orders
  public createOrder(order: OrderEntity): OrderEntity {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  public getOrderById(id: string): OrderEntity | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public getOrderByNumber(orderNumber: string): OrderEntity | undefined {
    return this.data.orders.find((o) => o.orderNumber === orderNumber);
  }

  public getOrdersByUserId(userId: string): OrderEntity[] {
    return this.data.orders.filter((o) => o.userId === userId);
  }

  public getAllOrdersAdmin(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): { orders: OrderEntity[]; total: number } {
    let list = [...this.data.orders];

    if (filters?.status) {
      list = list.filter((o) => o.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.guestEmail && o.guestEmail.toLowerCase().includes(q)) ||
          (o.guestPhone && o.guestPhone.includes(q))
      );
    }

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const paginated = list.slice((page - 1) * limit, page * limit);
    return { orders: paginated, total };
  }

  public updateOrderStatus(orderId: string, status: OrderEntity['status']): OrderEntity | undefined {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return undefined;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // Payments
  public savePayment(payment: PaymentEntity): PaymentEntity {
    const idx = this.data.payments.findIndex((p) => p.orderId === payment.orderId);
    if (idx > -1) {
      this.data.payments[idx] = payment;
    } else {
      this.data.payments.push(payment);
    }
    // Also attach to order
    const order = this.data.orders.find((o) => o.id === payment.orderId);
    if (order) {
      order.payment = payment;
      if (payment.status === 'SUCCESS' && order.status === 'AWAITING_PAYMENT') {
        order.status = 'PAYMENT_SUCCESSFUL';
      }
    }
    this.save();
    return payment;
  }

  public getPaymentByOrderId(orderId: string): PaymentEntity | undefined {
    return this.data.payments.find((p) => p.orderId === orderId);
  }

  public getPaymentByRazorpayOrderId(rzpOrderId: string): PaymentEntity | undefined {
    return this.data.payments.find((p) => p.razorpayOrderId === rzpOrderId);
  }

  // Shipments
  public saveShipment(shipment: ShipmentEntity): ShipmentEntity {
    const idx = this.data.shipments.findIndex((s) => s.orderId === shipment.orderId);
    if (idx > -1) {
      this.data.shipments[idx] = shipment;
    } else {
      this.data.shipments.push(shipment);
    }
    const order = this.data.orders.find((o) => o.id === shipment.orderId);
    if (order) {
      order.shipment = shipment;
      if (shipment.status === 'IN_TRANSIT') {
        order.status = 'SHIPPED';
      } else if (shipment.status === 'OUT_FOR_DELIVERY') {
        order.status = 'OUT_FOR_DELIVERY';
      } else if (shipment.status === 'DELIVERED') {
        order.status = 'DELIVERED';
      }
    }
    this.save();
    return shipment;
  }

  // Webhook Idempotency Check
  public isWebhookEventProcessed(eventId: string): boolean {
    return this.data.processedWebhookEvents.includes(eventId);
  }

  public markWebhookEventProcessed(eventId: string): void {
    if (!this.data.processedWebhookEvents.includes(eventId)) {
      this.data.processedWebhookEvents.push(eventId);
      // Keep list within bounds
      if (this.data.processedWebhookEvents.length > 5000) {
        this.data.processedWebhookEvents.splice(0, 1000);
      }
      this.save();
    }
  }

  // Reviews
  public getReviewsForProduct(productId: string): ReviewEntity[] {
    return this.data.reviews.filter((r) => r.productId === productId && r.isApproved);
  }

  public addReview(review: ReviewEntity): ReviewEntity {
    this.data.reviews.unshift(review);
    this.save();
    return review;
  }

  // Support Tickets
  public createSupportTicket(ticket: SupportTicketEntity): SupportTicketEntity {
    this.data.supportTickets.unshift(ticket);
    this.save();
    return ticket;
  }

  public getAllSupportTicketsAdmin(): SupportTicketEntity[] {
    return this.data.supportTickets;
  }

  public updateSupportTicketStatus(id: string, status: SupportTicketEntity['status'], adminNotes?: string): SupportTicketEntity | undefined {
    const ticket = this.data.supportTickets.find((t) => t.id === id);
    if (!ticket) return undefined;
    ticket.status = status;
    if (adminNotes !== undefined) ticket.adminNotes = adminNotes;
    ticket.updatedAt = new Date().toISOString();
    this.save();
    return ticket;
  }

  // Banners & Site Settings
  public getBanners(): InitialSiteBanner[] {
    return this.data.banners.filter((b) => b.isActive);
  }

  public updateBanner(id: string, updates: Partial<InitialSiteBanner>): InitialSiteBanner | undefined {
    const idx = this.data.banners.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    this.data.banners[idx] = { ...this.data.banners[idx], ...updates };
    this.save();
    return this.data.banners[idx];
  }

  // Admin Analytics Overview
  public getAdminStats() {
    const totalOrders = this.data.orders.length;
    const completedOrders = this.data.orders.filter((o) => o.status === 'DELIVERED').length;
    const pendingOrders = this.data.orders.filter((o) =>
      ['AWAITING_PAYMENT', 'PAYMENT_SUCCESSFUL', 'ORDER_CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED'].includes(o.status)
    ).length;

    // Total sales & revenue (from verified paid orders)
    const paidOrders = this.data.orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'AWAITING_PAYMENT');
    const totalRevenuePaise = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const totalCustomers = this.data.users.length;

    // Low stock variants (stock < 5)
    const lowStockProducts: { productName: string; variantSku: string; size: string; stockQuantity: number }[] = [];
    for (const p of this.data.products) {
      for (const v of p.variants) {
        if (v.stockQuantity <= 5) {
          lowStockProducts.push({
            productName: p.name,
            variantSku: v.sku,
            size: v.size,
            stockQuantity: v.stockQuantity,
          });
        }
      }
    }

    const bestsellingProducts = this.data.products.filter((p) => p.isBestseller);
    const recentOrders = this.data.orders.slice(0, 8);

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenuePaise,
      totalCustomers,
      lowStockProducts,
      bestsellingProducts,
      recentOrders,
    };
  }
}

export const dbStore = new DatabaseStore();
