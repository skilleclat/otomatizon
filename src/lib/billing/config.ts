import { PlanConfig, EarlyAccessConfig } from "./types";

export const earlyAccessConfig: EarlyAccessConfig = {
  campaignName: "First 10 Kenyan Businesses",
  totalSlots: 10,
  claimedSlots: 6, // 4 slots remaining
  discountedPriceKes: 499,
  regularPriceKes: 999,
  headline: "Join the first 10 Otomatizon businesses.",
  subheadline: "Get direct onboarding support and run your business operations on autopilot for KES 499/month."
};

export const defaultPlansConfig: Record<string, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceKesMonthly: 499,
    priceKesYearly: 4990,
    tagline: "For solo tutors and coaches starting to automate",
    badge: "Early Access",
    isEarlyAccess: true,
    limits: {
      maxActiveAutomations: 1,
      leadsMonthlyLimit: 100,
      connectedAppsLimit: 3
    },
    features: [
      "1 active automation",
      "Up to 100 customer inquiries / month",
      "WhatsApp & Google Calendar synchronization",
      "Instant lead capture in Google Sheets",
      "Standard email & WhatsApp support"
    ]
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceKesMonthly: 999,
    priceKesYearly: 9990,
    tagline: "For busy businesses losing leads and hours to manual admin",
    badge: "Most Popular",
    limits: {
      maxActiveAutomations: 5,
      leadsMonthlyLimit: 500,
      connectedAppsLimit: 6
    },
    features: [
      "Up to 5 active automations",
      "Up to 500 customer inquiries / month",
      "Full Google Suite (Calendar, Sheets, Gmail, Drive)",
      "Automated M-Pesa STK payment reminders",
      "Opportunity Discovery Engine",
      "Priority WhatsApp support (Nairobi team)"
    ]
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceKesMonthly: 1999,
    priceKesYearly: 19990,
    tagline: "For growing academies and high-volume practices",
    limits: {
      maxActiveAutomations: 999,
      leadsMonthlyLimit: 9999,
      connectedAppsLimit: 99
    },
    features: [
      "Unlimited active automations",
      "Unlimited inquiries & appointments",
      "Multi-staff calendar routing",
      "Custom WhatsApp message wording & branding",
      "Dedicated Nairobi operations advisor",
      "Same-day phone & WhatsApp onboarding"
    ]
  }
};

export function getPlanConfig(planId: string): PlanConfig {
  return defaultPlansConfig[planId] || defaultPlansConfig.starter;
}

export function getAllPlans(): PlanConfig[] {
  return Object.values(defaultPlansConfig);
}
