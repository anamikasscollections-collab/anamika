export interface InitialCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  displayOrder: number;
}

export interface InitialVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorCode: string;
  additionalPrice: number;
  stockQuantity: number;
}

export interface InitialProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  fabric: string;
  careInstructions: string;
  pattern: string;
  occasion: string;
  originalPrice: number; // in paise
  discountedPrice: number; // in paise
  discountPercent: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  images: { url: string; altText: string; isPrimary: boolean; displayOrder: number }[];
  variants: InitialVariant[];
}

export interface InitialCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number; // 10 = 10%, or paise for FIXED
  minOrderAmount: number; // paise
  maxDiscountAmount?: number; // paise
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface InitialSiteBanner {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  linkText: string;
  linkUrl: string;
  imageUrl: string;
  isActive: boolean;
}

export const initialCategories: InitialCategory[] = [
  {
    id: 'cat-sarees',
    name: 'Sarees',
    slug: 'sarees',
    description: 'Heirloom handwoven Banarasi, Kanjivaram, Organza, and Tissue silks crafted for timeless royalty.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'cat-kurtis',
    name: 'Kurtis',
    slug: 'kurtis',
    description: 'Exquisite velvet, chanderi, and chikankari kurtis tailored for contemporary young women.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'cat-new-arrivals',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Fresh festive silhouettes, artisanal embroideries, and limited-edition designer launches.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    displayOrder: 3,
  },
  {
    id: 'cat-bestsellers',
    name: 'Bestsellers',
    slug: 'bestsellers',
    description: 'Our most cherished royal drapes and celebratory kurtis loved by thousands across India.',
    image: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    displayOrder: 4,
  },
  {
    id: 'cat-offers',
    name: 'Offers',
    slug: 'offers',
    description: 'Curated seasonal promotions on selected handcrafted festive ensembles.',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    displayOrder: 5,
  },
];

