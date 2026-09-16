"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  UploadCloud,
  TrendingUp,
  Sparkles,
  FileText,
  Settings,
  LogOut,
  BrainCircuit,
  X,
  Shield,
  Building2,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inbox', label: 'Feedback Inbox', icon: Inbox },
  { href: '/inbox/ingest', label: 'Ingest Feedback', icon: UploadCloud },
] as const;

export const intelligenceNav = [
  { href: '/trends', label: 'Themes & Trends', icon: TrendingUp },
  { href: '/ask', label: 'Ask LOOP', icon: Sparkles },
  { href: '/reports', label: 'VoC Reports', icon: FileText },
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
  const { data: session } = useSession();
  const u = session?.user as any;
  const currentRole = role || u?.role || 'VIEWER';
  const workspaceName = u?.workspaceName || 'Northstar Labs';

  function isNavActive(href: string): boolean {
    if (href === '/dashboard') return p === '/dashboard';
    if (href === '/inbox/ingest') return p.startsWith('/inbox/ingest');
    if (href === '/inbox') return p === '/inbox' || (p.startsWith('/inbox') && !p.startsWith('/inbox/ingest'));
    return p === href || (href !== '/dashboard' && p.startsWith(href));
  }

  const navContent = (
    <div className="flex h-full flex-col p-4 sm:p-5">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/20 shadow-xs">
            <BrainCircuit size={21} />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-white leading-none">LOOP</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[.18em] text-white/45">
              Feedback Intelligence
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Workspace Identity Card */}
      <div className="my-3 rounded-2xl bg-white/[0.04] border border-white/[0.07] p-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-violet-300">
              <Building2 size={14} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-white">
                {workspaceName}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Workspace</span>
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-md border border-violet-400/20 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-300">
            {currentRole}
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="mt-2 flex-1 space-y-5 overflow-y-auto pr-1">
        {/* Main Group */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-white/35">
            Overview & Ingest
          </div>
          <nav className="space-y-1">
            {mainNav.map(({ href, label, icon: Icon }) => {
              const active = isNavActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out select-none',
                    active
                      ? 'bg-white/[0.11] font-semibold text-white shadow-xs border border-white/10 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-violet-400'
                      : 'text-white/65 hover:bg-white/[0.05] hover:text-white'
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      'shrink-0 transition-colors duration-150',
                      active ? 'text-violet-400' : 'text-white/45 group-hover:text-white/80'
                    )}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Intelligence Group */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-white/35">
            AI & Analytics
          </div>
          <nav className="space-y-1">
            {intelligenceNav.map(({ href, label, icon: Icon }) => {
              const active = isNavActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out select-none',
                    active
                      ? 'bg-white/[0.11] font-semibold text-white shadow-xs border border-white/10 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-violet-400'
                      : 'text-white/65 hover:bg-white/[0.05] hover:text-white'
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      'shrink-0 transition-colors duration-150',
                      active ? 'text-violet-400' : 'text-white/45 group-hover:text-white/80'
                    )}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Settings Group */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-white/35">
            Administration
          </div>
          <nav className="space-y-1">
            {(() => {
              const active = isNavActive('/settings');
              return (
                <Link
                  href="/settings"
                  onClick={onClose}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out select-none',
                    active
                      ? 'bg-white/[0.11] font-semibold text-white shadow-xs border border-white/10 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-violet-400'
                      : 'text-white/65 hover:bg-white/[0.05] hover:text-white'
                  )}
                >
                  <Settings
                    size={18}
                    className={cn(
                      'shrink-0 transition-colors duration-150',
                      active ? 'text-violet-400' : 'text-white/45 group-hover:text-white/80'
                    )}
                  />
                  <span>Workspace Settings</span>
                </Link>
              );
            })()}
          </nav>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="mt-auto pt-4 space-y-3">
        {/* AI Engine Status Widget */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-wider text-white/40 uppercase">
              AI Engine
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>
          <div className="mt-1 text-xs font-bold text-white">Claude & Semantic RAG</div>
          <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-4/5 rounded-full bg-violet-400" />
          </div>
        </div>

        {/* User Profile & Sign Out Bar */}
        <div className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/[0.06] p-2">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-600 text-xs font-black text-white">
              {u?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-white leading-none">
                {u?.name || 'User'}
              </div>
              <div className="mt-1 truncate text-[10px] text-white/40 leading-none">
                {u?.email || 'Logged in'}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded-lg p-1.5 text-white/50 hover:bg-rose-500/20 hover:text-rose-300 transition-colors shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-800/80 bg-[#17152b] text-white lg:block">
        {navContent}
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-[#17152b] text-white shadow-2xl border-r border-slate-800/90 transition-transform duration-200 ease-out">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
