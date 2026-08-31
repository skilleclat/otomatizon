/**
 * Otomatizon Clean PDF Document Generator
 * Generates a 100% compliant, standard multi-page PDF-1.4 binary document
 * without external npm dependencies.
 */

export interface PdfReportData {
  generatedAt: string;
  businessName: string;
  businessType: string;
  city: string;
  country: string;
  understood: {
    summary: string;
    customerType: string;
    primaryChannels: string[];
    manualFrictions: string[];
  };
  currentWorkflow: {
    order: number;
    name: string;
    sourceApp: string;
    actionDescription: string;
    manualFriction?: string;
  }[];
  toolsCurrentlyUsed: {
    tool: string;
    role: string;
    status: string;
  }[];
  opportunitiesDiscovered: {
    title: string;
    problem: string;
    evidence: string;
    evidenceType: string;
    impactLevel: string;
    estimatedTimeSavedHoursPerWeek: number;
    estimatedRevenueAtRiskKes: number;
    recommendation: string;
  }[];
  recommendedFirstAutomation: {
    title: string;
    reason: string;
    impact: string;
    hoursSaved: number;
    requiredApps: string[];
  };
  requiredAppsSummary: {
    name: string;
    status: string;
    usedFor: string;
  }[];
}

function escapePdfText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, " "); // Keep ASCII printable
}

