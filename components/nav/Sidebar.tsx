'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, Plus, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs',       label: 'Jobs',       icon: Briefcase },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out.');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0].toUpperCase() ?? '?';

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col glass-card rounded-none border-r border-[rgba(164,191,157,0.1)] z-30">
      {/* Logo */}
      <div className="p-5 border-b border-[rgba(164,191,157,0.08)]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#A4BF9D] flex items-center justify-center">
            <span className="text-[#071A1F] font-bold text-sm font-mono">L</span>
          </div>
          <span className="font-display text-lg font-semibold text-[#EAF3F0]">Lucent</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-[rgba(164,191,157,0.12)] text-[#EAF3F0]'
                  : 'text-[#5E7A76] hover:text-[#93AFA8] hover:bg-[rgba(164,191,157,0.06)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#A4BF9D]" />}
            </Link>
          );
        })}

        {/* New Job shortcut */}
        <Link
          href="/jobs/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5E7A76] hover:text-[#93AFA8] hover:bg-[rgba(164,191,157,0.06)] transition-all duration-150 mt-4"
        >
          <Plus className="w-4 h-4" />
          New Job
        </Link>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-[rgba(164,191,157,0.08)]">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-[rgba(164,191,157,0.15)] border border-[rgba(164,191,157,0.2)] flex items-center justify-center text-xs font-semibold text-[#A4BF9D]">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#EAF3F0] truncate">
              {user?.displayName || 'Recruiter'}
            </p>
            <p className="text-xs text-[#5E7A76] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#5E7A76] hover:text-[#D97878] hover:bg-[rgba(217,120,120,0.08)] transition-all duration-150 mt-1"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
