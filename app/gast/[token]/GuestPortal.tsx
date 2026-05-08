'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { sendGuestMessage, requestCheckout, bookExtra } from './actions';

type Booking = {
  id: number;
  arrival: string;
  departure: string;
  nights: number;
  adults: number;
  children: number;
  salutation: string;
  firstname: string | null;
  lastname: string;
  status: string;
  paymentMethod: string | null;
  pricingJson: Record<string, unknown> | null;
  extrasJson: unknown[] | null;
  nukiCode: string | null;
  checkinCompleted: boolean;
  checkinArrivalTime: string | null;
  checkoutRequested: boolean;
  language: string;
};

type Hotel = {
  name: string;
  email: string | null;
  phone: string | null;
  accentColor: string;
  address: string | null;
  whatsappNumber: string | null;
  checkinTime: string | null;
  checkinInfo: string | null;
  checkoutTime: string | null;
  preArrivalEnabled: boolean;
  reviewRequestLink: string | null;
  wifiSsid: string | null;
  wifiPassword: string | null;
  parkingInfo: string | null;
  wasteInfo: string | null;
  houseRules: string | null;
  emergencyNumbers: { label: string; number: string }[];
};

type Apartment = { id: number; name: string; imageUrl: string | null; imageAlt: string };

type Extra = {
  id: number; name: string; key: string; type: string; billingType: string;
  price: number; imageUrl: string | null; description: string | null;
  linkUrl: string | null; exclusiveGroup: string | null;
};

type Message = { id: number; sender: string; body: string; createdAt: string };

type ThingToSee = {
  id: number; category: string; title: string; description: string | null;
  address: string | null; mapsUrl: string | null; imageUrl: string | null;
};

type CheckinImage = { id: number; imageUrl: string; caption: string | null; sortOrder: number };

type Props = {
  token: string; booking: Booking; hotel: Hotel; apartments: Apartment[];
  allExtras: Extra[]; serverBookedExtraIds: number[];
  thingsToSee: ThingToSee[]; checkinImages: CheckinImage[]; initialMessages: Message[];
};

type Tab = 'arrival' | 'extras' | 'surroundings' | 'messages' | 'checkout';

