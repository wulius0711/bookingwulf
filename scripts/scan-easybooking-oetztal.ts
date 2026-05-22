/**
 * Scannt Ötztal-Unterkunftswebsites auf easybooking-Nutzung.
 * Marker: ebFrontEndFrame, easy-booking.at, webwidgets.easybooking, jquery.easybooking
 *
 * Aufruf: npx tsx scripts/scan-easybooking-oetztal.ts
 */

const MARKERS = [
  'ebFrontEndFrame',
  'easy-booking.at',
  'webwidgets.easybooking',
  'jquery.easybooking',
  'easybooking.eu',
];

const BOOKING_PATHS = ['/buchen', '/buchung', '/online-buchen', '/booking', '/reservierung', '/anfrage'];

const PROPERTIES = [
  // Sölden
  { betrieb: 'Apart Garni Wiesengrund',    website: 'https://www.wiesengrund-soelden.at',  region: 'Sölden',      inhaber: 'Familie Prantl',          phone: '+43 664 4353044',  email: 'info@wiesengrund-soelden.at' },
  { betrieb: 'Pension Birkenheim',          website: 'https://www.birkenheim-soelden.at',   region: 'Sölden',      inhaber: 'Familie Gstrein',         phone: '+43 664 7360 3685',email: 'info@birkenheim-soelden.at' },
  { betrieb: 'Sportpension Carinthia',      website: 'https://www.sportpension.at',          region: 'Sölden',      inhaber: 'Familie Stoxreiter',      phone: '+43 5254 2584',    email: 'info@sportpension.at' },
  { betrieb: 'Pension Charly',              website: 'https://www.pension-charly.at',        region: 'Sölden',      inhaber: 'Familie Fiegl',           phone: '+43 5254 2496',    email: 'info@pension-charly.at' },
  { betrieb: 'Sportpension Rubin',          website: 'https://www.rubin-soelden.at',         region: 'Sölden',      inhaber: 'Familie Falkner',         phone: '+43 5254 3285',    email: 'info@rubin-soelden.at' },
  { betrieb: 'Frühstückspension Maier',     website: 'https://www.pension-maier-soelden.at', region: 'Sölden',     inhaber: 'Familie Maier',           phone: '+43 5254 2456',    email: 'info@pension-maier-soelden.at' },
  { betrieb: 'Pension Klaus',               website: 'https://www.pension-klaus.at',         region: 'Sölden',                                          phone: '+43 5254 2530' },
  { betrieb: 'Pension Zur alten Mühle',     website: 'https://www.alte-muehle-soelden.com', region: 'Sölden',                                          phone: '+43 5254 2005',    email: 'info@alte-muehle-soelden.com' },
  { betrieb: 'Garni Concordia',             website: 'https://www.concordia-soelden.at',     region: 'Sölden',      inhaber: 'Sandra Schmid',           phone: '+43 664 44 96 225',email: 'info@concordia-soelden.at' },
  { betrieb: 'Pension Alpenruhe',           website: 'https://www.alpenruhe.at',             region: 'Sölden',      inhaber: 'Familie Riml',            phone: '+43 664 4428103',  email: 'info@alpenruhe.at' },
  { betrieb: 'Haus Wiesenrand',             website: 'https://www.wiesenrand.at',            region: 'Sölden',      inhaber: 'Andrea + Werner Riml',    phone: '+43 5254 2372',    email: 'wiesenrand@soelden.at' },
  { betrieb: 'Haus Gondelblick',            website: 'https://www.gondelblick.com',          region: 'Sölden',      inhaber: 'Familie Falkner',         phone: '+43 5254 3193',    email: 'info@gondelblick.com' },
  { betrieb: "Toni's Ferienheim",           website: 'https://www.toni-soelden.at',          region: 'Sölden',      inhaber: 'Familie Thaler',          phone: '+43 5254 30340',   email: 'info@toni-soelden.at' },
  { betrieb: 'Apart Corona',                website: 'https://www.apart-corona.at',          region: 'Sölden',      inhaber: 'Familie Fiegl',           phone: '+43 5254 2233',    email: 'info@apart-corona.at' },
  { betrieb: 'Hotel Elisabeth Superior',    website: 'https://www.elisabeth-soelden.com',    region: 'Sölden',      inhaber: 'Kalkus Brigitte e.U.',    phone: '+43 5254 2534',    email: 'office@elisabeth-soelden.com' },
  { betrieb: 'Haus Gerhard',                website: 'https://www.hausgerhard.com',          region: 'Sölden' },
  { betrieb: 'Haus Fidelis Riml',           website: 'https://www.fidelis-riml.com',         region: 'Sölden' },
  { betrieb: 'Zuckerhütl',                  website: 'https://www.zuckerhuetl.com',          region: 'Sölden' },
  { betrieb: 'Haus Sonnenhang',             website: 'https://www.haussonnenhang.com',       region: 'Sölden' },
  { betrieb: 'Appartement Sieglinde',       website: 'https://www.sieglinde.at',             region: 'Sölden' },
  { betrieb: 'Haus Veronika',               website: 'https://www.haus-veronika.com',        region: 'Zwieselstein' },
  // Längenfeld
  { betrieb: 'Pension Granbichler',         website: 'https://www.granbichler.at',           region: 'Längenfeld',                                      phone: '+43 5253 5509',    email: 'info@granbichler.at' },
  { betrieb: 'Gästehaus Martha',            website: 'https://www.martha-laengenfeld.at',    region: 'Längenfeld',  inhaber: 'Familie Schöpf',          phone: '+43 680 3025 440', email: 'info@martha-laengenfeld.at' },
  { betrieb: 'Gstreinshof',                 website: 'https://www.gstreinshof.com',          region: 'Längenfeld',  inhaber: 'Marisa + Benny Gstrein',  phone: '+43 5253 6312',    email: 'info@gstreinshof.com' },
  // Obergurgl
  { betrieb: 'Apart Rauch',                 website: 'https://ober-gurgl.ski',               region: 'Obergurgl',   inhaber: 'Familie Rauch',           phone: '+43 5256 20470',   email: 'info@apart-rauch.at' },
  // Sautens
  { betrieb: 'Pension Garni Ötztalerhof',   website: 'https://www.oetztalerhof.at',          region: 'Sautens',     inhaber: 'Familie Strigl',          phone: '+43 5252 6515',    email: 'urlaub@oetztalerhof.eu' },
  { betrieb: 'Gästehaus Edelweiss',         website: 'https://www.gaestehaus-edelweiss.at',  region: 'Sautens' },
  // Oetz
  { betrieb: 'Haus Gisela',                 website: 'https://www.haus-gisela.at',           region: 'Oetz',        inhaber: 'Familie Grundl',          phone: '+43 5252 6593',    email: 'haus-gisela@aon.at' },
  { betrieb: 'Haus Marita',                 website: 'https://www.hausmarita.at',            region: 'Oetz' },
  { betrieb: 'Gästehaus Pfausler',          website: 'https://www.pfausler.at',              region: 'Oetz' },
  // Niederthai / Umhausen
  { betrieb: 'Haus Lärchenwald',            website: 'https://www.ferienwohnung-oetztal.at', region: 'Niederthai' },
  { betrieb: 'Gasthof Winnebach',           website: 'https://www.winnebach.com',            region: 'Gries' },
  // Vent
  { betrieb: 'Pension Reinstadler',         website: 'https://www.pension-reinstadler.at',   region: 'Vent' },
  // Huben
  { betrieb: 'Cafe Flori',                  website: 'https://www.cafe-flori.com',           region: 'Huben' },
];

