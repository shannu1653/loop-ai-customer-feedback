import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, canWrite } from '@/lib/auth';
import { classifyFeedback } from '@/lib/ai';
import { createEmbedding } from '@/lib/retrieval';

const samples = [
  'Customers are asking for a clearer mobile onboarding checklist.',
  'The dashboard is much faster now, but teams want customizable widgets.',
  'Support says invoice downloads still fail occasionally during peak hours.',
  'Several prospects asked whether SSO can be enabled for their organization.',
  'Users love exports and want scheduled weekly delivery.',
];

export async function POST() {
  try {
    const u = await requireUser();
    if (!canWrite(u.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const content = samples[Math.floor(Math.random() * samples.length)];
    const ts = await db.theme.findMany({
      where: { workspaceId: u.workspaceId },
      select: { name: true },
    });

    const c = await classifyFeedback(
      content,
      ts.map((x) => x.name)
    );

    const f = await db.feedback.create({
      data: {
        content,
        channel: 'Simulated channel',
        customerLabel: 'Simulated customer',
        sentiment: c.sentiment as any,
        sentimentScore: c.sentimentScore,
        featureArea: c.featureArea,
        aiRationale: c.rationale,
        workspaceId: u.workspaceId,
      },
    });

    for (const name of c.themes) {
      const t = await db.theme.upsert({
        where: { workspaceId_name: { workspaceId: u.workspaceId, name } },
        create: { workspaceId: u.workspaceId, name },
        update: {},
      });

      await db.feedbackTheme.create({
        data: { feedbackId: f.id, themeId: t.id, confidence: 0.9 },
      });
    }

    await createEmbedding(f.id, f.content);

    return NextResponse.json({ message: 'Simulated feedback added', feedback: f });
  } catch (e: any) {
    const isAuth = e?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: isAuth ? 'Unauthorized' : e?.message || 'Failed to simulate feedback' },
      { status: isAuth ? 401 : 400 }
    );
  }
}

