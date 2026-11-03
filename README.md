# ANAMIKA COLLECTIONS
### Premium E-Commerce Website for Luxury Sarees & Designer Kurtis
**Brand Tagline:** *"Elegance in Every Thread"*

---

## 1. Executive Summary & Brand Overview

**ANAMIKA COLLECTIONS** is a complete, production-ready, full-stack luxury fashion e-commerce platform specializing in premium handwoven sarees (Varanasi Banarasi, Mulberry Kanjivaram, Pure Organza, Tissue Silk) and handcrafted designer kurtis (Micro Velvet Anarkalis, Lucknowi Chikankari Mulmul, Chanderi Silk sets).

The website was architected and developed with an uncompromising focus on:
- **Luxury Fashion Aesthetics**: Styled in Ivory (`#FAF7F2`), Champagne Gold (`#D4AF37`), Deep Wine (`#58111A`), and Espresso Brown (`#2A1810`) with classical serif typography (*Cinzel* and *Playfair Display*).
- **Mobile-First & Responsive**: Engineered for young modern women browsing on high-DPI smartphones, tablets, and desktops.
- **Strict Razorpay UPI-Only Payments**: Tailored specifically to the client's preference for UPI apps (Google Pay, PhonePe, Paytm, BHIM, Cred) with server-side HMAC-SHA256 signature verification and idempotent webhook processing. Cards, net banking, and COD are explicitly disabled.
- **Official Shiprocket Integration**: Real-time 6-digit Indian PIN code serviceability checking, dynamic courier rate calculation (paid by customer), shipment dispatch, AWB assignment, and live parcel tracking.
- **Strict Return & Exchange Policy Architecture**: Enforcing "NO RETURNS OR EXCHANGES" on all luxury apparel with full legal consumer compliance and an integrated Concierge Support Desk for verifiable transit damage and manufacturing defects.
- **Executive Admin Portal**: Isolated, secure dashboard for order pipeline transitions, inventory adjustment, product variants, coupon rules, banner promotions, and customer support resolutions.

---

## 2. Technology Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios, React Router v6 |
| **Backend** | Node.js, Express, TypeScript, Zod, Helmet, Morgan, Express Rate Limit, BcryptJS, JWT |
| **Database** | PostgreSQL with Prisma ORM (`@prisma/client` + schema migrations) |
| **Resilient Store** | Dual-Layer JSON persistent store (`data/anamika_store.json`) for zero-dependency offline local development |
| **Payments** | Razorpay SDK (Configured strictly for UPI checkout, server-side HMAC SHA256 validation) |
| **Logistics** | Shiprocket API (Serviceability, rate calculation, shipment booking, AWB tracking) |
| **Notifications** | WhatsApp Business API & SMTP Nodemailer (with high-fidelity dev simulators) |

---

## 3. Directory Structure

```
Anamika/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # PostgreSQL schema with relations, enums & indexes
│   │   └── seed.ts                  # Database seed script for PostgreSQL
│   ├── src/
│   │   ├── config/                  # Environment validation with Zod
│   │   ├── controllers/             # Auth, Product, Cart, Order, Payment, Shipping, Admin, Support
│   │   ├── data/                    # Initial seed data and thread-safe DB store
│   │   ├── middlewares/             # Customer auth, Admin auth, Rate limiting, Request validation
│   │   ├── routes/                  # Modular Express API endpoints (/api/*)
│   │   ├── services/                # Razorpay UPI, Shiprocket logistics, Notifications
│   │   ├── utils/                   # JWT token helpers, cryptographic security, logger
│   │   └── server.ts                # Main Express server entrypoint
│   ├── tests/
│   │   └── run-tests.ts             # 39-test automated test suite
│   ├── .env.example                 # Backend environment variable template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   ├── robots.txt               # SEO crawler directives
│   │   └── sitemap.xml              # XML Sitemap for search engines
│   ├── src/
│   │   ├── components/              # Navbar, Footer, ProductCard, CartDrawer, AuthModal, SearchModal, QuickViewModal
│   │   ├── context/                 # AuthContext, CartContext, WishlistContext
│   │   ├── pages/
│   │   │   ├── HomePage.tsx         # Hero carousel, value pillars, categories, sarees, kurtis, reviews, instagram
│   │   │   ├── CategoryPage.tsx     # Faceted filtering (fabric, size, price), sorting, responsive grid
│   │   │   ├── ProductDetailPage.tsx# Image zoom gallery, variant selector, Shiprocket PIN check, reviews
│   │   │   ├── CheckoutPage.tsx     # 5-step checkout with server calculation & Razorpay UPI
│   │   │   ├── OrderSuccessPage.tsx # Confirmed order pipeline, AWB tracking, printable tax invoice
│   │   │   ├── WishlistPage.tsx     # Saved items with direct "Move to Cart"
│   │   │   ├── AccountPage.tsx      # Orders history, address book, profile details
│   │   │   ├── PolicyPages.tsx      # Return & Exchange Policy, Shipping Policy
│   │   │   ├── SupportPage.tsx      # Defective/damaged product complaint submission & tracking
│   │   │   └── admin/
│   │   │       ├── AdminLogin.tsx   # Isolated administrative authentication
│   │   │       └── AdminDashboard.tsx# Analytics overview, products, stock, orders, coupons, banners, support
│   │   ├── services/                # Axios API client with bearer token interception
│   │   ├── App.tsx                  # Client router & modal overlays
│   │   ├── main.tsx
│   │   └── index.css                # Tailwind directives & luxury scrollbar styling
│   ├── .env.example                 # Frontend environment template
│   ├── tailwind.config.js           # Custom luxury color palette & typography
│   └── package.json
└── README.md                        # Master Project Documentation
```

