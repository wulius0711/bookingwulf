import { PLANS, PlanKey } from './stripe';

export function canAddApartment(plan: string, currentCount: number): boolean {
  const p = PLANS[plan as PlanKey] ?? PLANS.starter;
  return currentCount < p.maxApartments;
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
