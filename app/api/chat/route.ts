import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';
import { prisma } from '@/src/lib/prisma';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

function normalizeDate(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getNights(arrival: Date, departure: Date) {
  return Math.round((normalizeDate(departure).getTime() - normalizeDate(arrival).getTime()) / 86_400_000);
}

// ── Tool declarations (Gemini format) ─────────────────────────────────────────

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'check_availability',
    description: 'Prüft alle verfügbaren Apartments für den gewünschten Zeitraum und gibt Preise zurück.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        check_in:  { type: Type.STRING, description: 'Anreisedatum (YYYY-MM-DD)' },
        check_out: { type: Type.STRING, description: 'Abreisedatum (YYYY-MM-DD)' },
        guests:    { type: Type.NUMBER, description: 'Anzahl Erwachsene' },
        children:  { type: Type.NUMBER, description: 'Anzahl Kinder (optional)' },
      },
      required: ['check_in', 'check_out', 'guests'],
    },
  },
  {
    name: 'get_property_info',
    description: 'Gibt strukturierte Infos zu Extras, Upsells und Policies zurück (Frühstück, Haustiere, Stornierung, Parken, etc.).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING, description: 'Thema der Anfrage, z.B. breakfast, cancellation, parking, pets, extras, checkin' },
      },
      required: ['topic'],
    },
  },
  {
    name: 'get_booking_url',
    description: 'Generiert einen direkten vorausgefüllten Link zur Buchungsseite für ein bestimmtes Apartment.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        apartment_id: { type: Type.NUMBER, description: 'ID des gewählten Apartments' },
        check_in:     { type: Type.STRING, description: 'Anreisedatum (YYYY-MM-DD)' },
        check_out:    { type: Type.STRING, description: 'Abreisedatum (YYYY-MM-DD)' },
        adults:       { type: Type.NUMBER, description: 'Anzahl Erwachsene' },
        children:     { type: Type.NUMBER, description: 'Anzahl Kinder' },
      },
      required: ['apartment_id', 'check_in', 'check_out', 'adults'],
    },
  },
];

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function handleCheckAvailability(
  hotelId: number,
  input: { check_in: string; check_out: string; guests: number; children?: number },
) {
  const arrival   = new Date(input.check_in);
  const departure = new Date(input.check_out);
  const nights    = getNights(arrival, departure);

  if (nights <= 0) return { error: 'Abreisedatum muss nach Anreisedatum liegen.' };

  const [apartments, bookedRequests, hotelBlocks] = await Promise.all([
    prisma.apartment.findMany({
      where: {
        hotelId, isActive: true,
        maxAdults: { gte: input.guests },
        ...(input.children ? { maxChildren: { gte: input.children } } : {}),
      },
      include: { blockedRanges: true, priceSeasons: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.request.findMany({
      where: {
        hotelId,
        status: { in: ['booked', 'pending_paypal', 'pending_stripe'] },
        arrival: { lt: departure },
        departure: { gt: arrival },
      },
      select: { selectedApartmentIds: true },
    }),
    prisma.blockedRange.findMany({
      where: {
        hotelId,
        apartmentId: null,
        startDate: { lt: departure },
        endDate: { gt: arrival },
      },
    }),
  ]);

  const bookedIds = new Set(
    bookedRequests.flatMap(b =>
      b.selectedApartmentIds.split(',').map(s => Number(s.trim())).filter(Boolean),
    ),
  );
  const hotelBlocked = hotelBlocks.length > 0;

  const results = apartments.map(apt => {
    if (hotelBlocked) return { id: apt.id, name: apt.name, available: false };

    const blocked =
      bookedIds.has(apt.id) ||
      apt.blockedRanges.some(r => arrival < r.endDate && departure > r.startDate);

    if (blocked) return { id: apt.id, name: apt.name, available: false };

    let roomTotal = 0;
    for (let i = 0; i < nights; i++) {
      const night = new Date(arrival);
      night.setDate(arrival.getDate() + i);
      const season = apt.priceSeasons.find(s => night >= s.startDate && night < s.endDate);
      roomTotal += season?.pricePerNight ?? apt.basePrice ?? 0;
    }
    const cleaning = apt.cleaningFee ?? 0;
    const total = roomTotal + cleaning;

    return {
      id: apt.id,
      name: apt.name,
      available: true,
      maxAdults: apt.maxAdults,
      maxChildren: apt.maxChildren,
      size: apt.size,
      bedrooms: apt.bedrooms,
      description: apt.description,
      amenities: apt.amenities,
      nights,
      pricePerNight: Number((roomTotal / nights).toFixed(2)),
      cleaningFee: cleaning,
      totalPrice: Number(total.toFixed(2)),
    };
  });

  const available = results
    .filter(r => r.available)
    .sort((a, b) => ('size' in b ? (b.size ?? 0) : 0) - ('size' in a ? (a.size ?? 0) : 0));
  // Return max 3 to force a focused recommendation instead of a full list
  const top = available.slice(0, 3);
  return { nights, available: top, moreAvailable: available.length - top.length };
}

async function handleGetPropertyInfo(
  hotel: NonNullable<Awaited<ReturnType<typeof loadHotel>>>,
  input: { topic: string },
) {
  const s = hotel.settings;
  const extras = hotel.extras.filter(e => e.isActive);
  const upsells = extras.filter(e => e.showInUpsell);
  const faq = (hotel.chatbotFaq as Array<{ question: string; answer: string }> | null) ?? [];

  const faqMatches = faq.filter(q =>
    q.question.toLowerCase().includes(input.topic.toLowerCase()) ||
    input.topic.toLowerCase().includes(q.question.toLowerCase()),
  );

  return {
    topic: input.topic,
    checkinTime:  s?.checkinTime  ?? null,
    checkoutTime: s?.checkoutTime ?? null,
    address:      s?.address      ?? null,
    parkingInfo:  s?.parkingInfo  ?? null,
    houseRules:   s?.houseRules   ?? null,
    extras: extras.map(e => ({
      name: e.name,
      price: Number(e.price),
      billingType: e.billingType,
      description: e.description,
    })),
    upsells: upsells.map(e => ({
      name: e.name,
      price: Number(e.price),
      billingType: e.billingType,
    })),
    faqMatches,
  };
}

function handleGetBookingUrl(
  hotel: NonNullable<Awaited<ReturnType<typeof loadHotel>>>,
  input: { apartment_id: number; check_in: string; check_out: string; adults: number; children?: number },
) {
  const base = hotel.settings?.miniWidgetTarget ?? `https://bookingwulf.com/widget/${hotel.slug}`;
  const apt = hotel.apartments.find(a => a.id === input.apartment_id);
  const aptName = apt?.name ?? '';

  const params = new URLSearchParams({
    arrival:   input.check_in,
    departure: input.check_out,
    adults:    String(input.adults),
    ...(input.children ? { children: String(input.children) } : {}),
    ...(aptName ? { apartment: aptName } : {}),
  });

  return { url: `${base}?${params.toString()}`, apartmentName: aptName };
}

// ── Hotel loader ──────────────────────────────────────────────────────────────

async function loadHotel(slug: string) {
  return prisma.hotel.findUnique({
    where: { slug },
    select: {
      id: true, name: true, slug: true,
      chatbotEnabled: true, chatbotName: true, chatbotAvatar: true, chatbotColor: true,
      chatbotContext: true, chatbotFaq: true,
      settings: {
        select: {
          checkinTime: true, checkoutTime: true,
          address: true, parkingInfo: true, houseRules: true,
          miniWidgetTarget: true,
        },
      },
      extras: {
        where: { isActive: true },
        select: { name: true, price: true, billingType: true, description: true, showInUpsell: true, isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      apartments: {
        where: { isActive: true },
        select: { id: true, name: true, description: true, amenities: true, maxAdults: true, maxChildren: true, size: true, bedrooms: true, view: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(hotel: NonNullable<Awaited<ReturnType<typeof loadHotel>>>) {
  const upsells = hotel.extras
    .filter(e => e.showInUpsell && e.isActive)
    .map(e => `- ${e.name} (${Number(e.price).toFixed(2)} €, ${e.billingType})`)
    .join('\n');

  const apartmentList = hotel.apartments.map(a => {
    const parts = [`**${a.name}**`];
    if (a.maxAdults) parts.push(`bis ${a.maxAdults} Erwachsene`);
    if (a.maxChildren) parts.push(`${a.maxChildren} Kinder möglich`);
    if (a.size) parts.push(`${a.size} m²`);
    if (a.bedrooms) parts.push(`${a.bedrooms} Schlafzimmer`);
    if (a.view) parts.push(a.view);
    const header = parts.join(', ');
    const desc = a.description ? `\n  ${a.description}` : '';
    const amenities = a.amenities?.length ? `\n  Ausstattung: ${a.amenities.join(', ')}` : '';
    return `- ${header}${desc}${amenities}`;
  }).join('\n');

  const assistantName = hotel.chatbotName || 'Buchungs-Assistent';
  let prompt = `Du bist ${assistantName}, ein freundlicher und kompetenter Buchungsassistent für ${hotel.name}.

Deine Aufgaben:
- Beantworte Fragen zur Unterkunft, Ausstattung, Lage, Preisen und Policies
- Empfehle aktiv das passende Apartment basierend auf den Wünschen des Gastes
- Weise auf passende Extras hin (Frühstück, Spa, etc.)
- Generiere am Ende einen direkten Buchungslink

Empfehlungslogik — passe deine Empfehlung an den Kontext an:
- **Kinder**: Apartments mit maxChildren > 0 bevorzugen; kinderfreundliche Ausstattung (Kinderbett, Spielbereich) hervorheben
- **Paare / Romantik** (Hochzeit, Jubiläum, Valentinstag): Premium-Apartment, Aussicht, ruhige Lage; weise auf romantische Extras hin
- **Wellness-Urlaub**: ruhige, großzügige Apartments; Sauna, Spa oder Massage-Extras empfehlen
- **Aktivurlaub** (Wandern, Ski, Rad): Lage und Infrastruktur erwähnen (Skiroom, Fahrradkeller falls in Ausstattung)
- **Langer Aufenthalt** (7+ Nächte): Küche/Küchenzeile wichtig; größeres Apartment bevorzugen
- **Kurzer Trip** (1–2 Nächte): kompakteres Apartment, Gesamtkosten im Blick
- **Haustiere**: prüfe ob "haustierfreundlich" oder "Hunde erlaubt" in der Apartment-Ausstattung steht; falls nicht, klar kommunizieren
- **Barrierefreiheit**: auf Erdgeschoss, Lift oder barrierefreie Ausstattung hinweisen falls erwähnt
- **Budget**: wenn Gast nach günstigeren Optionen fragt → kleineres Apartment empfehlen, Reinigungsgebühr erklären
- **Remote Work**: WLAN-Qualität, ruhige Lage, Schreibtisch aus Ausstattung hervorheben
- Nenne immer konkret WARUM du ein Apartment empfiehlst (Ausstattung, Größe, Lage, Anlass)
- Du kannst Apartments beschreiben und vorempfehlen — aber nenne Preise erst nach check_availability
- Nach check_availability: empfehle maximal 2 Apartments — das beste zuerst mit Begründung, ein Alternativvorschlag falls sinnvoll. Nicht alle verfügbaren auflisten.
- Nach einer Empfehlung immer mit einer konkreten Frage abschließen, z.B. "Welches klingt besser für euch?" oder "Soll ich für Apartment 6 einen Buchungslink erstellen?"

Wichtige Regeln:
- Rufe IMMER check_availability bevor du konkrete Preise oder Verfügbarkeit nennst
- Frage nach Anreise, Abreise und Personenzahl (inkl. Kinder) falls noch unbekannt
- Halte dich an Buchungs- und Unterkunftsthemen
- Antworte auf Deutsch; wechsle auf Englisch wenn der Gast Englisch schreibt
- Sprich den Gast konsequent mit "Sie" an — niemals "du", auch nicht nach mehreren Nachrichten
- Ton: ruhig, klar, direkt — kein Marketing-Speak, keine übertriebenen Adjektive; Ausrufezeichen sparsam einsetzen, nicht am Anfang jeder Antwort
- Bevor du den Buchungslink generierst: frage kurz und neutral nach 1–2 passenden Extras — keine Verkaufsfloskeln, nur sachlich z.B. "Möchtet ihr noch Frühstück dazunehmen (12 € p.P./Nacht)?" — warte auf Antwort, dann Link
- Den Buchungslink IMMER so formatieren: kurzer Satz ZUERST, dann URL in der nächsten Zeile, dann ein kurzer freundlicher Abschlusssatz — z.B. "Hier ist der Link für Apartment 6:\nhttps://...\n\nBei Fragen bin ich gerne da."
- Wähle Extras passend zum Kontext (Familie → Kinderbett, Wellness → Spa etc.)

Unsere Apartments:
${apartmentList}`;

  if (upsells) {
    prompt += `\n\nVerfügbare Extras zum Upselling:\n${upsells}`;
  }

  if (hotel.chatbotContext) {
    prompt += `\n\nInformationen über die Unterkunft (Website-Inhalt):\n${hotel.chatbotContext.slice(0, 8000)}`;
  }

  if (hotel.chatbotFaq && Array.isArray(hotel.chatbotFaq) && hotel.chatbotFaq.length > 0) {
    const faqText = (hotel.chatbotFaq as Array<{ question: string; answer: string }>)
      .map(f => `F: ${f.question}\nA: ${f.answer}`)
      .join('\n\n');
    prompt += `\n\nZusätzliche FAQ:\n${faqText}`;
  }

  return prompt;
}

// ── Config endpoint (GET) ─────────────────────────────────────────────────────

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('hotel');
  if (!slug) return NextResponse.json({ error: 'hotel erforderlich' }, { status: 400, headers: corsHeaders });

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { chatbotEnabled: true, chatbotName: true, chatbotAvatar: true, chatbotColor: true },
  });

  if (!hotel || !hotel.chatbotEnabled) {
    return NextResponse.json({ error: 'Chatbot nicht verfügbar' }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json({
    name: hotel.chatbotName || null,
    color: hotel.chatbotColor || null,
    avatar: hotel.chatbotAvatar || null,
  }, { headers: corsHeaders });
}

// ── Main handler ──────────────────────────────────────────────────────────────

type ClientMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  try {
    const { hotelSlug, messages } = await req.json() as {
      hotelSlug: string;
      messages: ClientMessage[];
    };

    if (!hotelSlug || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'hotelSlug und messages erforderlich.' }, { status: 400, headers: corsHeaders });
    }

    const hotel = await loadHotel(hotelSlug);
    if (!hotel) return NextResponse.json({ error: 'Hotel nicht gefunden.' }, { status: 404, headers: corsHeaders });
    if (!hotel.chatbotEnabled) return NextResponse.json({ error: 'Chatbot nicht aktiviert.' }, { status: 403, headers: corsHeaders });

    const systemPrompt = buildSystemPrompt(hotel);

    // Convert client messages to Gemini format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contents: any[] = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Tool-use loop — max 5 iterations
    for (let i = 0; i < 5; i++) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ functionDeclarations }],
        },
      });

      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const functionCallParts = parts.filter((p: any) => p.functionCall);

      if (functionCallParts.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let text = parts.find((p: any) => p.text)?.text ?? response.text ?? '';
        // If response starts with URL: move trailing text before the link
        const urlFirst = text.trim().match(/^(https?:\/\/\S+)([\s\S]*)$/);
        if (urlFirst) {
          const url = urlFirst[1];
          const trailing = urlFirst[2].trim();
          text = trailing
            ? `Hier ist der Buchungslink:\n${url}\n\n${trailing}`
            : `Hier ist der Buchungslink:\n${url}\n\nBei Fragen bin ich gerne da.`;
        } else if (/https?:\/\/\S+$/.test(text.trim())) {
          // Response ends with URL and no closing sentence — append one
          text = `${text.trim()}\n\nBei Fragen bin ich gerne da.`;
        }
        return NextResponse.json({ message: text, assistantName: hotel.chatbotName || null, avatarUrl: hotel.chatbotAvatar || null }, { headers: corsHeaders });
      }

      // Append model's turn (with function calls)
      contents = [...contents, { role: 'model', parts }];

      // Execute each function call
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const functionResponses: any[] = [];
      for (const part of functionCallParts) {
        const { name, args } = part.functionCall!;
        let result: unknown;

        if (name === 'check_availability') {
          result = await handleCheckAvailability(hotel.id, args as Parameters<typeof handleCheckAvailability>[1]);
        } else if (name === 'get_property_info') {
          result = await handleGetPropertyInfo(hotel, args as Parameters<typeof handleGetPropertyInfo>[1]);
        } else if (name === 'get_booking_url') {
          result = handleGetBookingUrl(hotel, args as Parameters<typeof handleGetBookingUrl>[1]);
        } else {
          result = { error: 'Unbekanntes Tool.' };
        }

        functionResponses.push({
          functionResponse: { name, response: { result } },
        });
      }

      contents = [...contents, { role: 'user', parts: functionResponses }];
    }

    return NextResponse.json({ error: 'Keine Antwort vom Assistenten.' }, { status: 500, headers: corsHeaders });
  } catch (e) {
    console.error('[chat]', e);
    return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500, headers: corsHeaders });
  }
}
