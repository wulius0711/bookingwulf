export default function GastLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'html,body{background:#f0f2f5}' }} />
      {children}
    </>
  )
}
