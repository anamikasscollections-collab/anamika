import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_BASE_URL: z.string().default('http://localhost:5000'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  
  // Database
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/anamika_collections?schema=public'),
  
  // JWT Security
  JWT_SECRET: z.string().default('anamika_jwt_secret_development_key_change_in_production_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_JWT_SECRET: z.string().default('anamika_admin_jwt_secret_development_key_change_in_prod_2026'),
  ADMIN_JWT_EXPIRES_IN: z.string().default('24h'),
  
  // Razorpay
  RAZORPAY_KEY_ID: z.string().default('rzp_test_sample_key_id'),
  RAZORPAY_KEY_SECRET: z.string().default('sample_razorpay_secret_key'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('sample_razorpay_webhook_secret'),
  
  // Shiprocket
  SHIPROCKET_EMAIL: z.string().default('shipping@anamikacollections.com'),
  SHIPROCKET_PASSWORD: z.string().default('sample_shiprocket_password'),
  SHIPROCKET_API_BASE_URL: z.string().default('https://apiv2.shiprocket.in/v1/external'),
  SHIPROCKET_PICKUP_PINCODE: z.string().default('110001'),
  SHIPROCKET_PICKUP_LOCATION: z.string().default('Primary Warehouse Delhi'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().default('anamika-media'),
  CLOUDINARY_API_KEY: z.string().default('sample_cloudinary_api_key'),
  CLOUDINARY_API_SECRET: z.string().default('sample_cloudinary_secret'),
  
  // WhatsApp Notification Service
  WHATSAPP_API_TOKEN: z.string().default('sample_whatsapp_token'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().default('sample_phone_number_id'),
  WHATSAPP_DEV_MODE: z.string().default('true'),
  
  // Email Notification Service (SMTP)
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.string().default('2525'),
  SMTP_USER: z.string().default('sample_smtp_user'),
  SMTP_PASS: z.string().default('sample_smtp_pass'),
  SMTP_FROM: z.string().default('"ANAMIKA COLLECTIONS" <orders@anamikacollections.com>'),
  EMAIL_DEV_MODE: z.string().default('true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

