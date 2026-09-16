"use client";

import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function AppShellClient({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { data, status } = useSession();
  const r = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      r.replace('/login');
    }
  }, [status, r]);

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8f9fc] text-sm font-semibold text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          <span className="text-xs font-medium text-slate-400">Loading LOOP...</span>
        </div>
      </div>
    );
  }

  const role = (data?.user as any)?.role || 'VIEWER';

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Sidebar
        role={role}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <main className="min-h-screen lg:pl-64">
        <Topbar
          title={title}
          subtitle={subtitle}
          onOpenMenu={() => setMobileOpen(true)}
        />
        <div className="p-5 lg:p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
