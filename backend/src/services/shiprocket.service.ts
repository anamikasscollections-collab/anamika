import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface ServiceabilityResult {
  pincode: string;
  isServiceable: boolean;
  courierName?: string;
  courierCompanyId?: number;
  ratePaise: number; // calculated shipping rate in paise
  estimatedDeliveryDays: number;
  estimatedDeliveryDate: string;
  shippingOption: string;
  isMock: boolean;
}

export interface CreateShipmentParams {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  items: {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
  }[];
  subtotalPaise: number;
}

class ShiprocketService {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private isConfigured: boolean = false;

  constructor() {
    if (
      env.SHIPROCKET_EMAIL &&
      env.SHIPROCKET_PASSWORD &&
      !env.SHIPROCKET_EMAIL.includes('sample_') &&
      !env.SHIPROCKET_PASSWORD.includes('sample_')
    ) {
      this.isConfigured = true;
      logger.info('Shiprocket service configured with API credentials');
    } else {
      logger.warn(
        'Shiprocket credentials not provided or are sample placeholders. Using high-fidelity development/mock service.'
      );
    }
  }

  private async getAuthToken(): Promise<string | null> {
    if (!this.isConfigured) return null;

    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await axios.post(`${env.SHIPROCKET_API_BASE_URL}/auth/login`, {
        email: env.SHIPROCKET_EMAIL,
        password: env.SHIPROCKET_PASSWORD,
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        this.tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // ~9 days
        return this.token;
      }
    } catch (err: any) {
      logger.error('Failed to authenticate with Shiprocket API', err?.response?.data || err.message);
    }
    return null;
  }

