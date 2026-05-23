'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function SupplierStats() {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, productsRes] = await Promise.all([
          api.get('/suppliers/1/stats'),
          api.get('/products/supplier/1')
        ]);
        setStats(statsRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load performance statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Calculate inventory metrics
  const totalStock = products.reduce((sum, p) => sum + p.units_in_stock, 0);
  const discontinuedCount = products.filter(p => p.discontinued === 1).length;
  const activeProducts = products.length - discontinuedCount;
  const avgPrice = products.length > 0 
    ? (products.reduce((sum, p) => sum + parseFloat(p.unit_price), 0) / products.length).toFixed(2)
    : '0.00';

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Sidebar />
      <Toaster position="top-right" />
      
      <main className="ml-[280px] min-h-screen w-full flex flex-col">
        <TopNav title="Supplier Statistics" />
        
        <div className="p-6 space-y-6 flex-1">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-sm font-semibold animate-pulse" style={{ color: 'var(--color-primary)' }}>Loading analytics dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Summary Grid */}
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: `$${parseFloat(stats?.total_revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: '💰', color: '#10b981' },
                  { label: 'Orders Fulfilled', value: stats?.total_orders || 0, icon: '📋', color: '#6366f1' },
                  { label: 'Catalog Products', value: stats?.total_products || 0, icon: '📦', color: '#d97706' },
                  { label: 'Low Stock Alerts', value: stats?.low_stock_products || 0, icon: '⚠️', color: '#ef4444' },
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                      <p className="text-xl font-bold mt-1.5" style={{ color: 'var(--color-text-main)' }}>{stat.value}</p>
                    </div>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(124, 111, 80, 0.08)' }}>
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </section>

              {/* Graphical Analysis Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Product Inventory Health Gauges */}
                <div className="glass-panel p-5 rounded-xl lg:col-span-2 space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Product Inventory Health & Stock Levels
                  </h3>
                  
                  {/* Visual CSS-based Bar Graphs */}
                  <div className="space-y-4">
                    {products.slice(0, 5).map((p, i) => {
                      const percentage = Math.min(100, Math.max(5, (p.units_in_stock / (p.reorder_level * 5)) * 100));
                      const isLowStock = p.units_in_stock <= p.reorder_level;
                      
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-800">{p.product_name}</span>
                            <span className={isLowStock ? 'text-red-700 font-bold' : 'text-slate-500'}>
                              {p.units_in_stock} in stock (Reorder: {p.reorder_level})
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-slate-100 overflow-hidden border">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                p.discontinued === 1 
                                  ? 'bg-slate-300'
                                  : isLowStock 
                                  ? 'bg-red-500' 
                                  : 'bg-[#7c6f50]'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Logistics Ledger Details */}
                <div className="glass-panel p-5 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Inventory Breakdown
                  </h3>
                  
                  <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="py-2.5 flex justify-between text-xs">
                      <span className="text-slate-500">Total Physical Units</span>
                      <span className="font-bold text-slate-800">{totalStock} units</span>
                    </div>
                    <div className="py-2.5 flex justify-between text-xs">
                      <span className="text-slate-500">Active Offerings</span>
                      <span className="font-bold text-slate-800">{activeProducts} products</span>
                    </div>
                    <div className="py-2.5 flex justify-between text-xs">
                      <span className="text-slate-500">Discontinued Products</span>
                      <span className="font-bold text-slate-800">{discontinuedCount} products</span>
                    </div>
                    <div className="py-2.5 flex justify-between text-xs">
                      <span className="text-slate-500">Average Unit Price</span>
                      <span className="font-bold text-slate-800">${avgPrice}</span>
                    </div>
                    <div className="py-2.5 flex justify-between text-xs">
                      <span className="text-slate-500">Inventory Status</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        stats?.low_stock_products > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {stats?.low_stock_products > 0 ? 'Action Required' : 'Optimal'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