function hexLuminance(hex: string): number {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const lin = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function fmt(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

function fmtTime(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function eur(n: number) {
  return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n);
}

const TRANSLATIONS = {
  de: {
    guestportal: 'Gästeportal', night: 'Nacht', nights: 'Nächte',
    checkinPending: 'Online Check-In ausstehend',
    checkinPendingDesc: 'Jetzt ausfüllen und Zeit bei der Anreise sparen.',
    checkinDone: 'Check-In abgeschlossen',
    checkinDoneView: 'Angaben ansehen →',
    checkinFrom: 'Check-in ab', oclock: ' Uhr',
    keyHandover: '🔑 Schlüsselübergabe',
    accessCode: '🔑 Ihr Zugangscode', accessCodeValid: 'Gültig von Anreise bis Abreise',
    planArrival: 'Anreise planen', contact: 'Kontakt',
    call: 'Anrufen', whatsapp: 'WhatsApp', emailBtn: 'E-Mail schreiben',
    houseinfo: 'Hausinfos', wifi: '📶 WLAN', network: 'Netzwerk', password: 'Passwort',
    copy: 'Kopieren', copied: '✓ Kopiert',
    parking: '🅿️ Parkplatz', waste: '♻️ Müllentsorgung',
    houseRules: '📋 Hausordnung', emergency: '🚨 Notfallnummern',
    noExtras: 'Keine Zusatzleistungen verfügbar.',
    booked: '✓ Gebucht', variantBooked: 'Variante bereits gebucht',
    learnMore: 'Mehr erfahren', add: 'Hinzufügen',
    noSurroundings: 'Noch keine Einträge.', less: '▴ Weniger', openInMaps: 'In Maps öffnen',
    messagesHead: 'Nachrichten',
    noMessages: (h: string) => `Noch keine Nachrichten. Schreiben Sie dem ${h}-Team direkt hier.`,
    msgPlaceholder: 'Nachricht schreiben …',
    msgError: 'Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    checkoutHead: 'Abreise', checkoutTime: 'Check-Out Zeit',
    checkoutDesc: 'Wenn Sie zur Abreise bereit sind, informieren Sie das Team mit einem Klick — kein Warten an der Rezeption nötig.',
    checkoutBtn: 'Jetzt auschecken', goodbye: 'Auf Wiedersehen!',
    goodbyeText: 'Vielen Dank für Ihren Aufenthalt. Das Team wurde über Ihre Abreise informiert.',
    reviewPrompt: 'Hat Ihnen Ihr Aufenthalt gefallen? Wir freuen uns über eine Bewertung!',
    reviewBtn: '⭐ Bewertung schreiben',
    navArrival: 'Anreise', navExtras: 'Extras', navSurroundings: 'Umgebung',
    navMessages: 'Nachrichten', navCheckout: 'Abreise',
    cats: { restaurant: '🍽️ Restaurant & Café', attraction: '🏛️ Sehenswürdigkeit', activity: '🏔️ Aktivität', event: '🎉 Events', shopping: '🛍️ Einkaufen', emergency: '🏥 Wichtiges' },
    locale: 'de-AT',
  },
  en: {
    guestportal: 'Guest Portal', night: 'night', nights: 'nights',
    checkinPending: 'Online Check-In pending',
    checkinPendingDesc: 'Fill in now and save time on arrival.',
    checkinDone: 'Check-In completed',
    checkinDoneView: 'View details →',
    checkinFrom: 'Check-in from', oclock: '',
    keyHandover: '🔑 Key Handover',
    accessCode: '🔑 Your Access Code', accessCodeValid: 'Valid from arrival to departure',
    planArrival: 'Plan Arrival', contact: 'Contact',
    call: 'Call', whatsapp: 'WhatsApp', emailBtn: 'Send E-Mail',
    houseinfo: 'House Info', wifi: '📶 Wi-Fi', network: 'Network', password: 'Password',
    copy: 'Copy', copied: '✓ Copied',
    parking: '🅿️ Parking', waste: '♻️ Waste Disposal',
    houseRules: '📋 House Rules', emergency: '🚨 Emergency Numbers',
    noExtras: 'No additional services available.',
    booked: '✓ Booked', variantBooked: 'Variant already booked',
    learnMore: 'Learn more', add: 'Add',
    noSurroundings: 'No entries yet.', less: '▴ Less', openInMaps: 'Open in Maps',
    messagesHead: 'Messages',
    noMessages: (h: string) => `No messages yet. Write to the ${h} team directly here.`,
    msgPlaceholder: 'Write a message …',
    msgError: 'Message could not be sent. Please try again.',
    checkoutHead: 'Departure', checkoutTime: 'Check-Out Time',
    checkoutDesc: 'When you are ready to leave, notify the team with one click — no waiting at reception.',
    checkoutBtn: 'Check out now', goodbye: 'Goodbye!',
    goodbyeText: 'Thank you for your stay. The team has been notified of your departure.',
    reviewPrompt: 'Did you enjoy your stay? We would love a review!',
    reviewBtn: '⭐ Write a review',
    navArrival: 'Arrival', navExtras: 'Extras', navSurroundings: 'Around',
    navMessages: 'Messages', navCheckout: 'Departure',
    cats: { restaurant: '🍽️ Restaurant & Café', attraction: '🏛️ Attraction', activity: '🏔️ Activity', event: '🎉 Events', shopping: '🛍️ Shopping', emergency: '🏥 Important' },
    locale: 'en-GB',
  },
  it: {
    guestportal: 'Portale Ospiti', night: 'notte', nights: 'notti',
    checkinPending: 'Check-In online in sospeso',
    checkinPendingDesc: "Compilalo ora e risparmia tempo all'arrivo.",
    checkinDone: 'Check-In completato',
    checkinDoneView: 'Vedi dettagli →',
    checkinFrom: 'Check-in dalle', oclock: '',
    keyHandover: '🔑 Consegna chiavi',
    accessCode: '🔑 Il suo codice di accesso', accessCodeValid: "Valido dall'arrivo alla partenza",
    planArrival: 'Pianifica arrivo', contact: 'Contatto',
    call: 'Chiama', whatsapp: 'WhatsApp', emailBtn: 'Scrivi e-mail',
    houseinfo: 'Info struttura', wifi: '📶 Wi-Fi', network: 'Rete', password: 'Password',
    copy: 'Copia', copied: '✓ Copiato',
    parking: '🅿️ Parcheggio', waste: '♻️ Raccolta rifiuti',
    houseRules: '📋 Regolamento', emergency: '🚨 Numeri di emergenza',
    noExtras: 'Nessun servizio aggiuntivo disponibile.',
    booked: '✓ Prenotato', variantBooked: 'Variante già prenotata',
    learnMore: 'Scopri di più', add: 'Aggiungi',
    noSurroundings: 'Nessuna voce disponibile.', less: '▴ Meno', openInMaps: 'Apri su Maps',
    messagesHead: 'Messaggi',
    noMessages: (h: string) => `Nessun messaggio. Scrivi direttamente al team di ${h}.`,
    msgPlaceholder: 'Scrivi un messaggio …',
    msgError: 'Impossibile inviare il messaggio. Riprova.',
    checkoutHead: 'Partenza', checkoutTime: 'Orario check-out',
    checkoutDesc: 'Quando sei pronto a partire, avvisa il team con un clic — senza attendere alla reception.',
    checkoutBtn: 'Effettua check-out', goodbye: 'Arrivederci!',
    goodbyeText: 'Grazie per il soggiorno. Il team è stato informato della tua partenza.',
    reviewPrompt: 'Ti è piaciuto il soggiorno? Lascia una recensione!',
    reviewBtn: '⭐ Scrivi una recensione',
    navArrival: 'Arrivo', navExtras: 'Extra', navSurroundings: 'Dintorni',
    navMessages: 'Messaggi', navCheckout: 'Partenza',
    cats: { restaurant: '🍽️ Ristorante & Caffè', attraction: '🏛️ Attrazione', activity: '🏔️ Attività', event: '🎉 Eventi', shopping: '🛍️ Shopping', emergency: '🏥 Importante' },
    locale: 'it-IT',
  },
} as const;
type Lang = keyof typeof TRANSLATIONS;

export default function GuestPortal({ token, booking, hotel, apartments, allExtras, serverBookedExtraIds, thingsToSee, checkinImages, initialMessages }: Props) {
  const accent = hotel.accentColor || '#111827';
  const onAccent = hexLuminance(accent) > 0.4 ? '#111827' : '#ffffff';
  const accentOnLight = hexLuminance(accent) > 0.4 ? '#374151' : accent;
  const [tab, setTab] = useState<Tab>('arrival');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [msgInput, setMsgInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [checkoutDone, setCheckoutDone] = useState(booking.checkoutRequested);
  const [bookedExtras, setBookedExtras] = useState<number[]>(serverBookedExtraIds);
  const [msgError, setMsgError] = useState('');
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [tabContentKey, setTabContentKey] = useState(0);
  const [freshlyBooked, setFreshlyBooked] = useState(new Set<number>());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gp_lang') as Lang | null;
      if (stored && stored in TRANSLATIONS) return stored;
      const nav = navigator.language.slice(0, 2) as Lang;
      if (nav in TRANSLATIONS) return nav;
    }
    const bl = booking.language as Lang;
    return bl in TRANSLATIONS ? bl : 'de';
  });
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    localStorage.setItem('gp_lang', lang);
  }, [lang]);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      if (current > lastScrollY.current && current > window.innerHeight * 0.5) {
        setNavVisible(false);
      } else if (current < lastScrollY.current) {
        setNavVisible(true);
      }
      lastScrollY.current = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (tab !== 'messages') return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/gast/${token}`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
      } catch {}
    }, 20_000);
    return () => clearInterval(iv);
  }, [tab, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const mapsUrl = hotel.address
    ? `https://maps.google.com/?q=${encodeURIComponent(hotel.address)}`
    : null;
  const waUrl = hotel.whatsappNumber
    ? `https://wa.me/${hotel.whatsappNumber.replace(/\D/g, '')}`
    : null;

  function handleSendMessage() {
    if (!msgInput.trim()) return;
    setMsgError('');
    startTransition(async () => {
      try {
        await sendGuestMessage(token, msgInput);
        const res = await fetch(`/api/gast/${token}`);
        if (res.ok) setMessages((await res.json()).messages);
        setMsgInput('');
      } catch {
        setMsgError(t.msgError);
      }
    });
  }

  function handleCheckout() {
    startTransition(async () => {
      await requestCheckout(token);
      setCheckoutDone(true);
    });
  }

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    setTabContentKey((k) => k + 1);
  }

  function handleBookExtra(extraId: number) {
    startTransition(async () => {
      await bookExtra(token, extraId);
      setBookedExtras((prev) => [...prev, extraId]);
      setFreshlyBooked((prev) => new Set(prev).add(extraId));
    });
  }

  const hasHausinfos = !!(hotel.wifiSsid || hotel.wifiPassword || hotel.parkingInfo || hotel.wasteInfo || hotel.houseRules || hotel.emergencyNumbers.length > 0);

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'arrival', label: t.navArrival,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      id: 'extras', label: t.navExtras,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
    },
    {
      id: 'surroundings', label: t.navSurroundings,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    },
    {
      id: 'messages', label: t.navMessages,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    },
    {
      id: 'checkout', label: t.navCheckout,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    },
  ];

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; background: #f0f2f5; color: #111827; min-height: 100vh; padding: 12px 12px 0; padding-bottom: env(safe-area-inset-bottom); }
    .wrap { max-width: 560px; margin: 0 auto; padding-bottom: max(110px, calc(90px + env(safe-area-inset-bottom))); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.09); }
    .header { background: ${accent}; color: ${onAccent}; padding: 24px 20px 20px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .header-left { flex: 1; min-width: 0; }
    .header-hotel { font-size: 12px; font-weight: 700; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
    .header-title { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
    .header-sub { font-size: 14px; opacity: 0.8; margin-top: 4px; }
    .header-checkin-btn { padding: 7px 14px; border-radius: 20px; border: 1.5px solid rgba(255,255,255,0.55); background: rgba(255,255,255,0.15); color: inherit; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; font-family: inherit; flex-shrink: 0; text-decoration: none; display: inline-flex; align-items: center; }
    @keyframes cardReveal { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes bwPop { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.18)} 100%{transform:scale(1);opacity:1} }
    .content-anim > * { animation: cardReveal 0.28s ease both; }
    .content-anim > *:nth-child(1) { animation-delay: 0ms; }
    .content-anim > *:nth-child(2) { animation-delay: 55ms; }
    .content-anim > *:nth-child(3) { animation-delay: 110ms; }
    .content-anim > *:nth-child(4) { animation-delay: 165ms; }
    .content-anim > *:nth-child(5) { animation-delay: 220ms; }
    .content-anim > *:nth-child(6) { animation-delay: 275ms; }
    .content-anim > *:nth-child(7) { animation-delay: 330ms; }
    .content-anim > *:nth-child(8) { animation-delay: 385ms; }
    .content-anim > *:nth-child(9) { animation-delay: 440ms; }
    .badge-pop { animation: bwPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
    .content { padding: 20px; display: grid; gap: 16px; }
    .section-label { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 0 0; }
    .card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .card-head { padding: 14px 18px; background: #f9fafb; border-bottom: 1px solid #f0f0f0; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }
    .card-body { padding: 16px 18px; display: grid; gap: 12px; }
    .row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: 14px; }
    .row-lbl { color: #6b7280; flex-shrink: 0; }
    .row-val { font-weight: 600; text-align: right; }
    .divider { height: 1px; background: #f0f0f0; }
    .btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px 20px; border-radius: 10px; border: none; background: ${accent}; color: ${onAccent}; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; font-family: inherit; }
    .btn:hover { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-outline { background: transparent; border: 1.5px solid ${accent}; color: ${accent}; }
    .btn-sm { padding: 9px 16px; font-size: 13px; width: auto; }
    .contact-grid { display: grid; gap: 10px; }
    .msg-list { display: grid; gap: 10px; max-height: 340px; overflow-y: auto; padding: 4px 0; }
    .msg-bubble { max-width: 82%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.5; }
    .msg-hotel { background: #f3f4f6; color: #111827; border-bottom-left-radius: 4px; align-self: flex-start; }
    .msg-guest { background: ${accent}; color: ${onAccent}; border-bottom-right-radius: 4px; align-self: flex-end; }
    .msg-wrap { display: flex; flex-direction: column; }
    .msg-wrap.guest { align-items: flex-end; }
    .msg-time { font-size: 11px; color: #9ca3af; margin-top: 3px; padding: 0 4px; }
    .msg-input-row { display: flex; gap: 8px; }
    .msg-input { flex: 1; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: inherit; resize: none; }
    .msg-input:focus { outline: none; border-color: ${accent}; }
    .extra-card { border: 1.5px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .extra-img { width: 100%; height: 120px; object-fit: cover; background: #f3f4f6; }
    .extra-info { padding: 12px 14px; }
    .extra-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .extra-desc { font-size: 13px; color: #6b7280; line-height: 1.4; margin-bottom: 8px; }
    .extra-footer { display: flex; justify-content: space-between; align-items: center; }
    .extra-price { font-size: 15px; font-weight: 800; color: ${accent}; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-green { background: #dcfce7; color: #166534; }
    .nuki { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 18px; text-align: center; }
    .nuki-label { font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .nuki-code { font-size: 34px; font-weight: 900; letter-spacing: 0.2em; color: #111827; font-variant-numeric: tabular-nums; }
    .nuki-hint { font-size: 12px; color: #374151; margin-top: 6px; }
    .success-box { text-align: center; padding: 28px 20px; }
    .success-icon { font-size: 48px; margin-bottom: 12px; }
    .success-title { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
    .success-text { font-size: 14px; color: #6b7280; line-height: 1.6; }
    .error-text { font-size: 13px; color: #dc2626; }
    .desc-details > summary { list-style: none; cursor: pointer; -webkit-user-select: none; user-select: none; }
    .desc-details > summary::-webkit-details-marker { display: none; }
    .desc-preview { font-size: 13px; color: #6b7280; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .desc-collapse { display: none; font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .desc-full { display: none; font-size: 13px; color: #6b7280; line-height: 1.4; }
    .desc-details[open] .desc-preview { display: none; }
    .desc-details[open] .desc-collapse { display: block; }
    .desc-details[open] .desc-full { display: block; }
    /* Bottom Navigation */
    .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: center; padding: 0 12px calc(16px + env(safe-area-inset-bottom)); pointer-events: none; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
    .bottom-nav-inner { pointer-events: all; display: flex; gap: 2px; background: rgba(18,18,18,0.78); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-radius: 20px; padding: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.09); width: 100%; max-width: 420px; }
    .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 8px 8px; border: none; background: none; color: rgba(255,255,255,0.45); cursor: pointer; font-family: inherit; font-size: 9px; font-weight: 600; letter-spacing: 0.03em; transition: color 0.2s, background 0.2s; -webkit-tap-highlight-color: transparent; border-radius: 14px; white-space: nowrap; }
    .nav-btn.active { color: #fff; background: rgba(255,255,255,0.14); }
    @media (prefers-color-scheme: dark) {
      body { background: #0f172a; color: #f1f5f9; }
      .card { background: #1e293b; box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
      .card-head { background: #162032; border-color: #2d3f55; color: #64748b; }
      .row-lbl { color: #94a3b8; }
      .divider { background: #2d3f55; }
      .msg-hotel { background: #2d3f55; color: #f1f5f9; }
      .msg-input { background: #1e293b; color: #f1f5f9; border-color: #2d3f55; }
      .extra-card { border-color: #2d3f55; }
      .extra-img { background: #2d3f55; }
      .extra-desc { color: #94a3b8; }
      .nuki { background: #052e16; border-color: #166534; }
      .nuki-code { color: #f1f5f9; }
      .nuki-hint { color: #d1fae5; }
      .section-label { color: #475569; }
    }
  `;

  return (
    <html lang={lang}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content={accent} />
        <link rel="manifest" href="/manifest.json" />
        <style>{css}</style>
      </head>
      <body>
        <div className="wrap">
          {/* Header */}
          <div className="header">
            <div className="header-left">
              <div className="header-hotel">{hotel.name}</div>
              <div className="header-title">{t.guestportal}</div>
              <div className="header-sub">
                {fmt(booking.arrival, t.locale)} — {fmt(booking.departure, t.locale)} · {booking.nights} {booking.nights === 1 ? t.night : t.nights}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              {hotel.preArrivalEnabled && (
                <a
                  href={`/checkin/${token}`}
                  className="header-checkin-btn"
                  style={booking.checkinCompleted ? { background: 'rgba(34,197,94,0.25)', borderColor: 'rgba(34,197,94,0.7)' } : undefined}
                  title={booking.checkinCompleted ? t.checkinDoneView : undefined}
                >
                  {booking.checkinCompleted ? `✓ ${t.checkinDone}` : 'Check-In ↗'}
                </a>
              )}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['de', 'en', 'it'] as Lang[]).map((l) => (
                  <button key={l} onClick={() => setLang(l)} style={{
                    padding: '3px 8px', borderRadius: 6,
                    border: `1px solid rgba(255,255,255,${lang === l ? '0.6' : '0.2'})`,
                    background: lang === l ? 'rgba(255,255,255,0.18)' : 'transparent',
                    color: onAccent, fontSize: 10, fontWeight: lang === l ? 700 : 400,
                    cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em',
                    opacity: lang === l ? 1 : 0.65,
                  }}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab: Anreise */}
          {tab === 'arrival' && (
            <div key={tabContentKey} className="content content-anim">
              {hotel.preArrivalEnabled && (
                booking.checkinCompleted ? (
                  <a href={`/checkin/${token}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, textDecoration: 'none', color: '#166534' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>✓ {t.checkinDone}</div>
                      <div style={{ fontSize: 13, opacity: 0.75 }}>{booking.checkinArrivalTime ? `${t.checkinFrom} ${booking.checkinArrivalTime}${t.oclock} · ${t.checkinDoneView}` : t.checkinDoneView}</div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </a>
                ) : (
                  <a href={`/checkin/${token}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', background: `${accent}14`, border: `1px solid ${accent}44`, borderRadius: 14, textDecoration: 'none', color: accentOnLight }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{t.checkinPending}</div>
                      <div style={{ fontSize: 13, opacity: 0.8 }}>{t.checkinPendingDesc}</div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </a>
                )
              )}
              {hotel.checkinTime && (
                <div className="card">
                  <div className="card-head">🕐 Check-in</div>
                  <div className="card-body">
                    <div className="row">
                      <span className="row-lbl">{t.checkinFrom}</span>
                      <span className="row-val">{hotel.checkinTime}{t.oclock}</span>
                    </div>
                  </div>
                </div>
              )}
              {(hotel.checkinInfo || checkinImages.length > 0) && (
                <div className="card">
                  <div className="card-head">{t.keyHandover}</div>
                  <div className="card-body">
                    {hotel.checkinInfo && (
                      <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: checkinImages.length > 0 ? '0 0 16px' : 0 }}>{hotel.checkinInfo}</p>
                    )}
                    {checkinImages.length > 0 && (
                      <div style={{ display: 'grid', gap: 12 }}>
                        {checkinImages.map((img) => (
                          <div key={img.id}>
                            <img
                              src={img.imageUrl}
                              alt={img.caption ?? ''}
                              style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 280, display: 'block' }}
                              loading="lazy"
                            />
                            {img.caption && (
                              <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0', lineHeight: 1.5 }}>{img.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {booking.nukiCode && (
                <div className="nuki">
                  <div className="nuki-label">{t.accessCode}</div>
                  <div className="nuki-code">{booking.nukiCode}</div>
                  <div className="nuki-hint">{t.accessCodeValid}</div>
                </div>
              )}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {t.planArrival}
                </a>
              )}
              {(hotel.phone || hotel.email || waUrl) && (
                <div className="card">
                  <div className="card-head">{t.contact}</div>
                  <div className="card-body contact-grid">
                    {hotel.phone && (
                      <a href={`tel:${hotel.phone}`} className="btn btn-outline">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z"/></svg>
                        {t.call}
                      </a>
                    )}
                    {waUrl && (
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        {t.whatsapp}
                      </a>
                    )}
                    {hotel.email && (
                      <a href={`mailto:${hotel.email}`} className="btn btn-outline">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        {t.emailBtn}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Hausinfos */}
              {hasHausinfos && (
                <>
                  <div className="section-label">{t.houseinfo}</div>
                  {(hotel.wifiSsid || hotel.wifiPassword) && (
                    <div className="card">
                      <div className="card-head">{t.wifi}</div>
                      <div className="card-body">
                        {hotel.wifiSsid && (
                          <div className="row">
                            <span className="row-lbl">{t.network}</span>
                            <span className="row-val">{hotel.wifiSsid}</span>
                          </div>
                        )}
                        {hotel.wifiPassword && (
                          <div className="row">
                            <span className="row-lbl">{t.password}</span>
                            <span className="row-val" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{hotel.wifiPassword}</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText(hotel.wifiPassword!).then(() => { setCopiedWifi(true); setTimeout(() => setCopiedWifi(false), 2000); }); }}
                                style={{ padding: '3px 10px', border: '1.5px solid #e5e7eb', borderRadius: 6, background: copiedWifi ? '#dcfce7' : '#f9fafb', color: copiedWifi ? '#166534' : '#6b7280', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
                              >
                                {copiedWifi ? t.copied : t.copy}
                              </button>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {hotel.parkingInfo && (
                    <div className="card">
                      <div className="card-head">{t.parking}</div>
                      <div className="card-body">
                        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{hotel.parkingInfo}</p>
                      </div>
                    </div>
                  )}
                  {hotel.wasteInfo && (
                    <div className="card">
                      <div className="card-head">{t.waste}</div>
                      <div className="card-body">
                        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{hotel.wasteInfo}</p>
                      </div>
                    </div>
                  )}
                  {hotel.houseRules && (
                    <div className="card">
                      <div className="card-head">{t.houseRules}</div>
                      <div className="card-body">
                        <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{hotel.houseRules}</p>
                      </div>
                    </div>
                  )}
                  {hotel.emergencyNumbers.length > 0 && (
                    <div className="card">
                      <div className="card-head">{t.emergency}</div>
                      <div className="card-body">
                        {hotel.emergencyNumbers.map((e, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, color: '#374151' }}>{e.label}</span>
                            <a href={`tel:${e.number.replace(/\s/g, '')}`} style={{ fontSize: 15, fontWeight: 700, color: accent, textDecoration: 'none', fontFamily: 'monospace' }}>{e.number}</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tab: Extras */}
          {tab === 'extras' && (
            <div key={tabContentKey} className="content content-anim">
              {allExtras.length === 0 ? (
                <div className="card">
                  <div className="card-body">
                    <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>{t.noExtras}</p>
                  </div>
                </div>
              ) : allExtras.map((extra) => {
                const done = bookedExtras.includes(extra.id);
                const groupBlocked = !done && extra.exclusiveGroup !== null &&
                  allExtras.some((e) => e.exclusiveGroup === extra.exclusiveGroup && bookedExtras.includes(e.id));
                return (
                  <div key={extra.id} className="extra-card" style={{ opacity: done || groupBlocked ? 0.6 : 1 }}>
                    {extra.imageUrl && <img src={extra.imageUrl} alt={extra.name} className="extra-img" loading="lazy" />}
                    <div className="extra-info">
                      <div className="extra-name">{extra.name}</div>
                      {extra.description && <div className="extra-desc">{extra.description}</div>}
                      <div className="extra-footer">
                        <span className="extra-price">{eur(extra.price)}</span>
                        {done ? (
                          <span className={`badge badge-green${freshlyBooked.has(extra.id) ? ' badge-pop' : ''}`}>{t.booked}</span>
                        ) : groupBlocked ? (
                          <span className="badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>{t.variantBooked}</span>
                        ) : (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {extra.linkUrl && (
                              <a href={extra.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">{t.learnMore}</a>
                            )}
                            <button className="btn btn-sm" disabled={isPending} onClick={() => handleBookExtra(extra.id)}>
                              {t.add}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab: Umgebung */}
          {tab === 'surroundings' && (
            <div key={tabContentKey} className="content content-anim">
              {thingsToSee.length === 0 ? (
                <div className="card">
                  <div className="card-body">
                    <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>{t.noSurroundings}</p>
                  </div>
                </div>
              ) : Object.entries(
                thingsToSee.reduce<Record<string, ThingToSee[]>>((acc, t) => { (acc[t.category] ??= []).push(t); return acc; }, {})
              ).map(([cat, entries]) => (
                <div key={cat}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'rgb(75,75,75)', marginBottom: 10 }}>{(TRANSLATIONS[lang].cats as Record<string, string>)[cat] ?? cat}</div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {entries.map((entry) => (
                      <div key={entry.id} className="card" style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', gap: 0 }}>
                          {entry.imageUrl && <img src={entry.imageUrl} alt={entry.title} style={{ width: 90, height: 80, objectFit: 'cover', flexShrink: 0 }} loading="lazy" />}
                          <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{entry.title}</div>
                            {entry.description && (
                              <details className="desc-details" style={{ marginBottom: 6 }}>
                                <summary>
                                  <span className="desc-preview">{entry.description}</span>
                                  <span className="desc-collapse">{t.less}</span>
                                </summary>
                                <span className="desc-full">{entry.description}</span>
                              </details>
                            )}
                            {entry.address && <div style={{ fontSize: 12, color: '#9ca3af' }}>{entry.address}</div>}
                          </div>
                          {entry.mapsUrl && (
                            <a href={entry.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', padding: '0 14px', color: accent, flexShrink: 0 }} aria-label={t.openInMaps}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Nachrichten */}
          {tab === 'messages' && (
            <div key={tabContentKey} className="content content-anim">
              <div className="card">
                <div className="card-head">{t.messagesHead}</div>
                <div className="card-body">
                  {messages.length === 0 ? (
                    <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>
                      {t.noMessages(hotel.name)}
                    </p>
                  ) : (
                    <div className="msg-list">
                      {messages.map((m) => (
                        <div key={m.id} className={`msg-wrap${m.sender === 'guest' ? ' guest' : ''}`}>
                          <div className={`msg-bubble ${m.sender === 'hotel' ? 'msg-hotel' : 'msg-guest'}`}>{m.body}</div>
                          <span className="msg-time">{m.sender === 'hotel' ? `${hotel.name} · ` : ''}{fmtTime(m.createdAt, t.locale)}</span>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                  <div className="divider" />
                  <div className="msg-input-row">
                    <textarea
                      className="msg-input" rows={2} placeholder={t.msgPlaceholder}
                      value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    />
                    <button className="btn btn-sm" style={{ flexShrink: 0, alignSelf: 'flex-end' }} onClick={handleSendMessage} disabled={isPending || !msgInput.trim()} aria-label="Senden">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </div>
                  {msgError && <p className="error-text">{msgError}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Abreise */}
          {tab === 'checkout' && (
            <div key={tabContentKey} className="content content-anim">
              <div className="card">
                <div className="card-head">{t.checkoutHead}</div>
                <div className="card-body">
                  {checkoutDone ? (
                    <div className="success-box">
                      <div className="success-icon">👋</div>
                      <div className="success-title">{t.goodbye}</div>
                      <div className="success-text">{t.goodbyeText}</div>
                    </div>
                  ) : (
                    <>
                      {hotel.checkoutTime && (
                        <div className="row">
                          <span className="row-lbl">{t.checkoutTime}</span>
                          <span className="row-val">{hotel.checkoutTime}{t.oclock}</span>
                        </div>
                      )}
                      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                        {t.checkoutDesc}
                      </p>
                      <button className="btn" disabled={isPending} onClick={handleCheckout}>{t.checkoutBtn}</button>
                    </>
                  )}
                  {hotel.reviewRequestLink && checkoutDone && (
                    <>
                      <div className="divider" />
                      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{t.reviewPrompt}</p>
                      <a href={hotel.reviewRequestLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline">{t.reviewBtn}</a>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="bottom-nav" aria-label="Navigation" style={{ transform: navVisible ? 'translateY(0)' : 'translateY(calc(100% + 32px))' }}>
          <div className="bottom-nav-inner">
            {navItems.map((item) => (
              <button key={item.id} className={`nav-btn${tab === item.id ? ' active' : ''}`} onClick={() => handleTabChange(item.id)} aria-label={item.label}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </body>
    </html>
  );
}
