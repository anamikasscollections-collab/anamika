import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotalPaise, appliedCoupon, discountPaise, clearCart } = useCart();
  const { user, addresses } = useAuth();

  // Multi-step Checkout State
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Contact & Address, 2: Shipping & Review, 3: UPI Payment

  // Customer Contact & Address Form
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Delhi');
  const [pincode, setPincode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  // Shiprocket Shipping Calculation State
  const [shippingRatePaise, setShippingRatePaise] = useState(0);
  const [courierName, setCourierName] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [serviceable, setServiceable] = useState(false);
  const [shippingChecking, setShippingChecking] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // Payment Execution State
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Pre-fill default address if logged in
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setAddressLine1(defaultAddr.addressLine1);
      setAddressLine2(defaultAddr.addressLine2 || '');
      setCity(defaultAddr.city);
      setState(defaultAddr.state);
      setPincode(defaultAddr.pincode);
    }
  }, [addresses]);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-luxury-wine mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-luxury-espresso">Your Cart is Empty</h2>
        <p className="text-xs text-luxury-espresso/60">Please add exquisite drapes to your shopping bag before checkout.</p>
        <Link to="/category/sarees" className="inline-block bg-luxury-wine text-luxury-ivory px-6 py-2.5 rounded text-xs font-semibold uppercase tracking-wider">
          Explore Sarees
        </Link>
      </div>
    );
  }

  // Handle Step 1 -> Step 2: Validate address & calculate Shiprocket courier charges
  const handleProceedToShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setShippingError('');

    if (!customerName || !phone || !addressLine1 || !city || !state || !pincode) {
      setShippingError('Please fill in all mandatory customer and delivery address fields.');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setShippingError('Please enter a valid 6-digit Indian delivery PIN code.');
      return;
    }

    setShippingChecking(true);
    try {
      const res = await api.get(`/shipping/serviceability?pincode=${pincode.trim()}`);
      if (res.data?.success && res.data.data.isServiceable) {
        const data = res.data.data;
        setServiceable(true);
        setShippingRatePaise(data.ratePaise);
        setCourierName(data.courierName);
        setEstimatedDeliveryDate(data.estimatedDeliveryDate);
        setStep(2);
      } else {
        setServiceable(false);
        setShippingError(res.data?.message || `PIN code ${pincode} is currently unserviceable.`);
      }
    } catch (err: any) {
      setShippingError('Failed to verify PIN code serviceability with Shiprocket.');
    } finally {
      setShippingChecking(false);
    }
  };

  const totalPaise = Math.max(0, subtotalPaise - discountPaise + shippingRatePaise);

  // Handle Step 2 -> Step 3: Launch Razorpay UPI Checkout
  const handleInitiateUPIPayment = async () => {
    if (!acceptedPolicy) {
      alert('Please acknowledge and accept the No Returns or Exchanges Store Policy to proceed.');
      return;
    }

    setPaying(true);
    setPaymentError('');

    try {
      // 1. Create order on server (recalculating all amounts securely)
      const orderPayload = {
        customerName,
        email: email || user?.email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          variantSku: i.sku,
          quantity: i.quantity,
        })),
        couponCode: appliedCoupon?.code,
        customerNotes,
      };

      const orderRes = await api.post('/orders/checkout', orderPayload);
      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.message || 'Failed to initialize order on server');
      }

      const orderData = orderRes.data.data;
      const serverOrderId = orderData.orderId;

      // 2. Create Razorpay order from backend
      const rzpRes = await api.post('/payments/razorpay/create-order', {
        orderId: serverOrderId,
      });

      if (!rzpRes.data?.success) {
        throw new Error(rzpRes.data?.message || 'Razorpay order creation failed');
      }

      const { razorpayOrderId, amount, currency, keyId } = rzpRes.data.data;

      // 3. Launch Razorpay Checkout configured strictly for UPI APPS ONLY
      // If Razorpay SDK is loaded on window
      if (typeof window.Razorpay === 'function') {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: 'ANAMIKA COLLECTIONS',
          description: `Order #${orderData.orderNumber} - UPI Payment`,
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80',
          order_id: razorpayOrderId,
          prefill: {
            name: customerName,
            email: email,
            contact: phone,
          },
          theme: {
            color: '#58111A', // Deep Wine brand color
          },
          // Strict UPI-Only Configuration
          config: {
            display: {
              blocks: {
                upi_block: {
                  name: 'Pay with UPI (GPay, PhonePe, Paytm, BHIM)',
                  instruments: [{ method: 'upi' }],
                },
              },
              sequence: ['block.upi_block'],
              preferences: {
                show_default_blocks: false,
              },
            },
          },
          modal: {
            ondismiss: () => {
              setPaying(false);
              setPaymentError('UPI payment was cancelled by user. Your order remains pending.');
            },
          },
          handler: async (response: any) => {
            // 4. Verify payment cryptographic signature on backend
            try {
              const verifyRes = await api.post('/payments/razorpay/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: serverOrderId,
                upiVpa: response.razorpay_vpa || 'upi@bank',
              });

              if (verifyRes.data?.success) {
                await clearCart();
                navigate(`/order/${serverOrderId}`);
              } else {
                setPaymentError('Signature verification failed on backend. Please contact support.');
              }
            } catch (err: any) {
              setPaymentError(err.response?.data?.message || 'Verification failed');
            } finally {
              setPaying(false);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setPaymentError(`UPI Payment Failed: ${resp.error.description}`);
          setPaying(false);
        });
        rzp.open();
      } else {
        // Fallback simulator for offline testing when CDN is unavailable
        const verifyRes = await api.post('/payments/razorpay/verify', {
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: 'pay_upi_' + Math.random().toString(36).substring(2, 8),
          razorpaySignature: 'mock_upi_verified_sig',
          orderId: serverOrderId,
          upiVpa: 'patron@upi',
        });

        if (verifyRes.data?.success) {
          await clearCart();
          navigate(`/order/${serverOrderId}`);
        }
        setPaying(false);
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment initiation error');
      setPaying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Progress Bar */}
      <div className="max-w-xl mx-auto flex items-center justify-between text-xs uppercase tracking-widest font-semibold">
        <div className={`flex items-center space-x-1.5 ${step >= 1 ? 'text-luxury-wine' : 'text-luxury-espresso/40'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-luxury-wine text-white' : 'bg-gray-200'}`}>1</span>
          <span>Delivery Address</span>
        </div>
        <div className="w-12 h-0.5 bg-luxury-beige" />
        <div className={`flex items-center space-x-1.5 ${step >= 2 ? 'text-luxury-wine' : 'text-luxury-espresso/40'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-luxury-wine text-white' : 'bg-gray-200'}`}>2</span>
          <span>Review & Shipping</span>
        </div>
        <div className="w-12 h-0.5 bg-luxury-beige" />
        <div className={`flex items-center space-x-1.5 ${step === 3 ? 'text-luxury-wine' : 'text-luxury-espresso/40'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-luxury-wine text-white' : 'bg-gray-200'}`}>3</span>
          <span>UPI Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Multi-Step Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Customer Contact & Delivery Address */}
          {step === 1 && (
            <form onSubmit={handleProceedToShipping} className="bg-white p-6 sm:p-8 rounded-2xl border border-luxury-gold/20 shadow-sm space-y-6">
              <div className="border-b border-luxury-beige/30 pb-4">
                <h2 className="font-serif text-xl font-bold text-luxury-espresso">
                  1. Contact & Delivery Address
                </h2>
                <p className="text-xs text-luxury-espresso/60 mt-0.5">
                  Insured courier dispatch via Shiprocket. All fields marked * are required.
                </p>
              </div>

              {shippingError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
                  {shippingError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    placeholder="Recipient's complete name"
                    className="w-full bg-luxury-warmWhite border border-luxury-gold/30 rounded-lg px-3.5 py-2.5 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">
                    Mobile Number (for Courier & WhatsApp Updates) *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="10-digit Indian Mobile"
                    className="w-full bg-luxury-warmWhite border border-luxury-gold/30 rounded-lg px-3.5 py-2.5 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">
                    Email Address (for Invoice & Updates) *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-luxury-warmWhite border border-luxury-gold/30 rounded-lg px-3.5 py-2.5 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">
                    Complete Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                    placeholder="Flat / House No., Apartment, Street name"
                    className="w-full bg-luxury-warmWhite border border-luxury-gold/30 rounded-lg px-3.5 py-2.5 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Landmark, Area, Sector"
                    className="w-full bg-luxury-warmWhite border border-luxury-gold/30 rounded-lg px-3.5 py-2.5 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    placeholder="City / Town"
                    className="w-full bg-luxury-warmWhite border border-luxury-gold/30 rounded-lg px-3.5 py-2.5 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    placeholder="State"
                    className="w-full bg-luxury-warmWhite border border-luxury-gold/30 rounded-lg px-3.5 py-2.5 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">
                    6-Digit Delivery PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                    placeholder="e.g. 110001"
                    className="w-full bg-luxury-warmWhite border border-luxury-gold/30 rounded-lg px-3.5 py-2.5 text-sm text-luxury-espresso focus:outline-none focus:border-luxury-wine"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={shippingChecking}
                className="w-full bg-luxury-wine hover:bg-luxury-wine-light text-luxury-ivory font-serif font-bold py-3.5 rounded-lg shadow-md hover:shadow-luxury transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
              >
                <span>{shippingChecking ? 'Checking Courier Serviceability...' : 'Verify PIN & Continue to Review'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Shipping Review & UPI Payment Execution */}
          {step === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-luxury-gold/20 shadow-sm space-y-6">
              <div className="border-b border-luxury-beige/30 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-luxury-espresso">
                    2. Verified Courier & UPI Payment
                  </h2>
                  <p className="text-xs text-luxury-espresso/60 mt-0.5">
                    Razorpay Verified UPI Apps (Google Pay, PhonePe, Paytm, BHIM)
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-luxury-wine hover:underline font-semibold"
                >
                  Edit Address
                </button>
              </div>

              {/* Serviceability & Courier Confirmation */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-950">
                <div className="flex items-center space-x-2 font-bold text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>PIN {pincode} Verified for Insured Delivery</span>
                </div>
                <p>
                  Courier Partner: <strong>{courierName}</strong> | Estimated Delivery: <strong>{estimatedDeliveryDate}</strong>
                </p>
                <p className="text-emerald-800 text-[11px]">
                  Shipping Charge: ₹{shippingRatePaise / 100} (Calculated live via Shiprocket official logistics)
                </p>
              </div>

              {/* Delivery Address Summary */}
              <div className="p-3.5 bg-luxury-warmWhite rounded-lg text-xs space-y-1">
                <span className="text-luxury-espresso/60 block font-semibold uppercase tracking-wider">
                  Delivering to:
                </span>
                <p className="font-semibold text-luxury-espresso">{customerName} ({phone})</p>
                <p className="text-luxury-espresso/80">
                  {addressLine1}, {addressLine2 ? `${addressLine2}, ` : ''}{city}, {state} - {pincode}
                </p>
              </div>

              {/* Strict No Returns/Exchanges Acknowledgement (Requirement 9) */}
              <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-amber-950 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>STRICT STORE POLICY: NO RETURNS OR EXCHANGES</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed font-light">
                  To protect fabric sanctity and delicate pure zari handlooms, all items purchased on ANAMIKA COLLECTIONS are strictly final sale. If your order is damaged in transit or defective, submit an unboxing video claim within 48 hours for authorized legal remedies.
                </p>
                <label className="flex items-start space-x-2 pt-2 cursor-pointer text-xs font-semibold text-amber-950">
                  <input
                    type="checkbox"
                    checked={acceptedPolicy}
                    onChange={(e) => setAcceptedPolicy(e.target.checked)}
                    className="mt-0.5 accent-luxury-wine"
                  />
                  <span>I understand and agree to the No Return and No Exchange Policy.</span>
                </label>
              </div>

              {/* Payment Method Notice: Strictly UPI */}
              <div className="p-4 border border-luxury-gold/30 rounded-xl bg-luxury-cream space-y-2">
                <div className="flex items-center space-x-2 text-luxury-wine font-serif font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-luxury-gold" />
                  <span>Razorpay Checkout – UPI APPS ONLY</span>
                </div>
                <p className="text-xs text-luxury-espresso/80 font-light">
                  In accordance with store policy, all orders are processed exclusively via UPI (GPay, PhonePe, Paytm, BHIM, and Cred UPI). Cards, Net Banking, and COD are not supported.
                </p>
                <div className="flex items-center space-x-3 text-xs text-luxury-espresso/60 pt-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit Encrypted & HMAC SHA256 Signature Verified</span>
                </div>
              </div>

              {paymentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
                  {paymentError}
                </div>
              )}

              {/* Pay Now Button */}
              <button
                onClick={handleInitiateUPIPayment}
                disabled={paying || !acceptedPolicy}
                className="w-full bg-luxury-wine hover:bg-luxury-wine-light disabled:opacity-50 text-luxury-ivory font-serif font-bold py-4 rounded-xl shadow-lg hover:shadow-luxury transition-all text-sm uppercase tracking-widest flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4 text-luxury-gold" />
                <span>{paying ? 'Launching Razorpay UPI...' : `Pay ₹${(totalPaise / 100).toLocaleString('en-IN')} with UPI`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-luxury-gold/20 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif text-lg font-bold text-luxury-espresso border-b border-luxury-beige/30 pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Item list */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.variantId} className="flex space-x-3 text-xs">
                  <img src={i.image} alt={i.name} className="w-14 h-18 object-cover rounded bg-luxury-warmWhite flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-serif font-semibold text-luxury-espresso truncate">{i.name}</h5>
                    <p className="text-[11px] text-luxury-espresso/60">
                      Size: {i.size} | Shade: {i.color}
                    </p>
                    <p className="text-[11px] text-luxury-espresso/60">Qty: {i.quantity}</p>
                    <p className="font-serif font-bold text-luxury-wine mt-0.5">
                      ₹{((i.unitPricePaise * i.quantity) / 100).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-luxury-beige/30 pt-4 space-y-2 text-xs text-luxury-espresso/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{(subtotalPaise / 100).toLocaleString('en-IN')}</span>
              </div>
              {discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Discount ({appliedCoupon?.code})</span>
                  <span>-₹{(discountPaise / 100).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shiprocket Courier Charges</span>
                <span>
                  {shippingRatePaise > 0
                    ? `₹${(shippingRatePaise / 100).toLocaleString('en-IN')}`
                    : 'Calculated in Step 1'}
                </span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-luxury-wine pt-3 border-t border-luxury-beige/40">
                <span>Grand Total</span>
                <span>₹{(totalPaise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Assurance */}
            <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] text-luxury-espresso/60">
              <ShieldCheck className="w-4 h-4 text-luxury-gold" />
              <span>Silk Mark Purity • Safe UPI Payment • Insured Express Transit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

