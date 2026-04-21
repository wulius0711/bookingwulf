import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { decrypt } from '@/src/lib/session-crypto';
import { cookies } from 'next/headers';

export async function POST(request: Request): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const session = await decrypt(token);
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'Keine Datei' }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
  return NextResponse.json({ url: blob.url });
}
