import { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ResponsiveShell } from './responsive-shell';

export async function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const u = await getCurrentUser();
  if (!u) redirect('/login');

  return (
    <ResponsiveShell role={u.role} title={title} subtitle={subtitle}>
      {children}
    </ResponsiveShell>
  );
}
