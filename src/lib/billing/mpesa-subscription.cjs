const { MpesaDarajaConnector } = require("../connectors/mpesa-connector.cjs");
const { upgradePlan, PLAN_TIERS } = require("./subscription-manager.cjs");

const mpesaConnector = new MpesaDarajaConnector();

class MpesaSubscriptionManager {
  /**
   * Initiates STK Push prompt for SaaS subscription
   */
  async initiateSubscriptionPayment(phoneNumber, planId = "growth", orgId = "org_james") {
    const plan = PLAN_TIERS[planId] || PLAN_TIERS.growth;
    const accountRef = `Otomatizon-${plan.name.toUpperCase()}`;

    const stkResult = await mpesaConnector.initiateStkPush(phoneNumber, plan.priceKesMonthly, accountRef);

    return {
      success: true,
      stkResult,
      plan,
      orgId,
      checkoutRequestId: stkResult.checkoutRequestId,
      message: `Safaricom STK Push for KES ${plan.priceKesMonthly} dispatched to ${phoneNumber}. Please enter your M-Pesa PIN.`
    };
  }

  /**
   * Processes Safaricom subscription callback
   */
  processSubscriptionCallback(callbackPayload, orgId = "org_james", planId = "growth") {
    const parsed = mpesaConnector.parseCallbackPayload(callbackPayload);
    if (!parsed || !parsed.isSuccess) {
      return {
        success: false,
        error: parsed ? parsed.resultDesc : "Payment cancelled or timed out"
      };
    }

    const upgradeResult = upgradePlan(orgId, planId, {
      receiptNumber: parsed.receiptNumber,
      amount: parsed.amount,
      phone: parsed.phoneNumber
    });

    return {
      success: true,
      parsedPayment: parsed,
      upgradeResult
    };
  }
}

const mpesaSubscriptionManager = new MpesaSubscriptionManager();

module.exports = {
  MpesaSubscriptionManager,
  mpesaSubscriptionManager
};
