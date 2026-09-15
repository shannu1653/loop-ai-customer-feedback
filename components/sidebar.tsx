"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  Sparkles,
  FileText,
  Settings,
  LogOut,
  BrainCircuit,
  X,
  Shield,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

export const nav = [
  ['/dashboard', 'Overview', LayoutDashboard],
  ['/inbox', 'Feedback Inbox', Inbox],
  ['/trends', 'Themes & Trends', TrendingUp],
  ['/ask', 'Ask LOOP', Sparkles],
  ['/reports', 'VoC Reports', FileText],
  ['/settings', 'Workspace', Settings],
] as const;

export function Sidebar({
  role,
  mobileOpen,
  onClose,
}: {
  role?: string;
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const p = usePathname();

  const navContent = (
    <div className="flex h-full flex-col p-5">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600/30 text-violet-400">
            <BrainCircuit size={21} />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-white">LOOP</div>
            <div className="text-[10px] uppercase tracking-[.2em] text-white/45">
              Feedback intelligence
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs">
        <Shield size={14} className="text-violet-400" />
        <span className="text-white/60">Role:</span>
        <span className="font-bold text-violet-300">{role || 'VIEWER'}</span>
      </div>

      <nav className="space-y-1">
        {nav.map(([href, label, Icon]) => {
          const active = p === href || (href !== '/dashboard' && p.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white',
                active && 'bg-white/12 font-bold text-white shadow-sm'
              )}
            >
              <Icon size={18} className={active ? 'text-violet-400' : 'text-white/50'} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="mb-4 rounded-2xl bg-white/5 p-4">
          <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
            AI Engine
          </div>
          <div className="mt-1 text-sm font-bold text-white">Claude & Semantic RAG</div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10">
            <div className="h-full w-4/5 rounded-full bg-violet-400" />
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-rose-300"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-800 bg-[#17152b] text-white lg:block">
        {navContent}
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-[#17152b] text-white shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
