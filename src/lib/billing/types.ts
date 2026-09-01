// Billing & Subscription Types for Otomatizon

export type PlanId = "free" | "starter" | "growth" | "pro";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceKesMonthly: number;
  priceKesYearly: number;
  tagline: string;
  badge?: string;
  isEarlyAccess?: boolean;
  limits: {
    maxActiveAutomations: number;
    leadsMonthlyLimit: number;
    connectedAppsLimit: number;
  };
  features: string[];
}

export interface EarlyAccessConfig {
  campaignName: string;
  totalSlots: number;
  claimedSlots: number;
  discountedPriceKes: number;
  regularPriceKes: number;
  headline: string;
  subheadline: string;
}

export interface PaymentProvider {
  id: "mpesa_stk" | "intasend" | "card_manual";
  name: string;
  supportedCurrencies: ("KES" | "USD")[];
  initiatePayment: (params: {
    planId: PlanId;
    amountKes: number;
    phoneOrEmail: string;
    organizationId: string;
  }) => Promise<{ transactionId: string; status: "pending" | "completed" }>;
}

export interface SubscriptionRecord {
  id: string;
  organizationId: string;
  planId: PlanId;
  status: "active" | "trial" | "past_due" | "canceled";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  priceKesMonthly: number;
  provider: "mpesa_stk" | "intasend" | "card_manual";
  mpesaReceiptNumber?: string;
}
