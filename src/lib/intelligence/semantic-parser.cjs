/**
 * Otomatizon Multilingual Semantic Parser & Entity Extractor
 * Handles English, French, Swahili, and Kenyan Sheng.
 */

const SUBJECTS_MAP = [
  { keywords: ["french", "français", "francais", "delf", "dalf", "tef"], name: "French Tutoring" },
  { keywords: ["math", "maths", "mathematics", "calculus", "algebra"], name: "Mathematics Coaching" },
  { keywords: ["piano", "keyboard", "music", "guitar"], name: "Piano & Music Lessons" },
  { keywords: ["ielts", "toefl", "english", "anglais"], name: "English / IELTS Prep" },
  { keywords: ["physics", "physique", "chemistry", "chimie", "science"], name: "Science Tutoring" },
  { keywords: ["consulting", "executive", "coaching", "business"], name: "Executive Coaching" }
];

const LEVELS_MAP = [
  { keywords: ["grade 8", "grade 7", "grade 9", "grade 6", "primary", "kcpe", "cbc"], name: "Primary / Junior Secondary (CBC)" },
  { keywords: ["high school", "form 4", "form 3", "form 2", "form 1", "kcse", "lycée", "college", "4e", "3e", "terminale"], name: "High School / Lycée" },
  { keywords: ["beginner", "débutant", "debutant", "starter", "a1", "a2"], name: "Beginner (A1/A2)" },
  { keywords: ["intermediate", "intermédiaire", "intermediaire", "b1", "b2"], name: "Intermediate (B1/B2)" },
  { keywords: ["advanced", "avancé", "avance", "c1", "c2"], name: "Advanced (C1/C2)" },
  { keywords: ["adult", "executive", "adulte", "travail", "professional"], name: "Executive / Adult" }
];

const DAYS_MAP = [
  { keywords: ["monday", "lundi", "jumatatu"], name: "Monday" },
  { keywords: ["tuesday", "mardi", "jumanne"], name: "Tuesday" },
  { keywords: ["wednesday", "mercredi", "jumatano"], name: "Wednesday" },
  { keywords: ["thursday", "jeudi", "alhamisi"], name: "Thursday" },
  { keywords: ["friday", "vendredi", "ijumaa"], name: "Friday" },
  { keywords: ["saturday", "samedi", "jumamosi"], name: "Saturday" },
  { keywords: ["sunday", "dimanche", "jumapili"], name: "Sunday" },
  { keywords: ["weekend", "fin de semaine"], name: "Weekend" }
];

function detectLanguage(text) {
  const lower = text.toLowerCase();
  let frScore = 0;
  let swScore = 0;
  let enScore = 0;

  const frWords = ["bonjour", "salut", "cours", "français", "francais", "combien", "merci", "mardi", "fille", "pour", "tarif", "prix", "horaires"];
  const swWords = ["habari", "niaje", "sasa", "nataka", "masomo", "ngapi", "asante", "kesho", "pesa", "tafadhali", "kwa", "saa", "wapi"];
  const enWords = ["hello", "hi", "looking", "tutoring", "class", "classes", "how much", "rate", "rates", "daughter", "son", "slot", "book", "cost"];

  for (const w of frWords) if (lower.includes(w)) frScore += 2;
  for (const w of swWords) if (lower.includes(w)) swScore += 2;
  for (const w of enWords) if (lower.includes(w)) enScore += 2;

  if (frScore > enScore && frScore > swScore) return "fr";
  if (swScore > enScore && swScore > frScore) return "sw";
  if (frScore > 0 && enScore > 0) return "mixed";
  return "en";
}

function detectIntent(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("paid") || 
    lower.includes("sent the money") || 
    lower.includes("mpesa") || 
    lower.includes("m-pesa") || 
    lower.includes("nimetuma") || 
    lower.includes("j'ai payé") || 
    lower.includes("paiement effectué") ||
    /QA[A-Z0-9]{7,10}/i.test(text)
  ) {
    return "payment_confirmation";
  }

  if (
    lower.includes("book") || 
    lower.includes("reserve") || 
    lower.includes("réserver") || 
    lower.includes("slot") || 
    lower.includes("rendez-vous") || 
    lower.includes("schedule") ||
    lower.includes("available on") ||
    lower.includes("disponible le")
  ) {
    return "booking_request";
  }

  if (
    lower.includes("how much") || 
    lower.includes("rates") || 
    lower.includes("pricing") || 
    lower.includes("c'est combien") || 
    lower.includes("quel est le prix") || 
    lower.includes("tarif") || 
    lower.includes("ngapi") || 
    lower.includes("cost")
  ) {
    return "pricing_query";
  }

  if (
    lower.includes("cancel") || 
    lower.includes("annuler") || 
    lower.includes("postpone") || 
    lower.includes("reporter") || 
    lower.includes("sitakuja")
  ) {
    return "cancellation";
  }

  return "course_inquiry";
}

