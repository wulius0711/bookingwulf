import { scanRegion } from './scan-easybooking';

scanRegion([
  // Wenns
  { betrieb: 'Pension Landhaus Gasser', website: 'https://www.landhaus-gasser.at',       region: 'Wenns',           phone: '+43 5414 86124' },
  { betrieb: 'Weiratherhof',            website: 'https://www.weiratherhof-pitztal.at',  region: 'Wenns' },
  { betrieb: 'Haus Florian',            website: 'https://haus-florian-wenns.at',         region: 'Wenns' },
  // St. Leonhard
  { betrieb: 'Hotel Alpenhof Pitztal',  website: 'https://www.alpenhof-pitztal.com',     region: 'St. Leonhard im Pitztal' },
  { betrieb: 'Hotel St. Leonhard',      website: 'https://www.stleonhard.com',            region: 'St. Leonhard im Pitztal' },
  { betrieb: 'Pension Haus Andrea',     website: 'https://www.haus-andrea-pitztal.at',   region: 'St. Leonhard im Pitztal' },
  { betrieb: 'Sonnblick / B&B Elisabeth', website: 'https://sonnblick-pitztal.net',      region: 'St. Leonhard im Pitztal' },
  // Arzl im Pitztal
  { betrieb: 'Haus Helga Pitztal',      website: 'https://www.haushelga-pitztal.at',     region: 'Arzl im Pitztal' },
  { betrieb: 'Ferienhaus im Pitztal',   website: 'https://www.ferienhaus-im-pitztal.at', region: 'Arzl im Pitztal' },
  { betrieb: 'Hotel Arzlerhof',         website: 'https://www.arzlerhof.at',             region: 'Arzl im Pitztal' },
  { betrieb: 'Ferienhotel Bergland',    website: 'https://www.ferienhotel-bergland.at',  region: 'Arzl im Pitztal' },
  // Jerzens
  { betrieb: 'Bergsonnhof',             website: 'https://www.bergsonnhof.at',           region: 'Jerzens' },
]);
