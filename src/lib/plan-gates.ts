import { PLANS, PlanKey } from './plans';

const PLAN_LEVEL: Record<string, number> = { starter: 0, pro: 1, business: 2 };

export function canAddApartment(plan: string, currentCount: number): boolean {
  const p = PLANS[plan as PlanKey] ?? PLANS.starter;
  return currentCount < p.maxApartments;
}

export function canAddHotelToUser(newHotelPlan: string, currentHotelCount: number): boolean {
  if (currentHotelCount === 0) return true;
  const p = PLANS[newHotelPlan as PlanKey] ?? PLANS.starter;
  return p.maxHotels > 1 && currentHotelCount < p.maxHotels;
}

export function canAddUser(plan: string, currentCount: number): boolean {
  const p = PLANS[plan as PlanKey] ?? PLANS.starter;
  return currentCount < p.maxUsers;
}

export function hasFullBranding(plan: string): boolean {
  return plan === 'pro' || plan === 'business';
}

export function getPlanLimits(plan: string) {
  return PLANS[plan as PlanKey] ?? PLANS.starter;
}

/** Check if a feature requiring `minPlan` is available on `currentPlan` */
export function hasPlanAccess(currentPlan: string, minPlan: PlanKey): boolean {
  return (PLAN_LEVEL[currentPlan] ?? 0) >= (PLAN_LEVEL[minPlan] ?? 0);
}

/** Minimum plan required for each nav route */
export const NAV_PLAN_GATES: Record<string, PlanKey> = {
  '/admin/price-seasons': 'pro',
  '/admin/email-templates': 'pro',
  '/admin/analytics': 'business',
};

/** Minimum plan required for specific features (non-nav) */
export const FEATURE_PLAN_GATES: Record<string, PlanKey> = {
  messages: 'business',
};

/** Minimum plan label for tooltip */
export const PLAN_LABEL: Record<PlanKey, string> = {
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
};
