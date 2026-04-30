import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

const VALID_STATUSES = ['neu', 'gesendet', 'follow-up', 'geantwortet', 'demo', 'kein-interesse', 'abgeschlossen'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifySession();
    if (session.role !== 'super_admin') return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });

    const { id } = await params;
    const leadId = Number(id);
    if (!leadId) return NextResponse.json({ error: 'Ungültige ID.' }, { status: 400 });

    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) return NextResponse.json({ error: 'Ungültiger Status.' }, { status: 400 });
      data.status = body.status;
    }
    if (body.betrieb  !== undefined) data.betrieb  = String(body.betrieb).trim();
    if (body.inhaber  !== undefined) data.inhaber  = body.inhaber  ? String(body.inhaber).trim()  : null;
    if (body.email    !== undefined) data.email    = body.email    ? String(body.email).trim()    : null;
    if (body.phone      !== undefined) data.phone      = body.phone      ? String(body.phone).trim()      : null;
    if (body.kontaktPer !== undefined) data.kontaktPer = body.kontaktPer ? String(body.kontaktPer).trim() : null;
    if (body.region   !== undefined) data.region   = body.region   ? String(body.region).trim()   : null;
    if (body.website  !== undefined) data.website  = body.website  ? String(body.website).trim()  : null;
    if (body.notes    !== undefined) data.notes    = body.notes    ? String(body.notes).trim()    : null;
    if (body.nextStep !== undefined) data.nextStep = body.nextStep ? String(body.nextStep).trim()  : null;
    if (body.followUpAt !== undefined) data.followUpAt = body.followUpAt ? new Date(body.followUpAt) : null;

    const lead = await prisma.outreachLead.update({ where: { id: leadId }, data });
    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifySession();
    if (session.role !== 'super_admin') return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });

    const { id } = await params;
    const leadId = Number(id);
    if (!leadId) return NextResponse.json({ error: 'Ungültige ID.' }, { status: 400 });

    await prisma.outreachLead.delete({ where: { id: leadId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
