/**
 * Otomatizon Contextual Action & Reply Drafter
 * Automatically builds formatted replies and operational payloads from parsed entities.
 */

function draftActionAndReply(analysis, businessContext = {}) {
  const { intent, detectedLanguage, entities, urgency } = analysis;
  const businessName = businessContext.businessName || "Kamau French Tutoring";
  const ownerName = businessContext.ownerName || "James";
  const studentName = entities.studentName || (detectedLanguage === "fr" ? "Cher(e) étudiant(e)" : "there");
  const subject = entities.subject || "French Coaching";
  const level = entities.level ? `(${entities.level})` : "";
  const slot = entities.requestedDay ? `${entities.requestedDay} ${entities.requestedTime || ""}`.trim() : "this week";

  let actionType = "deliver_brochure";
  let actionTitle = "Deliver Brochure & Intro Rates";
  let actionDesc = `Send ${subject} syllabus & offer slot for ${studentName}.`;
  let replyText = "";

  // 1. PAYMENT CONFIRMATION INTENT
  if (intent === "payment_confirmation") {
    actionType = "confirm_payment";
    actionTitle = "Lock Slot & Issue Calendar Invite";
    actionDesc = `Acknowledge M-Pesa receipt ${entities.paymentReceipt || ""} and generate Google Meet link.`;

    if (detectedLanguage === "fr") {
      replyText = `Bonjour ${studentName} ! 🎉 Votre règlement de cours pour ${subject} a bien été validé (Réf: ${entities.paymentReceipt || "M-Pesa"}). Votre créneau pour ${slot} est confirmé ! Voici le lien de cours Google Meet : https://meet.google.com/oto-matu-ken . À très bientôt ! — ${ownerName}`;
    } else if (detectedLanguage === "sw") {
      replyText = `Habari ${studentName} ! 🎉 Malipo yako ya ${subject} yamepokelewa vizuri (Risi: ${entities.paymentReceipt || "M-Pesa"}). Kipindi chako cha ${slot} kimethibitishwa! Hii hapa link ya Google Meet: https://meet.google.com/oto-matu-ken . Asante sana! — ${ownerName}`;
    } else {
      replyText = `Hello ${studentName}! 🎉 Your tuition payment for ${subject} has been verified (Ref: ${entities.paymentReceipt || "M-Pesa"}). Your session for ${slot} is locked in! Here is your Google Meet lesson link: https://meet.google.com/oto-matu-ken . Looking forward to our class! — ${ownerName}`;
    }
  }

  // 2. BOOKING REQUEST INTENT
  else if (intent === "booking_request") {
    actionType = "offer_calendar_slots";
    actionTitle = "Propose Available Calendar Slots";
    actionDesc = `Provide 2 open slots for ${slot} and M-Pesa payment link.`;

    if (detectedLanguage === "fr") {
      replyText = `Bonjour ${studentName} ! Merci pour votre intérêt pour les cours de ${subject} ${level} (tarif standard : KES 3,500 / séance). J'ai justement des disponibilités pour ${slot}. Vous pouvez réserver directement votre premier créneau ici : https://calendar.google.com/calendar/appointments/s/kamau-french . Souhaitez-vous que je vous bloque l'horaire dès maintenant ? — ${ownerName}`;
    } else if (detectedLanguage === "sw") {
      replyText = `Habari ${studentName} ! Asante kwa kuulizia kuhusu masomo ya ${subject} ${level} (bei: KES 3,500 / somo). Niko na nafasi ${slot}. Unaweza kuchagua wakati unaokufaa hapa: https://calendar.google.com/calendar/appointments/s/kamau-french . Karibu sana! — ${ownerName}`;
    } else {
      replyText = `Hi ${studentName}! Thank you for reaching out regarding ${subject} ${level} (KES 3,500 / session). I currently have open lesson slots for ${slot}. You can select your preferred time here: https://calendar.google.com/calendar/appointments/s/kamau-french . Would you like me to hold this slot for you? — ${ownerName}`;
    }
  }

  // 3. PRICING QUERY INTENT
  else if (intent === "pricing_query") {
    actionType = "deliver_brochure";
    actionTitle = "Send Rate Card & Syllabus PDF";
    actionDesc = `Deliver KES 3,500/hr pricing & 10-lesson package options.`;

    if (detectedLanguage === "fr") {
      replyText = `Bonjour ${studentName} ! Nos cours particuliers de ${subject} ${level} sont à KES 3,500 par séance d'1h30 (ou forfait 10 cours à KES 30,000 incluant supports et examens blancs). Voici la brochure détaillée en pièce jointe. Quel serait votre objectif principal ? — ${ownerName}`;
    } else if (detectedLanguage === "sw") {
      replyText = `Habari ${studentName} ! Bei yetu ya ${subject} ${level} ni KES 3,500 kwa somo la saa moja na nusu (au package ya masomo 10 kwa KES 30,000). Nimekuwekea brochure hapa. Je, ungependa kuanza lini? — ${ownerName}`;
    } else {
      replyText = `Hi ${studentName}! Our 1-on-1 ${subject} ${level} sessions are KES 3,500 per 90-min lesson (or KES 30,000 for a 10-session package including materials and mock tests). I've attached our full syllabus brochure. What specific goal are you preparing for? — ${ownerName}`;
    }
  }

  // 4. GENERAL INQUIRY FALLBACK
  else {
    actionType = "deliver_brochure";
    actionTitle = "Send Introductory Welcome & Brochure";
    actionDesc = `Send warm greeting and ask about student's current proficiency level.`;

    if (detectedLanguage === "fr") {
      replyText = `Bonjour ${studentName} ! Ravi de vous lire. Je serai ravi de vous accompagner pour vos cours de ${subject}. Pourriez-vous me préciser votre niveau actuel et vos disponibilités préférées ? — ${ownerName} de ${businessName}`;
    } else {
      replyText = `Hi ${studentName}! Great to connect with you. I'd love to help you with ${subject} lessons. Could you share your current experience level and what days work best for you? — ${ownerName} at ${businessName}`;
    }
  }

  // 5. Structured Google Sheets Record
  const googleSheetsRow = {
    Date: new Date().toISOString().split("T")[0],
    "Student Name": entities.studentName || "New Inquirer",
    Phone: entities.phone || "+254...",
    Subject: subject,
    Level: entities.level || "General",
    "Requested Slot": slot,
    Intent: intent,
    Urgency: urgency.toUpperCase(),
    Language: detectedLanguage.toUpperCase(),
    Status: intent === "payment_confirmation" ? "PAID_CONFIRMED" : "INQUIRY_CAPTURED",
    "Estimated Value (KES)": entities.budgetMentionedKes || 3500
  };

  // 6. Proposed Calendar Event (if applicable)
  const suggestedCalendarEvent = {
    summary: `${subject} · ${entities.studentName || "Private Lesson"}`,
    description: `Student Level: ${entities.level || "Standard"}\nInquiry Source: WhatsApp Business\nCoordinated by Otomatizon Intelligence.`,
    proposedSlot: slot
  };

  return {
    suggestedAction: {
      actionType,
      title: actionTitle,
      description: actionDesc
    },
    draftedReply: replyText,
    googleSheetsRow,
    suggestedCalendarEvent
  };
}

module.exports = {
  draftActionAndReply
};
