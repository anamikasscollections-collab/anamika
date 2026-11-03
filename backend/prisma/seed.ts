import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { initialCategories, initialProducts, initialCoupons, initialBanners } from '../src/data/initialSeedData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ANAMIKA COLLECTIONS PostgreSQL Database via Prisma...');

  // 1. Super Admin User
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('AnamikaAdmin@2026', salt);

  const admin = await prisma.adminUser.upsert({
    where: { email: 'anamikasscollections@gmail.com' },
    update: {
      passwordHash: adminPasswordHash,
      isActive: true,
    },
    create: {
      email: 'anamikasscollections@gmail.com',
      username: 'anamika_admin',
      fullName: 'Anamika Executive Admin',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`Seeded Admin User: ${admin.email}`);

  // 2. Categories
  for (const cat of initialCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        displayOrder: cat.displayOrder,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${initialCategories.length} Categories`);

  // 3. Products with Images and Variants
  for (const prod of initialProducts) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: prod.description,
        fabric: prod.fabric,
        originalPrice: prod.originalPrice,
        discountedPrice: prod.discountedPrice,
        discountPercent: prod.discountPercent,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        categoryId: prod.categoryId,
        fabric: prod.fabric,
        careInstructions: prod.careInstructions,
        pattern: prod.pattern,
        occasion: prod.occasion,
        originalPrice: prod.originalPrice,
        discountedPrice: prod.discountedPrice,
        discountPercent: prod.discountPercent,
        isFeatured: prod.isFeatured,
        isBestseller: prod.isBestseller,
        isNewArrival: prod.isNewArrival,
        isActive: true,
        metaTitle: prod.metaTitle,
        metaDescription: prod.metaDescription,
      },
    });

    // Variants and Inventory
    for (const v of prod.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          size: v.size,
          color: v.color,
          colorCode: v.colorCode,
          additionalPrice: v.additionalPrice,
        },
        create: {
          id: v.id,
          productId: createdProduct.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          colorCode: v.colorCode,
          additionalPrice: v.additionalPrice,
        },
      });

      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: { stockQuantity: v.stockQuantity },
        create: {
          variantId: variant.id,
          stockQuantity: v.stockQuantity,
          lowStockThreshold: 5,
        },
      });
    }

    // Images
    await prisma.productImage.deleteMany({ where: { productId: createdProduct.id } });
    for (const img of prod.images) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
        },
      });
    }
  }
  console.log(`Seeded ${initialProducts.length} Luxury Products with Variants`);

  // 4. Coupons
  for (const coup of initialCoupons) {
    await prisma.coupon.upsert({
      where: { code: coup.code },
      update: {},
      create: {
        id: coup.id,
        code: coup.code,
        description: coup.description,
        discountType: coup.discountType,
        discountValue: coup.discountValue,
        minOrderAmount: coup.minOrderAmount,
        maxDiscountAmount: coup.maxDiscountAmount,
        validFrom: new Date(coup.validFrom),
        validUntil: new Date(coup.validUntil),
        isActive: coup.isActive,
      },
    });
  }
  console.log(`Seeded ${initialCoupons.length} Promo Coupons`);

  console.log('✅ PostgreSQL seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during PostgreSQL seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

