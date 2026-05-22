import { prisma } from '../src/lib/prisma';

const leads = [
  {
    betrieb: 'Haus Sonnenhang',
    inhaber: 'Jutta Fiegl',
    email: 'haussonnenhang@soelden.at',
    phone: '+43 664 44 25 341',
    website: 'https://www.haussonnenhang.com',
    region: 'Sölden, Ötztal, Tirol, Österreich',
    notes: 'Nutzt easybooking (easy-booking.at im HTML bestätigt)',
  },
  {
    betrieb: 'Gästehaus Edelweiss',
    inhaber: 'Roland Hackl',
    email: 'pens.edelweiss@aon.at',
    phone: '+43 5252 6393',
    website: 'https://www.gaestehaus-edelweiss.at',
    region: 'Sautens, Ötztal, Tirol, Österreich',
    notes: 'Nutzt easybooking (easy-booking.at + jquery.easybooking + easybooking.eu im HTML bestätigt); 3-Sterne Gästehaus',
  },
  {
    betrieb: 'Appartement Pfausler',
    inhaber: 'Petra Pfausler',
    email: 'info@pfausler.at',
    phone: '+43 5252 6687',
    website: 'https://www.pfausler.at',
    region: 'Oetz, Ötztal, Tirol, Österreich',
    notes: 'Nutzt easybooking (easy-booking.at + jquery.easybooking im HTML bestätigt); Ferienwohnungen',
  },
  {
    betrieb: 'Gasthof Winnebach',
    email: 'info@winnebach.com',
    phone: '+43 5253 5104',
    website: 'https://www.winnebach.com',
    region: 'Gries / Längenfeld, Ötztal, Tirol, Österreich',
    notes: 'Nutzt easybooking (easy-booking.at im HTML bestätigt); familiengeführter Gasthof',
  },
  {
    betrieb: 'Garni Flori',
    inhaber: 'Vicky Wilhelm-Van Egdom',
    email: 'info@cafe-flori.com',
    phone: '+43 6503143020',
    website: 'https://www.cafe-flori.com',
    region: 'Huben / Längenfeld, Ötztal, Tirol, Österreich',
    notes: 'Nutzt easybooking (easy-booking.at + jquery.easybooking + easybooking.eu im HTML bestätigt)',
  },
];

async function main() {
  console.log(`Lege ${leads.length} Outreach-Leads an...`);
  const result = await prisma.outreachLead.createMany({ data: leads });
  console.log(`✓ ${result.count} Leads erstellt.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
