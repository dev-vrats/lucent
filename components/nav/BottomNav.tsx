'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs',      label: 'Jobs',      icon: Briefcase },
  { href: '/jobs/new',  label: 'New Job',   icon: Plus },
];

export function BottomNav() {
  const { logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out.');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-[rgba(164,191,157,0.1)] z-50 flex items-center justify-around p-2 bg-[#040C0E]/90 backdrop-blur-md">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/jobs/new' && pathname.startsWith(href + '/'));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all duration-150 ${
              active
                ? 'text-[#EAF3F0]'
                : 'text-[#5E7A76] hover:text-[#93AFA8]'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-[#A4BF9D]' : ''}`} />
            {label}
          </Link>
        );
      })}
      
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium text-[#5E7A76] hover:text-[#D97878] transition-all duration-150"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </nav>
  );
}
