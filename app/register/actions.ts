'use server';

import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/password';
import { stripe, PLANS, PlanKey } from '@/src/lib/stripe';
import { redirect } from 'next/navigation';

export type RegisterState = { error?: string } | undefined;

export async function registerHotel(
  _state: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const hotelName = formData.get('hotelName')?.toString().trim() ?? '';
  const slug = formData.get('slug')?.toString().trim().toLowerCase().replace(/\s+/g, '-') ?? '';
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
  const password = formData.get('password')?.toString() ?? '';
  const confirm = formData.get('confirm')?.toString() ?? '';
  const plan = (formData.get('plan')?.toString() ?? 'starter') as PlanKey;

  if (!hotelName || !slug || !email || !password || !confirm) {
    return { error: 'Alle Felder sind erforderlich.' };
  }
  if (password.length < 8) return { error: 'Passwort muss mindestens 8 Zeichen lang sein.' };
  if (password !== confirm) return { error: 'Passwörter stimmen nicht überein.' };
  if (!(plan in PLANS)) return { error: 'Ungültiger Plan.' };

  const slugConflict = await prisma.hotel.findUnique({ where: { slug } });
  if (slugConflict) return { error: `Der Slug „${slug}" ist bereits vergeben.` };

  const emailConflict = await prisma.adminUser.findUnique({ where: { email } });
  if (emailConflict) return { error: 'Diese E-Mail wird bereits verwendet.' };

  const passwordHash = await hashPassword(password);

  const hotel = await prisma.hotel.create({
    data: {
      name: hotelName,
      slug,
      email,
      plan,
      subscriptionStatus: 'inactive',
      adminUsers: {
        create: { email, passwordHash, role: 'hotel_admin', isActive: true },
      },
    },
  });

  // Create Stripe customer and redirect to checkout
  const customer = await stripe.customers.create({
    name: hotelName,
    email,
    metadata: { hotelId: String(hotel.id) },
  });

  await prisma.hotel.update({
    where: { id: hotel.id },
    data: { stripeCustomerId: customer.id },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: 'subscription',
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    success_url: `${appUrl}/admin?registered=1`,
    cancel_url: `${appUrl}/register?cancelled=1`,
    metadata: { hotelId: String(hotel.id), plan },
    subscription_data: { metadata: { hotelId: String(hotel.id), plan } },
  });

  redirect(checkoutSession.url!);
}
