import { prisma } from '../src/lib/prisma';

const contacts: { website: string; inhaber: string | null; email: string | null; phone: string | null; region: string | null }[] = [
  { website: 'https://appartements-soelden.at/', inhaber: 'Andrea Linser', email: 'info@appartements-soelden.at', phone: '+43 664 5048645', region: 'Tirol' },
  { website: 'https://haus-elisabeth.cc/', inhaber: null, email: 'urlaub@haus-elisabeth.cc', phone: '+43 5226 3710', region: 'Tirol' },
  { website: 'https://landhof-carnuntum.at/', inhaber: 'Hannes Raser', email: 'office@landhof-carnuntum.at', phone: '+43 664 931 78 74', region: 'Niederösterreich' },
  { website: 'https://pension-piovesan.at/', inhaber: 'Marianne Michaela Semren', email: 'pension.piovesan@aon.at', phone: '+43 4254 24 80', region: 'Kärnten' },
  { website: 'https://pension-tina.at/', inhaber: null, email: 'info@pension-tina.at', phone: '+43 676 5262217', region: 'Tirol' },
  { website: 'https://www.3stylekitesurfing.com/', inhaber: 'Jenny Schuster', email: 'info@3stylekitesurfing.com', phone: '+43 676 9293881', region: 'Tirol' },
  { website: 'https://www.alpenflair.at/', inhaber: null, email: 'info@alpenflair.at', phone: '+49 171 6218 378', region: 'Tirol' },
  { website: 'https://www.apart-bachmann.at/', inhaber: 'Michael und Sabine Bachmann', email: 'info@apart-bachmann.at', phone: '+43 664 2500711', region: 'Tirol' },
  { website: 'https://www.apart-ban-voltas.at/', inhaber: 'Priska Kuprian', email: 'info@apart-ban-voltas.at', phone: '+43 664 2012207', region: 'Tirol' },
  { website: 'https://www.apart-elisabeth.at/', inhaber: 'Elisabeth Haselwanter', email: 'office@apart-elisabeth.at', phone: '+43 5264 5261', region: 'Tirol' },
  { website: 'https://www.apart-tuxertal.at/', inhaber: 'Josef Troppmair', email: 'info@apart-tuxertal.at', phone: '+43 677 630 94 250', region: 'Tirol' },
  { website: 'https://www.aparthotel-grischuna.ch/', inhaber: 'Familie Jenal', email: 'mail@aparthotel-grischuna.ch', phone: '+41 81 868 52 39', region: 'Samnaun, Schweiz' },
  { website: 'https://www.apartment-stern-mieders.at/', inhaber: 'Daniel & Edith Stern', email: 'apartment.stern@ikbnet.at', phone: '+43 676 430 27 02', region: 'Tirol' },
  { website: 'https://www.apartments-fliegerbichl.at/', inhaber: 'Gregor Voithofer', email: 'gregor.voithofer@gmx.at', phone: '+43 660 604 1008', region: 'Salzburg' },
  { website: 'https://www.appartements-mocking.at/', inhaber: 'Josef Huber', email: 'appartements@mocking-kitzbuehel.at', phone: '+43 5356 66544', region: 'Tirol' },
  { website: 'https://www.auerschmied.net/', inhaber: 'Ingemar Mayr', email: 'office@auerschmied.net', phone: '+43 676 9045605', region: 'Tirol' },
  { website: 'https://www.baumgartnerhof.at/', inhaber: 'Hubert Baumgartner', email: 'info@baumgartnerhof.at', phone: '+43 4254 22900', region: 'Kärnten' },
  { website: 'https://www.brunnenhof.at/', inhaber: 'Stephanie Seifert & Dr. Rainer Hawranek', email: 'info@brunnenhof.at', phone: '+43 676 9335285', region: 'Tirol' },
  { website: 'https://www.chesamonte.net/', inhaber: 'Familie Wechner', email: 'info@chesamonte.net', phone: '+43 5444 5237', region: 'Tirol' },
  { website: 'https://www.christophorus-partenen.at/', inhaber: 'Angelika Lechleitner', email: 'pension@christophorus-partenen.at', phone: '+43 5558 8309', region: 'Vorarlberg' },
  { website: 'https://www.das-neustadt.at/', inhaber: 'Anton Heinz Struppy', email: 'restaurant@hgi-wn.at', phone: '+43 2622 29400', region: 'Niederösterreich' },
  { website: 'https://www.das1494.at/', inhaber: 'Patrick und Jennifer Giovanelli', email: 'info@das1494.at', phone: '+43 660 4902387', region: 'Tirol' },
  { website: 'https://www.ferienwohnungen-hohl.at/', inhaber: 'Kathrin Huber', email: 'office@ferienwohnungen-hohl.at', phone: '+43 660 191 46 01', region: 'Steiermark' },
  { website: 'https://www.grundwert-apartment.at/', inhaber: 'Raphael Burtscher', email: 'grundwert.apartment@gmail.com', phone: '+43 664 534 569 2', region: 'Vorarlberg' },
  { website: 'https://www.haus-christoph.com/', inhaber: 'Christoph Eisl', email: 'office@haus-christoph.com', phone: '+43 664 73 556 716', region: 'Salzburg' },
  { website: 'https://www.hauszitterklapfen.at/', inhaber: 'Daniel Moosbrugger', email: 'info@hauszitterklapfen.at', phone: '+43 664 1236830', region: 'Vorarlberg' },
  { website: 'https://www.hochland-tux.at/', inhaber: 'Franz & Monika Wechselberger', email: 'info@hochland-tux.at', phone: '+43 676 4114672', region: 'Tirol' },
  { website: 'https://www.hotel-siegelerhof.at/', inhaber: 'Josef-Michael Thaler', email: 'info@hotel-siegelerhof.at', phone: '+43 664 3410423', region: 'Tirol' },
  { website: 'https://www.hotelbavaria-bw.de/', inhaber: null, email: null, phone: null, region: 'Deutschland' },
  { website: 'https://www.hotelsachsengang.com/', inhaber: 'Birgitt Hammerl', email: 'office@hotelsachsengang.com', phone: '+43 2249 93081', region: 'Niederösterreich' },
  { website: 'https://www.hs-scharinger.at/', inhaber: 'Wolfgang Scharinger', email: 'office@hs-scharinger.at', phone: '+43 7732 46138', region: 'Oberösterreich' },
  { website: 'https://www.hubertus-pension.at/', inhaber: 'Bernd Mondré', email: '3sterne@hubertus-pension.at', phone: '+43 6542 72427', region: 'Salzburg' },
  { website: 'https://www.ilys-inn.at/', inhaber: 'Ilyas Özdemir', email: 'info@ilys-inn.at', phone: '+43 699 17139061', region: 'Oberösterreich' },
  { website: 'https://www.knollhof.at/', inhaber: 'Thomas Walcher', email: 'office@knollhof.at', phone: '+43 3687 81758', region: 'Steiermark' },
  { website: 'https://www.landhaus-birgit.at/', inhaber: 'Martin Schulze', email: 'office@landhaus-birgit.at', phone: '+43 5225 63432', region: 'Tirol' },
  { website: 'https://www.landhaus-gasser.at/', inhaber: 'Christina Gasser', email: 'landhaus-gasser@cni.at', phone: '+43 5414 86124', region: 'Tirol' },
  { website: 'https://www.martinshof.tirol/', inhaber: 'Anneliese Pixner', email: 'martinshof@obergurgl.com', phone: '+43 5256 6237', region: 'Tirol' },
  { website: 'https://www.metzgerwirt.co.at/', inhaber: 'Emanuel Stadler', email: 'stadler.emanuel@metzgerwirt.co.at', phone: '+43 4246 2052', region: 'Kärnten' },
  { website: 'https://www.motel-waidhofen.at/', inhaber: 'Klaudia Schuster', email: 'rezeption@motel-waidhofen.at', phone: '+43 664 503 17 15', region: 'Niederösterreich' },
  { website: 'https://www.mountain-chalet-r.com/', inhaber: 'Silvia & Thomas Rolli', email: 'info@mountain-chalet-r.com', phone: '+49 151 15367651', region: 'Tirol' },
  { website: 'https://www.muntanella.com/', inhaber: 'Familie Schneeberger-Zatsch', email: 'office@muntanella.com', phone: '+43 5583 2665', region: 'Vorarlberg' },
  { website: 'https://www.oetztal-chalet.at/', inhaber: null, email: 'rezeption@oetztal-chalet.at', phone: '+49 174 949 10 27', region: 'Tirol' },
  { website: 'https://www.pension-besser.at/', inhaber: 'Helfried Besser', email: 'info@pension-besser.at', phone: '+43 4238 85680', region: 'Kärnten' },
  { website: 'https://www.pension-lagler.at/', inhaber: 'Angelika Lagler', email: 'pension@lagler.at', phone: '+43 676 9300230', region: 'Kärnten' },
  { website: 'https://www.pension-reimer.at/', inhaber: 'Marcel-Andre Mattis', email: 'pension.reimer@aon.at', phone: '+43 1 523 61 62', region: 'Wien' },
  { website: 'https://www.petranella.at/', inhaber: 'Petra Bogensperger', email: 'info@petranella.at', phone: '+43 699 177 44 010', region: 'Salzburg' },
  { website: 'https://www.plojen.at/', inhaber: 'Ludwig Schlatter', email: 'info@plojen.at', phone: '+43 676 6700785', region: 'Tirol' },
  { website: 'https://www.privatzimmer-haider.at/', inhaber: 'Erich Haider', email: 'office@privatzimmer-haider.at', phone: '+43 680 1250342', region: 'Burgenland' },
  { website: 'https://www.reitle.at/', inhaber: 'Wolfgang Schöpf', email: 'reitle@aon.at', phone: '+43 664 3387 578', region: 'Tirol' },
  { website: 'https://www.schoenblick-tux.at/', inhaber: 'Familie Pfister', email: 'info@schoenblick-tux.at', phone: '+43 664 9611 232', region: 'Tirol' },
  { website: 'https://www.schusters-alpenpanorama.at/', inhaber: 'Carmen Leopoldine Schuster', email: 'office@schusters-alpenpanorama.at', phone: '+43 3863 24101', region: 'Salzburg' },
  { website: 'https://www.seerhof.at/', inhaber: 'Harald Stadlwieser', email: 'info@seerhof.at', phone: '+43 5475 216', region: 'Tirol' },
  { website: 'https://www.serfaus-alpensuites.at/', inhaber: 'Thomas Manthey', email: 'serfaus@alpensuites.tirol', phone: '+43 664 188 56 55', region: 'Tirol' },
  { website: 'https://www.st-joseph.at/', inhaber: 'Christoph Mayr', email: 'office@st-joseph.at', phone: '+43 676 9213477', region: 'Tirol' },
  { website: 'https://www.tameggerhof.at/', inhaber: 'Anna-Theres Kitz', email: 'anna.theres.kitz@gmail.com', phone: '+43 664 3813423', region: 'Kärnten' },
  { website: 'https://www.waldhaus-hinterstoder.at/', inhaber: 'Ariane Schoisswohl', email: 'waldhausurlaub@speed.at', phone: '+43 676 7306702', region: 'Oberösterreich' },
  { website: 'https://www.waldschloss.at/', inhaber: 'Hans Christoph Haas', email: 'office@waldschloss.at', phone: '+43 7713 67400', region: 'Oberösterreich' },
  { website: 'https://www.wien-ferienwohnung.at/', inhaber: 'Elitza Hartl', email: 'wien-ferienwohnung@gmx.at', phone: '+43 688 60122305', region: 'Wien' },
];

async function main() {
  let updated = 0;
  for (const c of contacts) {
    const normalizedUrl = c.website.replace(/\/$/, '').toLowerCase();
    const lead = await prisma.outreachLead.findFirst({
      where: {
        website: { contains: normalizedUrl.replace('https://', '').replace('http://', '') },
      },
    });
    if (!lead) {
      console.warn(`Nicht gefunden: ${c.website}`);
      continue;
    }
    await prisma.outreachLead.update({
      where: { id: lead.id },
      data: {
        inhaber: c.inhaber ?? lead.inhaber,
        email: c.email ?? lead.email,
        phone: c.phone ?? lead.phone,
        region: c.region ?? lead.region,
      },
    });
    updated++;
  }
  console.log(`✓ ${updated} Leads aktualisiert.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