---

## 4. Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24 LTS recommended)
- **npm**: v9.0.0 or higher
- Optional for production: PostgreSQL v14+ or cloud Postgres (Neon / Supabase / AWS RDS)

### Step 1: Clone or Navigate to the Project
```bash
cd Anamika
```

### Step 2: Configure Backend Environment
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` with your desired configuration or run with defaults (which operates with high-fidelity test sandboxes out-of-the-box).

### Step 3: Install Backend Dependencies & Generate Prisma Client
```bash
npm install
npx prisma generate
```

### Step 4: Configure Frontend Environment
```bash
cd ../frontend
cp .env.example .env
npm install
```

---

## 5. Running the Application

### Running the Backend Development Server
```bash
cd backend
npm run dev
```
*Backend runs at:* `http://localhost:5000`  
*API Health check:* `http://localhost:5000/api/health`

### Running the Frontend Development Server
```bash
cd frontend
npm run dev
```
*Frontend runs at:* `http://localhost:5173`

---

## 6. Running the Comprehensive Test Suite

ANAMIKA COLLECTIONS comes with an end-to-end automated test runner covering all 39 business logic conditions:
```bash
cd backend
npm test
```

### Verified Test Cases (39/39 Passing):
1. **Catalog & Seed Integrity**: Ensures both Sarees and Kurtis categories, variant inventory, and pricing exist.
2. **Search, Filtering & Sorting**: Case-insensitive substring search, category filtering, price sorting.
3. **Customer Authentication**: Bcrypt password hashing, token validation, mobile OTP flow.
4. **Admin Authorization**: Pre-seeded Super Admin account verification, no public admin registration.
5. **Shopping Cart**: Item addition, stock quantity constraint check, server-side recalculation.
6. **Wishlist**: Add, toggle, and logged-in persistence.
7. **Shiprocket Logistics**: 6-digit PIN code serviceability check and zone-based customer shipping charge calculation.
8. **Multi-Step Checkout & Orders**: Server-calculated subtotal, coupon discount, shipping addition, `AWAITING_PAYMENT` state initialization.
9. **Razorpay Payment Gateway**: UPI-only display preference block enforcement, server-side order generation.
10. **Cryptographic Payment Verification**: HMAC SHA256 timing-safe signature comparison, order transition to `PAYMENT_SUCCESSFUL`, inventory deduction.
11. **Webhook Idempotency**: Detection and skipping of duplicate webhook events to prevent double processing.
12. **Shipment Booking & Tracking**: Shiprocket AWB generation, courier allocation, live tracking checkpoints.
13. **Return & Exchange Policy Remedy**: Formal support complaint creation and administrator resolution.

---

## 7. Payment Gateway Integration (Razorpay – UPI Only)

