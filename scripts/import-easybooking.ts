import { prisma } from '../src/lib/prisma';

const leads = [
  { website: 'https://appartements-soelden.at/', betrieb: 'Appartements Söelden' },
  { website: 'https://haus-elisabeth.cc/', betrieb: 'Haus Elisabeth' },
  { website: 'https://landhof-carnuntum.at/', betrieb: 'Landhof Carnuntum' },
  { website: 'https://pension-piovesan.at/', betrieb: 'Pension Piovesan' },
  { website: 'https://pension-tina.at/', betrieb: 'Pension Tina' },
  { website: 'https://www.3stylekitesurfing.com/', betrieb: '3Style Kitesurfing' },
  { website: 'https://www.alpenflair.at/', betrieb: 'Alpenflair' },
  { website: 'https://www.apart-bachmann.at/', betrieb: 'Apart Bachmann' },
  { website: 'https://www.apart-ban-voltas.at/', betrieb: 'Apart Ban Voltas' },
  { website: 'https://www.apart-elisabeth.at/', betrieb: 'Apart Elisabeth' },
  { website: 'https://www.apart-tuxertal.at/', betrieb: 'Apart Tuxertal' },
  { website: 'https://www.aparthotel-grischuna.ch/', betrieb: 'Aparthotel Grischuna' },
  { website: 'https://www.apartment-stern-mieders.at/', betrieb: 'Apartment Stern Mieders' },
  { website: 'https://www.apartments-fliegerbichl.at/', betrieb: 'Apartments Fliegerbichl' },
  { website: 'https://www.appartements-mocking.at/', betrieb: 'Appartements Möcking' },
  { website: 'https://www.auerschmied.net/', betrieb: 'Auerschmied' },
  { website: 'https://www.baumgartnerhof.at/', betrieb: 'Baumgartnerhof' },
  { website: 'https://www.brunnenhof.at/', betrieb: 'Brunnenhof' },
  { website: 'https://www.chesamonte.net/', betrieb: 'Chesa Monte' },
  { website: 'https://www.christophorus-partenen.at/', betrieb: 'Christophorus Partenen' },
  { website: 'https://www.das-neustadt.at/', betrieb: 'Das Neustadt' },
  { website: 'https://www.das1494.at/', betrieb: 'Das 1494' },
  { website: 'https://www.ferienwohnungen-hohl.at/', betrieb: 'Ferienwohnungen Hohl' },
  { website: 'https://www.grundwert-apartment.at/', betrieb: 'Grundwert Apartment' },
  { website: 'https://www.haus-christoph.com/', betrieb: 'Haus Christoph' },
  { website: 'https://www.hauszitterklapfen.at/', betrieb: 'Haus Zitterklapfen' },
  { website: 'https://www.hochland-tux.at/', betrieb: 'Hochland Tux' },
  { website: 'https://www.hotel-siegelerhof.at/', betrieb: 'Hotel Siegelerhof' },
  { website: 'https://www.hotelbavaria-bw.de/', betrieb: 'Hotel Bavaria' },
  { website: 'https://www.hotelsachsengang.com/', betrieb: 'Hotel Sachsengang' },
  { website: 'https://www.hs-scharinger.at/', betrieb: 'HS Scharinger' },
  { website: 'https://www.hubertus-pension.at/', betrieb: 'Pension Hubertus' },
  { website: 'https://www.ilys-inn.at/', betrieb: "Ily's Inn" },
  { website: 'https://www.knollhof.at/', betrieb: 'Knollhof' },
  { website: 'https://www.landhaus-birgit.at/', betrieb: 'Landhaus Birgit' },
  { website: 'https://www.landhaus-gasser.at/', betrieb: 'Landhaus Gasser' },
  { website: 'https://www.martinshof.tirol/', betrieb: 'Martinshof' },
  { website: 'https://www.metzgerwirt.co.at/', betrieb: 'Metzgerwirt' },
  { website: 'https://www.motel-waidhofen.at/', betrieb: 'Motel Waidhofen' },
  { website: 'https://www.mountain-chalet-r.com/', betrieb: 'Mountain Chalet R' },
  { website: 'https://www.muntanella.com/', betrieb: 'Muntanella' },
  { website: 'https://www.oetztal-chalet.at/', betrieb: 'Ötztal Chalet' },
  { website: 'https://www.pension-besser.at/', betrieb: 'Pension Besser' },
  { website: 'https://www.pension-lagler.at/', betrieb: 'Pension Lagler' },
  { website: 'https://www.pension-reimer.at/', betrieb: 'Pension Reimer' },
  { website: 'https://www.petranella.at/', betrieb: 'Petranella' },
  { website: 'https://www.plojen.at/', betrieb: 'Plojen' },
  { website: 'https://www.privatzimmer-haider.at/', betrieb: 'Privatzimmer Haider' },
  { website: 'https://www.reitle.at/', betrieb: 'Reitle' },
  { website: 'https://www.schoenblick-tux.at/', betrieb: 'Schönblick Tux' },
  { website: 'https://www.schusters-alpenpanorama.at/', betrieb: "Schuster's Alpenpanorama" },
  { website: 'https://www.seerhof.at/', betrieb: 'Seerhof' },
  { website: 'https://www.serfaus-alpensuites.at/', betrieb: 'Serfaus Alpensuites' },
  { website: 'https://www.st-joseph.at/', betrieb: 'St. Joseph' },
  { website: 'https://www.tameggerhof.at/', betrieb: 'Tameggerhof' },
  { website: 'https://www.waldhaus-hinterstoder.at/', betrieb: 'Waldhaus Hinterstoder' },
  { website: 'https://www.waldschloss.at/', betrieb: 'Waldschloss' },
  { website: 'https://www.wien-ferienwohnung.at/', betrieb: 'Wien Ferienwohnung' },
];

async function main() {
  const existing = await prisma.outreachLead.findMany({ select: { website: true } });
  const existingUrls = new Set(
    existing.map(e => e.website?.replace(/\/$/, '').toLowerCase()).filter(Boolean)
  );

  const toInsert = leads.filter(l => {
    const normalized = l.website.replace(/\/$/, '').toLowerCase();
    return !existingUrls.has(normalized);
  });

  console.log(`${leads.length} in Liste, ${existingUrls.size} bereits vorhanden, ${toInsert.length} neu`);

  if (toInsert.length === 0) {
    console.log('Nichts einzutragen.');
    return;
  }

  const result = await prisma.outreachLead.createMany({
    data: toInsert.map(l => ({
      ...l,
      region: 'Österreich',
      notes: 'Easybooking-Kunde',
    })),
  });

  console.log(`✓ ${result.count} Leads eingetragen.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
