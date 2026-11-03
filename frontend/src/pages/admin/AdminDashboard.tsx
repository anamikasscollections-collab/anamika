import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Tag,
  Image as ImageIcon,
  MessageSquare,
  LogOut,
  Plus,
  RefreshCw,
  Truck,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit,
  ExternalLink,
  X,
  Star,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PRODUCTS' | 'INVENTORY' | 'ORDERS' | 'COUPONS' | 'BANNERS' | 'SUPPORT'>('OVERVIEW');
  const [adminUser, setAdminUser] = useState<any | null>(null);

  // Stats
  const [stats, setStats] = useState<any | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New product form state
  const [pName, setPName] = useState('');
  const [pSlug, setPSlug] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCategory, setPCategory] = useState('cat-sarees');
  const [pFabric, setPFabric] = useState('Pure Katan Silk');
  const [pOriginalPrice, setPOriginalPrice] = useState(15000);
  const [pDiscountedPrice, setPDiscountedPrice] = useState(12000);
  const [pDiscountPercent, setPDiscountPercent] = useState(20);
  const [pImage1, setPImage1] = useState('');
  const [pImage2, setPImage2] = useState('');
  const [pSize, setPSize] = useState('Free Size');
  const [pColor, setPColor] = useState('Crimson Wine');
  const [pStock, setPStock] = useState(10);
  const [savingProduct, setSavingProduct] = useState(false);

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('cat-sarees');
  const [editFabric, setEditFabric] = useState('');
  const [editCare, setEditCare] = useState('');
  const [editPattern, setEditPattern] = useState('');
  const [editOccasion, setEditOccasion] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState(0);
  const [editDiscountedPrice, setEditDiscountedPrice] = useState(0);
  const [editDiscountPercent, setEditDiscountPercent] = useState(0);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editIsBestseller, setEditIsBestseller] = useState(false);
  const [editIsNewArrival, setEditIsNewArrival] = useState(false);
  const [editImages, setEditImages] = useState<any[]>([]);
  const [newImageInputUrl, setNewImageInputUrl] = useState('');
  const [editVariants, setEditVariants] = useState<any[]>([]);
  const [newVarSize, setNewVarSize] = useState('Free Size');
  const [newVarColor, setNewVarColor] = useState('Standard');
  const [newVarStock, setNewVarStock] = useState(10);
  const [updatingProduct, setUpdatingProduct] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(10);
  const [couponMinAmount, setCouponMinAmount] = useState(4999);
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  // Banners state
  const [banners, setBanners] = useState<any[]>([]);

  // Support Tickets state
  const [supportTickets, setSupportTickets] = useState<any[]>([]);

  useEffect(() => {
    const rawAdmin = localStorage.getItem('anamika_admin_user');
    const token = localStorage.getItem('anamika_admin_token');
    if (!token || !rawAdmin) {
      navigate('/admin/login');
      return;
    }
    setAdminUser(JSON.parse(rawAdmin));
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/overview');
      if (res.data?.success) setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/admin/products?search=${encodeURIComponent(productSearch)}`);
      if (res.data?.success) setProducts(res.data.data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get(`/admin/orders?status=${orderStatusFilter}`);
      if (res.data?.success) setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      if (res.data?.success) setCoupons(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await api.get('/admin/banners');
      if (res.data?.success) setBanners(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      const res = await api.get('/admin/support');
      if (res.data?.success) setSupportTickets(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger sub-fetches when tab changes
  useEffect(() => {
    if (activeTab === 'PRODUCTS' || activeTab === 'INVENTORY') fetchProducts();
    if (activeTab === 'ORDERS') fetchOrders();
    if (activeTab === 'COUPONS') fetchCoupons();
    if (activeTab === 'BANNERS') fetchBanners();
    if (activeTab === 'SUPPORT') fetchSupportTickets();
  }, [activeTab, orderStatusFilter]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const res = await api.post('/admin/products', {
        name: pName,
        slug: pSlug || undefined,
        description: pDesc,
        categoryId: pCategory,
        fabric: pFabric,
        originalPrice: pOriginalPrice * 100, // paise
        discountedPrice: pDiscountedPrice * 100,
        discountPercent: pDiscountPercent,
        images: [
          { url: pImage1 || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c', altText: pName, isPrimary: true, displayOrder: 1 },
          ...(pImage2 ? [{ url: pImage2, altText: pName, isPrimary: false, displayOrder: 2 }] : []),
        ],
        variants: [
          { size: pSize, color: pColor, additionalPrice: 0, stockQuantity: pStock },
        ],
      });

      if (res.data?.success) {
        setShowAddProductModal(false);
        fetchProducts();
        setPName('');
        setPDesc('');
        setPImage1('');
        setPImage2('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add product');
    } finally {
      setSavingProduct(false);
    }
  };

  const startEditingProduct = (p: any) => {
    setEditingProduct(p);
    setEditName(p.name || '');
    setEditSlug(p.slug || '');
    setEditDesc(p.description || '');
    setEditCategory(p.categoryId || 'cat-sarees');
    setEditFabric(p.fabric || '');
    setEditCare(p.careInstructions || '');
    setEditPattern(p.pattern || '');
    setEditOccasion(p.occasion || '');
    setEditOriginalPrice(Math.round((p.originalPrice || 0) / 100));
    setEditDiscountedPrice(Math.round((p.discountedPrice || 0) / 100));
    setEditDiscountPercent(p.discountPercent || 0);
    setEditIsFeatured(Boolean(p.isFeatured));
    setEditIsBestseller(Boolean(p.isBestseller));
    setEditIsNewArrival(Boolean(p.isNewArrival));
    setEditImages(
      p.images && p.images.length > 0
        ? p.images.map((img: any, idx: number) => ({
            id: img.id,
            url: img.url,
            altText: img.altText || p.name,
            isPrimary: img.isPrimary !== undefined ? Boolean(img.isPrimary) : idx === 0,
            displayOrder: img.displayOrder || idx + 1,
          }))
        : []
    );
    setEditVariants(
      p.variants && p.variants.length > 0
        ? p.variants.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            size: v.size || 'Free Size',
            color: v.color || 'Standard',
            stockQuantity: Number(v.stockQuantity ?? 10),
            additionalPrice: v.additionalPrice ? Math.round(v.additionalPrice / 100) : 0,
          }))
        : [{ size: 'Free Size', color: 'Standard', stockQuantity: 10, additionalPrice: 0 }]
    );
    setNewImageInputUrl('');
    setNewVarSize('Free Size');
    setNewVarColor('Standard');
    setNewVarStock(10);
  };

  const handleAddImageToEdit = () => {
    if (!newImageInputUrl.trim()) return;
    setEditImages((prev) => [
      ...prev,
      {
        id: 'img-' + Math.random().toString(36).substring(2, 9),
        url: newImageInputUrl.trim(),
        altText: editName,
        isPrimary: prev.length === 0,
        displayOrder: prev.length + 1,
      },
    ]);
    setNewImageInputUrl('');
  };

  const handleRemoveImageFromEdit = (index: number) => {
    setEditImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setEditImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const handleAddVariantToEdit = () => {
    if (!newVarSize.trim()) return;
    setEditVariants((prev) => [
      ...prev,
      {
        id: 'var-' + Math.random().toString(36).substring(2, 9),
        size: newVarSize.trim(),
        color: newVarColor.trim() || 'Standard',
        stockQuantity: Math.max(0, Number(newVarStock) || 0),
        additionalPrice: 0,
      },
    ]);
  };

  const handleRemoveVariantFromEdit = (index: number) => {
    if (editVariants.length <= 1) {
      alert('A product must maintain at least one size variant.');
      return;
    }
    setEditVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateVariantStock = (index: number, stock: number) => {
    setEditVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, stockQuantity: Math.max(0, stock) } : v))
    );
  };

  const handleUpdateVariantSize = (index: number, size: string) => {
    setEditVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, size } : v))
    );
  };

  const handleUpdateVariantColor = (index: number, color: string) => {
    setEditVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, color } : v))
    );
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setUpdatingProduct(true);
    try {
      const res = await api.put(`/admin/products/${editingProduct.id}`, {
        name: editName,
        slug: editSlug || undefined,
        description: editDesc,
        categoryId: editCategory,
        fabric: editFabric,
        careInstructions: editCare,
        pattern: editPattern,
        occasion: editOccasion,
        originalPrice: editOriginalPrice * 100, // into paise
        discountedPrice: editDiscountedPrice * 100,
        discountPercent: editDiscountPercent,
        isFeatured: editIsFeatured,
        isBestseller: editIsBestseller,
        isNewArrival: editIsNewArrival,
        images: editImages.map((img, idx) => ({
          ...img,
          displayOrder: idx + 1,
        })),
        variants: editVariants.map((v) => ({
          ...v,
          stockQuantity: Number(v.stockQuantity) || 0,
          additionalPrice: (Number(v.additionalPrice) || 0) * 100,
        })),
      });

      if (res.data?.success) {
        alert(`Product "${editName}" updated successfully!`);
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update product');
    } finally {
      setUpdatingProduct(false);
    }
  };

  const handleAdjustInventory = async (variantId: string, delta: number) => {
    try {
      await api.post('/admin/inventory/adjust', { variantId, delta });
      fetchProducts();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchOrders();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateShipment = async (orderId: string) => {
    try {
      const res = await api.post(`/admin/orders/${orderId}/shipment`);
      if (res.data?.success) {
        alert(`Shipment Created & Dispatched via Shiprocket! AWB: ${res.data.data.awbCode}`);
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Shipment creation failed');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCreatingCoupon(true);
    try {
      const res = await api.post('/admin/coupons', {
        code: couponCode,
        discountType: 'PERCENTAGE',
        discountValue: couponDiscount,
        minOrderAmount: couponMinAmount * 100,
      });
      if (res.data?.success) {
        setCouponCode('');
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleToggleCoupon = async (id: string, current: boolean) => {
    try {
      await api.put(`/admin/coupons/${id}/toggle`, { isActive: !current });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveSupportTicket = async (id: string, status: string) => {
    const adminNotes = prompt('Enter resolution notes / instructions for the patron:');
    if (adminNotes === null) return;
    try {
      await api.put(`/admin/support/${id}`, { status, adminNotes });
      fetchSupportTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('anamika_admin_token');
    localStorage.removeItem('anamika_admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-luxury-warmWhite flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="bg-luxury-espresso text-luxury-ivory border-b border-luxury-gold/30 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <span className="font-brand text-xl font-bold tracking-widest text-luxury-gold">
            ANAMIKA
          </span>
          <span className="text-xs uppercase tracking-widest text-luxury-ivory/60 font-semibold border-l border-luxury-gold/30 pl-3">
            Executive Admin Control
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-luxury-ivory/80">
            Signed in as <strong>{adminUser?.fullName || 'Super Admin'}</strong> ({adminUser?.role})
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs px-3 py-1.5 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Dashboard Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-xl border border-luxury-gold/20 shadow-sm flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider">
          {[
            { key: 'OVERVIEW', label: 'Overview & Stats', icon: LayoutDashboard },
            { key: 'PRODUCTS', label: 'Product Catalog', icon: Package },
            { key: 'INVENTORY', label: 'Stock & Inventory', icon: Layers },
            { key: 'ORDERS', label: 'Order Pipeline', icon: ShoppingBag },
            { key: 'COUPONS', label: 'Promo Coupons', icon: Tag },
            { key: 'BANNERS', label: 'Hero Banners', icon: ImageIcon },
            { key: 'SUPPORT', label: 'Customer Complaints', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-luxury-wine text-luxury-ivory shadow'
                    : 'text-luxury-espresso hover:bg-luxury-warmWhite'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW & STATS TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-xl border border-luxury-gold/20 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-luxury-gold-dark tracking-wider">Total Sales Revenue</span>
                <h3 className="font-serif text-2xl font-bold text-luxury-wine mt-1">
                  ₹{stats ? (stats.totalRevenuePaise / 100).toLocaleString('en-IN') : '0'}
                </h3>
                <p className="text-[11px] text-emerald-700 mt-1">✓ 100% Verified UPI Transactions</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-luxury-gold/20 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-luxury-gold-dark tracking-wider">Total Orders</span>
                <h3 className="font-serif text-2xl font-bold text-luxury-espresso mt-1">
                  {stats?.totalOrders || 0}
                </h3>
                <p className="text-[11px] text-luxury-espresso/60 mt-1">{stats?.completedOrders || 0} Delivered successfully</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-luxury-gold/20 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-luxury-gold-dark tracking-wider">Pending Orders</span>
                <h3 className="font-serif text-2xl font-bold text-amber-700 mt-1">
                  {stats?.pendingOrders || 0}
                </h3>
                <p className="text-[11px] text-amber-800/80 mt-1">Awaiting dispatch or packaging</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-luxury-gold/20 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-luxury-gold-dark tracking-wider">Registered Patrons</span>
                <h3 className="font-serif text-2xl font-bold text-luxury-espresso mt-1">
                  {stats?.totalCustomers || 0}
                </h3>
                <p className="text-[11px] text-luxury-espresso/60 mt-1">Young luxury clientele</p>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {stats?.lowStockProducts?.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 p-5 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Low Inventory Warning (Stock &lt; 5 units)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {stats.lowStockProducts.map((p: any, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-amber-200 shadow-xs">
                      <p className="font-bold text-luxury-espresso truncate">{p.productName}</p>
                      <p className="text-[11px] text-luxury-espresso/60">Variant: {p.size} ({p.variantSku})</p>
                      <p className="font-bold text-rose-700 mt-1">Only {p.stockQuantity} remaining</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. PRODUCT CATALOG MANAGEMENT TAB */}
        {activeTab === 'PRODUCTS' && (
          <div className="bg-white p-6 rounded-xl border border-luxury-gold/20 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
              <h3 className="font-serif text-xl font-bold text-luxury-espresso">
                Product Catalog ({products.length} Products)
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-luxury-wine hover:bg-luxury-wine-light text-luxury-ivory px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-luxury-warmWhite text-luxury-espresso border-b">
                  <tr>
                    <th className="p-3">Image</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Fabric</th>
                    <th className="p-3">Price (INR)</th>
                    <th className="p-3">Discount</th>
                    <th className="p-3">Total Stock</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-beige/20">
                  {products.map((p) => {
                    const totalStk = p.variants.reduce((acc: number, v: any) => acc + v.stockQuantity, 0);
                    return (
                      <tr key={p.id} className="hover:bg-luxury-ivory/50">
                        <td className="p-3">
                          <img src={p.images[0]?.url} alt="" className="w-10 h-12 object-cover rounded" />
                        </td>
                        <td className="p-3 font-semibold text-luxury-espresso max-w-xs truncate">
                          {p.name}
                        </td>
                        <td className="p-3 text-luxury-espresso/70">{p.fabric}</td>
                        <td className="p-3 font-bold text-luxury-wine">
                          ₹{(p.discountedPrice / 100).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-luxury-espresso/70">{p.discountPercent}%</td>
                        <td className="p-3 font-semibold">
                          <span className={totalStk <= 5 ? 'text-rose-700' : 'text-emerald-800'}>
                            {totalStk} units
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => startEditingProduct(p)}
                              className="px-2.5 py-1 bg-luxury-wine/10 hover:bg-luxury-wine text-luxury-wine hover:text-luxury-ivory rounded transition-colors flex items-center space-x-1 font-semibold text-[11px]"
                              title="Edit complete product details, sizes, prices, and images"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Delete product ${p.name}?`)) {
                                  await api.delete(`/admin/products/${p.id}`);
                                  fetchProducts();
                                }
                              }}
                              className="p-1.5 text-rose-700 hover:text-rose-900 rounded hover:bg-rose-50 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. INVENTORY MANAGEMENT TAB */}
        {activeTab === 'INVENTORY' && (
          <div className="bg-white p-6 rounded-xl border border-luxury-gold/20 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-luxury-espresso pb-3 border-b">
              Variant-Level Stock Adjustment
            </h3>

            <div className="space-y-4">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-lg bg-luxury-warmWhite border border-luxury-beige/40 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-luxury-espresso">{p.name}</h4>
                      <p className="text-luxury-espresso/60">{p.fabric}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {p.variants.map((v: any) => (
                      <div key={v.id} className="bg-white p-3 rounded border text-xs flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-luxury-espresso">{v.size} ({v.color})</p>
                          <p className="text-[10px] text-luxury-espresso/60 font-mono">{v.sku}</p>
                          <p className="font-bold text-luxury-wine mt-1">Stock: {v.stockQuantity}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleAdjustInventory(v.id, 1)}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-bold hover:bg-emerald-100"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleAdjustInventory(v.id, -1)}
                            disabled={v.stockQuantity <= 0}
                            className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-300 rounded font-bold hover:bg-rose-100 disabled:opacity-30"
                          >
                            -1
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ORDERS MANAGEMENT TAB */}
        {activeTab === 'ORDERS' && (
          <div className="bg-white p-6 rounded-xl border border-luxury-gold/20 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
              <div>
                <h3 className="font-serif text-xl font-bold text-luxury-espresso">
                  Order Management Pipeline ({orders.length})
                </h3>
                <p className="text-xs text-luxury-espresso/60">
                  Manage statuses, create Shiprocket shipments, track AWBs
                </p>
              </div>

              {/* Status Filter */}
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-luxury-warmWhite border border-luxury-gold/30 rounded px-3 py-1.5 text-xs font-semibold text-luxury-espresso"
              >
                <option value="">All Statuses</option>
                <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                <option value="PAYMENT_SUCCESSFUL">Payment Successful</option>
                <option value="ORDER_CONFIRMED">Order Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="PACKED">Packed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-xl border border-luxury-beige/40 bg-luxury-warmWhite/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pb-2 border-b border-luxury-beige/30 gap-2">
                    <div>
                      <span className="font-bold text-sm text-luxury-espresso">#{ord.orderNumber}</span>
                      <span className="text-luxury-espresso/60 ml-2">
                        {new Date(ord.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-serif font-bold text-sm text-luxury-wine">
                        ₹{(ord.totalAmount / 100).toLocaleString('en-IN')}
                      </span>
                      <span className="bg-luxury-wine text-luxury-ivory text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {ord.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-luxury-espresso block">Customer:</span>
                      <p>{ord.customerName} ({ord.guestPhone || ord.shippingAddress.phone})</p>
                      <p className="text-luxury-espresso/70">{ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.pincode}</p>
                    </div>

                    <div>
                      <span className="font-bold text-luxury-espresso block">Items Ordered:</span>
                      <ul className="text-luxury-espresso/80">
                        {ord.items.map((it: any, i: number) => (
                          <li key={i}>{it.productName} ({it.size} × {it.quantity})</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-luxury-espresso block">Shiprocket Courier:</span>
                      {ord.shipment?.awbCode ? (
                        <div className="space-y-1">
                          <p className="text-emerald-800 font-semibold">{ord.shipment.courierName} (AWB: {ord.shipment.awbCode})</p>
                          {ord.shipment.trackingUrl && (
                            <a href={ord.shipment.trackingUrl} target="_blank" rel="noreferrer" className="text-luxury-wine hover:underline inline-flex items-center space-x-1">
                              <span>Track Live</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCreateShipment(ord.id)}
                          className="mt-1 bg-luxury-wine text-luxury-ivory px-3 py-1 rounded text-[11px] font-semibold uppercase tracking-wider flex items-center space-x-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch via Shiprocket</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status transition dropdown */}
                  <div className="pt-2 flex items-center space-x-3 text-xs">
                    <span className="font-semibold text-luxury-espresso">Change Status:</span>
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      className="bg-white border rounded px-2.5 py-1 text-xs font-medium cursor-pointer"
                    >
                      <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                      <option value="PAYMENT_SUCCESSFUL">Payment Successful</option>
                      <option value="ORDER_CONFIRMED">Order Confirmed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="PACKED">Packed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. COUPONS MANAGEMENT TAB */}
        {activeTab === 'COUPONS' && (
          <div className="bg-white p-6 rounded-xl border border-luxury-gold/20 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-luxury-espresso pb-3 border-b">
              Promotional Coupons & Festive Discounts
            </h3>

            {/* Create Coupon Form */}
            <form onSubmit={handleCreateCoupon} className="p-4 bg-luxury-warmWhite rounded-lg border border-luxury-gold/30 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
              <div>
                <label className="block font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. FESTIVE20"
                  className="w-full bg-white border rounded p-2 uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Discount (%):</label>
                <input
                  type="number"
                  value={couponDiscount}
                  onChange={(e) => setCouponDiscount(Number(e.target.value))}
                  required
                  className="w-full bg-white border rounded p-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Min Order Amount (INR):</label>
                <input
                  type="number"
                  value={couponMinAmount}
                  onChange={(e) => setCouponMinAmount(Number(e.target.value))}
                  required
                  className="w-full bg-white border rounded p-2"
                />
              </div>
              <button
                type="submit"
                disabled={creatingCoupon}
                className="bg-luxury-wine text-luxury-ivory py-2.5 rounded font-semibold uppercase tracking-wider"
              >
                {creatingCoupon ? 'Creating...' : 'Create Coupon'}
              </button>
            </form>

            {/* Coupon List */}
            <div className="divide-y divide-luxury-beige/30">
              {coupons.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-sm text-luxury-wine">{c.code}</span>
                    <p className="text-luxury-espresso/60">{c.description || `${c.discountValue}% off orders above ₹${c.minOrderAmount / 100}`}</p>
                    <p className="text-[10px] text-luxury-espresso/50">Used: {c.usedCount} times</p>
                  </div>
                  <button
                    onClick={() => handleToggleCoupon(c.id, c.isActive)}
                    className={`px-3 py-1 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. BANNERS MANAGEMENT TAB */}
        {activeTab === 'BANNERS' && (
          <div className="bg-white p-6 rounded-xl border border-luxury-gold/20 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-luxury-espresso pb-3 border-b">
              Homepage Hero Slides
            </h3>
            <div className="space-y-4">
              {banners.map((b) => (
                <div key={b.id} className="p-4 bg-luxury-warmWhite rounded-xl border flex flex-col sm:flex-row gap-4 text-xs">
                  <img src={b.imageUrl} alt="" className="w-36 h-24 object-cover rounded" />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-serif font-bold text-sm text-luxury-espresso">{b.title}</h4>
                    <p className="text-luxury-espresso/70">{b.subtitle}</p>
                    <p className="text-luxury-gold-dark font-semibold">{b.tagline}</p>
                    <p className="text-[11px] text-luxury-wine font-medium">Link: {b.linkUrl} ({b.linkText})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SUPPORT COMPLAINTS TAB */}
        {activeTab === 'SUPPORT' && (
          <div className="bg-white p-6 rounded-xl border border-luxury-gold/20 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-serif text-xl font-bold text-luxury-espresso">
                Defective & Damaged Product Complaints ({supportTickets.length})
              </h3>
              <p className="text-xs text-luxury-espresso/60">
                Resolution claims for transit damage, weaving faults, and legal remedies
              </p>
            </div>

            <div className="space-y-3">
              {supportTickets.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-luxury-beige/40 bg-luxury-warmWhite/50 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-luxury-wine text-sm">{t.ticketNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="font-semibold text-luxury-espresso">{t.customerName} ({t.customerEmail} | {t.customerPhone})</p>
                  <p className="text-luxury-espresso/80 font-light">{t.description}</p>
                  {t.imageEvidenceUrl && (
                    <a href={t.imageEvidenceUrl} target="_blank" rel="noreferrer" className="text-luxury-wine hover:underline inline-flex items-center space-x-1">
                      <span>View Evidence Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {t.adminNotes && (
                    <p className="text-luxury-wine font-medium mt-1">Resolution: {t.adminNotes}</p>
                  )}
                  {t.status !== 'RESOLVED' && (
                    <div className="pt-2 flex space-x-2">
                      <button
                        onClick={() => handleResolveSupportTicket(t.id, 'RESOLVED')}
                        className="bg-emerald-700 text-white px-3 py-1 rounded text-[11px] font-semibold"
                      >
                        Approve Remedy / Resolve
                      </button>
                      <button
                        onClick={() => handleResolveSupportTicket(t.id, 'REJECTED')}
                        className="bg-rose-700 text-white px-3 py-1 rounded text-[11px] font-semibold"
                      >
                        Reject Claim
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Add New Product */}
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
              <h3 className="font-serif font-bold text-lg text-luxury-espresso border-b pb-2">
                Add New Luxury Product
              </h3>
              <form onSubmit={handleCreateProduct} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    required
                    placeholder="e.g. Pure Varanasi Katan Silk Saree in Emerald Green"
                    className="w-full bg-luxury-warmWhite border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Detailed Description *</label>
                  <textarea
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    required
                    rows={3}
                    placeholder="Describe weave, zari type, borders, drape feeling..."
                    className="w-full bg-luxury-warmWhite border rounded p-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Category *</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full bg-luxury-warmWhite border rounded p-2"
                    >
                      <option value="cat-sarees">Sarees</option>
                      <option value="cat-kurtis">Kurtis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Fabric Details *</label>
                    <input
                      type="text"
                      value={pFabric}
                      onChange={(e) => setPFabric(e.target.value)}
                      required
                      placeholder="e.g. 100% Pure Mulberry Silk"
                      className="w-full bg-luxury-warmWhite border rounded p-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Original Price (INR) *</label>
                    <input
                      type="number"
                      value={pOriginalPrice}
                      onChange={(e) => setPOriginalPrice(Number(e.target.value))}
                      required
                      className="w-full bg-luxury-warmWhite border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Discounted Price (INR) *</label>
                    <input
                      type="number"
                      value={pDiscountedPrice}
                      onChange={(e) => setPDiscountedPrice(Number(e.target.value))}
                      required
                      className="w-full bg-luxury-warmWhite border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Discount %</label>
                    <input
                      type="number"
                      value={pDiscountPercent}
                      onChange={(e) => setPDiscountPercent(Number(e.target.value))}
                      className="w-full bg-luxury-warmWhite border rounded p-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Primary Image URL *</label>
                    <input
                      type="url"
                      value={pImage1}
                      onChange={(e) => setPImage1(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-luxury-warmWhite border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Secondary Image URL</label>
                    <input
                      type="url"
                      value={pImage2}
                      onChange={(e) => setPImage2(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-luxury-warmWhite border rounded p-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Default Size</label>
                    <input
                      type="text"
                      value={pSize}
                      onChange={(e) => setPSize(e.target.value)}
                      className="w-full bg-luxury-warmWhite border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Color / Shade</label>
                    <input
                      type="text"
                      value={pColor}
                      onChange={(e) => setPColor(e.target.value)}
                      className="w-full bg-luxury-warmWhite border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Initial Stock Units</label>
                    <input
                      type="number"
                      value={pStock}
                      onChange={(e) => setPStock(Number(e.target.value))}
                      className="w-full bg-luxury-warmWhite border rounded p-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="bg-gray-200 px-4 py-2 rounded font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="bg-luxury-wine text-luxury-ivory px-5 py-2 rounded font-semibold text-xs uppercase tracking-wider"
                  >
                    {savingProduct ? 'Saving...' : 'Add to Catalog'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Existing Product */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-luxury-espresso">
                    Edit Luxury Product: <span className="text-luxury-wine">{editingProduct.name}</span>
                  </h3>
                  <p className="text-[11px] text-luxury-espresso/60 font-mono">
                    Product ID: {editingProduct.id}
                  </p>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 text-luxury-espresso/60 hover:text-luxury-espresso rounded-full hover:bg-luxury-warmWhite"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductEdit} className="space-y-5">
                {/* 1. Basic Info */}
                <div className="space-y-3 bg-luxury-warmWhite/50 p-4 rounded-xl border border-luxury-gold/20">
                  <h4 className="font-bold text-luxury-espresso uppercase text-[11px] tracking-wider text-luxury-gold-dark">
                    1. Basic Product Information
                  </h4>
                  <div>
                    <label className="block font-semibold mb-1">Product Title *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full bg-white border border-luxury-beige/50 rounded-lg p-2.5 text-luxury-espresso font-medium focus:ring-1 focus:ring-luxury-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Detailed Description *</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      required
                      rows={3}
                      className="w-full bg-white border border-luxury-beige/50 rounded-lg p-2.5 text-luxury-espresso focus:ring-1 focus:ring-luxury-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Category *</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full bg-white border border-luxury-beige/50 rounded-lg p-2 text-luxury-espresso"
                      >
                        <option value="cat-sarees">Sarees</option>
                        <option value="cat-kurtis">Kurtis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Fabric Details *</label>
                      <input
                        type="text"
                        value={editFabric}
                        onChange={(e) => setEditFabric(e.target.value)}
                        required
                        className="w-full bg-white border border-luxury-beige/50 rounded-lg p-2 text-luxury-espresso"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Care Instructions</label>
                      <input
                        type="text"
                        value={editCare}
                        onChange={(e) => setEditCare(e.target.value)}
                        placeholder="e.g. Dry Clean Only"
                        className="w-full bg-white border border-luxury-beige/50 rounded-lg p-2 text-luxury-espresso"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Occasion</label>
                      <input
                        type="text"
                        value={editOccasion}
                        onChange={(e) => setEditOccasion(e.target.value)}
                        placeholder="e.g. Bridal, Festive, Party"
                        className="w-full bg-white border border-luxury-beige/50 rounded-lg p-2 text-luxury-espresso"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Weave / Pattern</label>
                      <input
                        type="text"
                        value={editPattern}
                        onChange={(e) => setEditPattern(e.target.value)}
                        placeholder="e.g. Floral Jaal, Zari Border"
                        className="w-full bg-white border border-luxury-beige/50 rounded-lg p-2 text-luxury-espresso"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Pricing & Badges */}
                <div className="space-y-3 bg-luxury-warmWhite/50 p-4 rounded-xl border border-luxury-gold/20">
                  <h4 className="font-bold text-luxury-espresso uppercase text-[11px] tracking-wider text-luxury-gold-dark">
                    2. Pricing & Display Badges
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Original Price (INR ₹) *</label>
                      <input
                        type="number"
                        value={editOriginalPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditOriginalPrice(val);
                          if (val > 0 && editDiscountedPrice > 0) {
                            setEditDiscountPercent(Math.round(((val - editDiscountedPrice) / val) * 100));
                          }
                        }}
                        required
                        className="w-full bg-white border border-luxury-beige/50 rounded-lg p-2 text-luxury-espresso font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Discounted Price (INR ₹) *</label>
                      <input
                        type="number"
                        value={editDiscountedPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditDiscountedPrice(val);
                          if (editOriginalPrice > 0 && val > 0) {
                            setEditDiscountPercent(Math.round(((editOriginalPrice - val) / editOriginalPrice) * 100));
                          }
                        }}
                        required
                        className="w-full bg-white border border-luxury-beige/50 rounded-lg p-2 text-luxury-wine font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Discount %</label>
                      <input
                        type="number"
                        value={editDiscountPercent}
                        onChange={(e) => setEditDiscountPercent(Number(e.target.value))}
                        className="w-full bg-white border border-luxury-beige/50 rounded-lg p-2 text-luxury-espresso"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsFeatured}
                        onChange={(e) => setEditIsFeatured(e.target.checked)}
                        className="w-4 h-4 text-luxury-wine rounded border-luxury-gold/40 focus:ring-luxury-gold"
                      />
                      <span className="font-semibold text-luxury-espresso">Featured Product</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsBestseller}
                        onChange={(e) => setEditIsBestseller(e.target.checked)}
                        className="w-4 h-4 text-luxury-wine rounded border-luxury-gold/40 focus:ring-luxury-gold"
                      />
                      <span className="font-semibold text-luxury-espresso">Bestseller Badge</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsNewArrival}
                        onChange={(e) => setEditIsNewArrival(e.target.checked)}
                        className="w-4 h-4 text-luxury-wine rounded border-luxury-gold/40 focus:ring-luxury-gold"
                      />
                      <span className="font-semibold text-luxury-espresso">New Arrival Badge</span>
                    </label>
                  </div>
                </div>

                {/* 3. Product Images (Uploaded Pics Manager) */}
                <div className="space-y-3 bg-luxury-warmWhite/50 p-4 rounded-xl border border-luxury-gold/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-luxury-espresso uppercase text-[11px] tracking-wider text-luxury-gold-dark">
                      3. Product Images ({editImages.length} Pictures)
                    </h4>
                    <span className="text-[10px] text-luxury-espresso/60">
                      Click the star to set Primary thumbnail
                    </span>
                  </div>

                  {/* Existing Images Gallery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {editImages.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={`flex items-center space-x-3 p-2.5 rounded-lg border bg-white shadow-xs ${
                          img.isPrimary ? 'border-luxury-gold ring-1 ring-luxury-gold/50' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="w-14 h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                          onError={(e: any) => {
                            e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c';
                          }}
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <input
                            type="text"
                            value={img.url}
                            onChange={(e) => {
                              const newUrl = e.target.value;
                              setEditImages((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, url: newUrl } : item))
                              );
                            }}
                            className="w-full text-[11px] bg-luxury-warmWhite border rounded p-1 font-mono truncate"
                            placeholder="Image URL"
                          />
                          <div className="flex items-center justify-between text-[10px]">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className={`flex items-center space-x-1 px-1.5 py-0.5 rounded font-semibold ${
                                img.isPrimary
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'text-gray-500 hover:text-luxury-espresso'
                              }`}
                            >
                              <Star className={`w-3 h-3 ${img.isPrimary ? 'fill-amber-500 text-amber-500' : ''}`} />
                              <span>{img.isPrimary ? 'Primary Photo' : 'Set as Primary'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImageFromEdit(idx)}
                              className="text-rose-600 hover:text-rose-800 p-1"
                              title="Delete this image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Picture Row */}
                  <div className="pt-2 border-t border-luxury-beige/30 flex items-center space-x-2">
                    <input
                      type="url"
                      value={newImageInputUrl}
                      onChange={(e) => setNewImageInputUrl(e.target.value)}
                      placeholder="Paste new Image URL (https://...)"
                      className="flex-1 bg-white border border-luxury-beige/50 rounded-lg p-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageToEdit}
                      className="bg-luxury-espresso text-luxury-ivory px-3 py-2 rounded-lg font-semibold hover:bg-black transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Picture</span>
                    </button>
                  </div>
                </div>

                {/* 4. Sizes, Colors & Inventory Variants */}
                <div className="space-y-3 bg-luxury-warmWhite/50 p-4 rounded-xl border border-luxury-gold/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-luxury-espresso uppercase text-[11px] tracking-wider text-luxury-gold-dark">
                      4. Sizes, Colors & Inventory Units ({editVariants.length} Sizes)
                    </h4>
                    <span className="text-[10px] text-luxury-espresso/60">
                      Total Stock: {editVariants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)} units
                    </span>
                  </div>

                  <div className="space-y-2">
                    {editVariants.map((v, idx) => (
                      <div
                        key={v.id || idx}
                        className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-white border border-gray-200"
                      >
                        <div className="w-28">
                          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Size</label>
                          <input
                            type="text"
                            value={v.size}
                            onChange={(e) => handleUpdateVariantSize(idx, e.target.value)}
                            required
                            placeholder="e.g. S, M, Free Size"
                            className="w-full bg-luxury-warmWhite border rounded p-1.5 font-semibold text-luxury-espresso"
                          />
                        </div>

                        <div className="w-32">
                          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Color</label>
                          <input
                            type="text"
                            value={v.color}
                            onChange={(e) => handleUpdateVariantColor(idx, e.target.value)}
                            required
                            placeholder="e.g. Royal Wine"
                            className="w-full bg-luxury-warmWhite border rounded p-1.5 text-luxury-espresso"
                          />
                        </div>

                        <div className="w-24">
                          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Stock Units</label>
                          <input
                            type="number"
                            min="0"
                            value={v.stockQuantity}
                            onChange={(e) => handleUpdateVariantStock(idx, Number(e.target.value))}
                            required
                            className="w-full bg-luxury-warmWhite border rounded p-1.5 font-bold text-luxury-wine"
                          />
                        </div>

                        {v.sku && (
                          <div className="flex-1 min-w-[120px]">
                            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">SKU</label>
                            <span className="text-[11px] font-mono text-gray-600 block py-1.5 truncate">
                              {v.sku}
                            </span>
                          </div>
                        )}

                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantFromEdit(idx)}
                            className="text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50"
                            title="Delete this size variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Size / Variant Row */}
                  <div className="pt-2 border-t border-luxury-beige/30 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={newVarSize}
                      onChange={(e) => setNewVarSize(e.target.value)}
                      placeholder="Size (e.g. XL, Free Size)"
                      className="w-36 bg-white border border-luxury-beige/50 rounded-lg p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={newVarColor}
                      onChange={(e) => setNewVarColor(e.target.value)}
                      placeholder="Color (e.g. Wine)"
                      className="w-36 bg-white border border-luxury-beige/50 rounded-lg p-2 text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      value={newVarStock}
                      onChange={(e) => setNewVarStock(Number(e.target.value))}
                      placeholder="Stock"
                      className="w-24 bg-white border border-luxury-beige/50 rounded-lg p-2 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleAddVariantToEdit}
                      className="bg-luxury-espresso text-luxury-ivory px-3 py-2 rounded-lg font-semibold hover:bg-black transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Size</span>
                    </button>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="bg-gray-200 hover:bg-gray-300 px-5 py-2.5 rounded-lg font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingProduct}
                    className="bg-luxury-wine hover:bg-luxury-wine-light text-luxury-ivory px-6 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wider shadow-md transition-all flex items-center space-x-2"
                  >
                    {updatingProduct ? (
                      <span>Saving Changes...</span>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Save All Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

