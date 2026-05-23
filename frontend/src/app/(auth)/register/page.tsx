'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import { saveAuth, getDashboardRoute } from '../../../lib/auth';
import toast, { Toaster } from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { email, password, role });
      saveAuth(response.data);
      toast.success('Registration successful!');
      const route = getDashboardRoute(response.data.user.role);
      router.push(route);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10"
      style={{ backgroundColor: '#fdf8f6' }}>
      <Toaster position="top-right" />

      {/* Background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] blur-[120px] rounded-full"
          style={{ backgroundColor: 'rgba(239,225,193,0.3)' }}></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] blur-[100px] rounded-full"
          style={{ backgroundColor: 'rgba(250,243,225,0.5)' }}></div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center rounded-xl mb-4 shadow-lg"
            style={{ backgroundColor: '#31302f' }}>
            <span className="text-white text-2xl">📦</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#1c1b1a' }}>Northwind</h1>
          <p className="text-sm" style={{ color: '#49473f' }}>Supply Chain & Logistic Solutions</p>
        </div>

        {/* Register Card */}
        <div className="bg-white p-8 rounded-xl border shadow-lg" style={{ borderColor: '#cbc6bb' }}>
          <h2 className="text-xl font-semibold mb-1" style={{ color: '#1c1b1a' }}>Create Account</h2>
          <p className="text-sm mb-6" style={{ color: '#49473f' }}>Join the Northwind ecosystem today</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1c1b1a' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@northwind.com"
                required
                className="w-full px-4 py-2 rounded-lg border outline-none transition-all"
                style={{ borderColor: '#cbc6bb', backgroundColor: '#fdf8f6' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1c1b1a' }}>
                Your Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border outline-none transition-all"
                style={{ borderColor: '#cbc6bb', backgroundColor: '#fdf8f6' }}
              >
                <option value="customer">Customer</option>
                <option value="employee">Employee</option>
                <option value="supplier">Supplier</option>
                <option value="shipper">Shipper</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1c1b1a' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-lg border outline-none transition-all"
                style={{ borderColor: '#cbc6bb', backgroundColor: '#fdf8f6' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white transition-all mt-2"
              style={{ backgroundColor: '#675e44' }}
            >
              {loading ? 'Registering...' : 'Register →'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: '#cbc6bb' }}>
            <p className="text-sm" style={{ color: '#49473f' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-medium" style={{ color: '#625e50' }}>
                Login
              </Link>
            </p>
          </div>
        </div>

        <footer className="mt-6 text-center">
          <p className="text-xs" style={{ color: '#7a776e' }}>
            © 2024 Northwind E-Commerce. Sustainable Supply Chain Solutions.
          </p>
        </footer>
      </div>
    </main>
  );
}