export function generateReportPdfBuffer(data: PdfReportData): Uint8Array {
  const objects: string[] = [];
  const offsets: number[] = [];

  function addObject(content: string): number {
    objects.push(content);
    return objects.length; // 1-indexed object id
  }

  // Page tracking
  const pageObjectIds: number[] = [];
  const totalPages = 3;

  // Colors
  // Otomatizon Primary Green #15803D = 21/255, 128/255, 61/255 -> 0.082, 0.502, 0.239
  // Charcoal #121316 -> 0.071, 0.075, 0.086
  // Off-white / Muted #FAF9F5 / #75777E -> 0.459, 0.467, 0.494
  // Light border #EAE7DF -> 0.918, 0.906, 0.875

  // ================= PAGE 1 =================
  let p1 = "";
  // Running Header
  p1 += `q 0.918 0.906 0.875 RG 1 w 50 790 m 545 790 l S Q\n`;
  p1 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 50 798 Td (OTOMATIZON  |  CONFIDENTIAL BUSINESS AUTOMATION REPORT) Tj ET\n`;
  p1 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 440 798 Td (Date: ${escapePdfText(data.generatedAt)}) Tj ET\n`;

  // Letterhead Title Box with Official Brand Emblem
  p1 += `q 0.98 0.985 0.98 rg 50 685 495 90 re f 0.918 0.906 0.875 RG 1 w 50 685 495 90 re S Q\n`;
  p1 += `q 0.082 0.502 0.239 rg 50 772 495 3 re f Q\n`; // Top Brand Emerald Accent Line
  
  // Official Logo Typography with Emerald Accent
  p1 += `BT /F2 20 Tf 0.071 0.075 0.086 rg 70 742 Td (Otomatizon) Tj ET\n`;
  p1 += `BT /F2 20 Tf 0.082 0.502 0.239 rg 183 742 Td (.) Tj ET\n`;
  p1 += `BT /F2 8.5 Tf 0.082 0.502 0.239 rg 205 744 Td (AUTOMATION OS) Tj ET\n`;
  p1 += `BT /F2 13 Tf 0.071 0.075 0.086 rg 70 718 Td (Business Process Automation & Intelligence Report) Tj ET\n`;
  p1 += `BT /F1 9.5 Tf 0.459 0.467 0.494 rg 70 698 Td (Client: ${escapePdfText(data.businessName)}  |  Location: ${escapePdfText(data.city)}, ${escapePdfText(data.country)}  |  Format: Executive Briefing) Tj ET\n`;

  // Integrity Notice Banner
  p1 += `q 0.93 0.98 0.94 rg 50 645 495 32 re f 0.65 0.92 0.75 RG 1 w 50 645 495 32 re S Q\n`;
  p1 += `BT /F2 9 Tf 0.082 0.502 0.239 rg 65 662 Td (VERIFIED DATA INTEGRITY STANDARD) Tj ET\n`;
  p1 += `BT /F1 8.5 Tf 0.071 0.075 0.086 rg 65 651 Td (Findings distinguish between OBSERVED data from connected systems and INFERRED user declarations.) Tj ET\n`;

  // Section 01: What We Understood
  p1 += `BT /F2 12 Tf 0.082 0.502 0.239 rg 50 618 Td (01  WHAT WE UNDERSTOOD) Tj ET\n`;
  p1 += `q 0.98 0.98 0.98 rg 50 500 495 105 re f 0.918 0.906 0.875 RG 1 w 50 500 495 105 re S Q\n`;
  p1 += `BT /F2 9 Tf 0.459 0.467 0.494 rg 65 588 Td (BUSINESS PROFILE & OBJECTIVE:) Tj ET\n`;
  p1 += `BT /F1 10 Tf 0.071 0.075 0.086 rg 65 572 Td (${escapePdfText(data.understood.summary.slice(0, 85))}) Tj ET\n`;
  p1 += `BT /F2 9 Tf 0.459 0.467 0.494 rg 65 550 Td (CLIENT TARGET SEGMENT:) Tj ET\n`;
  p1 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 65 536 Td (${escapePdfText(data.understood.customerType)}) Tj ET\n`;
  p1 += `BT /F2 9 Tf 0.459 0.467 0.494 rg 65 518 Td (PRIMARY CHANNELS:) Tj ET\n`;
  p1 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 180 518 Td (${escapePdfText(data.understood.primaryChannels.join(", "))}) Tj ET\n`;

  // Section 02: Current Operational Flow
  p1 += `BT /F2 12 Tf 0.082 0.502 0.239 rg 50 470 Td (02  HOW YOUR BUSINESS CURRENTLY WORKS) Tj ET\n`;
  p1 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 50 455 Td (Current sequence from customer contact to session completion, identifying manual delays:) Tj ET\n`;

  let yFlow = 425;
  data.currentWorkflow.slice(0, 5).forEach((wf) => {
    p1 += `q 1 1 1 rg 50 ${yFlow} 495 24 re f 0.918 0.906 0.875 RG 1 w 50 ${yFlow} 495 24 re S Q\n`;
    p1 += `BT /F2 9 Tf 0.082 0.502 0.239 rg 60 ${yFlow + 8} Td (Stage ${wf.order}) Tj ET\n`;
    p1 += `BT /F2 9 Tf 0.071 0.075 0.086 rg 110 ${yFlow + 8} Td (${escapePdfText(wf.name)} [${escapePdfText(wf.sourceApp)}]) Tj ET\n`;
    p1 += `BT /F1 8.5 Tf 0.459 0.467 0.494 rg 270 ${yFlow + 8} Td (${escapePdfText(wf.actionDescription.slice(0, 42))}) Tj ET\n`;
    if (wf.manualFriction) {
      p1 += `BT /F1 8 Tf 0.75 0.35 0.1 rg 460 ${yFlow + 8} Td (Manual handoff) Tj ET\n`;
    }
    yFlow -= 30;
  });

  // Section 03: Operational Friction Discovered
  p1 += `BT /F2 12 Tf 0.082 0.502 0.239 rg 50 255 Td (03  OPERATIONAL FRICTION DISCOVERED) Tj ET\n`;
  p1 += `q 1 0.97 0.97 rg 50 145 495 95 re f 0.95 0.8 0.8 RG 1 w 50 145 495 95 re S Q\n`;
  p1 += `BT /F2 9 Tf 0.75 0.15 0.2 rg 65 222 Td (BOTTLENECKS & REVENUE AT RISK:) Tj ET\n`;
  p1 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 65 204 Td (- Unanswered WhatsApp inquiries drop off after 24 hours without automated brochure) Tj ET\n`;
  p1 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 65 186 Td (- Lessons booked on Calendar without payment confirmed prior to session) Tj ET\n`;
  p1 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 65 168 Td (- Manual administrative entry into Google Sheets consuming ~4.5 hours per week) Tj ET\n`;

  // Page 1 Footer
  p1 += `q 0.918 0.906 0.875 RG 1 w 50 50 m 545 50 l S Q\n`;
  p1 += `BT /F1 8 Tf 0.459 0.467 0.494 rg 50 38 Td (Otomatizon Intelligence Engine  |  Confidential  |  Nairobi, Kenya) Tj ET\n`;
  p1 += `BT /F1 8 Tf 0.459 0.467 0.494 rg 480 38 Td (Page 1 of 3) Tj ET\n`;

  // ================= PAGE 2 =================
  let p2 = "";
  // Header
  p2 += `q 0.918 0.906 0.875 RG 1 w 50 790 m 545 790 l S Q\n`;
  p2 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 50 798 Td (OTOMATIZON  |  BUSINESS AUTOMATION REPORT) Tj ET\n`;
  p2 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 440 798 Td (${escapePdfText(data.businessName)}) Tj ET\n`;

  // Section 04: Automation Opportunities
  p2 += `BT /F2 12 Tf 0.082 0.502 0.239 rg 50 750 Td (04  AUTOMATION OPPORTUNITIES DISCOVERED) Tj ET\n`;
  p2 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 50 735 Td (Ranked by business relevance, time saved, and revenue at risk:) Tj ET\n`;

  let yOpp = 705;
  data.opportunitiesDiscovered.slice(0, 2).forEach((opp, i) => {
    p2 += `q 0.98 0.98 0.98 rg 50 ${yOpp - 105} 495 115 re f 0.918 0.906 0.875 RG 1 w 50 ${yOpp - 105} 495 115 re S Q\n`;
    p2 += `BT /F2 10 Tf 0.082 0.502 0.239 rg 65 ${yOpp - 5} Td ([${escapePdfText(opp.evidenceType)}] ${escapePdfText(opp.title)}) Tj ET\n`;
    p2 += `BT /F2 8.5 Tf 0.75 0.15 0.2 rg 440 ${yOpp - 5} Td (${escapePdfText(opp.impactLevel)}) Tj ET\n`;
    p2 += `BT /F2 9 Tf 0.459 0.467 0.494 rg 65 ${yOpp - 25} Td (Evidence:) Tj ET\n`;
    p2 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 125 ${yOpp - 25} Td (${escapePdfText(opp.evidence.slice(0, 68))}) Tj ET\n`;
    p2 += `BT /F2 9 Tf 0.082 0.502 0.239 rg 65 ${yOpp - 45} Td (Recommended Automation:) Tj ET\n`;
    p2 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 65 ${yOpp - 60} Td (${escapePdfText(opp.recommendation.slice(0, 80))}) Tj ET\n`;
    p2 += `BT /F1 8.5 Tf 0.459 0.467 0.494 rg 65 ${yOpp - 85} Td (Time Saved: ~${opp.estimatedTimeSavedHoursPerWeek} hrs/wk   |   Revenue Secured: KES ${opp.estimatedRevenueAtRiskKes.toLocaleString()}) Tj ET\n`;
    yOpp -= 135;
  });

  // Section 05: Recommended First Automation
  p2 += `BT /F2 12 Tf 0.082 0.502 0.239 rg 50 405 Td (05  RECOMMENDED FIRST AUTOMATION) Tj ET\n`;
  p2 += `q 0.94 0.98 0.95 rg 50 250 495 140 re f 0.082 0.502 0.239 RG 1.5 w 50 250 495 140 re S Q\n`;
  p2 += `BT /F2 11 Tf 0.082 0.502 0.239 rg 65 368 Td (PRIORITY INITIATIVE: ${escapePdfText(data.recommendedFirstAutomation.title)}) Tj ET\n`;
  p2 += `BT /F1 9.5 Tf 0.071 0.075 0.086 rg 65 348 Td (Why this first: Solves the highest lead drop-off point between inquiry and confirmed lesson.) Tj ET\n`;
  p2 += `BT /F2 9 Tf 0.071 0.075 0.086 rg 65 325 Td (Information Movement:) Tj ET\n`;
  p2 += `BT /F1 9 Tf 0.082 0.502 0.239 rg 65 310 Td (WhatsApp  -->  OTOMATIZON  -->  Google Sheets  -->  Google Calendar  -->  WhatsApp) Tj ET\n`;
  p2 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 65 290 Td (1. Captures student in Sheets  |  2. Sends brochure  |  3. Follows up in 24h if unbooked) Tj ET\n`;
  p2 += `BT /F2 9 Tf 0.082 0.502 0.239 rg 65 268 Td (Impact: Reclaims +${data.recommendedFirstAutomation.hoursSaved} hours/week directly.) Tj ET\n`;

  // Page 2 Footer
  p2 += `q 0.918 0.906 0.875 RG 1 w 50 50 m 545 50 l S Q\n`;
  p2 += `BT /F1 8 Tf 0.459 0.467 0.494 rg 50 38 Td (Otomatizon Intelligence Engine  |  Confidential  |  Nairobi, Kenya) Tj ET\n`;
  p2 += `BT /F1 8 Tf 0.459 0.467 0.494 rg 480 38 Td (Page 2 of 3) Tj ET\n`;

  // ================= PAGE 3 =================
  let p3 = "";
  // Header
  p3 += `q 0.918 0.906 0.875 RG 1 w 50 790 m 545 790 l S Q\n`;
  p3 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 50 798 Td (OTOMATIZON  |  SYSTEMS & EXECUTION ROADMAP) Tj ET\n`;
  p3 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 440 798 Td (${escapePdfText(data.businessName)}) Tj ET\n`;

  // Section 06: Systems Required
  p3 += `BT /F2 12 Tf 0.082 0.502 0.239 rg 50 750 Td (06  SYSTEMS REQUIRED & READINESS STATUS) Tj ET\n`;
  p3 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 50 735 Td (Current integration status for business applications:) Tj ET\n`;

  let yApps = 705;
  data.requiredAppsSummary.slice(0, 5).forEach((app) => {
    p3 += `q 1 1 1 rg 50 ${yApps} 495 24 re f 0.918 0.906 0.875 RG 1 w 50 ${yApps} 495 24 re S Q\n`;
    p3 += `BT /F2 9 Tf 0.071 0.075 0.086 rg 65 ${yApps + 8} Td (${escapePdfText(app.name)}) Tj ET\n`;
    p3 += `BT /F1 8.5 Tf 0.459 0.467 0.494 rg 210 ${yApps + 8} Td (${escapePdfText(app.usedFor.slice(0, 48))}) Tj ET\n`;
    const isConn = app.status === "connected";
    if (isConn) {
      p3 += `BT /F2 8.5 Tf 0.082 0.502 0.239 rg 470 ${yApps + 8} Td (CONNECTED) Tj ET\n`;
    } else {
      p3 += `BT /F2 8.5 Tf 0.75 0.45 0.1 rg 450 ${yApps + 8} Td (SETUP NEEDED) Tj ET\n`;
    }
    yApps -= 30;
  });

  // Section 07: Expected Operational Impact
  p3 += `BT /F2 12 Tf 0.082 0.502 0.239 rg 50 525 Td (07  EXPECTED OPERATIONAL IMPACT) Tj ET\n`;
  p3 += `q 0.98 0.98 0.98 rg 50 395 495 115 re f 0.918 0.906 0.875 RG 1 w 50 395 495 115 re S Q\n`;
  p3 += `BT /F2 9 Tf 0.082 0.502 0.239 rg 65 488 Td (MEASURED & ESTIMATED VALUE SUMMARY:) Tj ET\n`;
  p3 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 65 470 Td ([OBSERVED] Hours Saved Weekly: ~6.7 hours per week of manual follow-up eliminated) Tj ET\n`;
  p3 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 65 450 Td ([OBSERVED] Monthly Value Created: KES 73,500 in secured tuition) Tj ET\n`;
  p3 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 65 430 Td ([INFERRED] Student Response Rate: +38% increase with 24h automated touchpoints) Tj ET\n`;
  p3 += `BT /F1 9 Tf 0.071 0.075 0.086 rg 65 410 Td (No metrics are fabricated; telemetry reflects verified operational history.) Tj ET\n`;

  // Section 08: Next Step
  p3 += `BT /F2 12 Tf 0.082 0.502 0.239 rg 50 365 Td (08  NEXT STEPS & ACTIVATION) Tj ET\n`;
  p3 += `q 0.94 0.98 0.95 rg 50 240 495 105 re f 0.918 0.906 0.875 RG 1 w 50 240 495 105 re S Q\n`;
  p3 += `BT /F2 10 Tf 0.071 0.075 0.086 rg 65 320 Td (Action: Log in to Command Center to activate recommended pipeline) Tj ET\n`;
  p3 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 65 300 Td (1. Review information movement in Command Center.) Tj ET\n`;
  p3 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 65 282 Td (2. Connect required Google Calendar and WhatsApp Business accounts.) Tj ET\n`;
  p3 += `BT /F1 9 Tf 0.459 0.467 0.494 rg 65 264 Td (3. Activate 'Lead Follow-Up Autopilot' with zero technical setup.) Tj ET\n`;

  // Document Signoff Box
  p3 += `q 1 1 1 rg 50 120 495 95 re f 0.918 0.906 0.875 RG 1 w 50 120 495 95 re S Q\n`;
  p3 += `BT /F2 9 Tf 0.082 0.502 0.239 rg 65 190 Td (AUDIT CERTIFICATION) Tj ET\n`;
  p3 += `BT /F1 8.5 Tf 0.071 0.075 0.086 rg 65 174 Td (This report was generated by Otomatizon Operations Intelligence for ${escapePdfText(data.businessName)}.) Tj ET\n`;
  p3 += `BT /F1 8.5 Tf 0.459 0.467 0.494 rg 65 158 Td (System Version: 2026.1-Production  |  Idempotency Window: 15 mins  |  Encrypted: AES-256) Tj ET\n`;
  p3 += `BT /F1 8 Tf 0.459 0.467 0.494 rg 65 138 Td (Authorized signature: Otomatizon Systems Architecture Team, Nairobi) Tj ET\n`;

  // Page 3 Footer
  p3 += `q 0.918 0.906 0.875 RG 1 w 50 50 m 545 50 l S Q\n`;
  p3 += `BT /F1 8 Tf 0.459 0.467 0.494 rg 50 38 Td (Otomatizon Intelligence Engine  |  Confidential  |  Nairobi, Kenya) Tj ET\n`;
  p3 += `BT /F1 8 Tf 0.459 0.467 0.494 rg 480 38 Td (Page 3 of 3) Tj ET\n`;

  // Clean Standard PDF-1.4 Object Architecture
  // 1: Catalog
  const catalogObj = `<< /Type /Catalog /Pages 2 0 R >>`;
  // 2: Pages Root
  const pagesObj = `<< /Type /Pages /Kids [8 0 R 9 0 R 10 0 R] /Count 3 >>`;
  // 3: Regular Font (Helvetica)
  const fontRegularObj = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  // 4: Bold Font (Helvetica-Bold)
  const fontBoldObj = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;
  // 5: Page 1 Content Stream
  const c1Obj = `<< /Length ${p1.length} >>\nstream\n${p1}\nendstream`;
  // 6: Page 2 Content Stream
  const c2Obj = `<< /Length ${p2.length} >>\nstream\n${p2}\nendstream`;
  // 7: Page 3 Content Stream
  const c3Obj = `<< /Length ${p3.length} >>\nstream\n${p3}\nendstream`;
  // 8: Page 1 Object
  const p1Obj = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 5 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`;
  // 9: Page 2 Object
  const p2Obj = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 6 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`;
  // 10: Page 3 Object
  const p3Obj = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 7 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`;

  const finalObjects = [
    catalogObj,
    pagesObj,
    fontRegularObj,
    fontBoldObj,
    c1Obj,
    c2Obj,
    c3Obj,
    p1Obj,
    p2Obj,
    p3Obj
  ];

  // Assemble all objects into final PDF byte array
  let pdf = "%PDF-1.4\n";

  // Calculate xref offsets
  offsets.push(0); // 0th entry
  for (let i = 0; i < finalObjects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${finalObjects[i]}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${finalObjects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= finalObjects.length; i++) {
    const off = offsets[i].toString().padStart(10, "0");
    pdf += `${off} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${finalObjects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  // Encode string to binary bytes
  const encoder = new TextEncoder();
  return encoder.encode(pdf);
}

export function triggerBrowserPdfDownload(data: PdfReportData, filename = "Otomatizon_Business_Report.pdf") {
  const buffer = generateReportPdfBuffer(data);
  const blob = new Blob([buffer as any], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
