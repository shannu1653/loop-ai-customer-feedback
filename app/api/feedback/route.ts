import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, canWrite } from '@/lib/auth';
import { z } from 'zod';
import { classifyFeedback } from '@/lib/ai';
import { createEmbedding } from '@/lib/retrieval';

export async function GET(req: Request) {
  try {
    const u = await requireUser();
    const url = new URL(req.url);

    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || 12)));
    const q = url.searchParams.get('q') || '';
    const status = url.searchParams.get('status') || '';
    const sentiment = url.searchParams.get('sentiment') || '';
    const channel = url.searchParams.get('channel') || '';
    const theme = url.searchParams.get('theme') || '';
    const dateRange = url.searchParams.get('dateRange') || '';
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';

    const where: any = { workspaceId: u.workspaceId };

    if (q) {
      where.content = { contains: q, mode: 'insensitive' };
    }
    if (status && ['NEW', 'REVIEWED', 'ACTIONED'].includes(status)) {
      where.status = status;
    }
    if (sentiment && ['POS', 'NEU', 'NEG'].includes(sentiment)) {
      where.sentiment = sentiment;
    }
    if (channel) {
      where.channel = channel;
    }
    if (theme) {
      where.themes = { some: { theme: { name: theme } } };
    }

    if (dateRange === '7d') {
      where.createdAt = { gte: new Date(Date.now() - 7 * 864e5) };
    } else if (dateRange === '30d') {
      where.createdAt = { gte: new Date(Date.now() - 30 * 864e5) };
    } else if (dateRange === '90d') {
      where.createdAt = { gte: new Date(Date.now() - 90 * 864e5) };
    } else if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [items, total] = await Promise.all([
      db.feedback.findMany({
        where,
        include: {
          themes: {
            include: {
              theme: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.feedback.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'Unauthorized' : 'Failed to load feedback' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    if (!canWrite(u.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const s = z.object({
      content: z.string().min(3, 'Feedback content must be at least 3 characters'),
      channel: z.string().min(1, 'Channel is required'),
      customerLabel: z.string().optional(),
    });

    const b = s.parse(await req.json());
    const themes = await db.theme.findMany({
      where: { workspaceId: u.workspaceId },
      select: { name: true },
    });

    const c = await classifyFeedback(
      b.content,
      themes.map((x) => x.name)
    );

    const f = await db.feedback.create({
      data: {
        content: b.content.trim(),
        channel: b.channel.trim(),
        customerLabel: b.customerLabel?.trim() || null,
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
        create: {
          workspaceId: u.workspaceId,
          name,
          description: `Customer feedback related to ${name.toLowerCase()}.`,
        },
        update: {},
      });

      await db.feedbackTheme.create({
        data: {
          feedbackId: f.id,
          themeId: t.id,
          confidence: 0.9,
        },
      });
    }

    await createEmbedding(f.id, f.content);

    return NextResponse.json({
      message: 'Feedback ingested and classified',
      feedback: f,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.issues?.[0]?.message || e.message || 'Failed to ingest feedback' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 400 }
    );
  }
}
