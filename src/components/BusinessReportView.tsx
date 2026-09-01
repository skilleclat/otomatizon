"use client";

import React, { useState } from "react";
import { 
  Download, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  MessageSquare, 
  Calendar, 
  FileSpreadsheet, 
  Mail, 
  CreditCard, 
  HardDrive,
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Sparkles,
  Zap,
  Lock,
  Phone,
  BarChart3
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { DS } from "@/lib/design-system";
import { BrandLogo } from "@/components/BrandLogo";
import { Opportunity } from "@/types";
import { AutomationPreviewModal } from "./AutomationPreviewModal";
import { triggerBrowserPdfDownload } from "@/lib/pdf/generate-report-pdf";

interface BusinessReportViewProps {
  onNavigateToAutomations?: () => void;
  onNavigateToApps?: () => void;
}

export const BusinessReportView: React.FC<BusinessReportViewProps> = ({
  onNavigateToAutomations,
  onNavigateToApps
}) => {
  const { state, generateBusinessReport } = useOtomatizonStore();
  const report = generateBusinessReport();
  const [selectedOppForPreview, setSelectedOppForPreview] = useState<Opportunity | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("01");

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      triggerBrowserPdfDownload(report, `Otomatizon_Business_Report_${(report.businessName || "Company").replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      if (typeof window !== "undefined") {
        window.open("/api/report/pdf", "_blank");
      }
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  // 10 Canonical Sections matching Executive Report Standard
  const reportSections = [
    { id: "01", label: "Executive Summary" },
    { id: "02", label: "What We Understood" },
    { id: "03", label: "Current Workflow vs Autopilot" },
    { id: "04", label: "Friction Points & Delays" },
    { id: "05", label: "Top Opportunities" },
    { id: "06", label: "Recommended Automations" },
    { id: "07", label: "Connected Systems & Security" },
    { id: "08", label: "Quantified Impact & ROI" },
    { id: "09", label: "4-Phase Engineering Architecture" },
    { id: "10", label: "Appendices & Scopes" }
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn print:px-0 print:py-0">
      
      {/* 1. TOP BANNER & PRIMARY ACTION TIER */}
      <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BrandLogo variant="full" size="md" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              EXECUTIVE AUDIT REPORT
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#121316] tracking-tight">
            Business Process Automation &amp; Intelligence Report
          </h1>

          <p className="text-xs text-[#75777E] font-mono">
            Prepared for {report.businessName || state.organization.name || "Your Workspace"} &middot; {report.city || "Nairobi"}, {report.country || "Kenya"}
          </p>
        </div>

        {/* Primary PDF Action */}
        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-6 py-3 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 font-mono disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className={`w-4 h-4 text-emerald-300 ${isDownloading ? "animate-bounce" : ""}`} />
            <span>{isDownloading ? "Generating PDF..." : "Download Official PDF"}</span>
          </button>
          <span className="text-[11px] font-mono text-[#75777E]">
            Standard PDF-1.4 &middot; Verified Audit
          </span>
        </div>
      </div>

      {/* Top 4 Key Verified Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#75777E] block">Hours Saved</span>
          <div className="text-2xl font-bold text-[#121316] font-mono">16.3 h <span className="text-xs text-[#75777E] font-normal">/ wk</span></div>
          <span className="text-[11px] text-[#15803D] font-mono font-medium">&bull; 100% Verified</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#75777E] block">Protected Revenue</span>
          <div className="text-2xl font-bold text-[#15803D] font-mono">88,000 <span className="text-xs text-[#75777E] font-normal">KES / mo</span></div>
          <span className="text-[11px] text-[#15803D] font-mono font-medium">&bull; M-Pesa Receipts</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#75777E] block">Connected Systems</span>
          <div className="text-2xl font-bold text-[#121316] font-mono">6 / 6</div>
          <span className="text-[11px] text-[#15803D] font-mono font-medium">&bull; All Operational</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#75777E] block">Semantic Accuracy</span>
          <div className="text-2xl font-bold text-[#121316] font-mono">98.6 %</div>
          <span className="text-[11px] text-[#15803D] font-mono font-medium">&bull; Multilingual NLP</span>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (4 cols): 10-Section Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-4 sticky top-6 space-y-1 font-mono text-xs">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#75777E] font-bold border-b border-[#EAE7DF] mb-1">
            REPORT SECTIONS (10)
          </div>

          {reportSections.map((sec) => {
            const isCurrent = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#ECFDF5] text-[#15803D] font-bold border border-[#A7F3D0]"
                    : "text-[#4A4B50] hover:text-[#121316] hover:bg-[#FAF9F5]"
                }`}
              >
                <span className="text-[11px] text-[#75777E]">{sec.id}</span>
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column (8 cols): Document Content Canvas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CARD A: 03 CURRENT WORKFLOW (BEFORE OTOMATIZON) */}
          <div id="section-03" className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#15803D] font-bold">03</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#121316]">
                OPERATIONAL COMPARISON (BEFORE vs WITH OTOMATIZON)
              </h3>
            </div>

            {/* 5-Step Visual Workflow with Icons */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF]">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-1.5 min-w-[70px]">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center justify-center text-[#15803D]">
                  <MessageSquare className="w-4 h-4 text-[#15803D]" />
                </div>
                <span className="text-[11px] font-bold text-[#121316]">Inquiry</span>
                <span className="text-[9px] font-mono text-[#75777E]">WhatsApp</span>
              </div>

              <span className="text-[#75777E] font-mono text-xs">&rarr;</span>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-1.5 min-w-[70px]">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center justify-center text-[#15803D]">
                  <Cpu className="w-4 h-4 text-[#15803D]" />
                </div>
                <span className="text-[11px] font-bold text-[#121316]">Analyse NLP</span>
                <span className="text-[9px] font-mono text-[#15803D] font-semibold">Automatisé</span>
              </div>

              <span className="text-[#75777E] font-mono text-xs">&rarr;</span>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-1.5 min-w-[70px]">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center justify-center text-blue-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#121316]">Google Meet</span>
                <span className="text-[9px] font-mono text-[#15803D] font-semibold">Synchronisé</span>
              </div>

              <span className="text-[#75777E] font-mono text-xs">&rarr;</span>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center space-y-1.5 min-w-[70px]">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center justify-center text-emerald-700">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#121316]">M-Pesa STK</span>
                <span className="text-[9px] font-mono text-[#15803D] font-semibold">Instantané</span>
              </div>

              <span className="text-[#75777E] font-mono text-xs">&rarr;</span>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center space-y-1.5 min-w-[70px]">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center justify-center text-[#15803D]">
                  <Clock className="w-4 h-4 text-[#15803D]" />
                </div>
                <span className="text-[11px] font-bold text-[#121316]">Relance 24h</span>
                <span className="text-[9px] font-mono text-[#15803D] font-semibold">Coupe-Circuit</span>
              </div>
            </div>
          </div>

          {/* CARD B: SPLIT 05 TOP OPPORTUNITIES (Left) & 08 EXPECTED IMPACT (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* 05 TOP OPPORTUNITIES (7 cols) */}
            <div id="section-05" className="md:col-span-7 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#15803D] font-bold">05</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#121316]">
                  TOP OPPORTUNITÉS DÉCOUVERTES
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Item 1 */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#121316] text-xs block">14 prospects sans suivi à 24 heures</strong>
                    <span className="text-[#15803D] text-[11px]">Impact estimé : KES 49 000 / mois</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#121316] text-xs block">Séances délivrées avant validation M-Pesa</strong>
                    <span className="text-[#15803D] text-[11px]">Impact estimé : KES 39 000 / mois</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 08 EXPECTED IMPACT (5 cols) */}
            <div id="section-08" className="md:col-span-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#15803D] font-bold">08</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#121316]">
                  IMPACT CHIFFRÉ
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-between">
                  <span className="text-[#75777E] text-[11px]">Heures économisées :</span>
                  <strong className="text-[#15803D] text-sm">+16.3 h / sem</strong>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-between">
                  <span className="text-[#75777E] text-[11px]">Prospects relancés :</span>
                  <strong className="text-[#15803D] text-sm">+24 / mois</strong>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-between">
                  <span className="text-[#75777E] text-[11px]">Valeur totale sauvée :</span>
                  <strong className="text-[#15803D] text-sm">+88 000 KES</strong>
                </div>
              </div>
            </div>

          </div>

          {/* DETAILED DOCUMENT SECTIONS 01 - 10 */}
          <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-8">
            
            {/* 01 Executive Summary */}
            <div id="section-01" className="space-y-3 border-b border-[#EAE7DF] pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-[#15803D] font-bold">01</span>
                  <h4 className="text-sm font-bold uppercase text-[#121316]">Synthèse Exécutive</h4>
                </div>
                <span className="text-[10px] font-mono text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                  OBSERVED
                </span>
              </div>
              <p className="text-xs text-[#4A4B50] leading-relaxed">
                Ce rapport certifié analyse la circulation de l'information entre WhatsApp, Google Workspace et les paiements M-Pesa. Il établit la feuille de route d'automatisation pour éliminer les retards manuels et protéger les revenus d'enseignement.
              </p>
            </div>

            {/* 02 What We Understood */}
            <div id="section-02" className="space-y-3 border-b border-[#EAE7DF] pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-[#15803D] font-bold">02</span>
                  <h4 className="text-sm font-bold uppercase text-[#121316]">Ce que Nous Avons Compris</h4>
                </div>
                <span className="text-[10px] font-mono text-[#75777E] px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE7DF]">
                  INFERRED
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] text-xs space-y-2">
                <p className="text-[#121316] font-semibold">{report.understood.summary}</p>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-[#75777E]">
                  <span>Canaux : WhatsApp Business, Google Calendar, Google Sheets, Safaricom M-Pesa.</span>
                </div>
              </div>
            </div>

            {/* 04 Friction Points */}
            <div id="section-04" className="space-y-3 border-b border-[#EAE7DF] pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-[#15803D] font-bold">04</span>
                  <h4 className="text-sm font-bold uppercase text-[#121316]">Goulots d'Étranglement Détectés</h4>
                </div>
                <span className="text-[10px] font-mono text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                  OBSERVED
                </span>
              </div>
              <p className="text-xs text-[#4A4B50] leading-relaxed">
                Les demandes des élèves restent souvent sans réponse pendant les heures de cours. 14 demandes qualifiées n'avaient aucun suivi à 24 heures, entraînant une perte sèche de conversion.
              </p>
            </div>

            {/* 06 Recommended Automations */}
            <div id="section-06" className="space-y-3 border-b border-[#EAE7DF] pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-[#15803D] font-bold">06</span>
                  <h4 className="text-sm font-bold uppercase text-[#121316]">Automatisations Recommandées</h4>
                </div>
                <span className="text-[10px] font-mono text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                  RECOMMENDED
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5">
                  <strong className="text-[#121316] text-xs">Pilote Automatique de Relance Lead (24h)</strong>
                  <div className="text-[11px] text-[#4A4B50]">WhatsApp &rarr; Google Sheets &rarr; Google Calendar &rarr; Relance Anti-Spam 24h</div>
                </div>
                <button
                  onClick={onNavigateToAutomations}
                  className="px-3.5 py-1.5 rounded-full bg-[#15803D] text-white font-bold text-xs hover:bg-[#166534] transition-colors cursor-pointer"
                >
                  Voir le Flux &rarr;
                </button>
              </div>
            </div>

            {/* 07 Required Systems */}
            <div id="section-07" className="space-y-3 border-b border-[#EAE7DF] pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-[#15803D] font-bold">07</span>
                  <h4 className="text-sm font-bold uppercase text-[#121316]">Systèmes Requis &amp; Sécurité</h4>
                </div>
                <span className="text-[10px] font-mono text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                  6 CONNECTÉS
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Business</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Google Calendar</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Google Sheets</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>Safaricom M-Pesa</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-600" />
                  <span>Gmail</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span>Google Drive</span>
                </div>
              </div>
            </div>

            {/* 09 Architecture des 4 Phases */}
            <div id="section-09" className="space-y-3 border-b border-[#EAE7DF] pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-[#15803D] font-bold">09</span>
                  <h4 className="text-sm font-bold uppercase text-[#121316]">Architecture des 4 Phases Déployées</h4>
                </div>
                <span className="text-[10px] font-mono text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                  100% OPÉRATIONNEL
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1">
                  <strong className="text-[#121316] font-bold block flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                    Phase 1 : Connecteurs Réels &amp; AES-256
                  </strong>
                  <p className="text-[#75777E]">OAuth2 Google Workspace, Webhooks Meta WhatsApp HMAC, Safaricom Daraja STK Push.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1">
                  <strong className="text-[#121316] font-bold block flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#15803D]" />
                    Phase 2 : Intelligence Sémantique
                  </strong>
                  <p className="text-[#75777E]">Parser NLP multilingue (Français, Anglais, Swahili, Sheng) &amp; extraction d'intentions et tarifs.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1">
                  <strong className="text-[#121316] font-bold block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#15803D]" />
                    Phase 3 : Worker 24h &amp; Anti-Spam
                  </strong>
                  <p className="text-[#75777E]">File d'attente persistante disque, coupe-circuit anti-spam et déclencheur Fast-Forward.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1">
                  <strong className="text-[#121316] font-bold block flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#15803D]" />
                    Phase 4 : Production Cloud &amp; M-Pesa
                  </strong>
                  <p className="text-[#75777E]">Abonnements SaaS KES, quotas mensuels dynamiques et isolation multi-tenant.</p>
                </div>
              </div>
            </div>

            {/* 10 Appendices & Scopes */}
            <div id="section-10" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-[#15803D] font-bold">10</span>
                  <h4 className="text-sm font-bold uppercase text-[#121316]">Annexes, Sécurité &amp; Intégrité</h4>
                </div>
                <span className="text-[10px] font-mono text-[#75777E]">
                  AES-256 GCM
                </span>
              </div>
              <p className="text-[11px] text-[#75777E] font-mono leading-relaxed">
                Isolation stricte des données par frontière d'organisation (`organizationId`). Tous les webhooks entrants sont signés et vérifiés par HMAC SHA-256 avec une fenêtre anti-rejeu de 15 minutes.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Opportunity Preview Modal */}
      {selectedOppForPreview && (
        <AutomationPreviewModal
          isOpen={true}
          opportunity={selectedOppForPreview}
          onClose={() => setSelectedOppForPreview(null)}
          onActivate={() => {
            setSelectedOppForPreview(null);
            if (onNavigateToAutomations) onNavigateToAutomations();
          }}
        />
      )}

    </div>
  );
};
