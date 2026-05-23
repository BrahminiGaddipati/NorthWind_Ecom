'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import TopNav from '../../../components/layout/TopNav';
import api from '../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function ShipperDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, pendingRes] = await Promise.all([
        api.get('/shipping/stats'),
        api.get('/shipping/shippers/1/orders'),
        api.get('/shipping/shippers/1/pending'),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data.slice(0, 5));
      setPending(pendingRes.data.slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsShipped = async (orderId: number) => {
    try {
      await api.put(`/shipping/orders/${orderId}/ship`, {
        shipped_date: new Date().toISOString(),
      });
      toast.success(`Order #${orderId} marked as shipped!`);
      fetchData();
    } catch (error: any) {
      toast.error('Failed to update order!');
    }
  };

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <Toaster position="top-right" />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="Shipper Dashboard" />
        <div className="p-6 space-y-6">

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Orders', value: stats?.total_orders || 0, icon: '📦' },
              { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: '⏳' },
              { label: 'Delivered Orders', value: stats?.delivered_orders || 0, icon: '✅' },
              { label: 'Late Orders', value: stats?.late_orders || 0, icon: '⚠️' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border"
                style={{ borderColor: '#cbc6bb' }}>
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-sm mt-2" style={{ color: '#49473f' }}>{stat.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1c1b1a' }}>{stat.value}</p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Pending Deliveries */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
              style={{ borderColor: '#cbc6bb' }}>
              <div className="p-4 border-b" style={{ borderColor: '#cbc6bb' }}>
                <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>
                  ⏳ Pending Deliveries
                </h3>
              </div>
              <div className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                {loading ? (
                  <p className="p-4 text-center">Loading...</p>
                ) : pending.length === 0 ? (
                  <p className="p-4 text-center text-sm" style={{ color: '#49473f' }}>
                    No pending deliveries!
                  </p>
                ) : pending.map((order) => (
                  <div key={order.order_id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#625e50' }}>
                          Order #{order.order_id}
                        </p>
                        <p className="text-sm" style={{ color: '#1c1b1a' }}>
                          {order.customer_name}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#49473f' }}>
                          📍 {order.ship_address}, {order.ship_city}, {order.ship_country}
                        </p>
                        <p className="text-xs" style={{ color: '#49473f' }}>
                          📞 {order.customer_phone}
                        </p>
                      </div>
                      <button
                        onClick={() => markAsShipped(order.order_id)}
                        className="px-3 py-2 rounded-lg text-white text-xs font-medium"
                        style={{ backgroundColor: '#675e44' }}
                      >
                        Mark Shipped
                      </button>
                    </div>
                    <p className="text-xs" style={{ color: '#49473f' }}>
                      Required by: {new Date(order.required_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* All Deliveries */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
              style={{ borderColor: '#cbc6bb' }}>
              <div className="p-4 border-b" style={{ borderColor: '#cbc6bb' }}>
                <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>
                  🚚 All Deliveries
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ backgroundColor: '#faf3e1' }}>
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Order</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Customer</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>City</th>
                      <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Status</th>
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
                        <td className="px-4 py-3 text-sm">{order.ship_city}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'Late'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Update Location */}
          <div className="bg-white p-5 rounded-xl shadow-sm border"
            style={{ borderColor: '#cbc6bb' }}>
            <h3 className="font-semibold text-lg mb-4" style={{ color: '#1c1b1a' }}>
              📍 Update Delivery Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#49473f' }}>
                  Order ID
                </label>
                <input
                  type="number"
                  placeholder="Enter order ID"
                  id="locationOrderId"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#49473f' }}>
                  Latitude
                </label>
                <input
                  type="number"
                  placeholder="e.g. 17.3850"
                  id="latitude"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#49473f' }}>
                  Longitude
                </label>
                <input
                  type="number"
                  placeholder="e.g. 78.4867"
                  id="longitude"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                />
              </div>
            </div>
            <button
              className="mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#675e44' }}
              onClick={async () => {
                const orderId = (document.getElementById('locationOrderId') as HTMLInputElement).value;
                const lat = (document.getElementById('latitude') as HTMLInputElement).value;
                const lng = (document.getElementById('longitude') as HTMLInputElement).value;
                if (!orderId || !lat || !lng) {
                  toast.error('Please fill all fields!');
                  return;
                }
                try {
                  await api.put(`/shipping/orders/${orderId}/location`, {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng),
                    tracking_status: 'In Transit',
                  });
                  toast.success('Location updated successfully!');
                } catch (error) {
                  toast.error('Failed to update location!');
                }
              }}
            >
              Update Location
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}