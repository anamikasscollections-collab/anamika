import React, { useState } from 'react';
import { ShieldAlert, Send, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const SupportPage: React.FC = () => {
  // Complaint Form State
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [issueType, setIssueType] = useState('DEFECTIVE_PRODUCT');
  const [description, setDescription] = useState('');
  const [imageEvidenceUrl, setImageEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Ticket Lookup State
  const [searchTicketNumber, setSearchTicketNumber] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      const res = await api.post('/support/complaint', {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        issueType,
        description,
        imageEvidenceUrl,
      });

      if (res.data?.success) {
        setSubmittedTicket(res.data.data);
      } else {
        setSubmitError(res.data?.message || 'Failed to file claim');
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketNumber.trim()) return;
    setLookupError('');
    setLookupLoading(true);

    try {
      const res = await api.get(`/support/ticket/${searchTicketNumber.trim()}`);
      if (res.data?.success) {
        setLookupResult(res.data.data);
      } else {
        setLookupError(res.data?.message || 'Ticket not found');
      }
    } catch (err: any) {
      setLookupError('Ticket not found. Please verify your reference number.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-luxury-gold/30 pb-4">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-luxury-wine">
          Customer Protection & Legal Remedy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-espresso mt-1">
          Defective & Damaged Product Support
        </h1>
        <p className="text-xs text-luxury-espresso/60 mt-1">
          Resolution desk for manufacturing defects, courier transit damage, or incorrect dispatches.
        </p>
      </div>

      {/* Notice on Strict No Returns vs Defect Remedy */}
      <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl text-xs text-amber-950 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
          <span>Understanding Our Policy</span>
        </div>
        <p className="leading-relaxed">
          While ANAMIKA COLLECTIONS maintains an absolute <strong>No Returns or Exchanges</strong> policy for regular sizing or preference changes, we strictly honor your consumer rights for any product received in a damaged, defective, or incorrect condition. Please submit this form within 48 hours of delivery accompanied by continuous unboxing video evidence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Submit Claim Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-luxury-beige/40 shadow-sm space-y-5">
          <h3 className="font-serif text-xl font-bold text-luxury-espresso">
            Submit Defect / Damage Claim
          </h3>

          {submittedTicket ? (
            <div className="bg-emerald-50 border border-emerald-300 p-6 rounded-xl text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-base text-emerald-900">
                Claim Filed Successfully
              </h4>
              <p className="text-xs text-emerald-800">
                Your ticket reference is: <strong className="font-mono text-sm">{submittedTicket.ticketNumber}</strong>
              </p>
              <p className="text-xs text-emerald-700">
                Our Senior Concierge will inspect your details and unboxing proof within 24 business hours.
              </p>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="mt-2 text-xs text-luxury-wine hover:underline font-semibold"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block font-medium text-luxury-espresso mb-1">
                  Order Number (e.g. AC-2026-XXXXX) *
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  placeholder="AC-2026-123456"
                  className="w-full bg-luxury-warmWhite border rounded p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-luxury-espresso mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    placeholder="Full name"
                    className="w-full bg-luxury-warmWhite border rounded p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-luxury-espresso mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    placeholder="10-digit mobile"
                    className="w-full bg-luxury-warmWhite border rounded p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-luxury-espresso mb-1">Email Address *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-luxury-warmWhite border rounded p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-luxury-espresso mb-1">Issue Category *</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-luxury-warmWhite border rounded p-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="DEFECTIVE_PRODUCT">Manufacturing Defect (Zari pull, weave tear)</option>
                  <option value="DAMAGED_IN_TRANSIT">Parcel Damaged During Shiprocket Transit</option>
                  <option value="WRONG_ITEM_DELIVERED">Incorrect Ensemble / Size Dispatched</option>
                  <option value="GENERAL_INQUIRY">Other Concierge Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-luxury-espresso mb-1">
                  Detailed Issue Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Please describe exactly what was found upon opening the package..."
                  className="w-full bg-luxury-warmWhite border rounded p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-luxury-espresso mb-1">
                  Unboxing Video / Photo Evidence Link (Google Drive / Cloudinary)
                </label>
                <input
                  type="url"
                  value={imageEvidenceUrl}
                  onChange={(e) => setImageEvidenceUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or image link"
                  className="w-full bg-luxury-warmWhite border rounded p-2.5 focus:outline-none"
                />
                <span className="text-[10px] text-luxury-espresso/60 block mt-1">
                  Continuous unboxing video is required for transit damage claims.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-luxury-wine hover:bg-luxury-wine-light text-luxury-ivory font-semibold py-3 rounded-lg text-xs uppercase tracking-widest shadow flex items-center justify-center space-x-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Claim...' : 'Register Formal Claim'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Check Existing Ticket Status */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-luxury-beige/40 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-luxury-espresso">
              Track Ticket Status
            </h3>
            <p className="text-xs text-luxury-espresso/60">
              Have a previously submitted claim ticket? Enter your reference code below.
            </p>

            <form onSubmit={handleLookupTicket} className="space-y-3">
              <input
                type="text"
                value={searchTicketNumber}
                onChange={(e) => setSearchTicketNumber(e.target.value)}
                placeholder="e.g. TKT-123456"
                className="w-full bg-luxury-warmWhite border rounded p-2.5 text-xs font-mono uppercase focus:outline-none"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full bg-luxury-espresso text-luxury-ivory py-2.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{lookupLoading ? 'Checking...' : 'Lookup Status'}</span>
              </button>
            </form>

            {lookupError && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded border border-rose-200">
                {lookupError}
              </div>
            )}

            {lookupResult && (
              <div className="p-4 bg-luxury-warmWhite rounded-xl border border-luxury-gold/30 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-luxury-wine">{lookupResult.ticketNumber}</span>
                  <span className="bg-luxury-gold/20 text-luxury-espresso font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {lookupResult.status}
                  </span>
                </div>
                <p className="text-luxury-espresso/70">Category: {lookupResult.issueType}</p>
                {lookupResult.adminNotes && (
                  <div className="mt-2 pt-2 border-t border-luxury-beige/30">
                    <span className="font-semibold text-luxury-espresso block">Resolution / Notes:</span>
                    <p className="text-luxury-espresso/90 italic">{lookupResult.adminNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

