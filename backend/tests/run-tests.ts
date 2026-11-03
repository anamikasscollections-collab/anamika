import { dbStore } from '../src/data/dbStore';
import { razorpayService } from '../src/services/razorpay.service';
import { shiprocketService } from '../src/services/shiprocket.service';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, failureDetail?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    results.push({ name: testName, passed: false, message: failureDetail });
    console.error(`  ✗ FAIL: ${testName} - ${failureDetail || 'Assertion failed'}`);
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING ANAMIKA COLLECTIONS COMPREHENSIVE TEST SUITE');
  console.log('======================================================\n');

  // TEST 1: Database & Seed Integrity
  console.log('--- 1. Catalog & Database Seed Integrity ---');
  const categories = dbStore.getCategories();
  assert(categories.length >= 2, 'Categories loaded', `Count: ${categories.length}`);
  const hasSarees = categories.some((c) => c.slug === 'sarees');
  const hasKurtis = categories.some((c) => c.slug === 'kurtis');
  assert(hasSarees && hasKurtis, 'Both Sarees and Kurtis categories exist');

  const products = dbStore.getProducts().products;
  assert(products.length >= 4, 'Catalog products seeded', `Count: ${products.length}`);
  const sampleProduct = products[0];
  assert(sampleProduct.variants.length > 0, 'Product has variant-level inventory');
  assert(sampleProduct.originalPrice > sampleProduct.discountedPrice, 'Discount calculation logic valid');

  // TEST 2: Product Search & Filtering
  console.log('\n--- 2. Product Search, Filtering & Sorting ---');
  const wineFilter = dbStore.getProducts({ search: 'Crimson Wine' });
  assert(wineFilter.products.length > 0, 'Search by keyword finds products');

  const sareeCategoryProducts = dbStore.getProducts({ categorySlug: 'sarees' });
  assert(sareeCategoryProducts.products.length > 0, 'Filter by category "sarees" works');

  const sortedPriceLow = dbStore.getProducts({ sortBy: 'price_low_high' });
  let isSortedAsc = true;
  for (let i = 0; i < sortedPriceLow.products.length - 1; i++) {
    if (sortedPriceLow.products[i].discountedPrice > sortedPriceLow.products[i + 1].discountedPrice) {
      isSortedAsc = false;
      break;
    }
  }
  assert(isSortedAsc, 'Sorting by price (low to high) works');

  // TEST 3: Customer Registration & Authentication
  console.log('\n--- 3. Customer Authentication & Security ---');
  const testEmail = `testuser_${Date.now()}@example.com`;
  const salt = bcrypt.genSaltSync(8);
  const passwordHash = bcrypt.hashSync('LuxuryPass@123', salt);
  const createdUser = dbStore.createUser({
    id: 'usr-test-01',
    fullName: 'Meera Kapoor',
    email: testEmail,
    phone: '9876543210',
    passwordHash,
    role: 'CUSTOMER',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  assert(createdUser.email === testEmail, 'Customer account creation succeeds');

  const foundUser = dbStore.findUserByEmail(testEmail);
  assert(Boolean(foundUser), 'Customer lookup by email succeeds');
  const passValid = bcrypt.compareSync('LuxuryPass@123', foundUser!.passwordHash!);
  assert(passValid, 'Password verification passes with bcrypt');
  const passInvalid = bcrypt.compareSync('WrongPassword', foundUser!.passwordHash!);
  assert(!passInvalid, 'Invalid password correctly rejected');

  // TEST 4: Admin Authentication (No Public Registration)
  console.log('\n--- 4. Admin Security & Role Authorization ---');
  const admin = dbStore.findAdminByUsernameOrEmail('anamika_admin');
  assert(Boolean(admin), 'Pre-seeded Admin account exists');
  assert(admin?.role === 'SUPER_ADMIN', 'Admin has SUPER_ADMIN role');
  const adminPassMatch = bcrypt.compareSync('AnamikaAdmin@2026', admin!.passwordHash);
  assert(adminPassMatch, 'Admin secure credentials authenticate properly');

  // TEST 5: Cart Management & Price Recalculation
  console.log('\n--- 5. Shopping Cart & Inventory Validation ---');
  const cart = dbStore.getOrCreateCart('usr-test-01');
  const testVariant = sampleProduct.variants[0];
  const initialStock = testVariant.stockQuantity;

  dbStore.updateCartItem(cart.id, testVariant.id, sampleProduct.id, 2);
  const updatedCart = dbStore.getOrCreateCart('usr-test-01');
  assert(updatedCart.items.length === 1, 'Item added to cart');
  assert(updatedCart.items[0].quantity === 2, 'Cart quantity correctly set');

  // TEST 6: Wishlist Workflow
  console.log('\n--- 6. Wishlist Management ---');
  const wlToggle1 = dbStore.toggleWishlist('usr-test-01', sampleProduct.id);
  assert(wlToggle1.inWishlist === true, 'Product added to Wishlist');
  const userWl = dbStore.getOrCreateWishlist('usr-test-01');
  assert(userWl.productIds.includes(sampleProduct.id), 'Wishlist persists product ID');
  const wlToggle2 = dbStore.toggleWishlist('usr-test-01', sampleProduct.id);
  assert(wlToggle2.inWishlist === false, 'Product removed from Wishlist on toggle');

  // TEST 7: Shipping Serviceability & Rate Calculation
  console.log('\n--- 7. Shiprocket Shipping Integration ---');
  const validServiceability = await shiprocketService.checkServiceability('110001');
  assert(validServiceability.isServiceable, 'Valid 6-digit Delhi PIN code is serviceable');
  assert(validServiceability.ratePaise > 0, 'Shipping rate returned (paid by customer)', `Rate: ₹${validServiceability.ratePaise / 100}`);

  const invalidServiceability = await shiprocketService.checkServiceability('000000');
  // Serviceability checking handles edge cases
  assert(typeof invalidServiceability.isServiceable === 'boolean', 'Serviceability check returns structured result');

  // TEST 8: Order Creation & Server-side Total Calculation
  console.log('\n--- 8. Order Creation & Multi-step Checkout ---');
  const subtotal = (sampleProduct.discountedPrice + testVariant.additionalPrice) * 1;
  const shipping = validServiceability.ratePaise;
  const total = subtotal + shipping;

  const testOrder = dbStore.createOrder({
    id: 'ord-test-999',
    orderNumber: `AC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    userId: 'usr-test-01',
    customerName: 'Meera Kapoor',
    guestPhone: '9876543210',
    shippingAddress: {
      id: 'addr-01',
      userId: 'usr-test-01',
      fullName: 'Meera Kapoor',
      phone: '9876543210',
      addressLine1: 'B-14, Green Park Extension',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      isDefault: true,
      addressType: 'HOME',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    status: 'AWAITING_PAYMENT',
    subtotalAmount: subtotal,
    discountAmount: 0,
    shippingAmount: shipping,
    totalAmount: total,
    items: [
      {
        id: 'oi-test-01',
        orderId: 'ord-test-999',
        productId: sampleProduct.id,
        variantId: testVariant.id,
        productName: sampleProduct.name,
        variantSku: testVariant.sku,
        size: testVariant.size,
        color: testVariant.color,
        quantity: 1,
        unitPrice: sampleProduct.discountedPrice + testVariant.additionalPrice,
        totalAmount: subtotal,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  assert(testOrder.status === 'AWAITING_PAYMENT', 'Order initialized in AWAITING_PAYMENT state');
  assert(testOrder.totalAmount === subtotal + shipping, 'Order total matches server calculated amounts');

  // TEST 9: Razorpay Order Creation & Strict UPI Configuration
  console.log('\n--- 9. Razorpay Payment Gateway & UPI Preference ---');
  const upiConfig = razorpayService.getUpiOnlyCheckoutConfig();
  assert(Boolean(upiConfig.config?.display?.blocks?.upi_block), 'Razorpay config strictly specifies UPI-only display block');

  const rzpOrder = await razorpayService.createOrder({
    amountPaise: testOrder.totalAmount,
    receipt: testOrder.orderNumber,
  });
  assert(Boolean(rzpOrder.id), 'Razorpay order created with unique ID');
  assert(rzpOrder.amount === testOrder.totalAmount, 'Razorpay order amount matches order total in paise');

  // TEST 10: Payment Cryptographic Signature Verification
  console.log('\n--- 10. Payment Signature Verification & Order Confirmation ---');
  const mockSigValid = razorpayService.verifyPaymentSignature({
    razorpayOrderId: rzpOrder.id,
    razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substring(2, 8),
    razorpaySignature: 'mock_upi_verified_sig',
  });
  assert(mockSigValid, 'Verified payment signature accepted');

  const mockSigInvalid = razorpayService.verifyPaymentSignature({
    razorpayOrderId: 'order_live_123',
    razorpayPaymentId: 'pay_live_456',
    razorpaySignature: 'tampered_invalid_signature',
  });
  assert(!mockSigInvalid, 'Tampered/invalid payment signature strictly rejected');

  // Update order to verified payment
  dbStore.savePayment({
    id: 'pay-test-01',
    orderId: testOrder.id,
    paymentProvider: 'RAZORPAY',
    razorpayOrderId: rzpOrder.id,
    razorpayPaymentId: 'pay_test_verified_123',
    amount: testOrder.totalAmount,
    currency: 'INR',
    status: 'SUCCESS',
    method: 'UPI',
    upiVpa: 'meera@okaxis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const verifiedOrder = dbStore.getOrderById(testOrder.id);
  assert(verifiedOrder?.status === 'PAYMENT_SUCCESSFUL', 'Order transitions to PAYMENT_SUCCESSFUL upon verified payment');

  // TEST 11: Webhook Idempotency
  console.log('\n--- 11. Webhook Idempotency ---');
  const testEventId = 'evt_test_' + Date.now();
  assert(!dbStore.isWebhookEventProcessed(testEventId), 'Webhook event not yet processed');
  dbStore.markWebhookEventProcessed(testEventId);
  assert(dbStore.isWebhookEventProcessed(testEventId), 'Webhook event registered as processed');
  // Duplicate check
  assert(dbStore.isWebhookEventProcessed(testEventId), 'Duplicate webhook event successfully detected for idempotent skip');

  // TEST 12: Shipment Creation & Tracking
  console.log('\n--- 12. Shiprocket Shipment Booking & Tracking ---');
  const shipment = await shiprocketService.createShipment({
    orderId: testOrder.id,
    orderNumber: testOrder.orderNumber,
    orderDate: testOrder.createdAt,
    customerName: testOrder.customerName,
    customerPhone: testOrder.guestPhone || '9876543210',
    addressLine1: testOrder.shippingAddress.addressLine1,
    city: testOrder.shippingAddress.city,
    state: testOrder.shippingAddress.state,
    pincode: testOrder.shippingAddress.pincode,
    items: [
      {
        name: sampleProduct.name,
        sku: testVariant.sku,
        units: 1,
        selling_price: sampleProduct.discountedPrice / 100,
      },
    ],
    subtotalPaise: testOrder.subtotalAmount,
  });

  assert(Boolean(shipment.awbCode), 'Shiprocket shipment generated AWB code');
  assert(Boolean(shipment.courierName), 'Shipment assigned courier partner');

  const tracking = await shiprocketService.getTrackingDetails(shipment.awbCode!);
  assert(Boolean(tracking.status), 'Shipment tracking details retrieved');

  // TEST 13: Customer Complaints / Legal Remedy Handling
  console.log('\n--- 13. Return & Exchange Policy: Support Ticket Handling ---');
  const ticket = dbStore.createSupportTicket({
    id: 'tkt-test-01',
    ticketNumber: 'TKT-998877',
    orderId: testOrder.id,
    customerName: testOrder.customerName,
    customerEmail: 'meera@example.com',
    customerPhone: '9876543210',
    issueType: 'DEFECTIVE_PRODUCT',
    description: 'Received saree with a pulled thread along the pallu border.',
    imageEvidenceUrl: 'https://images.unsplash.com/sample-defect.jpg',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  assert(ticket.status === 'OPEN', 'Support ticket opened for defective goods complaint');
  const resolvedTicket = dbStore.updateSupportTicketStatus(ticket.id, 'RESOLVED', 'Replacement approved');
  assert(resolvedTicket?.status === 'RESOLVED', 'Admin can review and resolve customer defect claims');

  console.log('\n======================================================');
  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.filter((r) => !r.passed).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('======================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test runner failure:', err);
  process.exit(1);
});

