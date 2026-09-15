"use client";

import { ReactNode, useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function ResponsiveShell({
  role,
  title,
  subtitle,
  children,
}: {
  role?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div>
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
        <div className="p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
