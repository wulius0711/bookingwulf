import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

function requireSuperAdmin(session: Awaited<ReturnType<typeof verifySession>>) {
  if (session.role !== 'super_admin') throw new Error('forbidden');
}

export async function GET() {
  try {
    const session = await verifySession();
    requireSuperAdmin(session);
    const leads = await prisma.outreachLead.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json({ leads });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'forbidden')
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    requireSuperAdmin(session);
    const body = await req.json();
    const lead = await prisma.outreachLead.create({
      data: {
        betrieb:  String(body.betrieb ?? '').trim(),
        inhaber:  body.inhaber  ? String(body.inhaber).trim()  : null,
        email:    body.email    ? String(body.email).trim()    : null,
        phone:      body.phone      ? String(body.phone).trim()      : null,
        kontaktPer: body.kontaktPer ? String(body.kontaktPer).trim() : null,
        region:   body.region   ? String(body.region).trim()   : null,
        website:  body.website  ? String(body.website).trim()  : null,
        notes:    body.notes    ? String(body.notes).trim()    : null,
        nextStep: body.nextStep ? String(body.nextStep).trim() : null,
      },
    });
    return NextResponse.json({ lead });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'forbidden')
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
