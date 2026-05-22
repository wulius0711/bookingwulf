/**
 * Kern-Scanner: findet easybooking-Nutzer anhand von Raw-HTML-Markern.
 * Wird von regionsspezifischen Skripten importiert.
 *
 * Aufruf direkt mit Properties-Array:
 *   npx tsx scripts/scan-easybooking-[region].ts
 *
 * Oder manuell:
 *   import { scanRegion } from './scan-easybooking';
 *   scanRegion([{ betrieb, website, region, ... }]);
 */

import { prisma } from '../src/lib/prisma';

export type Property = {
  betrieb: string;
  website: string;
  region: string;
  inhaber?: string;
  phone?: string;
  email?: string;
  notes?: string;
};

type Result = Property & { hit: boolean; markers: string[]; error?: string };

const MARKERS = [
  'ebFrontEndFrame',
  'easy-booking.at',
  'webwidgets.easybooking',
  'jquery.easybooking',
  'easybooking.eu',
];

const BOOKING_PATHS = [
  '/buchen', '/buchung', '/online-buchen',
  '/booking', '/reservierung', '/anfrage',
];

async function checkSite(p: Property): Promise<Result> {
  const result: Result = { ...p, hit: false, markers: [] };

  const scan = async (url: string) => {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bookingwulf-scanner/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    });
    const html = await res.text();
    for (const m of MARKERS) {
      if (html.includes(m) && !result.markers.includes(m)) {
        result.hit = true;
        result.markers.push(m);
      }
    }
  };

  try {
    await scan(p.website);
    if (!result.hit) {
      for (const path of BOOKING_PATHS) {
        try {
          await scan(p.website + path);
          if (result.hit) break;
        } catch { /* 404s ignorieren */ }
      }
    }
  } catch (e: any) {
    result.error = e.message?.slice(0, 80);
  }

  return result;
}

export async function scanRegion(properties: Property[]) {
  const unique = properties.filter(
    (p, i, arr) => arr.findIndex(x => x.website === p.website) === i
  );

  console.log(`Scanne ${unique.length} Websites auf easybooking...\n`);
  const results = await Promise.all(unique.map(checkSite));

  const hits  = results.filter(r => r.hit);
  const clean = results.filter(r => !r.hit && !r.error);
  const errs  = results.filter(r => !r.hit && r.error);

  const line = '━'.repeat(60);

  console.log(line);
  console.log(`✅  EASYBOOKING GEFUNDEN: ${hits.length}`);
  console.log(line);
  for (const r of hits) {
    console.log(`\n  ${r.betrieb} — ${r.region}`);
    console.log(`  ${r.website}`);
    if (r.inhaber) console.log(`  Inhaber: ${r.inhaber}`);
    if (r.email)   console.log(`  Email:   ${r.email}`);
    if (r.phone)   console.log(`  Tel:     ${r.phone}`);
    console.log(`  Marker:  ${r.markers.join(', ')}`);
  }

  console.log(`\n${line}`);
  console.log(`❌  KEIN EASYBOOKING: ${clean.length}`);
  console.log(line);
  for (const r of clean) console.log(`  ${r.betrieb.padEnd(35)} ${r.region}`);

  if (errs.length) {
    console.log(`\n${line}`);
    console.log(`⚠️   NICHT ERREICHBAR: ${errs.length}`);
    console.log(line);
    for (const r of errs) console.log(`  ${r.betrieb.padEnd(35)} ${r.error}`);
  }

  if (hits.length === 0) return;

  console.log(`\n${line}`);
  const answer = process.argv.includes('--save')
    ? 'j'
    : await prompt('In Outreach-DB speichern? (j/n) ');

  if (answer.trim().toLowerCase() !== 'j') {
    console.log('Abgebrochen – nichts gespeichert.');
    return;
  }

  const data = hits.map(r => ({
    betrieb:  r.betrieb,
    inhaber:  r.inhaber,
    email:    r.email,
    phone:    r.phone,
    website:  r.website,
    region:   `${r.region}, Österreich`,
    notes:    `easybooking bestätigt via HTML-Scan (${r.markers.join(', ')})${r.notes ? ' – ' + r.notes : ''}`,
  }));

  const saved = await prisma.outreachLead.createMany({ data, skipDuplicates: true });
  console.log(`✓ ${saved.count} Leads gespeichert.`);
  await prisma.$disconnect();
}

function prompt(question: string): Promise<string> {
  return new Promise(resolve => {
    process.stdout.write(question);
    process.stdin.once('data', d => resolve(d.toString()));
  });
}
