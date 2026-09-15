import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { retrieveFeedback } from '@/lib/retrieval';
import { answerGrounded } from '@/lib/ai';
import { z } from 'zod';

const AskSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters').max(500),
});

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    const { question } = AskSchema.parse(await req.json());
    const contexts = await retrieveFeedback(u.workspaceId, question.trim(), 8);
    const result = await answerGrounded(question.trim(), contexts);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'Unauthorized' : e?.issues?.[0]?.message || e.message || 'Ask failed' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 400 }
    );
  }
}