type Property = typeof PROPERTIES[0];
type Result = Property & { hit: boolean; markers: string[]; error?: string };

async function checkSite(p: Property): Promise<Result> {
  const result: Result = { ...p, hit: false, markers: [] };

  const tryUrl = async (url: string) => {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bookingwulf-scanner/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    });
    const html = await res.text();
    for (const marker of MARKERS) {
      if (html.includes(marker) && !result.markers.includes(marker)) {
        result.hit = true;
        result.markers.push(marker);
      }
    }
  };

  try {
    await tryUrl(p.website);
    if (!result.hit) {
      for (const path of BOOKING_PATHS) {
        try {
          await tryUrl(p.website + path);
          if (result.hit) break;
        } catch { /* ignore 404s */ }
      }
    }
  } catch (e: any) {
    result.error = e.message?.slice(0, 80);
  }

  return result;
}

async function main() {
  const unique = PROPERTIES.filter((p, i, arr) => arr.findIndex(x => x.website === p.website) === i);
  console.log(`Scanne ${unique.length} Websites auf easybooking...\n`);

  const results = await Promise.all(unique.map(checkSite));

  const hits  = results.filter(r => r.hit);
  const clean = results.filter(r => !r.hit && !r.error);
  const errs  = results.filter(r => !r.hit && r.error);

  console.log('━'.repeat(60));
  console.log(`✅  EASYBOOKING GEFUNDEN: ${hits.length}`);
  console.log('━'.repeat(60));
  for (const r of hits) {
    console.log(`\n  ${r.betrieb} — ${r.region}`);
    console.log(`  ${r.website}`);
    if (r.inhaber) console.log(`  Inhaber: ${r.inhaber}`);
    if (r.email)   console.log(`  Email:   ${r.email}`);
    if (r.phone)   console.log(`  Tel:     ${r.phone}`);
    console.log(`  Marker:  ${r.markers.join(', ')}`);
  }

  console.log('\n' + '━'.repeat(60));
  console.log(`❌  KEIN EASYBOOKING: ${clean.length}`);
  console.log('━'.repeat(60));
  for (const r of clean) console.log(`  ${r.betrieb.padEnd(35)} ${r.region}`);

  if (errs.length) {
    console.log('\n' + '━'.repeat(60));
    console.log(`⚠️   FEHLER / NICHT ERREICHBAR: ${errs.length}`);
    console.log('━'.repeat(60));
    for (const r of errs) console.log(`  ${r.betrieb.padEnd(35)} ${r.error}`);
  }
}

main().catch(console.error);
