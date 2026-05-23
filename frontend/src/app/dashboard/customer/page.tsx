'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../../components/layout/Sidebar';
import TopNav from '../../../components/layout/TopNav';
import api from '../../../lib/api';
import { getUser } from '../../../lib/auth';
import { useCartStore } from '../../../store/cartStore';

export default function CustomerDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const { items: cart, addToCart } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await api.get('/products');
        setProducts(productsRes.data.slice(0, 6));
        if (user?.id) {
          try {
            // Using ALFKI as a standard demo customer for orders list
            const ordersRes = await api.get(`/orders/customer/ALFKI`);
            setOrders(ordersRes.data.slice(0, 4));
          } catch {}
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Sidebar />
      <main className="ml-[280px] min-h-screen w-full flex flex-col">
        <TopNav title="Customer Dashboard" />
        <div className="p-6 space-y-6 flex-1">

          {/* Quick Welcome */}
          <div className="glass-panel p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
                Welcome back, {user?.email}!
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Explore Northwind's verified catalog, build your shipment cart, and track orders in real-time.
              </p>
            </div>
            <Link href="/dashboard/customer/products" className="premium-btn-primary text-xs">
              View Entire Catalog →
            </Link>
          </div>

          {/* Products + Cart Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Products Preview */}
            <div className="lg:col-span-2 glass-panel p-5 rounded-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text-main)' }}>
                  Featured Products
                </h3>
                <Link href="/dashboard/customer/products" className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 flex-1">
                {loading ? (
                  <p className="text-xs text-center py-10 col-span-3">Loading catalog...</p>
                ) : products.map((product) => (
                  <div key={product.product_id}
                    className="glass-card rounded-lg overflow-hidden flex flex-col justify-between">
                    <div className="h-28 flex items-center justify-center text-4xl"
                      style={{ backgroundColor: 'rgba(124, 111, 80, 0.05)' }}>
                      📦
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--color-primary)' }}>
                          {product.category_name}
                        </p>
                        <h4 className="font-bold text-sm mb-2 truncate" style={{ color: 'var(--color-text-main)' }}>
                          {product.product_name}
                        </h4>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                          ${parseFloat(product.unit_price).toFixed(2)}
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-sm font-semibold transition-all hover:scale-105"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Preview */}
            <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold" style={{ color: 'var(--color-text-main)' }}>My Cart</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: 'rgba(124, 111, 80, 0.15)', color: 'var(--color-primary)' }}>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl mb-2">🛒</span>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.product_id} className="flex gap-3 items-center pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: 'rgba(124, 111, 80, 0.05)' }}>
                          📦
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: 'var(--color-text-main)' }}>{item.product_name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>${item.unit_price} x {item.quantity}</p>
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                          ${(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t space-y-2.5" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                  <span className="font-semibold text-green-700">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-primary)' }}>${cartTotal.toFixed(2)}</span>
                </div>
                
                {cart.length > 0 ? (
                  <Link
                    href="/dashboard/customer/cart"
                    className="w-full py-2.5 rounded-lg font-medium text-white mt-2 text-xs text-center block transition-all"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Proceed to Checkout →
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg font-medium text-white/50 mt-2 text-xs cursor-not-allowed text-center"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  >
                    Cart is Empty
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Order History */}
          <section className="glass-panel rounded-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center"
              style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-bold text-base" style={{ color: 'var(--color-text-main)' }}>Recent Orders</h3>
              <Link href="/dashboard/customer/orders" className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                View All Orders
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th className="text-left">Order ID</th>
                    <th className="text-left">Date</th>
                    <th className="text-left">Ship To</th>
                    <th className="text-left">Shipper</th>
                    <th className="text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-xs">Loading orders...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-xs" style={{ color: 'var(--color-text-muted)' }}>No orders yet</td></tr>
                  ) : orders.map((order) => (
                    <tr key={order.order_id}>
                      <td className="font-bold" style={{ color: 'var(--color-primary)' }}>
                        #{order.order_id}
                      </td>
                      <td>
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td>{order.ship_city}, {order.ship_country}</td>
                      <td>{order.shipper_name}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.shipped_date
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.shipped_date ? 'Delivered' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}