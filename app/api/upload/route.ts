import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { decrypt } from '@/src/lib/session-crypto';
import { cookies } from 'next/headers';

export async function POST(request: Request): Promise<NextResponse> {
  // Nur eingeloggte Admins dürfen hochladen
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const session = await decrypt(token);
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
    }),
    onUploadCompleted: async () => {},
  });

  return NextResponse.json(jsonResponse);
}
