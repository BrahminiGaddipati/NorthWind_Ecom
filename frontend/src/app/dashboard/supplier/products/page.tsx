'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function SupplierProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit Modal state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editReorder, setEditReorder] = useState<number>(10);
  const [editDiscontinued, setEditDiscontinued] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Using supplier ID 1 as standard demo supplier
      const res = await api.get('/products/supplier/1');
      setProducts(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve your product list.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (product: any) => {
    setEditingProduct(product);
    setEditPrice(parseFloat(product.unit_price));
    setEditStock(parseInt(product.units_in_stock));
    setEditReorder(parseInt(product.reorder_level || 10));
    setEditDiscontinued(parseInt(product.discontinued || 0));
  };

  const handleEditClose = () => {
    setEditingProduct(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setSaving(true);
    try {
      await api.put(`/products/${editingProduct.product_id}`, {
        product_name: editingProduct.product_name,
        unit_price: editPrice,
        units_in_stock: editStock,
        reorder_level: editReorder,
        discontinued: editDiscontinued,
      });
      toast.success('Product credentials updated successfully!');
      handleEditClose();
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update product details.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Sidebar />
      <Toaster position="top-right" />
      
      <main className="ml-[280px] min-h-screen w-full flex flex-col">
        <TopNav title="My Products" />
        
        <div className="p-6 space-y-6 flex-1">
          {/* Header controls */}
          <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-main)' }}>
              Supplier Inventory Log
            </h3>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Filter by name/category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="premium-input pl-10"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs opacity-60">🔍</span>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th className="text-left">Product Name</th>
                    <th className="text-left">Category</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-center">Units in Stock</th>
                    <th className="text-center">Reorder Level</th>
                    <th className="text-left">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-10 text-xs">Retrieving catalog records...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-xs text-slate-500">No products matching filters.</td></tr>
                  ) : filtered.map((product) => {
                    const isLowStock = product.units_in_stock <= product.reorder_level;
                    const isDiscontinued = product.discontinued === 1;

                    return (
                      <tr key={product.product_id} className={isDiscontinued ? 'opacity-65' : ''}>
                        <td className="font-bold text-slate-900">{product.product_name}</td>
                        <td>{product.category_name}</td>
                        <td className="text-right font-semibold">${parseFloat(product.unit_price).toFixed(2)}</td>
                        <td className={`text-center font-bold ${isLowStock && !isDiscontinued ? 'text-red-700' : 'text-slate-800'}`}>
                          {product.units_in_stock}
                        </td>
                        <td className="text-center text-slate-500">{product.reorder_level || '0'}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDiscontinued
                              ? 'bg-gray-100 text-gray-700'
                              : isLowStock
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isDiscontinued ? 'Discontinued' : isLowStock ? 'Low Stock' : 'Healthy'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => handleEditOpen(product)}
                            className="premium-btn-secondary py-1 px-3 text-[10px] uppercase font-bold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b flex justify-between items-center" style={{ backgroundColor: 'rgba(124, 111, 80, 0.05)' }}>
              <h3 className="font-bold text-sm text-slate-950">
                Update Inventory: {editingProduct.product_name}
              </h3>
              <button onClick={handleEditClose} className="text-slate-500 hover:text-slate-900 font-bold text-lg">
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave}>
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                    className="premium-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Units in Stock
                    </label>
                    <input
                      type="number"
                      required
                      value={editStock}
                      onChange={(e) => setEditStock(parseInt(e.target.value))}
                      className="premium-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Reorder Threshold
                    </label>
                    <input
                      type="number"
                      required
                      value={editReorder}
                      onChange={(e) => setEditReorder(parseInt(e.target.value))}
                      className="premium-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Discontinued Status
                  </label>
                  <select
                    value={editDiscontinued}
                    onChange={(e) => setEditDiscontinued(parseInt(e.target.value))}
                    className="premium-input text-xs"
                  >
                    <option value={0}>Active (Offered in Catalog)</option>
                    <option value={1}>Discontinued (Hidden from Shop)</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-5 py-3 border-t flex justify-end gap-2 bg-slate-50">
                <button
                  type="button"
                  onClick={handleEditClose}
                  className="premium-btn-secondary py-1.5 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="premium-btn-primary py-1.5 px-4 text-xs font-semibold"
                >
                  {saving ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
