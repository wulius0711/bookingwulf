export type ChildPriceRangeInput = { minAge: number; maxAge: number; pricePerNight: number };

// Mirrors public/widget.html's getChildAge() exactly (calendar-based, not a 365.25-day
// approximation) so the server charges precisely what the guest saw quoted in the widget.
function getChildAge(birthday: string, arrivalDate: Date): number | null {
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) return null;
  let age = arrivalDate.getFullYear() - birth.getFullYear();
  const m = arrivalDate.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && arrivalDate.getDate() < birth.getDate())) age--;
  return age;
}

export function calculateChildPriceSurcharge({
  childPriceRanges,
  childBirthdays,
  arrivalDate,
  nights,
}: {
  childPriceRanges: ChildPriceRangeInput[];
  childBirthdays: (string | null | undefined)[];
  arrivalDate: Date;
  nights: number;
}): number {
  if (!childPriceRanges.length || !childBirthdays.length) return 0;
  let total = 0;
  for (const bd of childBirthdays) {
    if (!bd) continue;
    const age = getChildAge(bd, arrivalDate);
    if (age === null) continue;
    const range = childPriceRanges.find((r) => age >= r.minAge && age <= r.maxAge);
    if (range) total += Number(range.pricePerNight) * nights;
  }
  return parseFloat(total.toFixed(2));
}
