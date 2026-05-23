'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function SupplierAddProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [quantityPerUnit, setQuantityPerUnit] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [unitsInStock, setUnitsInStock] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(10);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].category_id.toString());
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load categories catalog.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error('Please select a product category.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/products', {
        product_name: productName,
        supplier_id: 1, // Demarcating default supplier ID 1
        category_id: parseInt(categoryId),
        quantity_per_unit: quantityPerUnit,
        unit_price: unitPrice,
        units_in_stock: unitsInStock,
        reorder_level: reorderLevel,
        discontinued: 0,
        units_on_order: 0
      });
      toast.success(`${productName} registered in catalog!`);
      
      setTimeout(() => {
        router.push('/dashboard/supplier/products');
      }, 1500);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add product to catalog.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Sidebar />
      <Toaster position="top-right" />
      
      <main className="ml-[280px] min-h-screen w-full flex flex-col">
        <TopNav title="Add Product" />
        
        <div className="p-6 space-y-6 flex-1 max-w-2xl">
          <div className="glass-panel p-6 rounded-xl">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900">
                Register New Catalog Product
              </h3>
              <p className="text-2xs text-slate-500 mt-1">
                Provide details to list your manufactured product inside the Northwind global directory.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Grandma's Boysenberry Spread"
                  className="premium-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Category Selection
                  </label>
                  {loadingCategories ? (
                    <p className="text-2xs text-slate-400">Loading classifications...</p>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="premium-input text-xs"
                    >
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Quantity Per Unit (Packaging)
                  </label>
                  <input
                    type="text"
                    required
                    value={quantityPerUnit}
                    onChange={(e) => setQuantityPerUnit(e.target.value)}
                    placeholder="e.g. 12 - 8 oz jars"
                    className="premium-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                    placeholder="e.g. 18.50"
                    className="premium-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={unitsInStock}
                    onChange={(e) => setUnitsInStock(parseInt(e.target.value))}
                    placeholder="e.g. 120"
                    className="premium-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    required
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(parseInt(e.target.value))}
                    placeholder="e.g. 10"
                    className="premium-input text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/supplier/products')}
                  className="premium-btn-secondary py-2 px-5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="premium-btn-primary py-2 px-6 text-xs font-semibold shadow-md shadow-[#7c6f50]/15"
                >
                  {submitting ? 'Adding Product...' : 'Register Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
