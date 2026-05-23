'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import { useCartStore } from '../../../../store/cartStore';
import toast, { Toaster } from 'react-hot-toast';

export default function CustomerProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/products/categories')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load catalog data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success(`${product.product_name} added to cart!`);
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === null || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Sidebar />
      <Toaster position="top-right" />
      <main className="ml-[280px] min-h-screen w-full flex flex-col">
        <TopNav title="Browse Products" />
        
        <div className="p-6 space-y-6 flex-1">
          {/* Header Actions */}
          <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="premium-input pl-10"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs opacity-60">🔍</span>
            </div>
            
            {/* Category Select */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === null 
                    ? 'bg-[#7c6f50] text-white shadow-sm' 
                    : 'bg-white/60 text-slate-700 border hover:bg-white'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() => setSelectedCategory(cat.category_id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.category_id
                      ? 'bg-[#7c6f50] text-white shadow-sm' 
                      : 'bg-white/60 text-slate-700 border hover:bg-white'
                  }`}
                >
                  {cat.category_name}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-sm font-semibold animate-pulse" style={{ color: 'var(--color-primary)' }}>Loading product catalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-xl">
              <span className="text-4xl mb-3 block">📦</span>
              <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-main)' }}>No Products Found</h4>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search criteria or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product) => {
                const isLowStock = product.units_in_stock <= product.reorder_level;
                const isOut = product.units_in_stock <= 0;
                
                return (
                  <div 
                    key={product.product_id} 
                    className="glass-card rounded-xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="h-40 flex items-center justify-center text-5xl relative"
                      style={{ backgroundColor: 'rgba(124, 111, 80, 0.05)' }}>
                      🛍️
                      {isOut && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-red-600 text-white font-bold text-2xs uppercase px-2 py-1 rounded">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--color-primary)' }}>
                            {product.category_name}
                          </span>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            product.discontinued 
                              ? 'bg-gray-200 text-gray-700'
                              : isLowStock 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {product.discontinued ? 'Discontinued' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm leading-snug" style={{ color: 'var(--color-text-main)' }}>
                          {product.product_name}
                        </h4>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          Pack: {product.quantity_per_unit || 'Units'}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          Supplier: <span className="font-medium text-slate-800">{product.supplier_name}</span>
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
                          ${parseFloat(product.unit_price).toFixed(2)}
                        </span>
                        
                        <button
                          disabled={isOut || product.discontinued === 1}
                          onClick={() => handleAddToCart(product)}
                          className={`premium-btn-primary py-1.5 px-3.5 text-2xs uppercase tracking-wider ${
                            (isOut || product.discontinued === 1) ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
