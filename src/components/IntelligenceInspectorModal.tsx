"use client";

import React, { useState } from "react";
import { 
  X, 
  Brain, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Copy, 
  Calendar, 
  FileSpreadsheet, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  Zap,
  Globe
} from "lucide-react";

interface IntelligenceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MESSAGES = [
  {
    lang: "FR",
    label: "Français (Demande de cours)",
    text: "Bonjour M. Kamau, je cherche des cours particuliers de français pour ma fille en classe de 4e, disponible le mardi vers 16h. Quels sont vos tarifs ?"
  },
  {
    lang: "EN",
    label: "English (Maths Booking)",
    text: "Hi James! I need urgent Grade 8 Mathematics coaching for my son Brian. We are looking for Saturday morning slots at 10am. Can we schedule this week?"
  },
  {
    lang: "SW",
    label: "Swahili / Sheng (Piano classes)",
    text: "Niaje bro! Nataka piano lessons weekend kwa house Lavington. Ni ngapi per session ya 1 hour?"
  },
  {
    lang: "PAY",
    label: "Paiement M-Pesa",
    text: "Bonjour, j'ai envoyé les KES 3,500 par M-Pesa. Réf: QAH8991204 pour le cours de français de demain 15h. Merci de confirmer !"
  }
];

export const IntelligenceInspectorModal: React.FC<IntelligenceInspectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [inputText, setInputText] = useState(PRESET_MESSAGES[0].text);
  const [senderName, setSenderName] = useState("Mercy Chebet");
  const [senderPhone, setSenderPhone] = useState("+254 719 552 108");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleParse = async (textToParse = inputText) => {
    setLoading(true);
    try {
      const res = await fetch("/api/intelligence/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToParse,
          senderName,
          senderPhone
        })
      });
      const data = await res.json();
      setAnalysisResult(data.analysis);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const copyReply = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121316]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF9F5] border border-[#EAE7DF] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#EAE7DF] bg-[#FFFFFF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#15803D]/10 border border-[#15803D]/20 flex items-center justify-center text-[#15803D]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#121316] flex items-center gap-2">
                Semantic Extraction &amp; Intelligence Lab
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]">
                  Phase 2 Live
                </span>
              </h2>
              <p className="text-xs text-[#75777E]">
                Multilingual natural language understanding (English, Swahili, Sheng, French) &amp; operational action drafting
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FAF9F5] text-[#75777E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
              TEST REAL BUSINESS SCENARIOS
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_MESSAGES.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(p.text);
                    handleParse(p.text);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#FAF9F5] border border-[#EAE7DF] text-xs font-medium text-[#121316] transition-all hover:border-[#15803D] flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="text-[10px] font-mono font-bold text-[#15803D] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                    {p.lang}
                  </span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input & Sender Controls */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#EAE7DF] space-y-4 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#121316] block mb-1">Sender Full Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF9F5] border border-[#EAE7DF] rounded-xl text-xs text-[#121316]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#121316] block mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF9F5] border border-[#EAE7DF] rounded-xl text-xs font-mono text-[#121316]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#121316] block mb-1">Raw Inbound Message Received</label>
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type any customer inquiry in English, Swahili, Sheng, or French..."
                className="w-full p-3.5 bg-[#FAF9F5] border border-[#EAE7DF] rounded-xl text-xs text-[#121316] focus:outline-none focus:border-[#15803D] font-mono leading-relaxed"
              />
            </div>

            <button
              onClick={() => handleParse()}
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-[#121316] text-[#FFFFFF] text-xs font-bold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#15803D]" />}
              <span>Analyze with Otomatizon Semantic Engine</span>
            </button>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#EAE7DF] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#75777E] block">Detected Intent</span>
                  <span className="font-bold text-[#121316] font-mono">{analysisResult.intent}</span>
                </div>
                <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#EAE7DF] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#75777E] block">Language</span>
                  <span className="font-bold text-[#15803D] font-mono uppercase">{analysisResult.detectedLanguage}</span>
                </div>
                <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#EAE7DF] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#75777E] block">Confidence</span>
                  <span className="font-bold text-[#15803D] font-mono">{analysisResult.confidenceScore}%</span>
                </div>
                <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#EAE7DF] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#75777E] block">Urgency</span>
                  <span className={`font-bold font-mono ${analysisResult.urgency === "high" ? "text-rose-600" : "text-[#121316]"}`}>
                    {analysisResult.urgency.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Extracted Entities Grid */}
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#EAE7DF] space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
                  AUTOMATICALLY EXTRACTED BUSINESS ENTITIES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#EAE7DF]">
                    <span className="text-[10px] text-[#75777E] block">Subject / Service</span>
                    <strong className="text-[#121316]">{analysisResult.entities.subject || "Standard"}</strong>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#EAE7DF]">
                    <span className="text-[10px] text-[#75777E] block">Target Level</span>
                    <strong className="text-[#121316]">{analysisResult.entities.level || "Not specified"}</strong>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#EAE7DF]">
                    <span className="text-[10px] text-[#75777E] block">Requested Slot</span>
                    <strong className="text-[#121316]">
                      {analysisResult.entities.requestedDay || ""} {analysisResult.entities.requestedTime || "Flexible"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Generated Contextual Reply */}
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#EAE7DF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    PROPOSED NATURAL LANGUAGE WHATSAPP REPLY
                  </span>
                  <button
                    onClick={() => copyReply(analysisResult.draftedReply)}
                    className="text-xs text-[#15803D] hover:underline flex items-center gap-1 font-mono cursor-pointer"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy text"}
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-[#ECFDF5]/50 border border-[#A7F3D0] text-xs text-[#065F46] leading-relaxed font-sans">
                  {analysisResult.draftedReply}
                </div>
              </div>

              {/* Structured Google Sheets Row & Proposed Calendar Slot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#EAE7DF] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#121316]">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Structured Google Sheets Row
                  </div>
                  <pre className="p-3 bg-[#FAF9F5] rounded-xl text-[11px] font-mono text-[#4A4B50] overflow-x-auto border border-[#EAE7DF]">
                    {JSON.stringify(analysisResult.googleSheetsRow, null, 2)}
                  </pre>
                </div>

                <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#EAE7DF] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#121316]">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Suggested Google Meet Session
                  </div>
                  <div className="p-3 bg-[#FAF9F5] rounded-xl text-xs space-y-1.5 border border-[#EAE7DF]">
                    <div><strong>Title:</strong> {analysisResult.suggestedCalendarEvent?.summary}</div>
                    <div><strong>Slot:</strong> {analysisResult.suggestedCalendarEvent?.proposedSlot}</div>
                    <div className="text-[11px] text-[#75777E]">{analysisResult.suggestedCalendarEvent?.description}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FFFFFF] border-t border-[#EAE7DF] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[#75777E]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
            Deterministic local inference &lt;15ms &middot; Zero third-party LLM costs
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-[#EAE7DF] text-xs font-medium text-[#121316] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
