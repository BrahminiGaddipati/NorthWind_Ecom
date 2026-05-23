'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import TopNav from '../../../components/layout/TopNav';
import api from '../../../lib/api';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, stockRes] = await Promise.all([
          api.get('/orders/stats'),
          api.get('/orders'),
          api.get('/reports/low-stock'),
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data.slice(0, 5));
        setLowStock(stockRes.data.slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="Overview" />
        <div className="p-6 space-y-6">

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Orders', value: stats?.total_orders || 0, icon: '🛍️', color: '#faf3e1' },
              { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: '⏳', color: '#faf3e1' },
              { label: 'Shipped Orders', value: stats?.shipped_orders || 0, icon: '🚚', color: '#faf3e1' },
              { label: 'Total Freight', value: `$${parseFloat(stats?.total_freight || 0).toFixed(2)}`, icon: '💰', color: '#faf3e1' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border"
                style={{ borderColor: '#cbc6bb' }}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <p className="text-sm" style={{ color: '#49473f' }}>{stat.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1c1b1a' }}>{stat.value}</p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
              style={{ borderColor: '#cbc6bb' }}>
              <div className="p-4 border-b" style={{ borderColor: '#cbc6bb' }}>
                <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ backgroundColor: '#faf3e1' }}>
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Order ID</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Customer</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Status</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                    {loading ? (
                      <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                    ) : orders.map((order) => (
                      <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: '#625e50' }}>
                          #{order.order_id}
                        </td>
                        <td className="px-4 py-3 text-sm">{order.customer_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            order.shipped_date
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.shipped_date ? 'Shipped' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#49473f' }}>
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
              style={{ borderColor: '#cbc6bb' }}>
              <div className="p-4 border-b" style={{ borderColor: '#cbc6bb' }}>
                <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>⚠️ Low Stock Alerts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ backgroundColor: '#faf3e1' }}>
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Product</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Stock</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Reorder Level</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                    {loading ? (
                      <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                    ) : lowStock.map((product) => (
                      <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">{product.product_name}</td>
                        <td className="px-4 py-3 text-sm font-bold" style={{ color: '#ba1a1a' }}>
                          {product.units_in_stock}
                        </td>
                        <td className="px-4 py-3 text-sm">{product.reorder_level}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#49473f' }}>
                          {product.supplier_name}
                        </td>
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