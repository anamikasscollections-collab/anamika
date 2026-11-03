import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Truck,
  Printer,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [invoice, setInvoice] = useState<any | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderAndInvoice = async () => {
      try {
        setLoading(true);
        const [orderRes, invoiceRes] = await Promise.all([
          api.get(`/orders/${id}`),
          api.get(`/orders/${id}/invoice`),
        ]);

        if (orderRes.data?.success) setOrder(orderRes.data.data);
        if (invoiceRes.data?.success) setInvoice(invoiceRes.data.data);
      } catch (err) {
        console.error('Error fetching order', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderAndInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Sparkles className="w-8 h-8 text-luxury-gold mx-auto animate-spin" />
        <h2 className="font-serif text-xl font-bold text-luxury-espresso">
          Verifying Payment & Generating Royal Invoice...
        </h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-luxury-espresso">Order Not Found</h2>
        <Link to="/" className="inline-block bg-luxury-wine text-luxury-ivory px-6 py-2.5 rounded text-xs font-semibold uppercase tracking-wider">
          Return to Boutique
        </Link>
      </div>
    );
  }

  const statusSteps = [
    { key: 'PAYMENT_SUCCESSFUL', label: 'Payment Verified' },
    { key: 'ORDER_CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Quality Check' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'Dispatched' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Hero Header */}
      <div className="bg-white p-8 rounded-2xl border border-luxury-gold/30 shadow-luxury text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-luxury-wine">
          ANAMIKA COLLECTIONS • OFFICIAL CONFIRMATION
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-espresso">
          Order Confirmed & Paid via UPI
        </h1>

        <p className="text-sm text-luxury-espresso/80 max-w-lg mx-auto font-light leading-relaxed">
          Namaste, <strong>{order.customerName}</strong>. Your payment for Order <strong>#{order.orderNumber}</strong> has been verified cryptographically. Your handcrafted drapes are now being meticulously inspected for shipment.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center space-x-2 bg-luxury-wine hover:bg-luxury-wine-light text-luxury-ivory text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>View & Print Tax Invoice</span>
          </button>

          <Link
            to="/category/sarees"
            className="inline-flex items-center space-x-2 bg-luxury-warmWhite hover:bg-luxury-beige/30 border border-luxury-gold/30 text-luxury-espresso text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-luxury-wine" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* Shipment & Live Tracking Card */}
      {order.shipment && (
        <div className="bg-luxury-warmWhite p-6 rounded-2xl border border-luxury-gold/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-luxury-wine" />
              <h3 className="font-serif font-bold text-base text-luxury-espresso">
                Shiprocket Courier Tracking
              </h3>
            </div>
            <span className="bg-luxury-wine text-luxury-ivory text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
              {order.shipment.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <span className="text-luxury-espresso/60 block">Assigned Courier:</span>
              <span className="font-semibold text-luxury-espresso">{order.shipment.courierName || 'Blue Dart Express'}</span>
            </div>
            <div>
              <span className="text-luxury-espresso/60 block">Air Waybill (AWB):</span>
              <span className="font-mono font-semibold text-luxury-wine">{order.shipment.awbCode || 'Assigned on Dispatch'}</span>
            </div>
            <div>
              <span className="text-luxury-espresso/60 block">Estimated Delivery:</span>
              <span className="font-semibold text-luxury-espresso">{order.shipment.estimatedDeliveryDate || '3-5 Business Days'}</span>
            </div>
          </div>

          {order.shipment.trackingUrl && (
            <div className="pt-2">
              <a
                href={order.shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-luxury-wine hover:underline font-semibold"
              >
                <span>Track live updates on Shiprocket</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Order Items Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-luxury-beige/40 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-luxury-espresso border-b border-luxury-beige/20 pb-3">
          Ordered Items
        </h3>

        <div className="divide-y divide-luxury-beige/20">
          {order.items.map((i: any) => (
            <div key={i.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                {i.imageUrl && (
                  <img src={i.imageUrl} alt={i.productName} className="w-14 h-16 object-cover rounded bg-luxury-warmWhite" />
                )}
                <div>
                  <h4 className="font-serif font-semibold text-luxury-espresso">{i.productName}</h4>
                  <p className="text-[11px] text-luxury-espresso/60">
                    Size: {i.size} | Shade: {i.color} | Qty: {i.quantity}
                  </p>
                </div>
              </div>
              <span className="font-serif font-bold text-luxury-wine">
                ₹{(i.totalAmount / 100).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Totals */}
        <div className="border-t border-luxury-beige/30 pt-4 space-y-1.5 text-xs text-luxury-espresso/80">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{(order.subtotalAmount / 100).toLocaleString('en-IN')}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-₹{(order.discountAmount / 100).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping Charges (Shiprocket)</span>
            <span>₹{(order.shippingAmount / 100).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-base font-serif font-bold text-luxury-wine pt-2 border-t border-luxury-beige/40">
            <span>Total Paid via Razorpay UPI</span>
            <span>₹{(order.totalAmount / 100).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Tax Invoice Modal */}
      {showInvoiceModal && invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-luxury-gold/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="font-brand text-2xl font-bold tracking-widest text-luxury-wine">
                  ANAMIKA COLLECTIONS
                </h2>
                <p className="text-[10px] tracking-widest text-luxury-gold-antique uppercase font-semibold">
                  Elegance in Every Thread
                </p>
              </div>
              <div className="text-right text-xs text-luxury-espresso/70">
                <p className="font-bold text-luxury-espresso">{invoice.invoiceNumber}</p>
                <p>Date: {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h5 className="font-bold text-luxury-espresso mb-1">Dispatched From:</h5>
                <p className="text-luxury-espresso/70">{invoice.brand.name}</p>
                <p className="text-luxury-espresso/70">{invoice.brand.address}</p>
                <p className="text-luxury-espresso/70">GSTIN: {invoice.brand.gstin}</p>
              </div>
              <div>
                <h5 className="font-bold text-luxury-espresso mb-1">Billed & Shipped To:</h5>
                <p className="font-semibold text-luxury-espresso">{invoice.customer.name}</p>
                <p className="text-luxury-espresso/70">{invoice.customer.phone}</p>
                <p className="text-luxury-espresso/70">{invoice.customer.address}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-luxury-ivory border-b border-luxury-wine text-luxury-wine">
                  <th className="p-2 text-left">Item Description</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((it: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-2">
                      <strong>{it.description}</strong> ({it.size}, {it.color})
                    </td>
                    <td className="p-2 text-center">{it.quantity}</td>
                    <td className="p-2 text-right">₹{it.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right">₹{it.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="p-2 text-right font-bold pt-4">Subtotal:</td>
                  <td className="p-2 text-right font-bold pt-4">₹{invoice.pricing.subtotalRupees.toLocaleString('en-IN')}</td>
                </tr>
                {invoice.pricing.discountRupees > 0 && (
                  <tr>
                    <td colSpan={3} className="p-2 text-right text-emerald-700">Promo Discount:</td>
                    <td className="p-2 text-right text-emerald-700">-₹{invoice.pricing.discountRupees.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="p-2 text-right">Shiprocket Express Shipping:</td>
                  <td className="p-2 text-right">₹{invoice.pricing.shippingRupees.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="border-t-2 border-luxury-wine text-sm font-bold text-luxury-wine">
                  <td colSpan={3} className="p-2 text-right">Total Paid (Prepaid UPI):</td>
                  <td className="p-2 text-right">₹{invoice.pricing.totalRupees.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>

            <div className="bg-luxury-warmWhite p-3 rounded text-[11px] text-luxury-espresso/70">
              <p><strong>Payment Transaction:</strong> {invoice.payment.transactionId} via {invoice.payment.method}</p>
              <p><strong>Policy Note:</strong> {invoice.policyNotice}</p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="bg-luxury-wine text-luxury-ivory px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="bg-gray-200 text-luxury-espresso px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

