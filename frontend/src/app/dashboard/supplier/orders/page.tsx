'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function SupplierOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Details Modal
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Fetch orders containing products from supplier ID 1
      const res = await api.get('/orders/supplier/1');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve incoming orders log.');
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetail = async (orderId: number) => {
    setSelectedOrderId(orderId);
    setLoadingDetail(true);
    setOrderDetail(null);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrderDetail(res.data);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to load order invoice details for #${orderId}`);
      setSelectedOrderId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeOrderDetail = () => {
    setSelectedOrderId(null);
    setOrderDetail(null);
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Sidebar />
      <Toaster position="top-right" />
      
      <main className="ml-[280px] min-h-screen w-full flex flex-col">
        <TopNav title="Incoming Orders" />
        
        <div className="p-6 space-y-6 flex-1">
          <div className="glass-panel p-5 rounded-xl">
            <div className="mb-4">
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-main)' }}>
                Shipments Log
              </h3>
              <p className="text-2xs text-slate-500 mt-1">
                A listing of customer orders containing products supplied by your manufactory.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th className="text-left">Order ID</th>
                    <th className="text-left">Date Placed</th>
                    <th className="text-left">Customer</th>
                    <th className="text-left">Target Date</th>
                    <th className="text-left">Ship City</th>
                    <th className="text-left">Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-10 text-xs">Loading order log...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-xs text-slate-500">No matching orders received yet.</td></tr>
                  ) : orders.map((order) => {
                    const isShipped = !!order.shipped_date;

                    return (
                      <tr key={order.order_id}>
                        <td className="font-bold text-slate-900">
                          #{order.order_id}
                        </td>
                        <td>
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>
                        <td className="font-medium text-slate-700">{order.customer_name}</td>
                        <td>
                          {new Date(order.required_date).toLocaleDateString()}
                        </td>
                        <td>{order.ship_city}, {order.ship_country}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isShipped
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isShipped ? 'Shipped' : 'Pending'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => openOrderDetail(order.order_id)}
                            className="premium-btn-secondary py-1 px-3 text-[10px] uppercase font-bold"
                          >
                            View Items
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

      {/* Invoice Modal Overlay */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-950">
                Supply Manifest for Order #{selectedOrderId}
              </h3>
              <button onClick={closeOrderDetail} className="text-slate-500 hover:text-slate-900 font-bold text-lg">✕</button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {loadingDetail && (
                <div className="py-12 text-center text-xs font-semibold animate-pulse" style={{ color: 'var(--color-primary)' }}>
                  Loading supply items list...
                </div>
              )}

              {orderDetail && (
                <>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <p><strong className="text-slate-600">Client:</strong> {orderDetail.customer_name}</p>
                    <p><strong className="text-slate-600">Destination:</strong> {orderDetail.ship_address}, {orderDetail.ship_city}, {orderDetail.ship_country}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-800 mb-2 uppercase tracking-wide">Ordered Products</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 border-b">
                          <tr>
                            <th className="p-2 font-bold text-slate-600">Item</th>
                            <th className="p-2 font-bold text-slate-600 text-center">Quantity</th>
                            <th className="p-2 font-bold text-slate-600 text-right">Price</th>
                            <th className="p-2 font-bold text-slate-600 text-right">Discount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {orderDetail.items.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="p-2 font-semibold text-slate-800">{item.product_name}</td>
                              <td className="p-2 text-center font-bold text-slate-700">{item.quantity}</td>
                              <td className="p-2 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                              <td className="p-2 text-right">{(parseFloat(item.discount) * 100).toFixed(0)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="px-5 py-3 border-t flex justify-end">
              <button onClick={closeOrderDetail} className="premium-btn-primary py-1.5 px-4 text-xs font-semibold">
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
