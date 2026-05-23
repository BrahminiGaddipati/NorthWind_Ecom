'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';

export default function EmployeeReports() {
  const [summary, setSummary] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [byCountry, setByCountry] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/sales-summary'),
      api.get('/reports/top-products'),
      api.get('/reports/sales-by-category'),
      api.get('/reports/sales-by-country'),
      api.get('/reports/top-customers'),
    ]).then(([summaryRes, productsRes, categoryRes, countryRes, customersRes]) => {
      setSummary(summaryRes.data[0]);
      setTopProducts(productsRes.data.slice(0, 5));
      setByCategory(categoryRes.data);
      setByCountry(countryRes.data.slice(0, 5));
      setTopCustomers(customersRes.data.slice(0, 5));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="Reports" />
        <div className="p-6 space-y-6">

          {/* Sales Summary */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Orders', value: summary?.total_orders || 0, icon: '📦' },
              { label: 'Total Customers', value: summary?.total_customers || 0, icon: '👥' },
              { label: 'Total Revenue', value: `$${parseFloat(summary?.total_revenue || 0).toFixed(2)}`, icon: '💰' },
              { label: 'Avg Order Value', value: `$${parseFloat(summary?.avg_order_value || 0).toFixed(2)}`, icon: '📊' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border"
                style={{ borderColor: '#cbc6bb' }}>
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-sm mt-2" style={{ color: '#49473f' }}>{stat.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1c1b1a' }}>
                  {loading ? '...' : stat.value}
                </p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top Products */}
            <div className="bg-white p-5 rounded-xl shadow-sm border"
              style={{ borderColor: '#cbc6bb' }}>
              <h3 className="font-semibold text-lg mb-4" style={{ color: '#1c1b1a' }}>
                🏆 Top 5 Products
              </h3>
              <div className="space-y-3">
                {loading ? <p>Loading...</p> : topProducts.map((product, i) => (
                  <div key={product.product_id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{i + 1}. {product.product_name}</span>
                      <span style={{ color: '#49473f' }}>{product.total_sold} sold</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#f1edea' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: '#675e44',
                          width: `${(product.total_sold / topProducts[0]?.total_sold) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales by Category */}
            <div className="bg-white p-5 rounded-xl shadow-sm border"
              style={{ borderColor: '#cbc6bb' }}>
              <h3 className="font-semibold text-lg mb-4" style={{ color: '#1c1b1a' }}>
                📂 Sales by Category
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ backgroundColor: '#faf3e1' }}>
                    <tr>
                      <th className="px-3 py-2 text-xs font-semibold" style={{ color: '#49473f' }}>Category</th>
                      <th className="px-3 py-2 text-xs font-semibold" style={{ color: '#49473f' }}>Orders</th>
                      <th className="px-3 py-2 text-xs font-semibold" style={{ color: '#49473f' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                    {loading ? (
                      <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
                    ) : byCategory.map((cat) => (
                      <tr key={cat.category_name} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium">{cat.category_name}</td>
                        <td className="px-3 py-2 text-sm">{cat.total_orders}</td>
                        <td className="px-3 py-2 text-sm">${parseFloat(cat.total_revenue).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white p-5 rounded-xl shadow-sm border"
              style={{ borderColor: '#cbc6bb' }}>
              <h3 className="font-semibold text-lg mb-4" style={{ color: '#1c1b1a' }}>
                👑 Top 5 Customers
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ backgroundColor: '#faf3e1' }}>
                    <tr>
                      <th className="px-3 py-2 text-xs font-semibold" style={{ color: '#49473f' }}>Company</th>
                      <th className="px-3 py-2 text-xs font-semibold" style={{ color: '#49473f' }}>Orders</th>
                      <th className="px-3 py-2 text-xs font-semibold" style={{ color: '#49473f' }}>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                    {loading ? (
                      <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
                    ) : topCustomers.map((customer) => (
                      <tr key={customer.customer_id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium">{customer.company_name}</td>
                        <td className="px-3 py-2 text-sm">{customer.total_orders}</td>
                        <td className="px-3 py-2 text-sm">${parseFloat(customer.total_spent).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sales by Country */}
            <div className="bg-white p-5 rounded-xl shadow-sm border"
              style={{ borderColor: '#cbc6bb' }}>
              <h3 className="font-semibold text-lg mb-4" style={{ color: '#1c1b1a' }}>
                🌍 Sales by Country
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ backgroundColor: '#faf3e1' }}>
                    <tr>
                      <th className="px-3 py-2 text-xs font-semibold" style={{ color: '#49473f' }}>Country</th>
                      <th className="px-3 py-2 text-xs font-semibold" style={{ color: '#49473f' }}>Orders</th>
                      <th className="px-3 py-2 text-xs font-semibold" style={{ color: '#49473f' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                    {loading ? (
                      <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
                    ) : byCountry.map((country) => (
                      <tr key={country.ship_country} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium">{country.ship_country}</td>
                        <td className="px-3 py-2 text-sm">{country.total_orders}</td>
                        <td className="px-3 py-2 text-sm">${parseFloat(country.total_revenue).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}