export const initialProducts: InitialProduct[] = [
  {
    id: 'prod-saree-1',
    name: 'Varanasi Pure Katan Silk Banarasi Saree in Crimson Wine',
    slug: 'varanasi-pure-katan-silk-banarasi-saree-crimson-wine',
    description: 'A masterpiece from the ghats of Varanasi. Woven with pure Mulberry silk warp and weft, featuring intricate floral Kadwa Jaal in antique champagne gold zari. Comes with unstitched pure silk blouse piece.',
    categoryId: 'cat-sarees',
    fabric: '100% Pure Katan Silk (Silk Mark Certified)',
    careInstructions: 'Strictly dry clean only. Wrap in unbleached muslin cloth and store in a cool, dry place. Avoid direct perfume sprays.',
    pattern: 'Intricate Kadwa Floral Jaal & Meenakari Border',
    occasion: 'Bridal, Wedding Reception, Grand Festivities',
    originalPrice: 1899900, // Rs 18,999 in paise
    discountedPrice: 1499900, // Rs 14,999 in paise
    discountPercent: 21,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: true,
    isActive: true,
    metaTitle: 'Crimson Wine Pure Katan Silk Banarasi Saree | ANAMIKA COLLECTIONS',
    metaDescription: 'Shop handcrafted Varanasi Katan Silk Saree in Crimson Wine with Antique Gold Zari at ANAMIKA COLLECTIONS.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
        altText: 'Crimson Wine Banarasi Saree Drape View',
        isPrimary: true,
        displayOrder: 1,
      },
      {
        url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
        altText: 'Gold Zari Kadwa Pallu Detail',
        isPrimary: false,
        displayOrder: 2,
      },
      {
        url: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=85',
        altText: 'Fabric Texture and Border Close-up',
        isPrimary: false,
        displayOrder: 3,
      },
    ],
    variants: [
      {
        id: 'var-saree-1-wine',
        sku: 'ANAM-SAR-KTN-WIN-01',
        size: 'Free Size (5.5m + 0.8m Blouse)',
        color: 'Crimson Wine',
        colorCode: '#58111A',
        additionalPrice: 0,
        stockQuantity: 14,
      },
      {
        id: 'var-saree-1-maroon',
        sku: 'ANAM-SAR-KTN-MAR-02',
        size: 'Free Size (5.5m + 0.8m Blouse)',
        color: 'Royal Maroon',
        colorCode: '#3D0A11',
        additionalPrice: 0,
        stockQuantity: 9,
      },
    ],
  },
  {
    id: 'prod-saree-2',
    name: 'Ivory & Champagne Gold Temple Border Kanjivaram Silk Saree',
    slug: 'ivory-champagne-gold-temple-border-kanjivaram-silk-saree',
    description: 'Impeccable South Indian heritage woven with heavy weight mulberry silk and three-ply silk yarn. Features authentic Korvai temple borders woven with pure gold tested zari.',
    categoryId: 'cat-sarees',
    fabric: 'Pure Mulberry Kanchipuram Silk',
    careInstructions: 'Dry clean only. Roll fold periodically to prevent zari creases.',
    pattern: 'Korvai Weft Temple Gopuram & Floral Buttis',
    occasion: 'Weddings, Muhurtham, Festive Puja',
    originalPrice: 2249900, // Rs 22,499
    discountedPrice: 1799900, // Rs 17,999
    discountPercent: 20,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    isActive: true,
    metaTitle: 'Ivory Kanjivaram Temple Border Silk Saree | ANAMIKA COLLECTIONS',
    metaDescription: 'Handcrafted Ivory and Champagne Gold Kanjivaram Silk Saree with authentic temple borders.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=85',
        altText: 'Ivory Kanjivaram Silk Saree Full Drape',
        isPrimary: true,
        displayOrder: 1,
      },
      {
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
        altText: 'Temple Border and Heavy Pallu Detail',
        isPrimary: false,
        displayOrder: 2,
      },
    ],
    variants: [
      {
        id: 'var-saree-2-ivory',
        sku: 'ANAM-SAR-KNJ-IVO-01',
        size: 'Free Size (5.5m + 0.8m Blouse)',
        color: 'Ivory Cream',
        colorCode: '#FFFDF9',
        additionalPrice: 0,
        stockQuantity: 8,
      },
    ],
  },
  {
    id: 'prod-saree-3',
    name: 'Dusty Rose Zardozi Embroidered Pure Organza Silk Saree',
    slug: 'dusty-rose-zardozi-embroidered-pure-organza-silk-saree',
    description: 'Gossamer pure organza silk in ethereal dusty rose blush. Hand-embroidered scallop borders with delicate cutdana, micro pearls, and French knots.',
    categoryId: 'cat-sarees',
    fabric: 'Pure Organza Silk with Raw Silk Blouse Piece',
    careInstructions: 'Specialist dry clean only. Steam iron on reverse at low temperature.',
    pattern: 'Floral Resham & Pearl Scalloped Embroidery',
    occasion: 'Cocktail, Sangeet, Engagement',
    originalPrice: 1399900, // Rs 13,999
    discountedPrice: 1049900, // Rs 10,499
    discountPercent: 25,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: true,
    isActive: true,
    metaTitle: 'Dusty Rose Organza Saree | ANAMIKA COLLECTIONS',
    metaDescription: 'Ethereal dusty rose organza saree with hand-crafted zardozi scalloped borders.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85',
        altText: 'Dusty Rose Organza Saree Model Drape',
        isPrimary: true,
        displayOrder: 1,
      },
      {
        url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
        altText: 'Embroidered Border & Pearl Detailing',
        isPrimary: false,
        displayOrder: 2,
      },
    ],
    variants: [
      {
        id: 'var-saree-3-rose',
        sku: 'ANAM-SAR-ORG-RSE-01',
        size: 'Free Size (5.5m + 0.8m Blouse)',
        color: 'Dusty Rose',
        colorCode: '#DCAE96',
        additionalPrice: 0,
        stockQuantity: 11,
      },
    ],
  },
  {
    id: 'prod-saree-4',
    name: 'Champagne Gold Tissue Silk Festive Drape Saree',
    slug: 'champagne-gold-tissue-silk-festive-drape-saree',
    description: 'Radiant champagne gold woven tissue silk saree that catches ambient lighting beautifully. Adorned with delicate hand-finished Gota Patti and mirror work borders.',
    categoryId: 'cat-sarees',
    fabric: 'Fine Metallic Tissue Silk Blend',
    careInstructions: 'Dry clean only. Do not iron directly on zari.',
    pattern: 'Gota Patti and Geometric Chevron Border',
    occasion: 'Diwali, Sangeet, Festive Celebrations',
    originalPrice: 1199900, // Rs 11,999
    discountedPrice: 899900, // Rs 8,999
    discountPercent: 25,
    isFeatured: true,
    isBestseller: false,
    isNewArrival: true,
    isActive: true,
    metaTitle: 'Champagne Gold Tissue Silk Saree | ANAMIKA COLLECTIONS',
    metaDescription: 'Lustrous Champagne Gold Tissue Silk Saree with authentic Gota Patti border.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
        altText: 'Champagne Gold Tissue Silk Saree Drape',
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [
      {
        id: 'var-saree-4-gold',
        sku: 'ANAM-SAR-TIS-GLD-01',
        size: 'Free Size (5.5m + 0.8m Blouse)',
        color: 'Champagne Gold',
        colorCode: '#D4AF37',
        additionalPrice: 0,
        stockQuantity: 15,
      },
    ],
  },
  {
    id: 'prod-kurti-1',
    name: 'Deep Wine Micro Velvet Anarkali Kurti Set with Zardozi Work',
    slug: 'deep-wine-micro-velvet-anarkali-kurti-set-zardozi-work',
    description: 'Opulent micro-velvet Anarkali kurta crafted with grand flared panels, hand-embroidered royal neck yolk in antique dabka and zardozi. Paired with churidar and a woven Banarasi silk dupatta.',
    categoryId: 'cat-kurtis',
    fabric: 'Premium 9000 Micro Velvet with Banarasi Silk Dupatta',
    careInstructions: 'Specialist dry clean only. Store on padded hangers.',
    pattern: 'Flared Anarkali with Heavy Royal Yoke Embroidery',
    occasion: 'Winter Weddings, Reception, Royal Gatherings',
    originalPrice: 1149900, // Rs 11,499
    discountedPrice: 899900, // Rs 8,999
    discountPercent: 22,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: true,
    isActive: true,
    metaTitle: 'Deep Wine Velvet Anarkali Kurti Set | ANAMIKA COLLECTIONS',
    metaDescription: 'Shop luxurious Deep Wine Micro Velvet Anarkali Kurti with Banarasi Dupatta.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
        altText: 'Deep Wine Velvet Anarkali Kurti Full View',
        isPrimary: true,
        displayOrder: 1,
      },
      {
        url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85',
        altText: 'Velvet Embroidery and Dupatta Detail',
        isPrimary: false,
        displayOrder: 2,
      },
    ],
    variants: [
      {
        id: 'var-kurti-1-s',
        sku: 'ANAM-KRT-VLV-WIN-S',
        size: 'S (Bust 36)',
        color: 'Deep Wine',
        colorCode: '#58111A',
        additionalPrice: 0,
        stockQuantity: 6,
      },
      {
        id: 'var-kurti-1-m',
        sku: 'ANAM-KRT-VLV-WIN-M',
        size: 'M (Bust 38)',
        color: 'Deep Wine',
        colorCode: '#58111A',
        additionalPrice: 0,
        stockQuantity: 12,
      },
      {
        id: 'var-kurti-1-l',
        sku: 'ANAM-KRT-VLV-WIN-L',
        size: 'L (Bust 40)',
        color: 'Deep Wine',
        colorCode: '#58111A',
        additionalPrice: 0,
        stockQuantity: 10,
      },
      {
        id: 'var-kurti-1-xl',
        sku: 'ANAM-KRT-VLV-WIN-XL',
        size: 'XL (Bust 42)',
        color: 'Deep Wine',
        colorCode: '#58111A',
        additionalPrice: 0,
        stockQuantity: 4,
      },
    ],
  },
  {
    id: 'prod-kurti-2',
    name: 'Ivory Handcrafted Chikankari Pure Cotton Angrakha Kurti',
    slug: 'ivory-handcrafted-chikankari-pure-cotton-angrakha-kurti',
    description: 'Authentic Lucknowi Chikankari embroidered by master artisans. Features intricate Bakhiya, Phanda, and Keel Kangan stitches on fine breathable mulmul cotton. Includes matching inner slip.',
    categoryId: 'cat-kurtis',
    fabric: '100% Breathable Mulmul Cotton with Pure Cotton Inner',
    careInstructions: 'Gentle hand wash with mild liquid detergent. Dry in shade.',
    pattern: 'Traditional Angrakha Cross-over with Hand Tassels',
    occasion: 'Brunch, Festive Puja, Elegant Daywear',
    originalPrice: 649900, // Rs 6,499
    discountedPrice: 499900, // Rs 4,999
    discountPercent: 23,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    isActive: true,
    metaTitle: 'Ivory Chikankari Angrakha Kurti | ANAMIKA COLLECTIONS',
    metaDescription: 'Authentic Lucknowi Handcrafted Chikankari Angrakha Kurti in Ivory Mulmul Cotton.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85',
        altText: 'Ivory Chikankari Kurti Model Shot',
        isPrimary: true,
        displayOrder: 1,
      },
      {
        url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
        altText: 'Intricate Chikankari Hand Stitching Detail',
        isPrimary: false,
        displayOrder: 2,
      },
    ],
    variants: [
      {
        id: 'var-kurti-2-s',
        sku: 'ANAM-KRT-CHK-IVO-S',
        size: 'S (Bust 36)',
        color: 'Ivory White',
        colorCode: '#FFFDF9',
        additionalPrice: 0,
        stockQuantity: 8,
      },
      {
        id: 'var-kurti-2-m',
        sku: 'ANAM-KRT-CHK-IVO-M',
        size: 'M (Bust 38)',
        color: 'Ivory White',
        colorCode: '#FFFDF9',
        additionalPrice: 0,
        stockQuantity: 15,
      },
      {
        id: 'var-kurti-2-l',
        sku: 'ANAM-KRT-CHK-IVO-L',
        size: 'L (Bust 40)',
        color: 'Ivory White',
        colorCode: '#FFFDF9',
        additionalPrice: 0,
        stockQuantity: 9,
      },
      {
        id: 'var-kurti-2-xl',
        sku: 'ANAM-KRT-CHK-IVO-XL',
        size: 'XL (Bust 42)',
        color: 'Ivory White',
        colorCode: '#FFFDF9',
        additionalPrice: 0,
        stockQuantity: 3,
      },
    ],
  },
  {
    id: 'prod-kurti-3',
    name: 'Espresso Brown Raw Silk Straight Kurti with Tilla Embroidery',
    slug: 'espresso-brown-raw-silk-straight-kurti-tilla-embroidery',
    description: 'Rich espresso brown raw silk straight tunic elevated with artisanal Kashmiri Tilla metallic thread work along the neckline and cuffs. Understated luxury for formal evenings.',
    categoryId: 'cat-kurtis',
    fabric: 'Fine Raw Silk with Cotton Silk Lining',
    careInstructions: 'Dry clean only. Iron on reverse using a pressing cloth.',
    pattern: 'Straight Cut with Kashmiri Tilla Threadwork',
    occasion: 'Cocktail Evenings, Festive Dinners',
    originalPrice: 799900, // Rs 7,999
    discountedPrice: 599900, // Rs 5,999
    discountPercent: 25,
    isFeatured: false,
    isBestseller: true,
    isNewArrival: true,
    isActive: true,
    metaTitle: 'Espresso Brown Silk Kurti with Tilla Work | ANAMIKA COLLECTIONS',
    metaDescription: 'Shop our luxury Espresso Brown Raw Silk straight kurti with Kashmiri Tilla embroidery.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
        altText: 'Espresso Brown Silk Kurti Front View',
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [
      {
        id: 'var-kurti-3-s',
        sku: 'ANAM-KRT-SLK-ESP-S',
        size: 'S (Bust 36)',
        color: 'Espresso Brown',
        colorCode: '#2A1810',
        additionalPrice: 0,
        stockQuantity: 5,
      },
      {
        id: 'var-kurti-3-m',
        sku: 'ANAM-KRT-SLK-ESP-M',
        size: 'M (Bust 38)',
        color: 'Espresso Brown',
        colorCode: '#2A1810',
        additionalPrice: 0,
        stockQuantity: 10,
      },
      {
        id: 'var-kurti-3-l',
        sku: 'ANAM-KRT-SLK-ESP-L',
        size: 'L (Bust 40)',
        color: 'Espresso Brown',
        colorCode: '#2A1810',
        additionalPrice: 0,
        stockQuantity: 7,
      },
    ],
  },
  {
    id: 'prod-kurti-4',
    name: 'Soft Beige Chanderi Silk Flared Kurti with Organza Dupatta',
    slug: 'soft-beige-chanderi-silk-flared-kurti-organza-dupatta',
    description: 'Subtle elegance rendered in translucent soft beige Chanderi silk. Features woven gold foil buttis, hand-embroidered gotta patti borders, and a scalloped organza silk dupatta.',
    categoryId: 'cat-kurtis',
    fabric: 'Pure Chanderi Silk with Cotton Mul Lining',
    careInstructions: 'Dry clean only.',
    pattern: 'Flared Kalidar with Hand Gotta Patti',
    occasion: 'Mehendi, Haldi, Festive Festivities',
    originalPrice: 899900, // Rs 8,999
    discountedPrice: 699900, // Rs 6,999
    discountPercent: 22,
    isFeatured: true,
    isBestseller: false,
    isNewArrival: true,
    isActive: true,
    metaTitle: 'Soft Beige Chanderi Silk Flared Kurti | ANAMIKA COLLECTIONS',
    metaDescription: 'Shop ethereal Soft Beige Chanderi silk kurti with scalloped organza dupatta.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85',
        altText: 'Soft Beige Chanderi Kurti Set Drape',
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [
      {
        id: 'var-kurti-4-s',
        sku: 'ANAM-KRT-CHD-BGE-S',
        size: 'S (Bust 36)',
        color: 'Soft Beige',
        colorCode: '#EADBC8',
        additionalPrice: 0,
        stockQuantity: 7,
      },
      {
        id: 'var-kurti-4-m',
        sku: 'ANAM-KRT-CHD-BGE-M',
        size: 'M (Bust 38)',
        color: 'Soft Beige',
        colorCode: '#EADBC8',
        additionalPrice: 0,
        stockQuantity: 11,
      },
      {
        id: 'var-kurti-4-l',
        sku: 'ANAM-KRT-CHD-BGE-L',
        size: 'L (Bust 40)',
        color: 'Soft Beige',
        colorCode: '#EADBC8',
        additionalPrice: 0,
        stockQuantity: 8,
      },
    ],
  },
];

