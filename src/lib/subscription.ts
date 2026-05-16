import type { SubscriptionStatus } from './types'

export const TRIAL_POST_CAP = 200

export function canAccessApp(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing'
}

export function isTrialExpired(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return true
  return new Date(trialEndsAt) < new Date()
}

export function trialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0
  const ms = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}