  public async checkServiceability(pincode: string): Promise<ServiceabilityResult> {
    const cleanPincode = pincode.trim();
    if (!/^\d{6}$/.test(cleanPincode)) {
      return {
        pincode: cleanPincode,
        isServiceable: false,
        ratePaise: 0,
        estimatedDeliveryDays: 0,
        estimatedDeliveryDate: '',
        shippingOption: 'Standard Courier',
        isMock: !this.isConfigured,
      };
    }

    const token = await this.getAuthToken();
    if (this.isConfigured && token) {
      try {
        const response = await axios.get(
          `${env.SHIPROCKET_API_BASE_URL}/courier/serviceability/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              pickup_postcode: env.SHIPROCKET_PICKUP_PINCODE,
              delivery_postcode: cleanPincode,
              weight: '0.8', // standard parcel weight 800g for saree/kurti
              cod: 0, // strict Prepaid/UPI only
            },
          }
        );

        const data = response.data?.data;
        if (data && data.available_courier_companies && data.available_courier_companies.length > 0) {
          // Select fastest or most optimal courier
          const courier = data.available_courier_companies[0];
          const rateRupees = parseFloat(courier.rate || '120');
          const estDays = parseInt(courier.estimated_delivery_days || '3', 10);
          const estDate = new Date();
          estDate.setDate(estDate.getDate() + estDays);

          return {
            pincode: cleanPincode,
            isServiceable: true,
            courierName: courier.courier_name,
            courierCompanyId: courier.courier_company_id,
            ratePaise: Math.round(rateRupees * 100),
            estimatedDeliveryDays: estDays,
            estimatedDeliveryDate: estDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            shippingOption: courier.courier_name || 'Express Air Courier',
            isMock: false,
          };
        }
      } catch (err: any) {
        logger.error('Shiprocket serviceability query failed', err?.response?.data || err.message);
      }
    }

    // High-fidelity development mock calculation based on real distance zones
    // (Metro vs Non-Metro Indian PIN codes)
    const isDelhiNCR = cleanPincode.startsWith('11') || cleanPincode.startsWith('20') || cleanPincode.startsWith('12');
    const isMajorMetro =
      isDelhiNCR ||
      cleanPincode.startsWith('40') || // Mumbai
      cleanPincode.startsWith('56') || // Bangalore
      cleanPincode.startsWith('50') || // Hyderabad
      cleanPincode.startsWith('60') || // Chennai
      cleanPincode.startsWith('70'); // Kolkata

    const estimatedDays = isDelhiNCR ? 2 : isMajorMetro ? 3 : 5;
    // Real standard courier rate for 800g luxury apparel (express air: Rs 99 metro, Rs 149 other)
    const rateRupees = isMajorMetro ? 99 : 149;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + estimatedDays);

    return {
      pincode: cleanPincode,
      isServiceable: true,
      courierName: isMajorMetro ? 'Blue Dart Express Air' : 'Delhivery Surface Premium',
      courierCompanyId: isMajorMetro ? 101 : 102,
      ratePaise: rateRupees * 100,
      estimatedDeliveryDays: estimatedDays,
      estimatedDeliveryDate: estDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      shippingOption: isMajorMetro ? 'Express Air (Fastest Delivery)' : 'Insured Secure Courier',
      isMock: true,
    };
  }

  public async createShipment(params: CreateShipmentParams) {
    logger.info(`Creating Shiprocket shipment for Order ${params.orderNumber} to PIN ${params.pincode}`);

    const token = await this.getAuthToken();
    if (this.isConfigured && token) {
      try {
        const payload = {
          order_id: params.orderNumber,
          order_date: params.orderDate,
          pickup_location: env.SHIPROCKET_PICKUP_LOCATION,
          billing_customer_name: params.customerName,
          billing_last_name: '',
          billing_address: params.addressLine1,
          billing_address_2: params.addressLine2 || '',
          billing_city: params.city,
          billing_pincode: params.pincode,
          billing_state: params.state,
          billing_country: 'India',
          billing_email: params.customerEmail || 'orders@anamikacollections.com',
          billing_phone: params.customerPhone,
          shipping_is_billing: true,
          order_items: params.items,
          payment_method: 'Prepaid',
          sub_total: params.subtotalPaise / 100,
          length: 30,
          breadth: 25,
          height: 5,
          weight: 0.8,
        };

        const response = await axios.post(
          `${env.SHIPROCKET_API_BASE_URL}/orders/create/adhoc`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = response.data;
        return {
          shiprocketOrderId: String(data.order_id || ''),
          shiprocketShipmentId: String(data.shipment_id || ''),
          awbCode: data.awb_code || null,
          courierName: data.courier_name || 'Shiprocket Standard',
          status: 'PICKUP_SCHEDULED',
          isMock: false,
        };
      } catch (err: any) {
        logger.error('Failed to create order on Shiprocket API', err?.response?.data || err.message);
        throw new Error(err?.response?.data?.message || 'Shiprocket shipment creation failed');
      }
    }

    // High fidelity development mock
    const mockShipmentId = 'SR-SHP-' + Math.floor(100000 + Math.random() * 900000);
    const mockAwb = 'AWB-BLD-' + Math.floor(10000000 + Math.random() * 90000000);
    return {
      shiprocketOrderId: 'SR-ORD-' + Math.floor(100000 + Math.random() * 900000),
      shiprocketShipmentId: mockShipmentId,
      awbCode: mockAwb,
      courierName: 'Blue Dart Air Express (Insured)',
      trackingUrl: `https://shiprocket.co/tracking/${mockAwb}`,
      status: 'PICKUP_SCHEDULED',
      isMock: true,
    };
  }

  public async getTrackingDetails(awbCode: string) {
    const token = await this.getAuthToken();
    if (this.isConfigured && token) {
      try {
        const response = await axios.get(
          `${env.SHIPROCKET_API_BASE_URL}/courier/track/awb/${awbCode}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return {
          trackingData: response.data,
          isMock: false,
        };
      } catch (err: any) {
        logger.error(`Error tracking AWB ${awbCode}`, err?.response?.data || err.message);
      }
    }

    // High fidelity mock tracking checkpoints
    return {
      awbCode,
      status: 'IN_TRANSIT',
      currentLocation: 'New Delhi Sorting Hub',
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      activities: [
        {
          activity: 'Shipment Picked up from ANAMIKA COLLECTIONS Warehouse',
          location: 'Delhi Central Hub',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString('en-IN'),
        },
        {
          activity: 'Processed and In Transit via Express Air Linehaul',
          location: 'Delhi Sorting Centre',
          date: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString('en-IN'),
        },
      ],
      isMock: true,
    };
  }
}

export const shiprocketService = new ShiprocketService();

