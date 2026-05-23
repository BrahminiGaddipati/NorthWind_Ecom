'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function EmployeeOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'pending') return !order.shipped_date;
    if (filter === 'shipped') return !!order.shipped_date;
    return true;
  });

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <Toaster position="top-right" />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="All Orders" />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
            style={{ borderColor: '#cbc6bb' }}>
            <div className="p-4 border-b flex justify-between items-center"
              style={{ borderColor: '#cbc6bb' }}>
              <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>All Orders</h3>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{ backgroundColor: '#faf3e1' }}>
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Order ID</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Employee</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Shipper</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Date</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Freight</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>
                  ) : filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#625e50' }}>
                        #{order.order_id}
                      </td>
                      <td className="px-4 py-3 text-sm">{order.customer_name}</td>
                      <td className="px-4 py-3 text-sm">{order.employee_name}</td>
                      <td className="px-4 py-3 text-sm">{order.shipper_name}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">${order.freight}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.shipped_date
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.shipped_date ? 'Shipped' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t text-sm" style={{ borderColor: '#cbc6bb', color: '#49473f' }}>
              Showing {filteredOrders.length} orders
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}