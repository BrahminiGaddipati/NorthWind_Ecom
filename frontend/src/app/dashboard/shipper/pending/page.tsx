'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function ShipperPending() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/shipping/shippers/1/pending');
      setOrders(res.data);
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
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order!');
    }
  };

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <Toaster position="top-right" />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="Pending Deliveries" />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
            style={{ borderColor: '#cbc6bb' }}>
            <div className="p-4 border-b" style={{ borderColor: '#cbc6bb' }}>
              <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>
                ⏳ Pending Deliveries
              </h3>
            </div>
            {loading ? (
              <p className="p-4 text-center">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="p-8 text-center text-sm" style={{ color: '#49473f' }}>
                🎉 No pending deliveries!
              </p>
            ) : (
              <div className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                {orders.map((order) => (
                  <div key={order.order_id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-semibold" style={{ color: '#625e50' }}>
                          Order #{order.order_id}
                        </p>
                        <p className="text-sm font-medium">{order.customer_name}</p>
                        <p className="text-sm" style={{ color: '#49473f' }}>
                          📍 {order.ship_address}, {order.ship_city}, {order.ship_country}
                        </p>
                        <p className="text-sm" style={{ color: '#49473f' }}>
                          📞 {order.customer_phone}
                        </p>
                        <p className="text-xs" style={{ color: '#7a776e' }}>
                          Required by: {new Date(order.required_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs" style={{ color: '#7a776e' }}>
                          Freight: ${order.freight}
                        </p>
                      </div>
                      <button
                        onClick={() => markAsShipped(order.order_id)}
                        className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all"
                        style={{ backgroundColor: '#675e44' }}
                      >
                        ✅ Mark as Shipped
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}