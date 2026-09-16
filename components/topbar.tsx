"use client";

import { useState, useRef, useEffect } from 'react';
import { Menu, Search, ChevronDown, User, LogOut, Shield, Building2 } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function Topbar({
  title,
  subtitle,
  onOpenMenu,
}: {
  title: string;
  subtitle?: string;
  onOpenMenu?: () => void;
}) {
  const { data } = useSession();
  const u = data?.user as any;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleColors: Record<string, { badge: string; text: string }> = {
    ADMIN: {
      badge: 'bg-violet-50 text-violet-700 border-violet-200/80',
      text: 'text-violet-700',
    },
    ANALYST: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      text: 'text-emerald-700',
    },
    VIEWER: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200/80',
      text: 'text-slate-700',
    },
  };

  const currentRole = u?.role || 'VIEWER';
  const roleStyle = roleColors[currentRole] || roleColors.VIEWER;
  const workspaceName = u?.workspaceName || 'Northstar Labs';

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/80 bg-[#f8f9fc]/85 px-4 sm:px-6 backdrop-blur-md lg:px-8">
      {/* Left Area: Mobile Menu Trigger + Title & Context */}
      <div className="flex items-center gap-3.5 min-w-0">
        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="rounded-xl border border-slate-200/90 bg-white p-2 text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 lg:hidden shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg sm:text-xl font-black tracking-tight text-slate-900">
              {title}
            </h1>
            <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-slate-300" />
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
              <Building2 size={12} />
              {workspaceName}
            </span>
          </div>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right Area: Search Shortcut + User Profile Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Quick Search Button */}
        <Link
          href="/inbox"
          className="hidden items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs transition-all duration-150 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm sm:flex"
        >
          <Search size={14} className="text-slate-400" />
          <span>Quick search</span>
          <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
            Inbox
          </kbd>
        </Link>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-1.5 pr-3 shadow-xs transition hover:border-slate-300 hover:shadow-sm active:scale-[0.98] select-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-600 text-xs font-black text-white shadow-xs">
              {u?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-bold text-slate-900 leading-none">
                {u?.name || 'User'}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${roleStyle.badge}`}
                >
                  {currentRole}
                </span>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {/* User Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-dropdown animate-slide-up z-50">
              <div className="border-b border-slate-100 p-2.5">
                <div className="text-xs font-bold text-slate-900">{u?.name || 'User'}</div>
                <div className="text-[11px] font-medium text-slate-400 truncate">{u?.email || ''}</div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Shield size={13} className={roleStyle.text} />
                  <span>Role: <strong className={roleStyle.text}>{currentRole}</strong></span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User size={14} className="text-slate-400" />
                  Workspace Settings
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
