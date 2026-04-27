import { prisma } from '../src/lib/prisma';

const leads = [
  { betrieb: 'Zukaunighof', inhaber: 'Oswald Slamanig', email: 'oswald.slamanig@aon.at', region: 'Österreich', website: 'zukaunighof.at' },
  { betrieb: 'Pension Heidi', inhaber: 'Familie Unterkirchner', email: null, region: 'Kaprun', website: 'pensionheidi.at' },
  { betrieb: 'Aparthotel Rainerhof', inhaber: 'Familie Fischbacher', email: 'info@rainerhof.at', region: 'Flachau', website: 'rainerhof.at' },
  { betrieb: 'Absolute Active Resorts', inhaber: null, email: 'thomas@absolute-active.com', region: 'Kirchberg/Tirol', website: 'kirchberg-resorts.at' },
  { betrieb: 'Salvenalm', inhaber: null, email: 'info@salvenalm.at', region: 'Hopfgarten/Tirol', website: 'salvenalm.at' },
  { betrieb: 'Talhammerhof', inhaber: null, email: 'talhammerhof@gmx.net', region: 'Österreich', website: 'talhammerhof.at' },
  { betrieb: 'Ramsauer Sonnenalm', inhaber: 'Familie Wieser', email: 'wieser@ramsauer-sonnenalm.com', region: 'Ramsau am Dachstein', website: 'ramsauer-sonnenalm.com' },
  { betrieb: 'Apart Ehart', inhaber: null, email: 'info@apartehart.at', region: 'St. Anton am Arlberg', website: 'apartehart.at' },
  { betrieb: 'Familiengut Ertlhof', inhaber: null, email: 'office@ertlhof.com', region: 'Seeboden/Millstätter See', website: 'ertlhof.com' },
  { betrieb: 'Haberl Attersee', inhaber: 'Maximilian Haberl', email: 'info@haberl-attersee.at', region: 'Attersee', website: 'haberl-attersee.at' },
  { betrieb: 'Alaska Appartement Ischgl', inhaber: null, email: 'info@ischglalaska.com', region: 'Ischgl', website: 'ischglalaska.com' },
  { betrieb: 'Gielerhof', inhaber: 'Familie Pfister', email: 'info@gielerhof.at', region: 'Österreich', website: 'gielerhof.at' },
  { betrieb: 'Ferienwohnungen Haus Sonne', inhaber: null, email: null, region: 'Ahrntal/Südtirol', website: 'appartement-sonne.com' },
  { betrieb: 'Haus Schönegger', inhaber: 'Thomas Schönegger', email: 'thomas.schoenegger@aon.at', region: 'Dorfgastein', website: 'haus-schoenegger.at' },
  { betrieb: 'Haus Piesendorf', inhaber: 'Familie Brandstätter', email: 'sky-42@sol.at', region: 'Piesendorf', website: 'hauspiesendorf.com' },
  { betrieb: 'Haus Kolibri', inhaber: 'Familie Thurnes', email: 'info@kolibri-fiss.at', region: 'Fiss/Tirol', website: 'kolibri-fiss.at' },
  { betrieb: 'Hotel Residence Ramsau', inhaber: 'Familie Aerts', email: 'info@hotel-residence.at', region: 'Ramsau am Dachstein', website: 'hotel-residence.at' },
  { betrieb: 'Haus Kohlberghof', inhaber: null, email: 'info@haus-kohlbergof.at', region: 'Österreich', website: 'haus-kohlberghof.at' },
  { betrieb: 'Villa Blumegg', inhaber: null, email: 'office@villa-blumegg.at', region: 'Österreich', website: 'villa-blumegg.at' },
  { betrieb: 'Hotel Pruggererhof', inhaber: null, email: 'info@pruggererhof.at', region: 'Pruggern/Steiermark', website: 'pruggererhof.at' },
  { betrieb: 'Hubertushof Leutasch', inhaber: 'Familie Pfeffel', email: 'office@hubertushof-leutasch.at', region: 'Leutasch/Tirol', website: 'hubertushof-leutasch.at' },
  { betrieb: 'Hotel Mosser', inhaber: null, email: 'suppenkasper@suppenkasper.at', region: 'Österreich', website: 'suppenkasper.at' },
  { betrieb: 'Hotel Berghof Seefeld', inhaber: 'Familie Woldrich', email: 'info@hotelberghof.com', region: 'Seefeld/Tirol', website: 'hotelberghof.com' },
  { betrieb: 'BAR10ZIMMER', inhaber: null, email: 'welcome@bar10zimmer.at', region: 'Österreich', website: 'bar10zimmer.at' },
  { betrieb: 'Gästehaus Oberweissen Hittl', inhaber: null, email: 'mail@hittl.info', region: 'Defereggental/Tirol', website: 'hittl.info' },
  { betrieb: 'Herzl Hof', inhaber: null, email: 'info@herzl-hof.at', region: 'Österreich', website: 'herzl-hof.at' },
  { betrieb: 'Ferienwohnungen Kern Attersee', inhaber: null, email: 'fewo.kern@gmail.com', region: 'Attersee', website: 'fewo-kern.at' },
  { betrieb: 'Pension Hallberg Hallstatt', inhaber: null, email: 'apartmentshallberg@gmx.at', region: 'Hallstatt', website: 'pension-hallberg-1.at' },
  { betrieb: 'Stefanihof Fuschl am See', inhaber: 'Philipp Minar', email: 'office@stefanihof.at', region: 'Fuschl am See', website: 'stefanihof.at' },
  { betrieb: 'Hotel Keil Kleinarl', inhaber: 'Familie Keil', email: 'info@keil.at', region: 'Kleinarl', website: 'keil.at' },
  { betrieb: 'Reithof Filzmoos', inhaber: null, email: 'info@reithof.com', region: 'Filzmoos', website: 'reithof.com' },
  { betrieb: 'Appartements Schwaiger', inhaber: null, email: 'info@appartements-schwaiger.at', region: 'Österreich', website: 'appartements-schwaiger.at' },
  { betrieb: 'Eisenbahnwelten im Kurort Rathen', inhaber: 'Lothar Hanisch', email: 'kontakt@eisenbahnwelten-rathen.de', region: 'Kurort Rathen/Sachsen', website: 'eisenbahnwelten-rathen.de' },
  { betrieb: 'Camping Mittagsspitze', inhaber: null, email: null, region: 'Triesen/Liechtenstein', website: 'campingtriesen.li' },
  { betrieb: 'Hotel Gasthof Alpenhof Annaberg', inhaber: 'Familie Meißnitzer', email: 'info@alpenhof-annaberg.at', region: 'Annaberg/NÖ', website: 'alpenhof-annaberg.at' },
  { betrieb: "Müller's Stuben", inhaber: 'Theodor Müller', email: 'info@muellers-stuben.de', region: 'Deutschland', website: 'muellers-stuben.de' },
  { betrieb: 'Harmonie & Balance Leogang', inhaber: 'Thomas Millauer', email: 'millauer@harmonie-balance.at', region: 'Leogang/Salzburg', website: 'harmonie-balance.at' },
];

async function main() {
  const existing = await prisma.outreachLead.count();
  if (existing > 0) {
    console.log(`DB hat bereits ${existing} Leads – überspringe Seed.`);
  } else {
    const result = await prisma.outreachLead.createMany({ data: leads });
    console.log(`${result.count} Leads angelegt.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
