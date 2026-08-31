/**
 * OTOMATIZON UNIFIED DESIGN SYSTEM TOKENS
 * Reference: Refined Light Editorial Visual Language
 * Philosophy: "Less, but better" — Calm, intentional, premium, warm ivory light system.
 */

export const DS = {
  // Backgrounds & Surfaces
  page: "min-h-screen bg-[#FAF9F5] text-[#121316] font-sans selection:bg-[#15803D]/15 selection:text-[#15803D]",
  card: "bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8",
  cardHover: "bg-white rounded-3xl border border-[#EAE7DF] hover:border-[#D5D1C6] transition-all shadow-sm p-6 sm:p-8",
  cardSubtle: "bg-[#F4F2EB]/60 rounded-3xl border border-[#EAE7DF] p-6 sm:p-8",
  cardInner: "bg-[#FAF9F5] rounded-2xl border border-[#EAE7DF] p-4 sm:p-5",

  // Typography
  h1: "text-3xl sm:text-4xl font-extrabold text-[#121316] tracking-tight",
  h2: "text-xl sm:text-2xl font-bold text-[#121316] tracking-tight",
  h3: "text-base sm:text-lg font-bold text-[#121316]",
  body: "text-sm text-[#4A4B50] leading-relaxed",
  bodyMuted: "text-xs text-[#75777E] leading-relaxed",
  monoEyebrow: "text-[11px] font-mono uppercase tracking-widest text-[#75777E] font-semibold block",

  // Buttons
  btnPrimary: "px-5 py-2.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50",
  btnSecondary: "px-4 py-2 rounded-full bg-white hover:bg-[#F4F2EB] text-[#121316] border border-[#EAE7DF] text-xs font-semibold transition-all shadow-sm inline-flex items-center justify-center gap-1.5",
  btnGhost: "text-xs font-medium text-[#75777E] hover:text-[#121316] transition-colors inline-flex items-center gap-1.5",
  btnDanger: "px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all",

  // Badges & Pills
  badgeSuccess: "bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1",
  badgeHighImpact: "bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1",
  badgeMediumImpact: "bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1",
  badgeNeutral: "bg-[#EFECE6] text-[#4A4B50] border border-[#E5E1D8] text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1",

  // Forms & Inputs
  input: "w-full bg-[#FAF9F5] border border-[#EAE7DF] rounded-2xl p-3.5 text-sm text-[#121316] placeholder-stone-400 focus:outline-none focus:border-[#15803D] transition-colors",
  textarea: "w-full bg-[#FAF9F5] border border-[#EAE7DF] rounded-2xl p-3.5 text-sm text-[#121316] placeholder-stone-400 focus:outline-none focus:border-[#15803D] transition-colors resize-none leading-relaxed",

  // Modals & Overlays
  modalOverlay: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fadeIn",
  modalDialog: "bg-white border border-[#EAE7DF] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden",
  modalHeader: "p-6 border-b border-[#EAE7DF] flex items-center justify-between bg-[#FAF9F5]",

  // Dividers
  divider: "border-t border-[#EAE7DF]"
};