As explicitly mandated, the platform is locked to **UPI APPS ONLY**:
- **Disabled Methods**: Credit Cards, Debit Cards, Net Banking, Wallets, EMI, and Cash on Delivery (COD) are disabled in checkout configuration.
- **Client Checkout Configuration**:
  ```json
  {
    "config": {
      "display": {
        "blocks": {
          "upi_block": {
            "name": "Pay with UPI (GPay, PhonePe, Paytm, BHIM)",
            "instruments": [{ "method": "upi" }]
          }
        },
        "sequence": ["block.upi_block"],
        "preferences": { "show_default_blocks": false }
      }
    }
  }
  ```
- **Security Protocols**:
  - Razorpay Key Secret is stored strictly on the backend (`backend/.env`).
  - Total order amount is computed exclusively on the server in paise (never trusting frontend values).
  - Client payment signatures are verified via HMAC SHA256: `HMAC_SHA256(order_id + "|" + payment_id, secret) === signature`.
  - Webhooks capture raw request buffers for signature verification (`X-Razorpay-Signature`).
  - Webhook events are processed idempotently using a processed events registry.

---

## 8. Shipping Integration (Shiprocket)

- **PIN Code Verification**: Customers enter their 6-digit delivery PIN code on the product page or checkout to verify serviceability across India.
- **Customer-Paid Shipping**: Rates are computed based on distance zones and parcel weight (800g apparel standard) via Shiprocket API or high-fidelity regional mock (Metro: ₹99, Non-Metro: ₹149).
- **Shipment Dispatch**: Store administrators can click **"Dispatch via Shiprocket"** in the Admin Dashboard, which assigns an AWB code (e.g. `AWB-BLD-74928190`) and tracking URL.
- **Live Tracking**: Customers can view shipment progress on `/order/:id` or on the Shiprocket tracking portal.

---

## 9. Return and Exchange Policy Architecture

- **Store Rule**: All items are strictly **Non-Returnable and Non-Exchangeable** to maintain handloom silk purity and hygiene.
- **Clear Prompts**:
  - Highlighted on every product detail page with an alert banner.
  - Mandatory acknowledgment checkbox required during checkout before payment.
  - Dedicated policy page at `/policies/returns-and-exchanges`.
- **Legal Compliance for Defects**:
  - Customers receiving items with manufacturing defects or transit damage can file a claim at `/support`.
  - Customers provide an unboxing video link and description within 48 hours.
  - Store administrators review claims in the **Admin Dashboard > Customer Complaints** tab, issuing replacements or authorized refunds.

---

## 10. Store Administrator Credentials & Usage Guide

- **Admin URL**: `http://localhost:5173/admin/login`
- **Pre-Seeded Executive Credentials**:
  - **Username**: `anamika_admin`
  - **Email**: `admin@anamikacollections.com`
  - **Password**: `AnamikaAdmin@2026`
- **Security Note**: Public admin registration is strictly disabled. Additional administrators can only be created by an existing `SUPER_ADMIN`.

