import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';
import { hasPlanAccess, hasFullBranding, hasAdvancedTypography } from '@/src/lib/plan-gates';
import type { PlanKey } from '@/src/lib/plans';
import { rateLimit, rateLimitResponse } from '@/src/lib/rate-limit';

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`hotel-settings:${ip}`, 60, 60_000).ok) return rateLimitResponse();

  try {
    const { searchParams } = new URL(req.url);
    const hotelSlug = searchParams.get('hotel');
    const configSlug = searchParams.get('config') || null;

    if (!hotelSlug) {
      return withCors(
        NextResponse.json(
          { success: false, message: 'Missing hotel slug' },
          { status: 400 },
        ),
      );
    }

    // hotel + hotelSettings in one query
    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: {
        id: true,
        name: true,
        plan: true,
        bookingTermsUrl: true,
        privacyPolicyUrl: true,
        settings: true,
      },
    });

    if (!hotel) {
      return withCors(
        NextResponse.json(
          { success: false, message: 'Hotel not found' },
          { status: 404 },
        ),
      );
    }

    const plan = (hotel.plan as PlanKey) ?? 'starter';
    const canUseExtras = hasPlanAccess(plan, 'pro');

    // Parallel: widgetConfig + extras + childPriceRanges + voucherCount
    const [widgetConfig, extras, childPriceRanges, voucherCount] = await Promise.all([
      configSlug
        ? prisma.widgetConfig.findUnique({
            where: { hotelId_slug: { hotelId: hotel.id, slug: configSlug } },
          })
        : Promise.resolve(null),
      prisma.hotelExtra.findMany({
        where: {
          hotelId: hotel.id,
          isActive: true,
          showInWidget: true,
          ...(!canUseExtras ? { type: 'insurance' } : {}),
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { key: true, name: true, type: true, billingType: true, price: true, description: true, imageUrl: true, linkUrl: true },
      }),
      prisma.childPriceRange.findMany({
        where: { hotelId: hotel.id },
        orderBy: [{ sortOrder: 'asc' }, { minAge: 'asc' }],
        select: { id: true, label: true, minAge: true, maxAge: true, pricePerNight: true },
      }),
      prisma.voucherTemplate.count({ where: { hotelId: hotel.id, isActive: true } }),
    ]);

    const vouchersEnabled = voucherCount > 0;
    const settings = hotel.settings;

    const mergedSettings = widgetConfig
      ? {
          ...settings,
          showPrices: widgetConfig.showPrices,
          showAmenities: widgetConfig.showAmenities,
          showExtrasStep: widgetConfig.showExtrasStep,
          showPhoneField: widgetConfig.showPhoneField,
          showMessageField: widgetConfig.showMessageField,
          enableImageSlider: widgetConfig.enableImageSlider,
          enableInstantBooking: widgetConfig.enableInstantBooking,
          instantBooking: widgetConfig.enableInstantBooking,
          hideRequestOption: widgetConfig.hideRequestOption,
        }
      : settings;

    const fullBranding = hasFullBranding(plan);
    const advancedTypography = hasAdvancedTypography(plan);

    if (mergedSettings) {
      if (!fullBranding) {
        mergedSettings.backgroundColor = null;
        mergedSettings.cardBackground = null;
        mergedSettings.textColor = null;
        mergedSettings.mutedTextColor = null;
        mergedSettings.borderColor = null;
        mergedSettings.cardRadius = null;
        mergedSettings.buttonRadius = null;
        mergedSettings.buttonColor = null;
        mergedSettings.headlineFont = null;
        mergedSettings.bodyFont = null;
      }
      if (!advancedTypography) {
        mergedSettings.headlineFontSize = null;
        mergedSettings.bodyFontSize = null;
        mergedSettings.headlineFontWeight = null;
        mergedSettings.bodyFontWeight = null;
        mergedSettings.headlineFontUrl = null;
        mergedSettings.bodyFontUrl = null;
      }
      (mergedSettings as Record<string, unknown>).paypalClientSecret = undefined;
      (mergedSettings as Record<string, unknown>).stripeSecretKey = undefined;
    }

    return withCors(
      NextResponse.json(
        { success: true, hotel, settings: mergedSettings, extras, childPriceRanges, miniWidgetTarget: mergedSettings?.miniWidgetTarget ?? null, vouchersEnabled },
        { headers: { 'Cache-Control': 'no-store' } },
      ),
    );
  } catch (error) {
    console.error('hotel-settings GET error:', error);

    return withCors(
      NextResponse.json(
        { success: false, message: 'Server error' },
        { status: 500 },
      ),
    );
  }
}
