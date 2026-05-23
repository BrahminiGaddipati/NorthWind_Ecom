'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/layout/Sidebar';
import TopNav from '../../../../components/layout/TopNav';
import api from '../../../../lib/api';

export default function EmployeeShippers() {
  const [shippers, setShippers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shipping/shippers')
      .then(res => setShippers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex" style={{ backgroundColor: '#faf3e1' }}>
      <Sidebar />
      <main className="ml-[280px] min-h-screen w-full">
        <TopNav title="Shippers" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {loading ? (
              <p>Loading...</p>
            ) : shippers.map((shipper) => (
              <div key={shipper.shipper_id}
                className="bg-white p-5 rounded-xl shadow-sm border"
                style={{ borderColor: '#cbc6bb' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white"
                    style={{ backgroundColor: '#675e44' }}>
                    🚚
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#1c1b1a' }}>{shipper.company_name}</p>
                    <p className="text-sm" style={{ color: '#49473f' }}>{shipper.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#faf3e1' }}>
                    <p className="text-lg font-bold" style={{ color: '#1c1b1a' }}>{shipper.total_orders}</p>
                    <p className="text-xs" style={{ color: '#49473f' }}>Total</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef9c3' }}>
                    <p className="text-lg font-bold text-yellow-700">{shipper.pending_orders}</p>
                    <p className="text-xs text-yellow-600">Pending</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
                    <p className="text-lg font-bold text-green-700">{shipper.delivered_orders}</p>
                    <p className="text-xs text-green-600">Delivered</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}