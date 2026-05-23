'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout, getUser } from '../../lib/auth';

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

const customerLinks: SidebarItem[] = [
  { label: 'Dashboard', href: '/dashboard/customer', icon: '🏠' },
  { label: 'Browse Products', href: '/dashboard/customer/products', icon: '🛍️' },
  { label: 'My Cart', href: '/dashboard/customer/cart', icon: '🛒' },
  { label: 'My Orders', href: '/dashboard/customer/orders', icon: '📦' },
  { label: 'Track Order', href: '/dashboard/customer/track', icon: '📍' },
];

const employeeLinks: SidebarItem[] = [
  { label: 'Overview', href: '/dashboard/employee', icon: '📊' },
  { label: 'All Orders', href: '/dashboard/employee/orders', icon: '📋' },
  { label: 'Products', href: '/dashboard/employee/products', icon: '🏷️' },
  { label: 'Customers', href: '/dashboard/employee/customers', icon: '👥' },
  { label: 'Reports', href: '/dashboard/employee/reports', icon: '📈' },
  { label: 'Shippers', href: '/dashboard/employee/shippers', icon: '🚚' },
];

const supplierLinks: SidebarItem[] = [
  { label: 'Overview', href: '/dashboard/supplier', icon: '📊' },
  { label: 'My Products', href: '/dashboard/supplier/products', icon: '📦' },
  { label: 'Add Product', href: '/dashboard/supplier/add-product', icon: '➕' },
  { label: 'Orders', href: '/dashboard/supplier/orders', icon: '🛒' },
  { label: 'Statistics', href: '/dashboard/supplier/stats', icon: '📈' },
];

const shipperLinks: SidebarItem[] = [
  { label: 'Overview', href: '/dashboard/shipper', icon: '📊' },
  { label: 'All Deliveries', href: '/dashboard/shipper/deliveries', icon: '🚚' },
  { label: 'Pending', href: '/dashboard/shipper/pending', icon: '⏳' },
  { label: 'Update Location', href: '/dashboard/shipper/location', icon: '📍' },
  { label: 'My Profile', href: '/dashboard/shipper/profile', icon: '👤' },
];

const getLinksByRole = (role: string) => {
  switch (role) {
    case 'customer': return customerLinks;
    case 'employee': return employeeLinks;
    case 'supplier': return supplierLinks;
    case 'shipper': return shipperLinks;
    default: return [];
  }
};

export default function Sidebar() {
  const pathname = usePathname();
  const user = getUser();
  const links = getLinksByRole(user?.role || '');

  return (
    <aside className="flex flex-col h-screen fixed left-0 top-0 w-[280px] z-50 border-r"
      style={{ 
        backgroundColor: '#171615',
        borderColor: 'rgba(255, 255, 255, 0.06)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)'
      }}>

      {/* Brand */}
      <div className="px-6 py-8 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#7c6f50] to-[#a39474] shadow-md shadow-[#7c6f50]/25">
            <span className="text-white text-xl">📦</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Northwind</h1>
            <p className="text-[10px] font-semibold tracking-widest text-[#a39474] uppercase">
              {user?.role} Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm hover:translate-x-1"
              style={{
                backgroundColor: isActive ? 'rgba(124, 111, 80, 0.15)' : 'transparent',
                color: isActive ? '#fbfaf8' : 'rgba(255, 255, 255, 0.55)',
                borderLeft: isActive ? '3px solid #7c6f50' : '3px solid transparent',
              }}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User info + Logout */}
      <div className="p-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-[#7c6f50] shadow-sm">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white font-semibold truncate">{user?.email}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg transition-all text-sm font-medium border border-white/10 text-white/75 hover:bg-white/5 hover:text-white"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}