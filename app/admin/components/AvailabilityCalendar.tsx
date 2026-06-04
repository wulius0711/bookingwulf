'use client'
import { useState } from 'react'

const MONTHS_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const SHOW_DAYS = new Set([1, 5, 10, 15, 20, 25])

interface Range { start: string; end: string; type: 'booked' | 'blocked' }
interface Apartment { id: number; name: string; ranges: Range[] }

interface Props {
  apartments: Apartment[]
}

export default function AvailabilityCalendar({ apartments }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayDate = now.getDate()
  const canPrev = !(year === now.getFullYear() && month === now.getMonth())

  function prevMonth() {
    if (!canPrev) return
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  function dayIso(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function dayStatus(apt: Apartment, day: number): 'booked' | 'blocked' | 'free' {
    const iso = dayIso(day)
    for (const r of apt.ranges) {
      if (r.start <= iso && iso < r.end) return r.type
    }
    return 'free'
  }

  function isPast(day: number) {
    return isCurrentMonth && day < todayDate
  }

  function isToday(day: number) {
    return isCurrentMonth && day === todayDate
  }

  function showLabel(day: number) {
    return SHOW_DAYS.has(day) || day === daysInMonth || isToday(day)
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', background: '#111', borderRadius: 16, padding: '20px 24px', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <NavBtn onClick={prevMonth} disabled={!canPrev}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </NavBtn>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#9ca3af', minWidth: 110, textAlign: 'center' }}>
          {MONTHS_DE[month]} {year}
        </span>
        <NavBtn onClick={nextMonth}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </NavBtn>
        <div style={{ flex: 1 }} />
        <LegendItem color="#C0DD97" label="Frei" />
        <LegendItem color="#F5C4B3" label="Belegt" />
        <LegendItem color="#D1D5DB" label="Blockiert" />
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Apartment labels */}
        <div style={{ width: 120, flexShrink: 0, paddingRight: 12 }}>
          <div style={{ height: 18 }} />
          {apartments.map((apt, i) => (
            <div key={apt.id} style={{ height: 18, marginBottom: i < apartments.length - 1 ? 2 : 0, display: 'flex', alignItems: 'center', fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {apt.name}
            </div>
          ))}
        </div>

        {/* Days */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Day numbers */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 4, height: 14 }}>
            {days.map(day => (
              <div key={day} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: isToday(day) ? '#378ADD' : '#4b5563', fontWeight: isToday(day) ? 700 : 400 }}>
                {showLabel(day) ? day : ''}
              </div>
            ))}
          </div>

          {/* Apartment rows */}
          {apartments.map((apt, i) => (
            <div key={apt.id} style={{ display: 'flex', gap: 2, marginBottom: i < apartments.length - 1 ? 2 : 0 }}>
              {days.map(day => {
                const past = isPast(day)
                const status = past ? 'past' : dayStatus(apt, day)
                const today = isToday(day)
                const bg = status === 'past' ? '#ECEAE3' : status === 'booked' ? '#F5C4B3' : status === 'blocked' ? '#D1D5DB' : '#C0DD97'

                return (
                  <div key={day} style={{ flex: 1, minWidth: 0, height: 18, borderRadius: 3, background: bg, boxShadow: today ? '0 0 0 1.5px #378ADD' : undefined }} />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NavBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 8, width: 34, height: 34, cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: disabled ? '#374151' : '#9ca3af', flexShrink: 0, transition: 'background 0.1s' }}>
      {children}
    </button>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
      <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
      {label}
    </div>
  )
}
