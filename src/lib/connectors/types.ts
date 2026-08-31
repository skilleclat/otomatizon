export type ConnectorProvider = "google_workspace" | "whatsapp_business" | "mpesa_daraja" | "gmail" | "google_calendar" | "google_sheets";

export type ConnectorAuthMode = "oauth2" | "cloud_api" | "qr_session" | "api_credentials";

export type ConnectorHealthStatus = "healthy" | "degraded" | "disconnected" | "needs_reauth";

export interface EncryptedCredential {
  iv: string;
  tag: string;
  ciphertext: string;
  updatedAt: string;
}

export interface GoogleConnectorConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
  scopes: string[];
  userEmail?: string;
  userName?: string;
}

export interface WhatsAppCloudConfig {
  phoneNumberId?: string;
  businessAccountId?: string;
  systemUserAccessToken?: string;
  webhookVerifyToken?: string;
  appSecret?: string;
  displayPhoneNumber?: string;
}

export interface WhatsAppQRSessionConfig {
  sessionId: string;
  status: "idle" | "qr_ready" | "connecting" | "authenticated" | "disconnected";
  qrCodeDataUri?: string;
  connectedPhone?: string;
  connectedName?: string;
  batteryLevel?: number;
  lastPingAt?: string;
}

export interface MpesaDarajaConfig {
  environment: "sandbox" | "production";
  consumerKey?: string;
  consumerSecret?: string;
  businessShortCode?: string;
  passkey?: string;
  tillNumber?: string;
  paybillNumber?: string;
  callbackUrl?: string;
  accountReference?: string;
}

export interface ConnectorStateRecord {
  id: string;
  provider: ConnectorProvider;
  name: string;
  authMode: ConnectorAuthMode;
  status: ConnectorHealthStatus;
  accountIdentifier: string;
  lastSyncedAt: string;
  latencyMs: number;
  permissions: string[];
  capabilities: string[];
  encryptedConfig?: EncryptedCredential;
  metadata?: Record<string, any>;
}

export interface WebhookIncomingEvent {
  provider: ConnectorProvider;
  rawPayload: any;
  receivedAt: string;
  verified: boolean;
  signature?: string;
  parsedEvent?: {
    eventType: "whatsapp_message" | "mpesa_payment" | "calendar_change" | "sheets_update";
    senderId?: string;
    senderName?: string;
    messageText?: string;
    amount?: number;
    receiptNumber?: string;
    timestamp: string;
  };
}

export interface ConnectionTestResult {
  provider: string;
  success: boolean;
  message: string;
  latencyMs: number;
  testedAt: string;
  details?: Record<string, any>;
}
