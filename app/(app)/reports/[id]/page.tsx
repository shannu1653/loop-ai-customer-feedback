import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ReportView } from '@/components/report-view';

export default async function ReportPage({ params }: { params: { id: string } }) {
  const u = await requireUser();
  const r = await db.report.findFirst({
    where: {
      id: params.id,
      workspaceId: u.workspaceId,
    },
    include: {
      generatedBy: {
        select: { name: true, email: true },
      },
    },
  });

  if (!r) {
    notFound();
  }

  return <ReportView report={JSON.parse(JSON.stringify(r))} />;
}
