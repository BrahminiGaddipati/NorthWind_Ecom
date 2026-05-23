'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';

export default function ShipperDeliveries() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shipping/shippers/1/orders')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="All Deliveries" />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
            style={{ borderColor: '#cbc6bb' }}>
            <div className="p-4 border-b" style={{ borderColor: '#cbc6bb' }}>
              <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>All Deliveries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{ backgroundColor: '#faf3e1' }}>
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Order ID</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Address</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>City</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Country</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Date</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>
                  ) : orders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#625e50' }}>#{order.order_id}</td>
                      <td className="px-4 py-3 text-sm">{order.customer_name}</td>
                      <td className="px-4 py-3 text-sm">{order.ship_address}</td>
                      <td className="px-4 py-3 text-sm">{order.ship_city}</td>
                      <td className="px-4 py-3 text-sm">{order.ship_country}</td>
                      <td className="px-4 py-3 text-sm">{new Date(order.order_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Late' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
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
      </main>
    </div>
  );
}