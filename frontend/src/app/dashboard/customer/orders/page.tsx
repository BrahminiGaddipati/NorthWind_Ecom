'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function CustomerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Default to ALFKI customer for demo purpose
      const res = await api.get('/orders/customer/ALFKI');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load order history.');
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
      toast.error(`Failed to load order details for #${orderId}`);
      setSelectedOrderId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeOrderDetail = () => {
    setSelectedOrderId(null);
    setOrderDetail(null);
  };

  const computeOrderTotal = (items: any[], freight: string | number) => {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
    return subtotal + parseFloat(freight.toString() || '0');
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Sidebar />
      <Toaster position="top-right" />
      
      <main className="ml-[280px] min-h-screen w-full flex flex-col">
        <TopNav title="My Orders" />
        
        <div className="p-6 space-y-6 flex-1">
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="text-base font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>
              Shipment & Order History
            </h3>
            
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th className="text-left">Order ID</th>
                    <th className="text-left">Date Placed</th>
                    <th className="text-left">Shipped Date</th>
                    <th className="text-left">Delivery City</th>
                    <th className="text-left">Freight</th>
                    <th className="text-left">Carrier</th>
                    <th className="text-left">Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-10 text-xs">Loading order log...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-xs text-slate-500">No orders placed yet.</td></tr>
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
                        <td>
                          {order.shipped_date ? new Date(order.shipped_date).toLocaleDateString() : '—'}
                        </td>
                        <td>{order.ship_city}, {order.ship_country}</td>
                        <td className="font-semibold text-slate-600">${parseFloat(order.freight).toFixed(2)}</td>
                        <td>{order.shipper_name || 'Processing'}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isShipped
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isShipped ? 'Delivered' : 'Pending'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => openOrderDetail(order.order_id)}
                            className="premium-btn-secondary py-1 px-3 text-[10px] uppercase font-bold"
                          >
                            Details
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

      {/* Order Details Modal Overlay */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b flex justify-between items-center" style={{ backgroundColor: 'rgba(124, 111, 80, 0.05)' }}>
              <h3 className="font-bold text-sm text-slate-950">
                Order details for #{selectedOrderId}
              </h3>
              <button 
                onClick={closeOrderDetail}
                className="text-slate-500 hover:text-slate-900 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {loadingDetail && (
                <div className="py-12 text-center text-xs font-semibold animate-pulse" style={{ color: 'var(--color-primary)' }}>
                  Retrieving invoice items...
                </div>
              )}

              {orderDetail && (
                <>
                  {/* Summary grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg">
                    <div>
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1">Customer</p>
                      <p className="font-semibold text-slate-800">{orderDetail.customer_name}</p>
                      <p className="text-slate-500 mt-0.5">{orderDetail.customer_phone}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1">Shipping Target</p>
                      <p className="font-semibold text-slate-800">{orderDetail.ship_name}</p>
                      <p className="text-slate-500 mt-0.5">{orderDetail.ship_address}, {orderDetail.ship_city}, {orderDetail.ship_country}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1">Required Date</p>
                      <p className="font-semibold text-slate-800">{new Date(orderDetail.required_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1">Carrier Details</p>
                      <p className="font-semibold text-slate-800">{orderDetail.shipper_name || 'Standard Post'}</p>
                      <p className="text-slate-500 mt-0.5">{orderDetail.shipper_phone}</p>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 mb-2 uppercase tracking-wide">Ordered Items</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 border-b">
                          <tr>
                            <th className="p-2.5 font-bold text-slate-600">Product Name</th>
                            <th className="p-2.5 font-bold text-slate-600 text-right">Unit Price</th>
                            <th className="p-2.5 font-bold text-slate-600 text-center">Qty</th>
                            <th className="p-2.5 font-bold text-slate-600 text-right">Discount</th>
                            <th className="p-2.5 font-bold text-slate-600 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {orderDetail.items.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="p-2.5 font-semibold text-slate-800">{item.product_name}</td>
                              <td className="p-2.5 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                              <td className="p-2.5 text-center">{item.quantity}</td>
                              <td className="p-2.5 text-right">{(parseFloat(item.discount) * 100).toFixed(0)}%</td>
                              <td className="p-2.5 text-right font-bold" style={{ color: 'var(--color-primary)' }}>
                                ${parseFloat(item.total_price).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Final Pricing breakdown */}
                  <div className="flex justify-end pt-3 border-t text-xs">
                    <div className="w-64 space-y-1.5">
                      <div className="flex justify-between text-slate-500">
                        <span>Items Subtotal</span>
                        <span>
                          ${orderDetail.items.reduce((sum: number, item: any) => sum + parseFloat(item.total_price || 0), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Freight Carrier Charges</span>
                        <span>${parseFloat(orderDetail.freight).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-dashed">
                        <span>Grand Invoice Total</span>
                        <span style={{ color: 'var(--color-primary)' }}>
                          ${computeOrderTotal(orderDetail.items, orderDetail.freight).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t flex justify-end">
              <button
                onClick={closeOrderDetail}
                className="premium-btn-primary py-1.5 px-4 text-xs font-semibold"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
