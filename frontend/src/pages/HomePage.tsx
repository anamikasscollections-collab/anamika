import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, ShieldCheck, Truck, RefreshCcw, Instagram } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredSarees, setFeaturedSarees] = useState<any[]>([]);
  const [designerKurtis, setDesignerKurtis] = useState<any[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bannersRes, catRes, sareesRes, kurtisRes] = await Promise.all([
          api.get('/products/banners'),
          api.get('/products/categories'),
          api.get('/products?category=sarees&limit=4'),
          api.get('/products?category=kurtis&limit=4'),
        ]);

        if (bannersRes.data?.success) setBanners(bannersRes.data.data || []);
        if (catRes.data?.success) setCategories(catRes.data.data || []);
        if (sareesRes.data?.success) setFeaturedSarees(sareesRes.data.data.products || []);
        if (kurtisRes.data?.success) setDesignerKurtis(kurtisRes.data.data.products || []);
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroBanner = banners[0] || {
    title: 'The Royal Festive Edit 2026',
    subtitle: 'Handcrafted Heritage Sarees & Artisanal Kurtis',
    tagline: 'Elegance in Every Thread',
    linkText: 'Explore Saree Collection',
    linkUrl: '/category/sarees',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
  };

  const reviews = [
    {
      name: 'Pooja Sharma',
      city: 'New Delhi',
      rating: 5,
      comment: 'The crimson wine Varanasi Katan Silk saree is mesmerizing. The antique gold zari has an heirloom weight and drape. Unboxing felt like opening royal jewelry!',
      product: 'Pure Katan Silk Banarasi Saree',
    },
    {
      name: 'Radhika Mehra',
      city: 'Mumbai',
      rating: 5,
      comment: 'The deep wine velvet Anarkali kurti is so soft, lightweight, and regal. The zardozi embroidery is so intricately done. Fast delivery via Blue Dart.',
      product: 'Micro Velvet Anarkali Kurti Set',
    },
    {
      name: 'Ananya Iyer',
      city: 'Bangalore',
      rating: 5,
      comment: 'Pure Kanjivaram silk with authentic tested gold zari. The temple border is pristine. ANAMIKA COLLECTIONS is now my primary store for luxury festive wear.',
      product: 'Ivory Temple Border Kanjivaram Saree',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO BANNER */}
      <section className="relative min-h-[580px] sm:min-h-[700px] flex items-center justify-center bg-luxury-espresso text-luxury-ivory overflow-hidden">
        {/* Background Image with Deep Wine/Espresso Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${heroBanner.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-espresso-dark/95 via-luxury-wine-dark/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-espresso-dark/80 via-transparent to-black/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full z-10">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 bg-luxury-wine/60 border border-luxury-gold/40 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-luxury-gold" />
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-luxury-gold-light">
                {heroBanner.tagline || 'Elegance in Every Thread'}
              </span>
            </div>

            <h1 className="font-brand text-4xl sm:text-6xl font-bold tracking-wider leading-tight text-luxury-ivory drop-shadow-md">
              {heroBanner.title}
            </h1>

            <p className="text-base sm:text-lg text-luxury-ivory/85 font-light leading-relaxed max-w-xl">
              {heroBanner.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to={heroBanner.linkUrl || '/category/sarees'}
                className="bg-luxury-gold hover:bg-luxury-gold-dark text-luxury-espresso-dark font-serif font-bold text-sm tracking-widest uppercase px-8 py-4 rounded shadow-gold-glow hover:shadow-luxury transition-all flex items-center space-x-2"
              >
                <span>{heroBanner.linkText || 'Explore Saree Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/category/kurtis"
                className="bg-white/10 hover:bg-white/20 border border-luxury-gold/40 text-luxury-ivory font-serif font-semibold text-sm tracking-widest uppercase px-8 py-4 rounded backdrop-blur-md transition-all"
              >
                Shop Designer Kurtis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 bg-white border border-luxury-gold/20 rounded-xl shadow-luxury">
          <div className="flex items-center space-x-3.5">
            <ShieldCheck className="w-8 h-8 text-luxury-wine flex-shrink-0" />
            <div>
              <h4 className="font-serif font-semibold text-sm text-luxury-espresso">100% Pure Silk</h4>
              <p className="text-xs text-luxury-espresso/60">Certified Handloom Quality</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <Truck className="w-8 h-8 text-luxury-wine flex-shrink-0" />
            <div>
              <h4 className="font-serif font-semibold text-sm text-luxury-espresso">Shiprocket Air</h4>
              <p className="text-xs text-luxury-espresso/60">Tracked Pan-India Logistics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <Sparkles className="w-8 h-8 text-luxury-wine flex-shrink-0" />
            <div>
              <h4 className="font-serif font-semibold text-sm text-luxury-espresso">UPI Verified</h4>
              <p className="text-xs text-luxury-espresso/60">Instant Secure Razorpay</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <RefreshCcw className="w-8 h-8 text-luxury-wine flex-shrink-0" />
            <div>
              <h4 className="font-serif font-semibold text-sm text-luxury-espresso">Strict Heirloom Purity</h4>
              <p className="text-xs text-luxury-espresso/60">No Returns or Exchanges</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-luxury-wine">
            Curated Ensembles
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-espresso">
            Shop By Royal Category
          </h2>
          <div className="w-20 h-0.5 bg-luxury-gold mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.slice(0, 3).map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative h-96 rounded-xl overflow-hidden shadow-md hover:shadow-luxury-hover transition-all duration-500"
            >
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-espresso-dark/90 via-luxury-wine/40 to-transparent" />
              <div className="absolute bottom-6 inset-x-6 text-luxury-ivory">
                <span className="text-xs uppercase tracking-widest text-luxury-gold font-semibold">
                  Handcrafted Collection
                </span>
                <h3 className="font-serif text-2xl font-bold mt-1 group-hover:text-luxury-gold-light transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-luxury-ivory/80 mt-1 line-clamp-2 font-light">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-luxury-gold">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED SAREES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-luxury-wine">
              Heirloom Drapes
            </span>
            <h2 className="font-serif text-3xl font-bold text-luxury-espresso mt-1">
              Handwoven Saree Collection
            </h2>
            <div className="w-16 h-0.5 bg-luxury-gold mt-2" />
          </div>
          <Link
            to="/category/sarees"
            className="mt-4 md:mt-0 text-xs uppercase tracking-widest font-bold text-luxury-wine hover:text-luxury-wine-light flex items-center space-x-1"
          >
            <span>View All Sarees</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSarees.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 5. PROMOTIONAL FESTIVE EDIT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-luxury-wine text-luxury-ivory p-8 sm:p-14 border border-luxury-gold/40 shadow-luxury">
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80)',
            }}
          />
          <div className="relative max-w-xl space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-luxury-gold">
              Special Festive Offer
            </span>
            <h2 className="font-brand text-3xl sm:text-4xl font-bold tracking-wider leading-snug">
              An Ode to Pure Silk & Intricate Zari
            </h2>
            <p className="text-sm text-luxury-ivory/85 font-light leading-relaxed">
              Use code <strong className="text-luxury-gold font-bold">ELEGANCE10</strong> at checkout to receive 10% instant savings on orders above ₹4,999. Valid exclusively on our verified UPI checkout.
            </p>
            <div className="pt-2">
              <Link
                to="/category/new-arrivals"
                className="inline-flex items-center space-x-2 bg-luxury-gold hover:bg-luxury-gold-dark text-luxury-espresso-dark font-serif font-bold text-xs uppercase tracking-widest px-6 py-3 rounded shadow transition-all"
              >
                <span>Shop New Festive Arrivals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DESIGNER KURTIS COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-luxury-wine">
              Modern Royalty
            </span>
            <h2 className="font-serif text-3xl font-bold text-luxury-espresso mt-1">
              Artisanal Kurti Ensembles
            </h2>
            <div className="w-16 h-0.5 bg-luxury-gold mt-2" />
          </div>
          <Link
            to="/category/kurtis"
            className="mt-4 md:mt-0 text-xs uppercase tracking-widest font-bold text-luxury-wine hover:text-luxury-wine-light flex items-center space-x-1"
          >
            <span>View All Kurtis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {designerKurtis.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS & PRAISE */}
      <section className="bg-luxury-warmWhite py-16 border-y border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-luxury-wine">
              Patron Praise
            </span>
            <h2 className="font-serif text-3xl font-bold text-luxury-espresso">
              Words of Royal Admiration
            </h2>
            <div className="w-16 h-0.5 bg-luxury-gold mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-luxury-beige/40 shadow-sm hover:shadow-luxury transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-500 space-x-1 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-luxury-espresso/80 italic font-light leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-luxury-beige/20 flex items-center justify-between">
                  <div>
                    <h5 className="font-serif font-bold text-sm text-luxury-espresso">{rev.name}</h5>
                    <p className="text-[11px] text-luxury-espresso/60">{rev.city}</p>
                  </div>
                  <span className="text-[10px] text-luxury-wine font-semibold uppercase tracking-wider bg-luxury-wine/5 px-2 py-1 rounded">
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. INSTAGRAM SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-luxury-wine">
            Follow Our Journey
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-espresso mt-1">
            @AnamikaCollections
          </h2>
          <p className="text-xs text-luxury-espresso/60 mt-1">
            Tag us to be featured in our royal bridal and festive archives
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=600&q=80',
          ].map((url, i) => (
            <div key={i} className="group relative aspect-square rounded-lg overflow-hidden shadow-sm">
              <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-luxury-wine/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Instagram className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

