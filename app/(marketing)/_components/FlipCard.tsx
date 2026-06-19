'use client'

import { useState, useEffect } from 'react'

type Props = {
  initials: string
  name: string
  subtitle: string
  text: string
  photo?: string
  linkLabel?: string
  linkHref?: string
}

export default function FlipCard({ initials, name, subtitle, text, photo, linkLabel, linkHref }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches)
  }, [])

  return (
    <div
      className="v4-animate h-[380px]"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => !isTouch && setFlipped(true)}
      onMouseLeave={() => !isTouch && setFlipped(false)}
      onClick={() => isTouch && setFlipped(f => !f)}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="v4-card absolute inset-0 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            ...(photo ? {
              backgroundImage: `url(${photo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            } : {}),
          }}
        >
          {photo ? (
            <>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,20,40,0.7) 0%, transparent 50%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-[17px] font-bold mb-0.5" style={{ color: '#fff' }}>{name}</h3>
                <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{subtitle}</p>
              </div>
              <p className="absolute top-4 right-5 text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{isTouch ? 'Tippen für mehr →' : 'Hover für mehr →'}</p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-5 h-full p-8">
              <svg width="72" height="72" viewBox="0 0 96 96" fill="none" aria-hidden>
                <circle cx="48" cy="48" r="48" fill="#e4f4f8" />
                <circle cx="48" cy="48" r="47.5" stroke="#90cce0" strokeWidth="1" />
                <text
                  x="48" y="48"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontSize="26"
                  fontWeight="700"
                  fill="#108ba9"
                  letterSpacing="2"
                >{initials}</text>
              </svg>
              <div className="text-center">
                <h3 className="text-[17px] font-bold mb-1 v4-text-navy">{name}</h3>
                <p className="text-[13px] v4-text-muted">{subtitle}</p>
              </div>
              <p className="absolute bottom-5 right-6 text-[12px] font-medium v4-text-muted">{isTouch ? 'Tippen für mehr →' : 'Hover für mehr →'}</p>
            </div>
          )}
        </div>

        {/* Back */}
        <div
          className="v4-card absolute inset-0 flex flex-col p-8"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-[17px] font-bold mb-1 v4-text-navy">{name}</h3>
          <p className="text-[13px] mb-4 v4-text-muted">{subtitle}</p>
          <p className="text-[13px] font-normal leading-[1.65] v4-text-body">{text}</p>
          {linkLabel && linkHref && (
            <a
              href={linkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-auto pt-4 text-sm font-semibold hover:underline underline-offset-4 v4-text-navy"
            >
              {linkLabel} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