export const initialCoupons: InitialCoupon[] = [
  {
    id: 'coup-elegance10',
    code: 'ELEGANCE10',
    description: '10% off on luxury sarees & kurtis on orders above Rs 4,999',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 499900, // Rs 4,999
    maxDiscountAmount: 250000, // Rs 2,500
    usageLimit: 500,
    usedCount: 32,
    validFrom: '2026-01-01T00:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    isActive: true,
  },
  {
    id: 'coup-firstroyal',
    code: 'FIRSTROYAL',
    description: 'Flat Rs 1,000 instant off on your maiden festive order above Rs 7,999',
    discountType: 'FIXED',
    discountValue: 100000, // Rs 1,000 in paise
    minOrderAmount: 799900,
    maxDiscountAmount: 100000,
    usageLimit: 1000,
    usedCount: 74,
    validFrom: '2026-01-01T00:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    isActive: true,
  },
];

export const initialBanners: InitialSiteBanner[] = [
  {
    id: 'banner-1',
    title: 'The Royal Festive Edit 2026',
    subtitle: 'Handcrafted Heritage Sarees & Artisanal Kurtis',
    tagline: 'Elegance in Every Thread',
    linkText: 'Explore Saree Collection',
    linkUrl: '/category/sarees',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
    isActive: true,
  },
  {
    id: 'banner-2',
    title: 'Pure Organza & Chanderi Silks',
    subtitle: 'Featherlight Silhouettes for Modern Young Women',
    tagline: 'Timeless Luxury for Every Celebration',
    linkText: 'Shop New Arrivals',
    linkUrl: '/category/new-arrivals',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85',
    isActive: true,
  },
];

