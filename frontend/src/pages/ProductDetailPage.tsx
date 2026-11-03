import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  Star,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Shiprocket PIN check state
  const [pincodeInput, setPincodeInput] = useState('');
  const [pinCheckLoading, setPinCheckLoading] = useState(false);
  const [pinCheckResult, setPinCheckResult] = useState<any | null>(null);

  // New review form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/slug/${slug}`);
        if (res.data?.success) {
          const data = res.data.data;
          setProduct(data.product);
          setReviews(data.reviews || []);
          setRelatedProducts(data.relatedProducts || []);
          setSelectedImage(data.product.images[0]?.url || '');
          setSelectedVariant(data.product.variants[0] || null);
        }
      } catch (err) {
        console.error('Error fetching product', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-luxury-espresso">
        <Sparkles className="w-8 h-8 text-luxury-gold mx-auto animate-spin mb-4" />
        <h2 className="font-serif text-xl font-bold">Unfolding Heirloom Silk...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-luxury-espresso">Ensemble Not Found</h2>
        <p className="text-sm text-luxury-espresso/60">The requested saree or kurti may have been archived.</p>
        <Link to="/category/sarees" className="inline-block bg-luxury-wine text-luxury-ivory px-6 py-2.5 rounded font-semibold text-xs uppercase tracking-wider">
          Browse Sarees
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const currentVariant = selectedVariant || product.variants[0];
  const unitPrice = (product.discountedPrice + (currentVariant?.additionalPrice || 0)) / 100;
  const originalPrice = (product.originalPrice + (currentVariant?.additionalPrice || 0)) / 100;
  const isOutOfStock = (currentVariant?.stockQuantity || 0) <= 0;

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput || !/^\d{6}$/.test(pincodeInput.trim())) {
      setPinCheckResult({ isServiceable: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
      return;
    }

    setPinCheckLoading(true);
    try {
      const res = await api.get(`/shipping/serviceability?pincode=${pincodeInput.trim()}`);
      if (res.data?.success) {
        setPinCheckResult(res.data.data);
      } else {
        setPinCheckResult({ isServiceable: false, message: res.data.message });
      }
    } catch (err: any) {
      setPinCheckResult({ isServiceable: false, message: 'Serviceability check failed. Please try again.' });
    } finally {
      setPinCheckLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!currentVariant || isOutOfStock) return;
    setAddingToCart(true);
    await addItem(product.id, currentVariant.id, quantity);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!currentVariant || isOutOfStock) return;
    await addItem(product.id, currentVariant.id, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewerComment) return;
    try {
      await api.post(`/products/${product.id}/reviews`, {
        customerName: reviewerName,
        rating: reviewerRating,
        comment: reviewerComment,
      });
      setReviewSubmitted(true);
      setReviews([
        {
          id: 'temp-' + Date.now(),
          customerName: reviewerName,
          rating: reviewerRating,
          comment: reviewerComment,
          createdAt: new Date().toISOString(),
        },
        ...reviews,
      ]);
      setReviewerName('');
      setReviewerComment('');
    } catch (err) {
      console.error('Error submitting review', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-luxury-espresso/60 uppercase tracking-wider">
        <Link to="/" className="hover:text-luxury-wine transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/category/${product.categoryId.replace('cat-', '')}`} className="hover:text-luxury-wine transition-colors">
          {product.fabric.includes('Kurti') ? 'Kurtis' : 'Sarees'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-luxury-espresso font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Gallery & Zoom Preview */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-luxury-warmWhite rounded-2xl overflow-hidden border border-luxury-gold/20 shadow-luxury relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 cursor-zoom-in"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-luxury-wine text-luxury-ivory text-xs font-bold px-3 py-1 rounded shadow uppercase tracking-wider">
                {product.discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-lg backdrop-blur-md transition-colors ${
                inWishlist ? 'bg-luxury-wine text-luxury-gold' : 'bg-white/80 hover:bg-white text-luxury-espresso'
              }`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-luxury-gold' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img.url ? 'border-luxury-wine ring-2 ring-luxury-gold/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Specifications & Purchasing Controls */}
        <div className="space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-luxury-gold-dark font-semibold">
              <ShieldCheck className="w-4 h-4 text-luxury-wine" />
              <span>{product.fabric}</span>
              <span>•</span>
              <span>Silk Mark Certified Purity</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-espresso mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="mt-4 p-4 bg-white rounded-xl border border-luxury-gold/20 flex items-baseline justify-between shadow-sm">
              <div className="flex items-baseline space-x-3">
                <span className="font-serif font-bold text-3xl text-luxury-wine">
                  ₹{unitPrice.toLocaleString('en-IN')}
                </span>
                {originalPrice > unitPrice && (
                  <span className="text-base text-luxury-espresso/50 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="bg-luxury-wine/10 text-luxury-wine text-xs font-bold px-2 py-0.5 rounded">
                    Save ₹{(originalPrice - unitPrice).toLocaleString('en-IN')} ({product.discountPercent}% OFF)
                  </span>
                )}
              </div>
              <span className="text-xs text-luxury-espresso/50">Taxes Included</span>
            </div>

            {/* Description */}
            <div className="mt-4">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-1">
                The Heritage Story:
              </h3>
              <p className="text-sm text-luxury-espresso/80 leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Variants Selector (Size & Color) */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-2">
                  Select Size & Shade:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        currentVariant?.id === v.id
                          ? 'bg-luxury-wine text-luxury-ivory border-luxury-wine shadow-sm'
                          : 'bg-white text-luxury-espresso border-luxury-gold/30 hover:border-luxury-gold'
                      }`}
                    >
                      {v.size} ({v.color})
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock status indicator */}
              <div className="text-xs">
                {isOutOfStock ? (
                  <span className="text-rose-700 font-semibold">❌ Sold Out in this variant</span>
                ) : (
                  <span className="text-emerald-800 font-medium">
                    ✓ Available: {currentVariant?.stockQuantity} pieces in warehouse
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="mt-4 flex items-center space-x-3">
                <label className="text-xs uppercase tracking-wider font-semibold text-luxury-espresso">
                  Quantity:
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-white border border-luxury-gold/30 rounded px-3 py-1.5 text-xs text-luxury-espresso font-semibold focus:outline-none"
                >
                  {[...Array(Math.min(currentVariant?.stockQuantity || 1, 5))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="flex-1 bg-luxury-wine hover:bg-luxury-wine-light disabled:opacity-50 text-luxury-ivory py-3.5 px-6 rounded-lg text-xs font-semibold uppercase tracking-widest shadow-md hover:shadow-luxury transition-all flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addingToCart ? 'Adding to Bag...' : 'Add to Shopping Bag'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 bg-luxury-gold hover:bg-luxury-gold-dark disabled:opacity-50 text-luxury-espresso-dark py-3.5 px-6 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now (Instant UPI)</span>
              </button>
            </div>

            {/* MANDATORY STORE POLICY ALERT (Requirement 9) */}
            <div className="mt-6 p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-2 font-bold text-amber-900 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Store Policy: Strictly No Returns or Exchanges</span>
              </div>
              <p className="leading-relaxed">
                ANAMIKA COLLECTIONS strictly adheres to a <strong>No Return and No Exchange</strong> policy on all pure handloom sarees and designer kurtis to guarantee uncompromised purity and hygiene.
              </p>
              <p className="text-[11px] text-amber-900/80">
                <em>Consumer Notice:</em> If your parcel arrives damaged in transit or contains an incorrect/defective item, submit an unboxing video claim via our <Link to="/support" className="underline font-bold text-amber-950">Support Concierge</Link> within 48 hours for immediate investigation and remedy.
              </p>
            </div>

            {/* Shiprocket Delivery PIN Checker Widget */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-luxury-gold/20 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-luxury-espresso">
                <Truck className="w-4 h-4 text-luxury-wine" />
                <span>Check Delivery & Serviceability:</span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  placeholder="Enter 6-digit delivery PIN code"
                  className="flex-1 bg-luxury-warmWhite border border-luxury-gold/30 rounded px-3 py-1.5 text-xs text-luxury-espresso focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={pinCheckLoading}
                  className="bg-luxury-espresso hover:bg-luxury-espresso-light text-luxury-ivory px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {pinCheckLoading ? 'Checking...' : 'Check PIN'}
                </button>
              </form>

              {pinCheckResult && (
                <div
                  className={`p-2.5 rounded text-xs ${
                    pinCheckResult.isServiceable
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {pinCheckResult.isServiceable ? (
                    <div>
                      <p className="font-semibold flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Delivery available via {pinCheckResult.courierName}!</span>
                      </p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Estimated Delivery by: <strong>{pinCheckResult.estimatedDeliveryDate}</strong> | Courier Charge: <strong>₹{pinCheckResult.ratePaise / 100}</strong>
                      </p>
                    </div>
                  ) : (
                    <p>{pinCheckResult.message || 'Delivery is currently not available for this PIN code.'}</p>
                  )}
                </div>
              )}
            </div>

            {/* Fabric Details & Care Specs */}
            <div className="mt-6 pt-4 border-t border-luxury-beige/30 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-luxury-espresso/60 block">Weave & Pattern:</span>
                <span className="font-medium text-luxury-espresso">{product.pattern || 'Handcrafted Kadwa Zari'}</span>
              </div>
              <div>
                <span className="text-luxury-espresso/60 block">Occasion:</span>
                <span className="font-medium text-luxury-espresso">{product.occasion || 'Bridal & Grand Festivities'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-luxury-espresso/60 block">Care Instructions:</span>
                <span className="font-medium text-luxury-espresso">{product.careInstructions || 'Dry Clean Only. Store wrapped in unbleached muslin cloth.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section className="pt-12 border-t border-luxury-gold/20 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-luxury-espresso">Customer Reviews</h3>
            <p className="text-xs text-luxury-espresso/60 mt-0.5">Authentic feedback from verified patrons</p>
          </div>
          <div className="flex items-center space-x-2 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm font-bold text-luxury-espresso ml-1">5.0 / 5.0</span>
          </div>
        </div>

        {/* Existing Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-5 rounded-xl border border-luxury-beige/40 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-luxury-espresso">{rev.customerName}</span>
                <div className="flex text-amber-400">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              {rev.title && <h5 className="text-xs font-semibold text-luxury-wine">{rev.title}</h5>}
              <p className="text-xs text-luxury-espresso/80 font-light leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>

        {/* Write a Review Form */}
        <div className="bg-luxury-warmWhite p-6 rounded-2xl border border-luxury-gold/20 max-w-xl">
          <h4 className="font-serif font-bold text-base text-luxury-espresso mb-1">Share Your Experience</h4>
          <p className="text-xs text-luxury-espresso/60 mb-4">Adorned this piece? Let others know about the drape, silk purity, and finish.</p>
          {reviewSubmitted ? (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded text-xs border border-emerald-200">
              ✓ Thank you! Your review has been added to the product page.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  placeholder="e.g. Radhika Sharma"
                  className="w-full bg-white border border-luxury-gold/30 rounded px-3 py-1.5 text-xs text-luxury-espresso focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">Rating</label>
                <select
                  value={reviewerRating}
                  onChange={(e) => setReviewerRating(Number(e.target.value))}
                  className="bg-white border border-luxury-gold/30 rounded px-3 py-1.5 text-xs text-luxury-espresso focus:outline-none"
                >
                  <option value={5}>5 Stars - Exquisite Perfection</option>
                  <option value={4}>4 Stars - High Quality Silk</option>
                  <option value={3}>3 Stars - Good</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase font-medium text-luxury-espresso mb-1">Your Review</label>
                <textarea
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  required
                  rows={3}
                  placeholder="Tell us about the fabric texture, zari sheen, and packaging..."
                  className="w-full bg-white border border-luxury-gold/30 rounded px-3 py-1.5 text-xs text-luxury-espresso focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-luxury-wine text-luxury-ivory px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-luxury-wine-light transition-colors"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-luxury-gold/20 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-luxury-espresso">Complete Your Festive Trousseau</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

