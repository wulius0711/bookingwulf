'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const GA_ID = 'G-PJLWNDWCLV'
const CONSENT_KEY = 'cookie_consent'

export default function CookieBanner() {
  const pathname = usePathname()
  const [consent, setConsent] = useState<'granted' | 'denied' | null>(null)

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored === 'granted' || stored === 'denied') {
      setConsent(stored)
    }
  }, [pathname])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'granted')
    setConsent('granted')
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'denied')
    setConsent('denied')
  }

  if (pathname.startsWith('/admin')) return null

  return (
    <>
      {consent === 'granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true });
          `}</Script>
        </>
      )}

      {consent === null && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: '#fff', borderTop: '1px solid #e5e7eb',
          padding: '16px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        }}>
          <p style={{ margin: 0, fontSize: 14, color: '#374151', maxWidth: 640, lineHeight: 1.5 }}>
            Wir verwenden Google Analytics, um die Nutzung unserer Website zu verstehen. Ihre Daten werden anonymisiert verarbeitet.{' '}
            <a href="/datenschutz" style={{ color: '#111', textDecoration: 'underline' }}>Datenschutzerklärung</a>
          </p>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={decline} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db',
              background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer', fontWeight: 500,
            }}>
              Ablehnen
            </button>
            <button onClick={accept} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: '#111827', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 500,
            }}>
              Akzeptieren
            </button>
          </div>
        </div>
      )}
    </>
  )
}
