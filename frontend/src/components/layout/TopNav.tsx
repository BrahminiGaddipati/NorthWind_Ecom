'use client';

import { getUser } from '../../lib/auth';

interface TopNavProps {
  title: string;
}

export default function TopNav({ title }: TopNavProps) {
  const user = getUser();

  return (
    <header
      className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ 
        backgroundColor: 'rgba(249, 248, 246, 0.85)', 
        borderColor: 'rgba(124, 111, 80, 0.15)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
      }}
    >
      {/* Title */}
      <h2 className="text-xl font-bold tracking-tight" style={{ color: '#1c1b1a' }}>
        {title}
      </h2>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Quick search..."
            className="pl-9 pr-4 py-2 rounded-full text-xs outline-none border transition-all w-60 focus:w-72 focus:border-[#7c6f50] focus:ring-2 focus:ring-[#7c6f50]/15"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderColor: 'rgba(124, 111, 80, 0.25)',
              color: '#1c1b1a',
            }}
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs opacity-60">
            🔍
          </span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full transition-all hover:bg-black/5"
          style={{ color: '#49473f' }}>
          <span>🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#c62828' }}></span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3 pl-2 border-l" style={{ borderColor: 'rgba(124, 111, 80, 0.15)' }}>
          <div
            className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#7c6f50] shadow-sm"
          >
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold leading-tight" style={{ color: '#1c1b1a' }}>
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] uppercase font-bold text-black/40 tracking-wider">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}