"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight, 
  ChevronDown, 
  Calendar, 
  DollarSign,
  Activity,
  Calculator,
  Layers,
  Sparkles
} from "lucide-react";
import { MetricExplanationModal, MetricDetail } from "./MetricExplanationModal";
import { DataProvenance } from "@/types";

interface ResultsImpactViewProps {
  onNavigateToAutomations?: () => void;
}

export const ResultsImpactView: React.FC<ResultsImpactViewProps> = ({
  onNavigateToAutomations
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricDetail | null>(null);
  const [timeframe, setTimeframe] = useState<"month" | "week" | "quarter">("month");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // 6 Metric Definitions matching Reference Image 8
  const metricsData: (MetricDetail & { growth: string; isStable?: boolean })[] = [
    {
      id: "inquiries_handled",
      title: "Inquiries Handled",
      titleFr: "Inquiries Handled",
      value: "27",
      sublabel: "Inquiries Handled",
      growth: "+16% vs last week",
      formula: "SUM(inbound_whatsapp_webhooks) over the last 7 days",
      formulaDescription: "Counts every inbound first customer message received on WhatsApp Business, cryptographically verified via HMAC signature and deduplicated.",
      provenance: "OBSERVED",
      confidenceScore: 100,
      timeframe: "Last 7 days",
      contributingFactors: [
        "27 inbound WhatsApp messages received",
        "27 contacts qualified by Decision Engine",
        "0 dropped or abandoned messages"
      ]
    },
    {
      id: "followups_sent",
      title: "Follow-ups Sent",
      titleFr: "Follow-ups Sent",
      value: "24",
      sublabel: "Follow-ups Sent",
      growth: "+13% vs last week",
      formula: "SUM(followup_actions_executed) after 24h delay expiration",
      formulaDescription: "Number of polite follow-up messages automatically dispatched by Otomatizon when no booking was found on Google Calendar.",
      provenance: "OBSERVED",
      confidenceScore: 100,
      timeframe: "Last 7 days",
      contributingFactors: [
        "24 leads followed up at 24h without manual intervention",
        "Average dispatch delay: 24h00m12s",
        "100% Meta Cloud API delivery rate"
      ]
    },
    {
      id: "bookings_won",
      title: "Bookings Won",
      titleFr: "Bookings Won",
      value: "6",
      sublabel: "Bookings Won",
      growth: "+21% vs last week",
      formula: "SUM(google_calendar_confirmed_events) attributed to follow-ups",
      formulaDescription: "Private tutoring lessons booked in the calendar directly following an automated follow-up sent by Otomatizon.",
      provenance: "OBSERVED",
      confidenceScore: 98,
      timeframe: "Last 7 days",
      contributingFactors: [
        "6 students scheduled their initial evaluation lesson",
        "Average conversion delay: 31 hours after follow-up",
        "Confirmed directly on Google Calendar"
      ]
    },
    {
      id: "hours_saved",
      title: "Time Saved",
      titleFr: "Time Saved",
      value: "8.2 h",
      sublabel: "Time Saved",
      growth: "+15% vs last week",
      formula: "(27 inquiries × 10 min) + (24 follow-ups × 12 min) + (6 bookings × 15 min) = 492 min = 8.2 h",
      formulaDescription: "Calculated from the average time an independent tutor spends manually logging leads, composing messages, and coordinating calendar availability.",
      provenance: "ESTIMATED",
      confidenceScore: 94,
      timeframe: "Last 7 days",
      contributingFactors: [
        "4.5 h saved on initial qualification and Sheets logging",
        "2.8 h saved on WhatsApp follow-up drafting",
        "0.9 h saved on calendar coordination"
      ]
    },
    {
      id: "success_rate",
      title: "Success Rate",
      titleFr: "Success Rate",
      value: "98.6%",
      sublabel: "Success Rate",
      growth: "Stable",
      isStable: true,
      formula: "(71 successful actions / 72 total actions) × 100 = 98.61%",
      formulaDescription: "Percentage of orchestration steps executed without technical error across WhatsApp, Google Sheets, and Google Calendar APIs.",
      provenance: "OBSERVED",
      confidenceScore: 99,
      timeframe: "Last 7 days",
      contributingFactors: [
        "71 pipeline steps verified with HTTP 200",
        "1 minor network latency warning (180ms)",
        "0 critical failures or state desynchronizations"
      ]
    },
    {
      id: "value_created",
      title: "Estimated Value Created",
      titleFr: "Estimated Value Created",
      value: "KES 88,000",
      sublabel: "Estimated Value Created",
      growth: "+32% vs last week",
      formula: "(6 exam prep packages × KES 14,000) + (4 deposits recovered × KES 1,000) = KES 88,000",
      formulaDescription: "Economic value of secured lesson packages and confirmed sessions that would have been lost without systematic 24-hour follow-up.",
      provenance: "ESTIMATED",
      confidenceScore: 92,
      timeframe: "Last 7 days",
      contributingFactors: [
        "6 students enrolled in exam prep packages (KES 14,000)",
        "4 advance M-Pesa deposits secured before lesson 1",
        "Attribution verified via conversion ledger"
      ]
    }
  ];

  // 30-Day Trendline Points matching Reference Image 8
  const trendPoints = [
    { date: "30 Jul", value: 4, x: 20, y: 110 },
    { date: "5 Aug", value: 11, x: 80, y: 90 },
    { date: "10 Aug", value: 17, x: 140, y: 70 },
    { date: "15 Aug", value: 11, x: 200, y: 90 },
    { date: "20 Aug", value: 25, x: 260, y: 45 },
    { date: "25 Aug", value: 28, x: 320, y: 35 },
    { date: "30 Aug", value: 14, x: 380, y: 80 }
  ];

  const svgWidth = 400;
  const svgHeight = 140;
  const areaPath = `M 20,110 L 80,90 L 140,70 L 200,90 L 260,45 L 320,35 L 380,80 L 380,130 L 20,130 Z`;
  const linePath = `M 20,110 L 80,90 L 140,70 L 200,90 L 260,45 L 320,35 L 380,80`;

  return (
    <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-8 animate-fadeIn">
      
      {/* 1. TOP HEADER & DISTRIBUTION TIMEFRAME DROPDOWN matching Reference Image 8 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7DF] pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#121316] tracking-tight">
            Automation Performance
          </h2>
          <p className="text-xs text-[#75777E] mt-0.5">
            Verified operational results and measurable economic impact for your business.
          </p>
        </div>

        {/* Timeframe Dropdown matching Image 8 */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span className="text-[11px] text-[#75777E]">Breakdown by automation</span>
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="appearance-none bg-[#FAF9F5] border border-[#EAE7DF] rounded-xl px-3 py-1.5 pr-7 text-xs font-bold text-[#121316] focus:outline-none focus:border-[#15803D] cursor-pointer"
            >
              <option value="month">Last month</option>
              <option value="week">This week</option>
              <option value="quarter">This quarter</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#75777E] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. SPLIT: 6 METRIC CARDS (Left 8 Cols) + DONUT DISTRIBUTION (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left 8 Cols: 6 Impact Cards matching Reference Image 8 */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Row 1: 4 Cards */}
          {metricsData.slice(0, 4).map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMetric(m)}
              className="p-4 rounded-2xl bg-[#FAF9F5]/70 border border-[#EAE7DF] hover:border-[#15803D] transition-all cursor-pointer shadow-2xs space-y-1 group"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-mono tracking-tight group-hover:text-[#15803D] transition-colors">
                {m.value}
              </div>
              <div className="text-xs font-bold text-[#121316]">
                {m.title}
              </div>
              <div className="text-[10px] font-mono text-[#15803D] font-bold">
                {m.growth}
              </div>
            </div>
          ))}

          {/* Row 2: Card 5 (Success Rate) & Card 6 (KES 88,000) */}
          <div
            onClick={() => setSelectedMetric(metricsData[4])}
            className="col-span-2 sm:col-span-2 p-4 rounded-2xl bg-[#FAF9F5]/70 border border-[#EAE7DF] hover:border-[#15803D] transition-all cursor-pointer shadow-2xs space-y-1 group"
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-mono tracking-tight group-hover:text-[#15803D] transition-colors">
              {metricsData[4].value}
            </div>
            <div className="text-xs font-bold text-[#121316]">
              {metricsData[4].title}
            </div>
            <div className="text-[10px] font-mono text-[#75777E] font-medium">
              {metricsData[4].growth}
            </div>
          </div>

          <div
            onClick={() => setSelectedMetric(metricsData[5])}
            className="col-span-2 sm:col-span-2 p-4 rounded-2xl bg-[#FAF9F5]/70 border border-[#EAE7DF] hover:border-[#15803D] transition-all cursor-pointer shadow-2xs space-y-1 group"
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-mono tracking-tight group-hover:text-[#15803D] transition-colors">
              {metricsData[5].value}
            </div>
            <div className="text-xs font-bold text-[#121316]">
              {metricsData[5].title}
            </div>
            <div className="text-[10px] font-mono text-[#15803D] font-bold">
              {metricsData[5].growth}
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Donut Distribution Chart matching Reference Image 8 */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#FAF9F5]/50 border border-[#EAE7DF] flex flex-col items-center justify-center space-y-4">
          
          {/* SVG Donut Chart */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#EAE7DF"
                strokeWidth="8"
              />
              {/* Foreground Emerald Segment (100%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#15803D"
                strokeWidth="8"
                strokeDasharray="238.76"
                strokeDashoffset="0"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Donut Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-[#121316] font-mono leading-none">
                27
              </span>
              <span className="text-[9px] font-mono text-[#75777E] uppercase mt-1 leading-tight">
                Total Inquiries
              </span>
            </div>
          </div>

          {/* Donut Legend matching Image 8 */}
          <div className="space-y-1.5 text-xs font-mono w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                <span className="text-[#121316] font-medium">Lead Follow-Up</span>
              </div>
              <strong className="text-[#121316]">27 (100%)</strong>
            </div>

            <div className="flex items-center justify-between text-[#75777E]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-[#75777E]" />
                <span>Payment Reminders</span>
              </div>
              <span>0 (0%)</span>
            </div>

            <div className="flex items-center justify-between text-[#75777E]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-[#75777E]" />
                <span>Others</span>
              </div>
              <span>0 (0%)</span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. 30-DAY OPERATIONAL TRENDLINE matching Reference Image 8 */}
      <div className="border-t border-[#EAE7DF] pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#121316]">
            Trends (Last 30 days)
          </span>
          <span className="text-[10px] font-mono text-[#75777E]">
            Daily volume of automated inquiries
          </span>
        </div>

        {/* SVG Line & Area Chart Container */}
        <div className="w-full bg-[#FAF9F5]/40 border border-[#EAE7DF] rounded-2xl p-4 pt-6 overflow-x-auto">
          <div className="min-w-[420px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-36 overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#15803D" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#15803D" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="35" x2="380" y2="35" stroke="#EAE7DF" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="20" y1="70" x2="380" y2="70" stroke="#EAE7DF" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="20" y1="105" x2="380" y2="105" stroke="#EAE7DF" strokeDasharray="3 3" strokeWidth="0.8" />

              {/* Filled Area */}
              <path d={areaPath} fill="url(#trendGradient)" />

              {/* Line Stroke */}
              <path d={linePath} fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Interactive Data Points */}
              {trendPoints.map((pt, idx) => {
                const isHovered = hoveredPointIndex === idx;

                return (
                  <g 
                    key={idx} 
                    onMouseEnter={() => setHoveredPointIndex(idx)} 
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? "5" : "3.5"}
                      fill="#15803D"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all"
                    />

                    {/* Tooltip on hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={pt.x - 22}
                          y={pt.y - 25}
                          width="44"
                          height="18"
                          rx="4"
                          fill="#121316"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 13}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {pt.value} leads
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Y-Axis Labels */}
              <text x="5" y="38" fontSize="8" fontFamily="monospace" fill="#75777E">30</text>
              <text x="5" y="73" fontSize="8" fontFamily="monospace" fill="#75777E">20</text>
              <text x="5" y="108" fontSize="8" fontFamily="monospace" fill="#75777E">10</text>
              <text x="10" y="130" fontSize="8" fontFamily="monospace" fill="#75777E">0</text>

              {/* X-Axis Date Labels matching Reference Image 8 */}
              {trendPoints.map((pt, idx) => (
                <text
                  key={idx}
                  x={pt.x}
                  y="138"
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="monospace"
                  fill="#75777E"
                >
                  {pt.date}
                </text>
              ))}
            </svg>
          </div>
        </div>

      </div>

      {/* 4. MODAL: 5-STAGE CAUSAL PROVENANCE AUDIT TRAIL */}
      <MetricExplanationModal
        isOpen={!!selectedMetric}
        metric={selectedMetric}
        onClose={() => setSelectedMetric(null)}
      />

    </div>
  );
};
