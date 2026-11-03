import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const popularTags = [
    'Banarasi Silk',
    'Kanjivaram',
    'Chikankari',
    'Organza',
    'Micro Velvet',
    'Crimson Wine',
    'Champagne Gold',
  ];

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products?search=${encodeURIComponent(searchTerm.trim())}&limit=6`);
        if (res.data?.success) {
          setResults(res.data.data.products || []);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onClose();
      navigate(`/category/sarees?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-luxury-cream w-full max-w-2xl rounded-xl shadow-2xl border border-luxury-gold/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Header */}
        <form onSubmit={handleSearchSubmit} className="p-4 border-b border-luxury-gold/20 flex items-center space-x-3 bg-white">
          <Search className="w-5 h-5 text-luxury-gold-dark" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pure sarees, designer kurtis, fabrics, shades..."
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base text-luxury-espresso placeholder-luxury-espresso/40 focus:outline-none"
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')} className="p-1 text-luxury-espresso/50 hover:text-luxury-wine">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase font-medium text-luxury-espresso/60 hover:text-luxury-wine px-2 py-1"
          >
            Esc
          </button>
        </form>

        {/* Popular Tags */}
        <div className="p-4 bg-luxury-ivory/60 border-b border-luxury-beige/30 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-luxury-espresso/50 font-medium">Trending:</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag)}
              className="bg-white hover:bg-luxury-gold/20 border border-luxury-gold/20 text-luxury-espresso px-2.5 py-1 rounded-full transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Live Search Results */}
        <div className="max-h-96 overflow-y-auto p-4">
          {loading && (
            <div className="py-8 text-center text-xs text-luxury-espresso/60">
              Searching royal archives...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product.slug)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-luxury-gold/20 cursor-pointer transition-colors"
                >
                  <img
                    src={product.images[0]?.url}
                    alt={product.name}
                    className="w-12 h-16 object-cover rounded bg-luxury-warmWhite"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-luxury-gold-dark font-medium">
                      {product.fabric}
                    </p>
                    <h4 className="font-serif text-sm font-semibold text-luxury-espresso truncate">
                      {product.name}
                    </h4>
                    <p className="font-bold text-xs text-luxury-wine mt-0.5">
                      ₹{(product.discountedPrice / 100).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-luxury-espresso/40" />
                </div>
              ))}
            </div>
          )}

          {!loading && searchTerm.trim() && results.length === 0 && (
            <div className="py-8 text-center">
              <p className="font-serif text-sm font-semibold text-luxury-espresso">
                No exquisite drapes found for "{searchTerm}"
              </p>
              <p className="text-xs text-luxury-espresso/60 mt-1">
                Try searching for "Banarasi", "Katan Silk", or "Velvet Kurti".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

