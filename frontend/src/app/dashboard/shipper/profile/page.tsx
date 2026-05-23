'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function ShipperProfile() {
  const [shipper, setShipper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ company_name: '', phone: '' });

  useEffect(() => {
    api.get('/shipping/shippers/1')
      .then(res => {
        setShipper(res.data);
        setForm({
          company_name: res.data.company_name,
          phone: res.data.phone,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/shipping/shippers/1', form);
      toast.success('Profile updated successfully!');
      setEditing(false);
      setShipper({ ...shipper, ...form });
    } catch (error) {
      toast.error('Failed to update profile!');
    }
  };

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <Toaster position="top-right" />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="My Profile" />
        <div className="p-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border max-w-lg"
            style={{ borderColor: '#cbc6bb' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-bold"
                style={{ backgroundColor: '#675e44' }}>
                🚚
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>
                  {loading ? 'Loading...' : shipper?.company_name}
                </h3>
                <p className="text-sm" style={{ color: '#49473f' }}>Shipper Profile</p>
              </div>
            </div>

            {!editing ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#faf3e1' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#49473f' }}>Company Name</p>
                  <p className="font-medium">{shipper?.company_name}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#faf3e1' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#49473f' }}>Phone</p>
                  <p className="font-medium">{shipper?.phone}</p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="w-full py-3 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: '#675e44' }}
                >
                  ✏️ Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#49473f' }}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#49473f' }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: '#675e44' }}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 py-3 rounded-lg text-sm font-medium border"
                    style={{ borderColor: '#cbc6bb', color: '#49473f' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}