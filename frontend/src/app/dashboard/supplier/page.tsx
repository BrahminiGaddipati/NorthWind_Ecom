'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import TopNav from '../../../components/layout/TopNav';
import api from '../../../lib/api';
import { getUser } from '../../../lib/auth';
import toast, { Toaster } from 'react-hot-toast';

export default function SupplierDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    category_id: 1,
    unit_price: 0,
    units_in_stock: 0,
    reorder_level: 10,
    quantity_per_unit: '',
    discontinued: 0,
    supplier_id: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        api.get('/products/supplier/1'),
        api.get('/suppliers/1/stats'),
      ]);
      setProducts(productsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', newProduct);
      toast.success('Product added successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add product!');
    }
  };

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <Toaster position="top-right" />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="Supplier Dashboard" />
        <div className="p-6 space-y-6">

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Products', value: stats?.total_products || 0, icon: '📦' },
              { label: 'Total Orders', value: stats?.total_orders || 0, icon: '🛒' },
              { label: 'Total Revenue', value: `$${parseFloat(stats?.total_revenue || 0).toFixed(2)}`, icon: '💰' },
              { label: 'Low Stock', value: stats?.low_stock_products || 0, icon: '⚠️' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border"
                style={{ borderColor: '#cbc6bb' }}>
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-sm mt-2" style={{ color: '#49473f' }}>{stat.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1c1b1a' }}>{stat.value}</p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Products Table */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden"
              style={{ borderColor: '#cbc6bb' }}>
              <div className="p-4 border-b" style={{ borderColor: '#cbc6bb' }}>
                <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>My Products</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ backgroundColor: '#faf3e1' }}>
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Product</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Category</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Stock</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Price</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
                    ) : products.map((product) => (
                      <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">{product.product_name}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#49473f' }}>{product.category_name}</td>
                        <td className="px-4 py-3 text-sm font-bold"
                          style={{ color: product.units_in_stock <= product.reorder_level ? '#ba1a1a' : '#1c1b1a' }}>
                          {product.units_in_stock}
                        </td>
                        <td className="px-4 py-3 text-sm">${product.unit_price}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            product.discontinued
                              ? 'bg-gray-100 text-gray-600'
                              : product.units_in_stock <= product.reorder_level
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.discontinued ? 'Discontinued' : product.units_in_stock <= product.reorder_level ? 'Low Stock' : 'Healthy'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Product Form */}
            <div className="bg-white p-5 rounded-xl shadow-sm border"
              style={{ borderColor: '#cbc6bb' }}>
              <h3 className="font-semibold text-lg mb-4" style={{ color: '#1c1b1a' }}>Add Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#49473f' }}>Product Name</label>
                  <input
                    type="text"
                    value={newProduct.product_name}
                    onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                    placeholder="e.g. Lavender Honey"
                    required
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#49473f' }}>Price ($)</label>
                    <input
                      type="number"
                      value={newProduct.unit_price}
                      onChange={(e) => setNewProduct({ ...newProduct, unit_price: +e.target.value })}
                      placeholder="0.00"
                      required
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#49473f' }}>Stock</label>
                    <input
                      type="number"
                      value={newProduct.units_in_stock}
                      onChange={(e) => setNewProduct({ ...newProduct, units_in_stock: +e.target.value })}
                      placeholder="0"
                      required
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#49473f' }}>Quantity Per Unit</label>
                  <input
                    type="text"
                    value={newProduct.quantity_per_unit}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity_per_unit: e.target.value })}
                    placeholder="e.g. 10 boxes"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-medium text-white mt-2"
                  style={{ backgroundColor: '#625e50' }}
                >
                  Add Product
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}