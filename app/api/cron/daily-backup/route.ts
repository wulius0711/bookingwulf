import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { put, list, del } from '@vercel/blob';

const RETENTION_DAYS = 30;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Dump all critical tables
  const [
    hotels, hotelSettings, widgetConfigs, presets,
    apartments, apartmentImages, priceSeasons, blockedRanges,
    icalFeeds, extras, emailTemplates,
    nukiConfigs, beds24Configs, beds24Mappings,
    requests, requestMessages,
    adminUsers, childPriceRanges,
  ] = await Promise.all([
    prisma.hotel.findMany(),
    prisma.hotelSettings.findMany(),
    prisma.widgetConfig.findMany(),
    prisma.hotelSettingsPreset.findMany(),
    prisma.apartment.findMany(),
    prisma.apartmentImage.findMany(),
    prisma.priceSeason.findMany(),
    prisma.blockedRange.findMany(),
    prisma.icalFeed.findMany(),
    prisma.hotelExtra.findMany(),
    prisma.emailTemplate.findMany(),
    prisma.nukiConfig.findMany(),
    prisma.beds24Config.findMany(),
    prisma.beds24ApartmentMapping.findMany(),
    prisma.request.findMany(),
    prisma.requestMessage.findMany(),
    prisma.adminUser.findMany({ select: { id: true, email: true, role: true, hotelId: true, createdAt: true } }),
    prisma.childPriceRange.findMany(),
  ]);

  const dump = {
    _meta: { createdAt: new Date().toISOString(), version: 1 },
    hotels, hotelSettings, widgetConfigs, presets,
    apartments, apartmentImages, priceSeasons, blockedRanges,
    icalFeeds, extras, emailTemplates,
    nukiConfigs, beds24Configs, beds24Mappings,
    requests, requestMessages,
    adminUsers, childPriceRanges,
  };

  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `backups/${date}.json`;
  const content = JSON.stringify(dump, null, 0);

  await put(filename, content, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  // Delete backups older than RETENTION_DAYS
  const { blobs } = await list({ prefix: 'backups/' });
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const toDelete = blobs.filter(b => new Date(b.uploadedAt) < cutoff);
  if (toDelete.length > 0) {
    await del(toDelete.map(b => b.url));
  }

  console.log(`[daily-backup] Saved ${filename} (${(content.length / 1024).toFixed(0)} KB), deleted ${toDelete.length} old backup(s).`);
  return NextResponse.json({ ok: true, filename, sizeKb: Math.round(content.length / 1024), deleted: toDelete.length });
}
