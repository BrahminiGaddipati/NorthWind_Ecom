'use client';

import { useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function ShipperLocation() {
  const [orderId, setOrderId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState('In Transit');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const getMyLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported!');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        toast.success('Location detected!');
        setLocating(false);
      },
      () => {
        toast.error('Could not get location!');
        setLocating(false);
      }
    );
  };

  const updateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !latitude || !longitude) {
      toast.error('Please fill all fields!');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/shipping/orders/${orderId}/location`, {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        tracking_status: status,
      });
      toast.success('Location updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update location!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <Toaster position="top-right" />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="Update Location" />
        <div className="p-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border max-w-lg"
            style={{ borderColor: '#cbc6bb' }}>
            <h3 className="font-semibold text-lg mb-6" style={{ color: '#1c1b1a' }}>
              📍 Update Delivery Location
            </h3>
            <form onSubmit={updateLocation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#49473f' }}>
                  Order ID
                </label>
                <input
                  type="number"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter order ID"
                  required
                  className="w-full px-4 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#49473f' }}>
                  Tracking Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                >
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#49473f' }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 17.3850"
                    step="any"
                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#49473f' }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 78.4867"
                    step="any"
                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={getMyLocation}
                disabled={locating}
                className="w-full py-2 rounded-lg border text-sm font-medium transition-all"
                style={{ borderColor: '#675e44', color: '#675e44' }}
              >
                {locating ? 'Detecting...' : '📍 Get My Current Location'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white text-sm font-medium transition-all"
                style={{ backgroundColor: '#675e44' }}
              >
                {loading ? 'Updating...' : 'Update Location'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}