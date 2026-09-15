"use client";

import { Menu, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
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

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-violet-100 text-violet-800 border-violet-200',
    ANALYST: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    VIEWER: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/70 bg-[#f7f6fb]/95 px-5 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/inbox"
          className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-800 sm:flex"
        >
          <Search size={14} className="text-slate-400" />
          <span>Quick search</span>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
            Inbox
          </kbd>
        </Link>

        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/70 bg-white p-1.5 pr-3 shadow-sm">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-600 text-xs font-black text-white">
            {u?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 leading-none">
              {u?.name || 'User'}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`rounded border px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider ${
                  roleColors[u?.role] || roleColors.VIEWER
                }`}
              >
                {u?.role || 'VIEWER'}
              </span>
              <span className="hidden text-[10px] text-slate-400 sm:inline">
                {u?.workspaceName || 'Northstar Labs'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
