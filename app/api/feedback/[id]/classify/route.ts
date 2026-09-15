import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, canWrite } from '@/lib/auth';
import { classifyFeedback } from '@/lib/ai';
import { createEmbedding } from '@/lib/retrieval';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const u = await requireUser();
    if (!canWrite(u.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const f = await db.feedback.findFirst({
      where: { id: params.id, workspaceId: u.workspaceId },
    });
    if (!f) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const ts = await db.theme.findMany({
      where: { workspaceId: u.workspaceId },
      select: { name: true },
    });

    const c = await classifyFeedback(
      f.content,
      ts.map((x) => x.name)
    );

    await db.feedback.update({
      where: { id: f.id },
      data: {
        sentiment: c.sentiment as any,
        sentimentScore: c.sentimentScore,
        featureArea: c.featureArea,
        aiRationale: c.rationale,
      },
    });

    await db.feedbackTheme.deleteMany({
      where: { feedbackId: f.id },
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

    return NextResponse.json({ message: 'Re-classified' });
  } catch (e: any) {
    const isAuth = e?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: isAuth ? 'Unauthorized' : 'Failed to reclassify feedback' },
      { status: isAuth ? 401 : 400 }
    );
  }
}

