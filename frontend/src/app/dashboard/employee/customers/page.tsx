'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';

export default function EmployeeCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/reports/top-customers')
      .then(res => setCustomers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="Customers" />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
            style={{ borderColor: '#cbc6bb' }}>
            <div className="p-4 border-b flex justify-between items-center"
              style={{ borderColor: '#cbc6bb' }}>
              <h3 className="font-semibold text-lg" style={{ color: '#1c1b1a' }}>All Customers</h3>
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 rounded-lg border text-sm outline-none w-64"
                style={{ borderColor: '#cbc6bb', backgroundColor: '#faf3e1' }}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{ backgroundColor: '#faf3e1' }}>
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Company</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Contact</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Country</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Total Orders</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#49473f' }}>Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#cbc6bb' }}>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
                  ) : filtered.map((customer) => (
                    <tr key={customer.customer_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{customer.company_name}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#49473f' }}>{customer.contact_name}</td>
                      <td className="px-4 py-3 text-sm">{customer.country}</td>
                      <td className="px-4 py-3 text-sm">{customer.total_orders}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#625e50' }}>
                        ${parseFloat(customer.total_spent).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t text-sm" style={{ borderColor: '#cbc6bb', color: '#49473f' }}>
              Showing {filtered.length} customers
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}