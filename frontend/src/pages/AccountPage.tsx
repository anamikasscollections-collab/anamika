import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, LogOut, Plus, Truck, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addresses, logout, addAddress } = useAuth();
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'ADDRESSES' | 'PROFILE'>('ORDERS');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // New address modal/form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Delhi');
  const [addrPincode, setAddrPincode] = useState('');
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await api.get('/orders/my-orders');
        if (res.data?.success) {
          setOrders(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching orders', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrLine1 || !addrCity || !addrState || !addrPincode) return;

    setSavingAddr(true);
    const success = await addAddress({
      fullName: addrName,
      phone: addrPhone,
      addressLine1: addrLine1,
      addressLine2: addrLine2,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      isDefault: addresses.length === 0,
      addressType: 'HOME',
    });
    setSavingAddr(false);

    if (success) {
      setShowAddAddress(false);
      setAddrName('');
      setAddrPhone('');
      setAddrLine1('');
      setAddrLine2('');
      setAddrCity('');
      setAddrPincode('');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-luxury-gold/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-luxury-wine/10 border border-luxury-gold/40 flex items-center justify-center text-luxury-wine font-serif font-bold text-2xl">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-luxury-gold-dark">
              Royal Patron
            </span>
            <h1 className="font-serif text-2xl font-bold text-luxury-espresso">
              {user.fullName}
            </h1>
            <p className="text-xs text-luxury-espresso/60">
              {user.email || user.phone || 'Verified Customer'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-800 hover:text-rose-950 bg-rose-50 px-4 py-2 rounded-lg border border-rose-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-1 bg-white p-3 rounded-xl border border-luxury-beige/30 shadow-sm h-fit">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'ORDERS'
                ? 'bg-luxury-wine text-luxury-ivory shadow'
                : 'text-luxury-espresso hover:bg-luxury-ivory'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ADDRESSES')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'ADDRESSES'
                ? 'bg-luxury-wine text-luxury-ivory shadow'
                : 'text-luxury-espresso hover:bg-luxury-ivory'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'PROFILE'
                ? 'bg-luxury-wine text-luxury-ivory shadow'
                : 'text-luxury-espresso hover:bg-luxury-ivory'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Details</span>
          </button>
        </aside>

        {/* Tab Content */}
        <main className="md:col-span-3">
          {/* TAB: ORDERS */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-luxury-espresso mb-4">
                Your Order Archives
              </h3>

              {loadingOrders ? (
                <div className="p-12 text-center text-xs text-luxury-espresso/60">Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-xl border border-luxury-beige/40">
                  <p className="text-sm font-serif font-semibold text-luxury-espresso">No orders placed yet.</p>
                  <p className="text-xs text-luxury-espresso/60 mt-1">Explore our heirloom drapes to make your first purchase.</p>
                  <Link to="/category/sarees" className="mt-4 inline-block bg-luxury-wine text-luxury-ivory px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider">
                    Shop Sarees
                  </Link>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="bg-white p-5 rounded-xl border border-luxury-beige/40 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-luxury-beige/20 text-xs gap-2">
                      <div>
                        <span className="font-bold text-luxury-espresso">Order #{ord.orderNumber}</span>
                        <span className="text-luxury-espresso/50 ml-2">
                          Plotted on {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="bg-luxury-wine/10 text-luxury-wine text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                        <Link
                          to={`/order/${ord.id}`}
                          className="text-luxury-wine hover:underline font-semibold"
                        >
                          View Details & Invoice →
                        </Link>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {ord.items.map((i: any) => (
                        <div key={i.id} className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-medium text-luxury-espresso">{i.productName}</span>
                            <span className="text-luxury-espresso/60 ml-2">({i.size}, {i.color} × {i.quantity})</span>
                          </div>
                          <span className="font-semibold text-luxury-wine">
                            ₹{(i.totalAmount / 100).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipment info if present */}
                    {ord.shipment?.awbCode && (
                      <div className="pt-2 border-t border-luxury-beige/20 flex items-center justify-between text-xs text-luxury-espresso/70">
                        <div className="flex items-center space-x-1.5">
                          <Truck className="w-3.5 h-3.5 text-luxury-wine" />
                          <span>Dispatched via {ord.shipment.courierName} (AWB: {ord.shipment.awbCode})</span>
                        </div>
                        {ord.shipment.trackingUrl && (
                          <a
                            href={ord.shipment.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-luxury-wine hover:underline inline-flex items-center space-x-1 font-semibold"
                          >
                            <span>Track Live</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === 'ADDRESSES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-bold text-luxury-espresso">Saved Delivery Addresses</h3>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="inline-flex items-center space-x-1.5 bg-luxury-wine text-luxury-ivory px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Add Address Form Modal / Box */}
              {showAddAddress && (
                <form onSubmit={handleCreateAddress} className="bg-luxury-warmWhite p-6 rounded-xl border border-luxury-gold/30 space-y-4">
                  <h4 className="font-serif font-bold text-sm text-luxury-espresso">Add Delivery Location</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      required
                      placeholder="Recipient Full Name"
                      className="bg-white border rounded p-2 text-xs"
                    />
                    <input
                      type="tel"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      required
                      placeholder="10-digit Mobile"
                      className="bg-white border rounded p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={addrLine1}
                      onChange={(e) => setAddrLine1(e.target.value)}
                      required
                      placeholder="Address Line 1"
                      className="sm:col-span-2 bg-white border rounded p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={addrLine2}
                      onChange={(e) => setAddrLine2(e.target.value)}
                      placeholder="Address Line 2 (Optional)"
                      className="sm:col-span-2 bg-white border rounded p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      required
                      placeholder="City"
                      className="bg-white border rounded p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      required
                      placeholder="State"
                      className="bg-white border rounded p-2 text-xs"
                    />
                    <input
                      type="text"
                      maxLength={6}
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value)}
                      required
                      placeholder="6-digit PIN code"
                      className="bg-white border rounded p-2 text-xs"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={savingAddr}
                      className="bg-luxury-wine text-luxury-ivory px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider"
                    >
                      {savingAddr ? 'Saving...' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="bg-gray-200 text-luxury-espresso px-4 py-2 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white p-4 rounded-xl border border-luxury-beige/40 shadow-sm text-xs space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-luxury-espresso">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="bg-luxury-gold/20 text-luxury-espresso text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-luxury-espresso/70">{addr.phone}</p>
                    <p className="text-luxury-espresso/80">
                      {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="bg-white p-6 rounded-xl border border-luxury-beige/40 shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-luxury-espresso mb-4">Account Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-luxury-espresso/60 block">Full Name:</span>
                  <span className="font-semibold text-luxury-espresso text-sm">{user.fullName}</span>
                </div>
                <div>
                  <span className="text-luxury-espresso/60 block">Email Address:</span>
                  <span className="font-semibold text-luxury-espresso text-sm">{user.email || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-luxury-espresso/60 block">Registered Mobile:</span>
                  <span className="font-semibold text-luxury-espresso text-sm">{user.phone || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-luxury-espresso/60 block">Membership Status:</span>
                  <span className="font-semibold text-luxury-wine text-sm">Privileged Patron</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

