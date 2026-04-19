import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';
import { hasPlanAccess, hasFullBranding, hasAdvancedTypography } from '@/src/lib/plan-gates';
import type { PlanKey } from '@/src/lib/plans';

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

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: {
        id: true,
        name: true,
        plan: true,
        bookingTermsUrl: true,
        privacyPolicyUrl: true,
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

    const settings = await prisma.hotelSettings.findUnique({
      where: { hotelId: hotel.id },
    });

    // If a widget config slug is given, override feature toggles
    const widgetConfig = configSlug
      ? await prisma.widgetConfig.findUnique({
          where: { hotelId_slug: { hotelId: hotel.id, slug: configSlug } },
        })
      : null;

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
        }
      : settings;

    const plan = (hotel.plan as PlanKey) ?? 'starter';
    const fullBranding = hasFullBranding(plan);
    const advancedTypography = hasAdvancedTypography(plan);

    // Strip settings that aren't available on this plan
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
      }
    }

    const canUseExtras = hasPlanAccess(plan, 'pro');
    const extras = await prisma.hotelExtra.findMany({
      where: {
        hotelId: hotel.id,
        isActive: true,
        // Starter plans only get insurance, Pro+ gets everything
        ...(!canUseExtras ? { type: 'insurance' } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { key: true, name: true, type: true, billingType: true, price: true, linkUrl: true },
    });

    return withCors(
      NextResponse.json(
        { success: true, hotel, settings: mergedSettings, extras },
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
