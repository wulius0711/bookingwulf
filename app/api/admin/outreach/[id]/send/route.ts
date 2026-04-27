import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { getOutreachTransport, buildOutreachEmail } from '@/src/lib/outreach-mailer';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifySession();
    if (session.role !== 'super_admin') return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });

    const { id } = await params;
    const leadId = Number(id);
    if (!leadId) return NextResponse.json({ error: 'Ungültige ID.' }, { status: 400 });

    const lead = await prisma.outreachLead.findUnique({ where: { id: leadId } });
    if (!lead) return NextResponse.json({ error: 'Lead nicht gefunden.' }, { status: 404 });
    if (!lead.email) return NextResponse.json({ error: 'Keine E-Mail-Adresse hinterlegt.' }, { status: 400 });

    const transport = getOutreachTransport();
    if (!transport) return NextResponse.json({ error: 'Zoho SMTP nicht konfiguriert. Bitte ZOHO_SMTP_USER und ZOHO_SMTP_PASS in .env.local setzen.' }, { status: 503 });

    const { subject, html, text } = buildOutreachEmail(lead.betrieb, lead.inhaber);

    await transport.sendMail({
      from: `Wolfgang von bookingwulf <${process.env.ZOHO_SMTP_USER}>`,
      to: lead.email,
      subject,
      text,
      html,
    });

    const updated = await prisma.outreachLead.update({
      where: { id: leadId },
      data: { status: 'gesendet', sentAt: new Date() },
    });

    return NextResponse.json({ lead: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unbekannter Fehler';
    return NextResponse.json({ error: `E-Mail konnte nicht gesendet werden: ${msg}` }, { status: 500 });
  }
}
