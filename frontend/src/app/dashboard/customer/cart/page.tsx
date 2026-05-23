'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import { getUser } from '../../../../lib/auth';
import { useCartStore } from '../../../../store/cartStore';
import toast, { Toaster } from 'react-hot-toast';

export default function CustomerCart() {
  const router = useRouter();
  const user = getUser();
  const { items: cart, updateQuantity, removeFromCart, clearCart } = useCartStore();

  const [shippers, setShippers] = useState<any[]>([]);
  const [selectedShipper, setSelectedShipper] = useState<string>('');
  const [loadingShippers, setLoadingShippers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Checkout address fields
  const [shipName, setShipName] = useState('');
  const [shipAddress, setShipAddress] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipCountry, setShipCountry] = useState('');

  // Flat freight rate
  const freight = 12.50;

  useEffect(() => {
    // Pre-populate ship name from customer info if possible
    if (user?.email) {
      setShipName(user.email.split('@')[0].toUpperCase());
    }

    const fetchShippers = async () => {
      try {
        const res = await api.get('/shipping/shippers');
        setShippers(res.data);
        if (res.data.length > 0) {
          setSelectedShipper(res.data[0].shipper_id.toString());
        }
      } catch (error) {
        console.error('Failed to load shippers, using static fallback.', error);
        // Static fallback for Northwind Shippers
        const staticShippers = [
          { shipper_id: 1, company_name: 'Speedy Express', phone: '(503) 555-9831' },
          { shipper_id: 2, company_name: 'United Package', phone: '(503) 555-3199' },
          { shipper_id: 3, company_name: 'Federal Shipping', phone: '(503) 555-9931' }
        ];
        setShippers(staticShippers);
        setSelectedShipper('1');
      } finally {
        setLoadingShippers(false);
      }
    };

    fetchShippers();
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const grandTotal = cartTotal + freight;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    if (!selectedShipper) {
      toast.error('Please select a shipping carrier!');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer_id: 'ALFKI', // Demarcating default customer ID for the test users
        employee_id: 1,
        ship_via: parseInt(selectedShipper),
        freight: freight,
        ship_name: shipName,
        ship_address: shipAddress,
        ship_city: shipCity,
        ship_country: shipCountry,
        items: cart.map(item => ({
          product_id: item.product_id,
          unit_price: item.unit_price,
          quantity: item.quantity,
          discount: 0
        }))
      };

      const res = await api.post('/orders', orderPayload);
      toast.success(`Order placed successfully! Order ID: #${res.data.order_id}`);
      clearCart();
      
      // Redirect to tracking page for this order
      setTimeout(() => {
        router.push(`/dashboard/customer/track?orderId=${res.data.order_id}`);
      }, 1500);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Checkout failed! Verify form parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Sidebar />
      <Toaster position="top-right" />
      
      <main className="ml-[280px] min-h-screen w-full flex flex-col">
        <TopNav title="My Cart" />
        
        <div className="p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-panel p-5 rounded-xl">
                <h3 className="text-base font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>
                  Cart Contents ({cart.length} unique items)
                </h3>
                
                {cart.length === 0 ? (
                  <div className="py-16 text-center">
                    <span className="text-5xl block mb-3">🛒</span>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Your cart is empty</h4>
                    <p className="text-xs text-slate-500 mb-6">Explore the shop and add some items to your order.</p>
                    <button 
                      onClick={() => router.push('/dashboard/customer/products')}
                      className="premium-btn-primary text-xs"
                    >
                      Shop Products
                    </button>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                    {cart.map((item) => (
                      <div key={item.product_id} className="py-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                            style={{ backgroundColor: 'rgba(124, 111, 80, 0.06)' }}>
                            📦
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">{item.product_name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.category_name}</p>
                            <p className="text-xs font-semibold text-slate-700 mt-1">${parseFloat(item.unit_price.toString()).toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="flex items-center border rounded-lg bg-white/50 overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                              ${(item.unit_price * item.quantity).toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.product_id)}
                              className="text-[10px] text-red-500 hover:underline mt-1 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Checkout Form Card */}
            {cart.length > 0 && (
              <div className="glass-panel p-5 rounded-xl">
                <h3 className="text-base font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>
                  Delivery Details & Checkout
                </h3>
                
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Recipient / Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shipName}
                      onChange={(e) => setShipName(e.target.value)}
                      placeholder="e.g. ALFKI Corporation"
                      className="premium-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={shipAddress}
                      onChange={(e) => setShipAddress(e.target.value)}
                      placeholder="e.g. Obere Str. 57"
                      className="premium-input text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={shipCity}
                        onChange={(e) => setShipCity(e.target.value)}
                        placeholder="e.g. Berlin"
                        className="premium-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        required
                        value={shipCountry}
                        onChange={(e) => setShipCountry(e.target.value)}
                        placeholder="e.g. Germany"
                        className="premium-input text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Shipping Carrier
                    </label>
                    {loadingShippers ? (
                      <p className="text-xs text-slate-400">Loading carriers...</p>
                    ) : (
                      <select
                        value={selectedShipper}
                        onChange={(e) => setSelectedShipper(e.target.value)}
                        className="premium-input text-xs"
                      >
                        {shippers.map((s) => (
                          <option key={s.shipper_id} value={s.shipper_id}>
                            {s.company_name} {s.phone ? `(${s.phone})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Summary Block */}
                  <div className="pt-4 mt-4 border-t border-dashed space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Items Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Freight Charges</span>
                      <span>${freight.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <span>Total Shipment Price</span>
                      <span style={{ color: 'var(--color-primary)' }}>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full premium-btn-primary py-2.5 text-xs font-semibold mt-4 shadow-md shadow-[#7c6f50]/15"
                  >
                    {submitting ? 'Processing Shipment...' : 'Submit Order & Pay'}
                  </button>
                </form>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
