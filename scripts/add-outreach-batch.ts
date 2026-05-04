import { prisma } from '../src/lib/prisma';

const leads = [
  {
    betrieb: 'Landhotel Biberburg',
    inhaber: 'Rico Leonhardt',
    email: 'landhotel-biberburg@t-online.de',
    phone: '035341 2009',
    website: 'https://www.landhotel-biberburg.de',
    region: 'Bad Liebenwerda, Sachsen',
    notes: 'Hotel; nutzt aktuell externes Buchungsformular',
  },
  {
    betrieb: 'Wolffhotel',
    inhaber: 'Tiemo Wolff',
    email: 'info@wolffhotel.de',
    phone: '+49 6594 92090',
    website: 'https://www.wolffhotel.de',
    region: 'Kopp, Eifel, Rheinland-Pfalz',
    notes: 'Hotel mit Restaurant & Biergarten; Outdoor-Aktivitäten; WhatsApp: 0151 5328 1414',
  },
  {
    betrieb: 'Cafe und Pension Theodor Fontane',
    inhaber: 'Lutz Koppelmann',
    email: 'cafefontane@t-online.de',
    phone: '+49 39456 336',
    website: 'https://www.cafe-pension-fontane.de',
    region: 'Thale/Altenbrak, Harz, Sachsen-Anhalt',
    notes: 'Café + Pension; externes Online-Buchungsformular im Einsatz',
  },
  {
    betrieb: 'Gasthof Appartements Kirchenwirt',
    inhaber: 'Familie Grasser',
    email: 'office@kwd.at',
    phone: '+43 4246 7264',
    website: 'https://www.kwd.at',
    region: 'Döbriach, Kärnten, Österreich',
    notes: 'Hotel-Pension / Ferienapartments; österreichischer Betrieb',
  },
  {
    betrieb: 'VisSaarVie GmbH',
    inhaber: null,
    email: 'service@vissaarvie.de',
    phone: '+49 6865 911688-0',
    website: 'https://vissaarvie.de',
    region: 'Mettlach-Orscholz, Saarland',
    notes: 'Ferienwohnanlage / Apartmentkomplex; als GmbH geführt',
  },
  {
    betrieb: 'Hirsch in Pink',
    inhaber: 'Marian Semm',
    email: 'hip@marian-semm.de',
    phone: '+49 151 54604153',
    website: 'http://www.hirsch-in-pink.de',
    region: 'Türkheim (Irsingen), Unterallgäu, Bayern',
    notes: 'Luxus-Ferienhaus bis 6 Personen',
  },
  {
    betrieb: "Das Lisa'l",
    inhaber: 'Helmut & Christiane Seitz',
    email: 'servus@das-lisal.at',
    phone: '+49 155 671 98 161',
    website: 'https://www.das-lisal.at',
    region: 'Zell am Ziller, Tirol, Österreich',
    notes: '2 Premium-Design-Apartments (Chalet Loft & City Loft); auch WhatsApp',
  },
  {
    betrieb: 'Ferienwohnung Ginova',
    inhaber: 'Helena Ginova',
    email: 'servus@ferienwohnung-ginova.de',
    phone: '0151 58881052',
    website: 'https://ferienwohnung-ginova.de',
    region: 'Garmisch-Partenkirchen, Oberbayern, Bayern',
    notes: 'Ferienwohnung; eigene Buchungsseite',
  },
  {
    betrieb: 'Milchhaus Zimmer',
    inhaber: 'Matthias Roller',
    email: 'info@milch-haus.de',
    phone: '07433 2608485',
    website: 'https://milch-haus.de',
    region: 'Balingen (Heselwangen), Baden-Württemberg',
    notes: 'Gästehaus mit 2 Zimmern; renoviertes Milchwirtschaftsgebäude',
  },
];

async function main() {
  console.log(`Lege ${leads.length} Outreach-Leads an...`);
  const result = await prisma.outreachLead.createMany({ data: leads });
  console.log(`✓ ${result.count} Leads erstellt.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
