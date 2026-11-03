import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state
  const searchQuery = searchParams.get('search') || '';
  const [fabricFilter, setFabricFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [priceRange, setPriceRange] = useState<number>(30000); // in Rupees
  const [sortBy, setSortBy] = useState<'newest' | 'price_low_high' | 'price_high_low' | 'popularity'>('newest');

  const fabrics = [
    'Pure Katan Silk',
    'Mulberry Silk',
    'Organza Silk',
    'Chanderi Silk',
    'Micro Velvet',
    'Mulmul Cotton',
  ];

  const sizes = ['Free Size', 'S (Bust 36)', 'M (Bust 38)', 'L (Bust 40)', 'XL (Bust 42)'];

  const categoryTitles: Record<string, string> = {
    sarees: 'Handwoven Heritage Sarees',
    kurtis: 'Artisanal Designer Kurtis',
    'new-arrivals': 'New Festive Arrivals',
    bestsellers: 'Royal Bestsellers',
    offers: 'Curated Festive Offers',
  };

  const currentTitle = slug ? categoryTitles[slug] || slug.replace('-', ' ') : 'All Ensembles';

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);

        // Fetch category details
        if (slug && slug !== 'all' && !['new-arrivals', 'bestsellers', 'offers'].includes(slug)) {
          try {
            const catRes = await api.get(`/products/categories/${slug}`);
            if (catRes.data?.success) setCategory(catRes.data.data);
          } catch (e) {
            // Category slug might be generic filter
          }
        }

        // Build query params
        const params: any = {
          limit: 36,
          sortBy,
          maxPrice: priceRange,
        };

        if (slug && slug !== 'all') {
          params.category = slug;
        }

        if (fabricFilter) {
          params.fabric = fabricFilter;
        }

        if (sizeFilter) {
          params.size = sizeFilter;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const res = await api.get('/products', { params });
        if (res.data?.success) {
          setProducts(res.data.data.products || []);
          setTotalCount(res.data.data.total || 0);
        }
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [slug, fabricFilter, sizeFilter, priceRange, sortBy, searchQuery]);

  const clearAllFilters = () => {
    setFabricFilter('');
    setSizeFilter('');
    setPriceRange(30000);
    setSortBy('newest');
    if (searchQuery) {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-luxury-espresso/60 uppercase tracking-wider">
        <Link to="/" className="hover:text-luxury-wine transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-luxury-espresso font-semibold">{currentTitle}</span>
      </nav>

      {/* Category Header */}
      <div className="border-b border-luxury-gold/30 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-luxury-wine">
            ANAMIKA COLLECTIONS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-espresso mt-1 capitalize">
            {currentTitle}
          </h1>
          {category?.description && (
            <p className="text-sm text-luxury-espresso/70 mt-2 max-w-2xl font-light">
              {category.description}
            </p>
          )}
          {searchQuery && (
            <p className="text-sm text-luxury-wine mt-1">
              Search results for <strong>"{searchQuery}"</strong> ({totalCount} items)
            </p>
          )}
        </div>

        {/* Mobile Filter Toggle & Desktop Sort */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center space-x-2 bg-white border border-luxury-gold/30 px-3 py-2 rounded text-xs font-semibold text-luxury-espresso"
          >
            <SlidersHorizontal className="w-4 h-4 text-luxury-wine" />
            <span>Filters</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 bg-white border border-luxury-gold/30 px-3 py-2 rounded text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-luxury-wine" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-luxury-espresso font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest">Sort By: Newest Arrivals</option>
              <option value="popularity">Sort By: Bestselling / Popular</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div className="bg-white p-5 rounded-xl border border-luxury-beige/40 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-luxury-beige/30">
              <div className="flex items-center space-x-2 font-serif font-bold text-sm text-luxury-espresso">
                <Filter className="w-4 h-4 text-luxury-wine" />
                <span>Refine Drapes</span>
              </div>
              {(fabricFilter || sizeFilter || priceRange < 30000 || searchQuery) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-rose-700 hover:underline font-semibold"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Filter by Fabric */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-2.5">
                Artisanal Fabric
              </h4>
              <div className="space-y-1.5 text-xs">
                {fabrics.map((fab) => (
                  <label key={fab} className="flex items-center space-x-2 cursor-pointer text-luxury-espresso/80 hover:text-luxury-wine">
                    <input
                      type="radio"
                      name="fabric"
                      checked={fabricFilter === fab}
                      onChange={() => setFabricFilter(fabricFilter === fab ? '' : fab)}
                      className="accent-luxury-wine"
                    />
                    <span>{fab}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter by Size */}
            <div className="pt-4 border-t border-luxury-beige/20">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-2.5">
                Size / Drape
              </h4>
              <div className="space-y-1.5 text-xs">
                {sizes.map((sz) => (
                  <label key={sz} className="flex items-center space-x-2 cursor-pointer text-luxury-espresso/80 hover:text-luxury-wine">
                    <input
                      type="radio"
                      name="size"
                      checked={sizeFilter === sz}
                      onChange={() => setSizeFilter(sizeFilter === sz ? '' : sz)}
                      className="accent-luxury-wine"
                    />
                    <span>{sz}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter by Maximum Price */}
            <div className="pt-4 border-t border-luxury-beige/20">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-2">
                <span>Max Price</span>
                <span className="text-luxury-wine font-bold">₹{priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="4000"
                max="30000"
                step="1000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-luxury-wine cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-luxury-espresso/50 mt-1">
                <span>₹4,000</span>
                <span>₹30,000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filters Slide-over / Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
            <div className="relative w-80 bg-luxury-cream h-full p-6 space-y-6 overflow-y-auto shadow-2xl z-10">
              <div className="flex items-center justify-between pb-4 border-b border-luxury-gold/30">
                <h3 className="font-serif font-bold text-base text-luxury-espresso">Filter Products</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-luxury-espresso" />
                </button>
              </div>

              {/* Mobile Fabric Filter */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-2">
                  Artisanal Fabric
                </h4>
                <div className="space-y-2 text-xs">
                  {fabrics.map((fab) => (
                    <label key={fab} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="mobile_fabric"
                        checked={fabricFilter === fab}
                        onChange={() => setFabricFilter(fabricFilter === fab ? '' : fab)}
                        className="accent-luxury-wine"
                      />
                      <span>{fab}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Size Filter */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-luxury-espresso mb-2">
                  Size
                </h4>
                <div className="space-y-2 text-xs">
                  {sizes.map((sz) => (
                    <label key={sz} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="mobile_size"
                        checked={sizeFilter === sz}
                        onChange={() => setSizeFilter(sizeFilter === sz ? '' : sz)}
                        className="accent-luxury-wine"
                      />
                      <span>{sz}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-luxury-wine text-luxury-ivory py-2.5 rounded font-semibold text-xs uppercase tracking-wider"
              >
                Apply Filters ({totalCount})
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white p-4 rounded-lg border border-luxury-beige/30 space-y-4">
                  <div className="aspect-[3/4] bg-luxury-warmWhite rounded" />
                  <div className="h-4 bg-luxury-warmWhite rounded w-3/4" />
                  <div className="h-4 bg-luxury-warmWhite rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-luxury-beige/40 space-y-3">
              <h3 className="font-serif text-xl font-bold text-luxury-espresso">
                No matching ensembles found
              </h3>
              <p className="text-xs text-luxury-espresso/60 max-w-sm mx-auto">
                We couldn't find any sarees or kurtis matching your refined filter parameters. Try loosening the price or fabric filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2 bg-luxury-wine text-luxury-ivory text-xs font-semibold uppercase tracking-wider rounded"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

