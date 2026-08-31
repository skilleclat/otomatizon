"use client";

import React, { useState } from "react";
import { Check, X, ThumbsUp, ThumbsDown, MessageSquare, Send } from "lucide-react";
import { recordDecisionEvent } from "@/lib/decision-engine";
import { DS } from "@/lib/design-system";

interface FeedbackCardProps {
  workflowTitle?: string;
  workflowId?: string;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  workflowTitle = "Lead Follow-Up Autopilot",
  workflowId = "wf_lead_autopilot"
}) => {
  const [feedbackState, setFeedbackState] = useState<"initial" | "yes_submitted" | "no_prompt" | "no_submitted">("initial");
  const [whatWentWrong, setWhatWentWrong] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleYes = () => {
    setFeedbackState("yes_submitted");
    recordDecisionEvent({
      id: `fb_${Date.now()}`,
      organizationId: "current_org",
      eventType: "automation_successful",
      targetId: workflowId,
      timestamp: new Date().toISOString(),
      metadata: { solvedProblem: true, title: workflowTitle }
    });
  };

  const handleNoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setFeedbackState("no_submitted");
      setIsSubmitting(false);
      recordDecisionEvent({
        id: `fb_${Date.now()}`,
        organizationId: "current_org",
        eventType: "recommendation_rejected",
        targetId: workflowId,
        timestamp: new Date().toISOString(),
        metadata: { solvedProblem: false, whatWentWrong, title: workflowTitle }
      });
    }, 400);
  };

  if (feedbackState === "yes_submitted") {
    return (
      <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] text-xs flex items-center gap-2 animate-fadeIn font-medium">
        <Check className="w-4 h-4 text-[#15803D] shrink-0" />
        <span>Thank you! Your feedback helps Otomatizon tailor your business operations.</span>
      </div>
    );
  }

  if (feedbackState === "no_submitted") {
    return (
      <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] text-[#4A4B50] text-xs flex items-center gap-2 animate-fadeIn font-medium">
        <Check className="w-4 h-4 text-[#75777E] shrink-0" />
        <span>Feedback recorded. We will use this to improve your recommendations.</span>
      </div>
    );
  }

  if (feedbackState === "no_prompt") {
    return (
      <form onSubmit={handleNoSubmit} className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-3 animate-fadeIn">
        <span className="text-xs font-bold text-[#121316] block">
          What went wrong with &ldquo;{workflowTitle}&rdquo;?
        </span>
        <textarea
          required
          rows={2}
          value={whatWentWrong}
          onChange={(e) => setWhatWentWrong(e.target.value)}
          placeholder="e.g. The follow-up sent too early, or the tone felt too casual."
          className={DS.textarea}
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setFeedbackState("initial")}
            className={DS.btnGhost}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !whatWentWrong.trim()}
            className={DS.btnPrimary}
          >
            <Send className="w-3 h-3" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] text-xs">
      <div className="flex items-center gap-2 text-[#4A4B50]">
        <MessageSquare className="w-4 h-4 text-[#15803D] shrink-0" />
        <span>
          Did <strong className="text-[#121316]">&ldquo;{workflowTitle}&rdquo;</strong> solve your problem?
        </span>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={handleYes}
          className="px-3 py-1.5 rounded-full bg-white hover:bg-[#ECFDF5] text-[#121316] hover:text-[#15803D] border border-[#EAE7DF] transition-colors flex items-center gap-1.5 font-semibold shadow-sm"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-[#15803D]" />
          <span>Yes</span>
        </button>

        <button
          onClick={() => setFeedbackState("no_prompt")}
          className="px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 text-[#75777E] hover:text-[#121316] border border-[#EAE7DF] transition-colors flex items-center gap-1.5 font-medium shadow-sm"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>No</span>
        </button>
      </div>
    </div>
  );
};