### Admin Capabilities:
1. **Analytics Overview**: View real-time revenue, total orders, pending dispatches, patron registrations, and low-stock alerts.
2. **Product Catalog**: Add, edit, or delete sarees and kurtis. Specify fabric, care instructions, original price, discounted price, and multiple image URLs.
3. **Inventory Management**: Adjust stock quantities per variant with `+1` / `-1` controls.
4. **Order Management**: Filter by status, change lifecycle status (`PROCESSING`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`), generate Shiprocket shipments, and view customer invoices.
5. **Coupons Management**: Create discount codes (e.g., `ELEGANCE10`, `FIRSTROYAL`) with minimum purchase requirements and expiry limits.
6. **Hero Banners**: Manage homepage promotional hero titles, subtitles, and CTA buttons.
7. **Customer Complaints**: Review defect tickets, inspect unboxing evidence, and submit resolution notes.

---

## 11. REST API Documentation Summary

### Customer Authentication
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate with email/password
- `POST /api/auth/otp/request` - Request 6-digit OTP to mobile or email
- `POST /api/auth/otp/verify` - Verify OTP and generate session JWT
- `GET /api/auth/profile` - Fetch profile, order count, and wishlist count
- `GET /api/auth/addresses` - Retrieve customer delivery addresses
- `POST /api/auth/addresses` - Add new delivery address

### Catalog & Products
- `GET /api/products` - Filtered product listing (`category`, `fabric`, `size`, `minPrice`, `maxPrice`, `search`, `sortBy`)
- `GET /api/products/slug/:slug` - Product details, reviews, and related items
- `GET /api/products/categories` - Active category listing
- `GET /api/products/banners` - Active promotional hero slides
- `POST /api/products/:id/reviews` - Submit product review and 1-5 star rating

### Cart & Wishlist
- `GET /api/cart` - Retrieve cart with server-recalculated prices & shipping
- `POST /api/cart/items` - Add or update quantity of product variant
- `DELETE /api/cart/items/:variantId` - Remove variant from cart
- `DELETE /api/cart/clear` - Empty cart
- `GET /api/wishlist` - View customer wishlist
- `POST /api/wishlist/toggle` - Add/remove item from wishlist
- `POST /api/wishlist/move-to-cart` - Transfer saved item directly to cart

### Shipping & Orders
- `GET /api/shipping/serviceability?pincode=XXXXXX` - Check PIN serviceability & rate
- `GET /api/shipping/track/:awb` - Fetch courier tracking checkpoints
- `POST /api/orders/checkout` - Create order in `AWAITING_PAYMENT` status
- `GET /api/orders/:idOrNumber` - Order status and details
- `GET /api/orders/:id/invoice` - Formal GST tax invoice data
- `GET /api/orders/my-orders` - Customer's past orders

### Payments (Razorpay UPI)
- `GET /api/payments/razorpay/config` - UPI-only checkout configuration
- `POST /api/payments/razorpay/create-order` - Create server-side Razorpay order
- `POST /api/payments/razorpay/verify` - Verify cryptographic HMAC SHA256 signature
- `POST /api/payments/razorpay/webhook` - Idempotent webhook receiver for payment capture/failure

### Admin Endpoints (Requires Admin Bearer Token)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/overview` - Real-time statistics & low stock warnings
- `GET /api/admin/products` - Catalog management
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/inventory/adjust` - Adjust variant stock
- `GET /api/admin/orders` - Filtered order list
- `PUT /api/admin/orders/:id/status` - Transition order status
- `POST /api/admin/orders/:id/shipment` - Dispatch order via Shiprocket
- `GET /api/admin/coupons` - List promo coupons
- `POST /api/admin/coupons` - Create promo coupon
- `PUT /api/admin/coupons/:id/toggle` - Toggle coupon status
- `GET /api/admin/support` - Customer defect complaints
- `PUT /api/admin/support/:id` - Resolve defect claim

---

## 12. Live Configuration & Admin Access

### A. Live Integrated Services
- **Database**: Live AWS us-east-1 Neon Serverless PostgreSQL (`postgresql://neondb_owner:***@ep-icy-union-bb6u1myr-pooler.c-15.us-east-1.aws.neon.tech/neondb?sslmode=require`)
- **Email Service & OTP Sender**: Real-time Google Workspace / Gmail SMTP (`anamikasscollections@gmail.com`) authenticated via 16-character App Password on port 465 SSL.
- **Customer Registration**: Mandatory collection of 10-digit Indian Mobile Number + Email OTP verification + password.
- **Admin Control**: Complete product management (edit title, fabric, category, description, original/discounted INR prices, upload/delete pictures, set primary photo, edit size variants and inventory stock).

### B. Default Administrative Credentials
- **Admin Portal URL**: `http://localhost:5173/admin/login`
- **Admin Email**: `anamikasscollections@gmail.com`
- **Admin Username**: `anamika_admin`
- **Admin Password**: `AnamikaAdmin@2026`
- **Role**: `SUPER_ADMIN`

---

## 13. Production Deployment Guide

### Option A: Standard Node.js & Static Frontend (Render / Railway / VPS)
1. **Backend**:
   - Provision a PostgreSQL database instance (Supabase, Neon, or Railway Postgres).
   - Set environment variables matching `backend/.env.example`.
   - Run database migrations: `npx prisma db push` and `npx prisma db seed`.
   - Build and start server: `npm run build && npm start`.
2. **Frontend**:
   - Set `VITE_API_BASE_URL=https://your-backend-api.com/api`.
   - Set `VITE_RAZORPAY_KEY_ID=rzp_live_YourKeyId`.
   - Build static assets: `npm run build`.
   - Deploy `frontend/dist` to Vercel, Netlify, or Cloudflare Pages.

### Option B: Docker Containerization
Both services can be bundled into lightweight Alpine Node containers with a reverse proxy (Nginx or Traefik) routing `/api` to Express and `/` to Vite static dist.

---

© 2026 ANAMIKA COLLECTIONS. All Rights Reserved. Elegance in Every Thread.

