import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Truck, Lock, FileText, CheckCircle } from 'lucide-react';

export const ReturnExchangePolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-luxury-gold/30 pb-4">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-luxury-wine">
          Store Guidelines
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-espresso mt-1">
          Return and Exchange Policy
        </h1>
        <p className="text-xs text-luxury-espresso/60 mt-1">
          Last updated: November 2026 • ANAMIKA COLLECTIONS
        </p>
      </div>

      <div className="bg-amber-50/90 border-2 border-amber-300 p-6 rounded-2xl text-xs sm:text-sm text-amber-950 space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 font-bold text-base text-amber-900">
          <ShieldAlert className="w-6 h-6 text-amber-700 flex-shrink-0" />
          <span>OFFICIAL NOTICE: STRICT NO RETURN & NO EXCHANGE POLICY</span>
        </div>
        <p className="leading-relaxed">
          At <strong>ANAMIKA COLLECTIONS</strong>, we craft and curate rare, handcrafted handloom silks, authentic Varanasi Banarasis, and delicate artisanal kurtis. Due to the fragile nature of real gold zari, pure mulberry silk yarns, and the exacting hygiene required for luxury bridal and festive attire, <strong>we maintain a strict policy of NO RETURNS OR EXCHANGES on any purchase.</strong>
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-luxury-beige/40 shadow-sm space-y-6 text-xs sm:text-sm text-luxury-espresso/80 leading-relaxed font-light">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-luxury-espresso">
            1. Purity & Heirloom Sanity
          </h2>
          <p>
            Every single drape undergoes a three-tier quality audit prior to boxing. When you purchase from ANAMIKA COLLECTIONS, you are guaranteed an untouched, unadulterated ensemble straight from our master weavers' looms. To prevent yarn stress, folds, or perfume contamination, products once delivered cannot be returned or replaced for size, color preference, or change of mind.
          </p>
        </section>

        <section className="space-y-2 border-t pt-4">
          <h2 className="font-serif font-bold text-base text-luxury-espresso">
            2. Legally Protected Exceptions: Defective, Damaged, or Incorrect Items
          </h2>
          <p>
            In compliance with applicable Indian consumer protection laws, our strict non-returnable policy does <strong>not</strong> exclude remedies for verifiable manufacturing defects, transit damage, or incorrectly dispatched products.
          </p>
          <div className="bg-luxury-warmWhite p-4 rounded-xl border border-luxury-gold/30 space-y-2 text-xs">
            <h4 className="font-bold text-luxury-wine uppercase tracking-wider">
              Mandatory Protocol for Defect Claims:
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Time Window:</strong> Claims must be registered within <strong>48 hours</strong> of courier delivery.
              </li>
              <li>
                <strong>Unboxing Video:</strong> A continuous, unedited 360-degree video recording from the opening of the sealed outer Shiprocket tamper-evident polybag to inspecting the garment is mandatory to verify transit damage or missing items.
              </li>
              <li>
                <strong>Filing Channel:</strong> Submit your claim through our online <Link to="/support" className="text-luxury-wine underline font-semibold">Concierge Support Remedy Portal</Link> or email <em>care@anamikacollections.com</em> with your order number.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-2 border-t pt-4">
          <h2 className="font-serif font-bold text-base text-luxury-espresso">
            3. Investigation & Resolution Process
          </h2>
          <p>
            Upon receiving your complaint, our Quality Assurance Directorate will inspect the unboxing proof within 24 to 48 business hours. If validated as genuine manufacturing fault or courier mishandling, we will arrange a reverse pickup and issue an exchange or authorized remedy at zero expense to you.
          </p>
        </section>
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-luxury-gold/30 pb-4">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-luxury-wine">
          Logistics Standard
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-espresso mt-1">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-luxury-espresso/60 mt-1">
          Official Carrier: Shiprocket Express Air Logistics
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-luxury-beige/40 shadow-sm space-y-6 text-xs sm:text-sm text-luxury-espresso/80 leading-relaxed font-light">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-luxury-espresso flex items-center space-x-2">
            <Truck className="w-5 h-5 text-luxury-wine" />
            <span>1. Pan-India Delivery & Serviceability</span>
          </h2>
          <p>
            ANAMIKA COLLECTIONS partners with <strong>Shiprocket</strong> to provide seamless, insured transit across more than 26,000 PIN codes in India. Live courier partner availability (Blue Dart Air, Delhivery Premium, DTDC Express) is checked automatically during checkout.
          </p>
        </section>

        <section className="space-y-2 border-t pt-4">
          <h2 className="font-serif font-bold text-base text-luxury-espresso">
            2. Customer-Paid Shipping Charges
          </h2>
          <p>
            In accordance with our pricing transparency, shipping charges are calculated live through Shiprocket API and paid by the customer during checkout. Standard express courier typically ranges from ₹99 to ₹149 depending on the destination zone. We do not inflate garment prices to mask shipping costs.
          </p>
        </section>

        <section className="space-y-2 border-t pt-4">
          <h2 className="font-serif font-bold text-base text-luxury-espresso">
            3. Dispatch & Delivery Timelines
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Processing:</strong> Orders placed before 2:00 PM IST on business days are dispatched within 24 to 36 hours following payment verification.</li>
            <li><strong>Metros (Delhi NCR, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad):</strong> 2 to 3 business days via Express Air.</li>
            <li><strong>Rest of India:</strong> 4 to 6 business days via insured express linehaul.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

