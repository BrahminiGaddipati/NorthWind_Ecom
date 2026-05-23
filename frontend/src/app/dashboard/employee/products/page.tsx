'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';

export default function EmployeeProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="Products" />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
            style={{ borderColor: '#cbc6bb' }}>
            <div className="p-4 border-b flex justify-between items-center"
              style={{ borderColor: '#cbc6bb' }}>
              <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>All Products</h3>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 rounded-lg border text-sm outline-none w-64"
                style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{ backgroundColor: '#faf3e1' }}>
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Product</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Category</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Supplier</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Price</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Stock</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                  ) : filtered.map((product) => (
                    <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{product.product_name}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#49473f' }}>{product.category_name}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#49473f' }}>{product.supplier_name}</td>
                      <td className="px-4 py-3 text-sm">${product.unit_price}</td>
                      <td className="px-4 py-3 text-sm font-bold"
                        style={{ color: product.units_in_stock <= product.reorder_level ? '#ba1a1a' : '#1c1b1a' }}>
                        {product.units_in_stock}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          product.discontinued
                            ? 'bg-gray-100 text-gray-600'
                            : product.units_in_stock <= product.reorder_level
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.discontinued ? 'Discontinued' :
                           product.units_in_stock <= product.reorder_level ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t text-sm" style={{ borderColor: '#cbc6bb', color: '#49473f' }}>
              Showing {filtered.length} of {products.length} products
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}