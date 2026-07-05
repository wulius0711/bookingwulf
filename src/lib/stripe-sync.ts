import { stripe, getApartmentPriceIds } from './stripe';
import { prisma } from './prisma';

/** Abrechnungsrelevante Apartment-Anzahl: das Maximum aus echten Apartments und einer manuell hinterlegten Mindestgröße
 *  (falls jemand mit weniger Apartments testet, aber für die reale Größe seines Betriebs zahlen will). */
export function effectiveApartmentCount(actualCount: number, billedApartments: number | null): number {
  return Math.max(actualCount, billedApartments ?? 0);
}

/** Nach jedem Apartment-Create/Delete/Duplicate oder einer Änderung von billedApartments aufrufen, damit die
 *  Stripe-Subscription-Quantity der Apartment-Fee-Position mitzieht. */
export async function syncApartmentQuantity(hotelId: number): Promise<void> {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { stripeSubscriptionId: true, billedApartments: true, _count: { select: { apartments: true } } },
    });
    if (!hotel?.stripeSubscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(hotel.stripeSubscriptionId);
    const apartmentPriceIds = getApartmentPriceIds();
    const apartmentItem = subscription.items.data.find((item) => apartmentPriceIds.includes(item.price.id));
    if (!apartmentItem) return;

    const count = effectiveApartmentCount(hotel._count.apartments, hotel.billedApartments);
    const quantity = Math.max(0, count - 1);
    // High-Water-Mark: nur erhöhen, nie automatisch verkleinern (kein automatischer Gutschrift-Lauf beim Löschen von Apartments).
    if (quantity <= (apartmentItem.quantity ?? 0)) return;

    // 'always_invoice' statt 'create_prorations': bei jährlicher Abrechnung würde eine reine Proration-Position sonst erst
    // bei der Verlängerung in ~10 Monaten mitverrechnet, statt sofort abgebucht zu werden.
    await stripe.subscriptionItems.update(apartmentItem.id, { quantity, proration_behavior: 'always_invoice' });
  } catch (error) {
    console.error('syncApartmentQuantity error:', error);
  }
}
