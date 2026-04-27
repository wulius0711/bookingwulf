import { cookies } from 'next/headers';
import { decrypt } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import OutreachClient from './OutreachClient';

export default async function OutreachPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const session = await decrypt(token);

  if (!session || session.role !== 'super_admin') redirect('/admin');

  const leads = await prisma.outreachLead.findMany({ orderBy: { createdAt: 'asc' } });
  const zohoConfigured = !!(process.env.ZOHO_SMTP_USER && process.env.ZOHO_SMTP_PASS);

  return <OutreachClient initialLeads={leads} zohoConfigured={zohoConfigured} />;
}
