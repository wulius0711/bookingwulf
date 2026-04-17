import { cookies } from 'next/headers'
import { decrypt } from '@/src/lib/session'
import { redirect } from 'next/navigation'

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = await decrypt(token)

  if (session) redirect('/admin')

  return <>{children}</>
}
