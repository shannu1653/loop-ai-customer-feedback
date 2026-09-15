import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, canWrite } from '@/lib/auth';
import { z } from 'zod';

const PatchFeedbackSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'ACTIONED']).optional(),
  sentiment: z.enum(['POS', 'NEU', 'NEG']).optional(),
  featureArea: z.string().max(80).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const u = await requireUser();
    const item = await db.feedback.findFirst({
      where: {
        id: params.id,
        workspaceId: u.workspaceId,
      },
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'Unauthorized' : 'Failed to fetch feedback' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const u = await requireUser();
    if (!canWrite(u.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const b = PatchFeedbackSchema.parse(await req.json());
    const existing = await db.feedback.findFirst({
      where: {
        id: params.id,
        workspaceId: u.workspaceId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (b.status !== undefined) updateData.status = b.status;
    if (b.sentiment !== undefined) updateData.sentiment = b.sentiment;
    if (b.featureArea !== undefined) updateData.featureArea = b.featureArea;
    if (b.sentimentScore !== undefined) updateData.sentimentScore = b.sentimentScore;

    const updated = await db.feedback.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.issues?.[0]?.message || e.message || 'Failed to update feedback' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const u = await requireUser();
    if (!canWrite(u.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await db.feedback.findFirst({
      where: {
        id: params.id,
        workspaceId: u.workspaceId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    await db.feedback.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'Unauthorized' : 'Failed to delete feedback' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 500 }
    );
  }
}