function extractEntities(text, senderContext = {}) {
  const lower = text.toLowerCase();
  const entities = {
    studentName: senderContext.senderName || undefined,
    phone: senderContext.senderPhone || undefined
  };

  // 1. Subject Extraction
  for (const s of SUBJECTS_MAP) {
    if (s.keywords.some(k => lower.includes(k))) {
      entities.subject = s.name;
      break;
    }
  }
  if (!entities.subject) entities.subject = "French Tutoring"; // fallback to primary discipline

  // 2. Level Extraction
  for (const l of LEVELS_MAP) {
    if (l.keywords.some(k => lower.includes(k))) {
      entities.level = l.name;
      break;
    }
  }

  // 3. Requested Day
  for (const d of DAYS_MAP) {
    if (d.keywords.some(k => lower.includes(k))) {
      entities.requestedDay = d.name;
      break;
    }
  }

  // 4. Requested Time (e.g. 16h, 4pm, 10:00 AM)
  const timeMatch = text.match(/(\b\d{1,2}(?:h|\:00|\s?(?:am|pm))\b)/i);
  if (timeMatch) {
    entities.requestedTime = timeMatch[1].trim();
  }

  // 5. Budget / Amount Mentioned (e.g. KES 3500, 3,500, 5000 bob)
  const budgetMatch = text.match(/(?:kes|ksh|\$|€|bob)\s?([0-9,]+)/i) || text.match(/([0-9,]+)\s?(?:kes|ksh|bob)/i);
  if (budgetMatch) {
    const rawVal = budgetMatch[1].replace(/,/g, "");
    const num = parseInt(rawVal, 10);
    if (!isNaN(num) && num > 0) entities.budgetMentionedKes = num;
  }

  // 6. M-Pesa Receipt Code (e.g. QAH8991204 or QA12345678)
  const receiptMatch = text.match(/\b(Q[A-Z0-9]{8,10})\b/i);
  if (receiptMatch) {
    entities.paymentReceipt = receiptMatch[1].toUpperCase();
  }

  return entities;
}

function calculateUrgency(text) {
  const lower = text.toLowerCase();
  if (
    lower.includes("urgent") || 
    lower.includes("asap") || 
    lower.includes("today") || 
    lower.includes("aujourd'hui") || 
    lower.includes("demain") || 
    lower.includes("tomorrow") || 
    lower.includes("kesho") || 
    lower.includes("exam next week") || 
    lower.includes("urgent help")
  ) {
    return "high";
  }
  return "normal";
}

/**
 * Main Semantic Parsing Function
 */
function parseInboundMessageText(rawText, senderContext = {}) {
  const language = detectLanguage(rawText);
  const intent = detectIntent(rawText);
  const entities = extractEntities(rawText, senderContext);
  const urgency = calculateUrgency(rawText);

  // Confidence calculation (heuristic based on matches)
  let confidence = 85;
  if (entities.subject) confidence += 5;
  if (entities.level) confidence += 4;
  if (entities.requestedDay || entities.requestedTime) confidence += 4;
  if (entities.paymentReceipt) confidence += 2;
  confidence = Math.min(99, confidence);

  return {
    rawMessage: rawText,
    detectedLanguage: language,
    intent,
    confidenceScore: confidence,
    urgency,
    entities,
    sentiment: urgency === "high" ? "urgent" : "positive"
  };
}

/**
 * Email Intelligence Classifier (Distinguishes Business vs. Personal/Spam)
 */
function classifyInboundEmail({ from = "", subject = "", body = "", snippet = "" }) {
  const fullText = `${subject} ${snippet} ${body}`.toLowerCase();
  const fromLower = (from || "").toLowerCase();

  // 1. Check for automated notifications / newsletters / security alerts / social
  const personalSpamKeywords = [
    "noreply@", "no-reply@", "donotreply@", "security code", "password reset", "verification code",
    "verify your account", "receipt from uber", "netflix", "spotify", "newsletter", "unsubscribe",
    "promotions", "daily digest", "facebookmail", "linkedin.com", "instagram.com", "tiktok.com",
    "twitter.com", "x.com", "bank statement", "code de sécurité", "réinitialisation"
  ];

  const matchedSpamTerm = personalSpamKeywords.find(k => fullText.includes(k) || fromLower.includes(k));

  // 2. Business Keywords (Tuition, Services, Quotes, Bookings, Pricing, Invoices, Clients)
  const businessKeywords = [
    "lesson", "tutoring", "tutor", "coaching", "class", "classes", "quote", "rate", "rates",
    "fee", "fees", "cost", "invoice", "booking", "book", "schedule", "session", "availability",
    "pricing", "service", "services", "consultation", "client", "student", "cours", "devis",
    "tarif", "tarifs", "rendez-vous", "disponibilité", "disponible", "facture", "formation", "inscription"
  ];

  const matchedBusinessTerms = businessKeywords.filter(k => fullText.includes(k));
  const isBusiness = matchedBusinessTerms.length >= 1 && !matchedSpamTerm;

  if (isBusiness) {
    const semantic = parseInboundMessageText(`${subject}. ${body || snippet}`, { senderName: from });
    return {
      category: "BUSINESS_INQUIRY",
      isBusiness: true,
      confidenceScore: Math.min(98, 85 + matchedBusinessTerms.length * 4),
      matchedTerms: matchedBusinessTerms,
      summary: `Business inquiry regarding ${semantic.entities.subject || "Services"} (${matchedBusinessTerms.slice(0, 3).join(", ")})`,
      actionRequired: "Record in Google Sheets, inspect Calendar, and draft reply",
      semantic
    };
  }

  return {
    category: "PERSONAL_FILTERED",
    isBusiness: false,
    confidenceScore: 94,
    matchedSpamTerm: matchedSpamTerm || null,
    summary: matchedSpamTerm 
      ? `Automated notification / personal alert (${matchedSpamTerm}) filtered to preserve privacy`
      : "Non-business / personal message — Skipped from business ledger to maintain privacy",
    actionRequired: "None (Preserved in private inbox, ignored by business pipeline)"
  };
}

module.exports = {
  parseInboundMessageText,
  classifyInboundEmail,
  detectLanguage,
  detectIntent,
  extractEntities
};
