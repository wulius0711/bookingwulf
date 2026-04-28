import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { getGeminiModel, BOOKINGWULF_SYSTEM_PROMPT, classifyQuestion } from '@/src/lib/gemini';

export async function POST(req: Request) {
  let session: Awaited<ReturnType<typeof verifySession>>;
  try {
    session = await verifySession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Check Pro+ plan (super_admin always allowed)
  if (session.role !== 'super_admin' && session.hotelId) {
    const hotel = await prisma.hotel.findUnique({
      where: { id: session.hotelId },
      select: { plan: true, subscriptionStatus: true },
    });
    const plan = hotel?.plan ?? 'starter';
    const status = hotel?.subscriptionStatus ?? 'inactive';
    const isActive = status === 'active' || status === 'trialing';
    const isPro = plan === 'pro' || plan === 'business';
    if (!isActive || !isPro) {
      return NextResponse.json({ error: 'plan_required', minPlan: 'pro' }, { status: 403 });
    }
  }

  const { question } = await req.json();
  if (!question || typeof question !== 'string' || question.trim().length < 2) {
    return NextResponse.json({ error: 'invalid_question' }, { status: 400 });
  }
  const trimmed = question.trim().slice(0, 1000);

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'ai_error', detail: 'key_missing' }, { status: 500 });
  }

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(
      `${BOOKINGWULF_SYSTEM_PROMPT}\n\nFrage: ${trimmed}`
    );
    const answer = result.response.text().trim();
    const category = classifyQuestion(trimmed);

    await prisma.supportChatLog.create({
      data: {
        hotelId: session.hotelId ?? null,
        question: trimmed,
        answer,
        category,
        isSuperAdmin: session.role === 'super_admin',
      },
    });

    return NextResponse.json({ answer, category });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Gemini error:', message);
    return NextResponse.json({ error: 'ai_error', detail: message }, { status: 500 });
  }
}
