'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

// Inner component that uses useSearchParams — must be wrapped in Suspense
function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId');

  const [orderId, setOrderId] = useState<string>(initialOrderId || '');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  const handleTrack = async (idToTrack: string) => {
    if (!idToTrack) {
      toast.error('Please enter a valid Order ID!');
      return;
    }
    setLoading(true);
    setSearched(true);
    setTrackingInfo(null);
    try {
      const res = await api.get(`/shipping/orders/${idToTrack}/tracking`);
      setTrackingInfo(res.data);
    } catch (error) {
      console.error(error);
      toast.error(`No tracking information found for Order #${idToTrack}`);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (!trackingInfo) return 'upcoming';
    const isShipped = !!trackingInfo.shipped_date;
    const isDelivered = trackingInfo.tracking_status === 'Delivered';

    if (step === 1) return 'completed';
    if (step === 2) return isShipped || isDelivered ? 'completed' : 'active';
    if (step === 3) {
      if (isDelivered) return 'completed';
      return isShipped ? 'active' : 'upcoming';
    }
    if (step === 4) return isDelivered ? 'completed' : 'upcoming';
    return 'upcoming';
  };

  const stepDotClass = (step: number) => {
    const status = getStepStatus(step);
    if (status === 'completed') return 'bg-green-700';
    if (status === 'active') return 'bg-amber-600 animate-pulse';
    return 'bg-slate-300';
  };

  return (
    <div className="p-6 space-y-6 flex-1">
      {/* Tracking Search Bar */}
      <div className="glass-panel p-5 rounded-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
          Enter Order Reference ID
        </h3>
        <div className="flex gap-3 max-w-lg">
          <input
            type="number"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack(orderId)}
            placeholder="e.g. 10248"
            className="premium-input text-xs"
          />
          <button
            onClick={() => handleTrack(orderId)}
            className="premium-btn-primary py-2 px-6 text-xs font-semibold whitespace-nowrap"
          >
            Track Cargo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-sm font-semibold animate-pulse" style={{ color: 'var(--color-primary)' }}>
            Connecting to logistic telemetry...
          </p>
        </div>
      ) : trackingInfo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Timeline + Ledger */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stepper Timeline */}
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-base font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
                Transit Timeline — Order #{trackingInfo.order_id}
              </h3>

              <div className="relative pl-8 space-y-8 border-l-2 ml-3" style={{ borderColor: 'var(--color-border)' }}>
                {[
                  {
                    step: 1,
                    title: 'Order Placed & Registered',
                    desc: `Received on ${new Date(trackingInfo.order_date).toLocaleString()}`
                  },
                  {
                    step: 2,
                    title: 'Cargo Prepared in Warehouse',
                    desc: 'Items sorted, quality verified, and packed.'
                  },
                  {
                    step: 3,
                    title: 'Dispatched & In Transit',
                    desc: trackingInfo.shipped_date
                      ? `Shipped via ${trackingInfo.shipper_name || 'Logistic Partner'} on ${new Date(trackingInfo.shipped_date).toLocaleString()}`
                      : 'Awaiting carrier pick-up.'
                  },
                  {
                    step: 4,
                    title: 'Delivered',
                    desc: `Estimated: ${new Date(trackingInfo.required_date).toLocaleDateString()}`
                  }
                ].map(({ step, title, desc }) => (
                  <div key={step} className="relative">
                    <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${stepDotClass(step)}`}>
                      {getStepStatus(step) === 'completed' ? '✓' : step}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Ledger */}
            <div className="glass-panel p-5 rounded-xl text-xs space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wide">Shipment Ledger</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Carrier', value: trackingInfo.shipper_name || 'Standard Carrier' },
                  { label: 'Carrier Phone', value: trackingInfo.shipper_phone || '—' },
                  { label: 'Destination Name', value: trackingInfo.ship_name },
                  {
                    label: 'Delivery Address',
                    value: `${trackingInfo.ship_address}, ${trackingInfo.ship_city}, ${trackingInfo.ship_country}`
                  }
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
                    <p className="font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Telemetry Map Panel */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">📍 Satellite Telemetry</h3>

            <div className="h-64 rounded-lg bg-slate-900 flex flex-col justify-between p-4 relative overflow-hidden border">
              {/* Grid dots background */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              />

              <div className="z-10 flex justify-between items-start">
                <span className="text-[8px] uppercase font-bold tracking-widest text-[#a39474] bg-black/50 px-2 py-1 rounded">
                  GPS Feed Active
                </span>
                <span className="text-[9px] font-mono text-slate-400 bg-black/50 px-2 py-1 rounded">
                  {trackingInfo.latitude ? `${parseFloat(trackingInfo.latitude).toFixed(4)}° N` : 'N/A'}<br />
                  {trackingInfo.longitude ? `${parseFloat(trackingInfo.longitude).toFixed(4)}° E` : 'N/A'}
                </span>
              </div>

              {/* SVG Route Mock */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M20,80 Q50,30 80,20" fill="none" stroke="rgba(124,111,80,0.4)" strokeWidth="1.5" strokeDasharray="3,3" />
                  <circle cx="20" cy="80" r="3" fill="#94a3b8" />
                  <text x="20" y="88" fill="#94a3b8" fontSize="5" textAnchor="middle">Origin</text>
                  <circle cx="80" cy="20" r="3" fill="#c62828" />
                  <text x="80" y="14" fill="#c62828" fontSize="5" textAnchor="middle">Destination</text>
                  {trackingInfo.latitude && trackingInfo.longitude && (
                    <circle cx="48" cy="45" r="4.5" fill="#f57c00" />
                  )}
                </svg>
              </div>

              <div className="z-10 bg-black/60 p-2.5 rounded-lg border border-white/5 text-[9px] text-slate-300">
                <p className="font-bold text-white uppercase tracking-wide mb-0.5">Telemetry Coordinates</p>
                <p>Status: <span className="text-[#a39474] font-semibold">{trackingInfo.tracking_status || 'In Transit'}</span></p>
                <p>Lat: {trackingInfo.latitude || 'Pending GPS Lock'}</p>
                <p>Lng: {trackingInfo.longitude || 'Pending GPS Lock'}</p>
              </div>
            </div>

            <div className="text-xs space-y-1.5 pt-2">
              <p className="font-bold text-slate-800">Status Narrative</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {trackingInfo.tracking_status === 'Delivered'
                  ? 'The cargo has successfully arrived at the destination. Verified and closed.'
                  : trackingInfo.shipped_date
                  ? 'Shipment is currently in transit. GPS telemetry active.'
                  : 'Invoice is awaiting logistics processing. Handover to dispatcher scheduled.'}
              </p>
            </div>
          </div>
        </div>
      ) : searched ? (
        <div className="glass-panel p-10 text-center rounded-xl">
          <span className="text-4xl mb-2 block">🔍</span>
          <p className="text-xs font-bold text-slate-800">No telemetry log returned</p>
          <p className="text-[10px] text-slate-500 mt-1">Check that the Order ID exists and has shipping telemetry attached.</p>
        </div>
      ) : (
        <div className="glass-panel p-16 text-center rounded-xl">
          <span className="text-5xl mb-4 block">📍</span>
          <h4 className="text-sm font-bold text-slate-800 mb-1">Global Logistics Tracking</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Submit an active order number above to view carrier logs, parcel checkpoints, and live transit maps.
          </p>
        </div>
      )}
    </div>
  );
}

// Outer page component — wraps TrackContent in Suspense to satisfy Next.js
export default function CustomerTrack() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Sidebar />
      <Toaster position="top-right" />
      <main className="ml-[280px] min-h-screen w-full flex flex-col">
        <TopNav title="Track Shipment" />
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-sm font-semibold animate-pulse" style={{ color: 'var(--color-primary)' }}>
              Loading tracking portal...
            </p>
          </div>
        }>
          <TrackContent />
        </Suspense>
      </main>
    </div>
  );
}
