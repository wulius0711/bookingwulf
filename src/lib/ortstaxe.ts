// Wiener Ortstaxe key numbers (applied directly to room price without breakfast)
// Source: WKO Merkblatt, December 2025
const WIEN_RATES: { from: Date; rate: number }[] = [
  { from: new Date('2027-07-01'), rate: 0.067797 },
  { from: new Date('2026-07-01'), rate: 0.043478 },
  { from: new Date('2000-01-01'), rate: 0.025237 },
];

function wienRate(arrivalDate: Date): number {
  for (const { from, rate } of WIEN_RATES) {
    if (arrivalDate >= from) return rate;
  }
  return 0.025237;
}

export type OrtstaxeSettings = {
  ortstaxeMode: string;
  ortstaxePerPersonPerNight: number | null;
  ortstaxeMinAge: number | null;
};

export function calculateOrtstaxe({
  settings,
  roomTotalWithoutBreakfast,
  adults,
  children,
  nights,
  arrivalDate,
  childBirthdays,
}: {
  settings: OrtstaxeSettings;
  roomTotalWithoutBreakfast: number;
  adults: number;
  children: number;
  nights: number;
  arrivalDate: Date;
  childBirthdays: (string | null)[];
}): number {
  const { ortstaxeMode, ortstaxePerPersonPerNight, ortstaxeMinAge } = settings;

  if (ortstaxeMode === 'wien') {
    const rate = wienRate(arrivalDate);
    return parseFloat((roomTotalWithoutBreakfast * rate).toFixed(2));
  }

  if (ortstaxeMode === 'custom' && ortstaxePerPersonPerNight && ortstaxePerPersonPerNight > 0) {
    let eligiblePersons = adults;
    if (children > 0) {
      if (ortstaxeMinAge === null || ortstaxeMinAge === 0) {
        eligiblePersons += children;
      } else {
        for (const bd of childBirthdays) {
          if (!bd) continue;
          const age = Math.floor(
            (arrivalDate.getTime() - new Date(bd).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
          );
          if (age >= ortstaxeMinAge) eligiblePersons++;
        }
      }
    }
    return parseFloat((ortstaxePerPersonPerNight * eligiblePersons * nights).toFixed(2));
  }

  return 0;
}

export function wienRateInfo(arrivalDate?: Date): { current: number; label: string } {
  const d = arrivalDate ?? new Date();
  const rate = wienRate(d);
  const pct = (rate * 100).toFixed(4).replace('.', ',');
  return { current: rate, label: `${pct} % vom Zimmerpreis` };
}
