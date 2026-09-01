"use client";

import React, { useState } from "react";
import { 
  Building2, 
  CreditCard, 
  User, 
  ShieldCheck, 
  Bell, 
  Check, 
  Sparkles, 
  AlertCircle,
  Smartphone,
  Users,
  UserPlus,
  Trash2,
  Mail,
  Phone
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { getAllPlans } from "@/lib/billing/config";
import { DS } from "@/lib/design-system";
import type { TeamMemberRole } from "@/types";

type SettingsTab = "account" | "business" | "billing" | "team" | "notifications" | "security";

export const SettingsView = () => {
  const { 
    state, 
    updateBusinessProfile, 
    upgradePlan, 
    resetToDefaults,
    inviteTeamMember,
    updateTeamMemberRole,
    removeTeamMember
  } = useOtomatizonStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("billing");

  // Profile Form State
  const [businessName, setBusinessName] = useState(state.businessProfile.name || "My Business Workspace");
  const [city, setCity] = useState(state.businessProfile.city || "Nairobi");
  const [dealSize, setDealSize] = useState(state.businessProfile.averageDealSizeKes || 3500);
  const [saveNotice, setSaveNotice] = useState(false);

  // Team Invite Form State
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>("collaborator");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const plans = getAllPlans();
  const currentPlan = plans.find((p) => p.id === state.stats.currentPlanId) || plans[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      name: businessName,
      city,
      averageDealSizeKes: Number(dealSize)
    });
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    inviteTeamMember({
      name: inviteName,
      email: inviteEmail,
      phone: invitePhone,
      role: inviteRole
    });
    setInviteName("");
    setInviteEmail("");
    setInvitePhone("");
    setShowInviteForm(false);
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="border-b border-[#EAE7DF] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className={DS.monoEyebrow}>
            Preferences & Account
          </span>
          <h1 className={DS.h1}>
            Settings
          </h1>
          <p className="text-[#4A4B50] text-sm mt-1.5">
            Manage your organization parameters, billing plan, and notifications.
          </p>
        </div>

        <button
          onClick={resetToDefaults}
          className={DS.btnGhost}
        >
          Reset Demo Data
        </button>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-[#15803D]" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {inviteSuccess && (
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-[#15803D]" />
          <span>Team invitation dispatched. A workspace invite link was sent.</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-[#F4F2EB] p-1 rounded-full border border-[#EAE7DF] text-xs font-medium w-fit overflow-x-auto">
        {[
          { id: "billing", label: "Billing & Plans", icon: CreditCard },
          { id: "business", label: "Business", icon: Building2 },
          { id: "team", label: "Team & Permissions", icon: Users },
          { id: "account", label: "Account", icon: User },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "security", label: "Security", icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`px-3.5 py-1.5 rounded-full capitalize transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-white text-[#121316] font-bold shadow-sm"
                  : "text-[#75777E] hover:text-[#121316]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      
      {/* 1. BILLING TAB */}
      {activeTab === "billing" && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Current Subscription Card */}
          <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7DF] pb-5">
              <div>
                <span className={DS.monoEyebrow}>Current Subscription</span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-2xl font-bold text-[#121316]">
                    {currentPlan.name} Plan
                  </h2>
                  <span className={DS.badgeSuccess}>
                    Active &bull; M-Pesa Billed
                  </span>
                </div>
              </div>

              <div>
                <span className="text-3xl font-extrabold text-[#121316]">
                  KES {currentPlan.priceKesMonthly.toLocaleString()}
                </span>
                <span className="text-xs text-[#75777E] font-mono"> / month</span>
              </div>
            </div>

            {/* Subscription Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1">
                <span className="text-[#75777E] font-medium block">Active automations</span>
                <div className="text-base font-bold text-[#121316]">
                  {state.workflows.filter(w => w.active).length} of {state.stats.automationsLimit} used
                </div>
                <span className="text-[11px] text-[#75777E]">Capacity limit</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1">
                <span className="text-[#75777E] font-medium block">Billing cycle</span>
                <div className="text-base font-bold text-[#121316]">
                  Monthly (30 Days Cycle)
                </div>
                <span className="text-[11px] text-[#75777E]">Renews via M-Pesa STK</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1">
                <span className="text-[#75777E] font-medium block">Payment method</span>
                <div className="text-base font-bold text-[#121316] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#15803D]" />
                  <span>Safaricom M-Pesa</span>
                </div>
                <span className="text-[11px] text-[#75777E]">+254 712 882 109</span>
              </div>
            </div>

            {/* Live Monthly Quota Progress Gauges */}
            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold">
                  MONTHLY USAGE &amp; QUOTA GAUGES
                </span>
                <span className="text-xs font-mono text-[#15803D] font-bold">
                  100% Operational
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#4A4B50]">Automations</span>
                    <span className="font-bold text-[#121316]">1 / 1 (100%)</span>
                  </div>
                  <div className="w-full bg-[#EAE7DF] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#15803D] h-full rounded-full w-full" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#4A4B50]">Follow-Ups</span>
                    <span className="font-bold text-[#121316]">24 / 50 (48%)</span>
                  </div>
                  <div className="w-full bg-[#EAE7DF] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#15803D] h-full rounded-full w-[48%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#4A4B50]">Leads Captured</span>
                    <span className="font-bold text-[#121316]">27 / 75 (36%)</span>
                  </div>
                  <div className="w-full bg-[#EAE7DF] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#15803D] h-full rounded-full w-[36%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Plans Switcher */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#121316]">
              Change Subscription Plan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((p) => {
                const isSelected = p.id === state.stats.currentPlanId;
                const isGrowth = p.id === "growth";
                const isFree = p.id === "free";

                return (
                  <div
                    key={p.id}
                    className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "border-[#15803D] ring-2 ring-[#15803D]/20 shadow-md"
                        : "border-[#EAE7DF] shadow-sm"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base text-[#121316]">
                          {p.name}
                        </h4>
                        {isSelected && (
                          <span className={DS.badgeSuccess}>
                            Current
                          </span>
                        )}
                        {!isSelected && isGrowth && (
                          <span className={DS.badgeNeutral}>
                            Popular
                          </span>
                        )}
                        {!isSelected && isFree && (
                          <span className="text-[10px] font-mono font-bold text-[#75777E] px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE7DF]">
                            Free
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-xl font-extrabold text-[#121316]">
                          {p.priceKesMonthly === 0 ? "KES 0" : `KES ${p.priceKesMonthly.toLocaleString()}`}
                        </span>
                        <span className="text-xs text-[#75777E] font-mono"> / mo</span>
                      </div>

                      <p className="text-xs text-[#4A4B50] leading-relaxed line-clamp-2">
                        {p.tagline}
                      </p>

                      <div className="pt-3 border-t border-[#EAE7DF] space-y-2 text-xs text-[#4A4B50]">
                        {p.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => upgradePlan(p.id as any)}
                      disabled={isSelected}
                      className={isSelected ? DS.btnSecondary : DS.btnPrimary}
                    >
                      {isSelected ? "Current Plan" : `Switch to ${p.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. BUSINESS PROFILE TAB */}
      {activeTab === "business" && (
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#121316]">
              Business Information
            </h2>
            <p className="text-xs text-[#4A4B50]">
              Details used to tailor the Opportunity Detection Engine for your business.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 max-w-lg">
            <div>
              <label className="text-xs font-mono uppercase text-[#75777E] block mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={DS.input}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-[#75777E] block mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={DS.input}
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-[#75777E] block mb-1">
                  Average Deal (KES)
                </label>
                <input
                  type="number"
                  value={dealSize}
                  onChange={(e) => setDealSize(Number(e.target.value))}
                  className={DS.input}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={DS.btnPrimary}
              >
                <span>Save changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TEAM & PERMISSIONS TAB */}
      {activeTab === "team" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7DF] pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                    WORKSPACE ACCESS
                  </span>
                  <span className="text-xs font-mono text-[#75777E]">
                    {(state.teamMembers || []).length} Members
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-[#121316] tracking-tight">
                  Team Members &amp; Permissions
                </h2>
                <p className="text-xs text-[#4A4B50]">
                  Manage staff, teaching assistants, and accounting partners collaborating in your workspace.
                </p>
              </div>

              <button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="px-4 py-2 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all shadow-xs flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Team Member</span>
              </button>
            </div>

            {/* Invite Member Drawer / Form */}
            {showInviteForm && (
              <form onSubmit={handleInvite} className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#A7F3D0] space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-[#002E25] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>Invite New Team Member</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="text-xs text-[#75777E] hover:text-[#121316] font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grace Mutua"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className={DS.input}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="grace@otomatizon.co.ke"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className={DS.input}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      placeholder="+254 712 000 999"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      className={DS.input}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                      Access Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as TeamMemberRole)}
                      className={DS.input}
                    >
                      <option value="collaborator">Collaborator (Workflows &amp; Leads)</option>
                      <option value="viewer">Viewer (Read-Only &amp; Audit Logs)</option>
                      <option value="admin">Admin (Full Control &amp; Billing)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold font-mono transition-all cursor-pointer"
                  >
                    <span>Send Workspace Invitation</span>
                  </button>
                </div>
              </form>
            )}

            {/* Team Members List */}
            <div className="divide-y divide-[#EAE7DF] border border-[#EAE7DF] rounded-2xl overflow-hidden">
              {(state.teamMembers || []).map((member) => {
                const isOwner = member.id === "tm_01";
                return (
                  <div key={member.id} className="p-4 bg-white hover:bg-[#FAF9F5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#002E25] text-white font-bold text-xs flex items-center justify-center font-mono">
                        {member.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#121316]">
                            {member.name}
                          </h4>
                          {isOwner && (
                            <span className="text-[10px] font-mono font-bold text-[#15803D] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full">
                              WORKSPACE OWNER
                            </span>
                          )}
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            member.status === "active"
                              ? "text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0]"
                              : "text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A]"
                          }`}>
                            {member.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#75777E]">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <select
                        disabled={isOwner}
                        value={member.role}
                        onChange={(e) => updateTeamMemberRole(member.id, e.target.value as TeamMemberRole)}
                        className={`text-xs font-mono font-bold rounded-full px-3 py-1.5 border border-[#EAE7DF] bg-[#FAF9F5] text-[#121316] ${
                          isOwner ? "opacity-75 cursor-not-allowed" : "cursor-pointer hover:border-[#15803D]"
                        }`}
                      >
                        <option value="admin">Admin</option>
                        <option value="collaborator">Collaborator</option>
                        <option value="viewer">Viewer</option>
                      </select>

                      {!isOwner && (
                        <button
                          onClick={() => removeTeamMember(member.id)}
                          className="p-1.5 rounded-full text-[#75777E] hover:text-[#BE123C] hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                          title="Revoke access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Permissions Matrix Callout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase text-[#15803D] font-bold block">
                  ADMIN ROLE
                </span>
                <p className="text-[#121316] font-medium">
                  Full control over active automations, Safaricom M-Pesa billing, integrations tokens, and team roles.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase text-[#002E25] font-bold block">
                  COLLABORATOR ROLE
                </span>
                <p className="text-[#121316] font-medium">
                  Can edit workflow parameters, simulate inbound leads, view roster spreadsheets, and resolve attention items.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold block">
                  VIEWER ROLE
                </span>
                <p className="text-[#121316] font-medium">
                  Read-only access to operational logs, revenue protection analytics, and executive PDF reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACCOUNT TAB */}
      {activeTab === "account" && (
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn max-w-lg">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#121316]">
              Account Profile
            </h2>
            <p className="text-xs text-[#4A4B50]">
              Personal details of the primary account owner.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-mono uppercase text-[#75777E] block mb-1">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={state.session?.user?.fullName || ""}
                placeholder="Your Full Name"
                className={DS.input}
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-[#75777E] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                defaultValue={state.session?.user?.email || ""}
                placeholder="your.email@gmail.com"
                className={DS.input}
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-[#75777E] block mb-1">
                Phone Number (WhatsApp)
              </label>
              <input
                type="tel"
                defaultValue={state.session?.user?.phone || ""}
                placeholder="+254 700 000 000"
                className={DS.input}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn max-w-lg">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#121316]">
              Notification Preferences
            </h2>
            <p className="text-xs text-[#4A4B50]">
              Control how Otomatizon notifies you of opportunities and executed workflows.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {[
              { title: "Daily WhatsApp summary", desc: "Brief recap of leads captured and payments verified every evening at 18:00." },
              { title: "Immediate M-Pesa payment alerts", desc: "Push notification as soon as an STK payment is matched to a student." },
              { title: "Weekly opportunity scan", desc: "Notification when new high-impact automations are discovered." }
            ].map((n, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF]">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-[#121316]">{n.title}</h4>
                  <p className="text-[#4A4B50]">{n.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="mt-1 accent-[#15803D] w-4 h-4 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SECURITY TAB */}
      {activeTab === "security" && (
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn max-w-lg">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#121316]">
              Security & Multi-Tenant Isolation
            </h2>
            <p className="text-xs text-[#4A4B50]">
              Row-level security policies, HMAC webhooks, and session token state.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span className="font-bold text-[#121316]">Row-Level Security (RLS) Active</span>
            </div>
            <p className="text-[#4A4B50]">
              All queries are strictly partitioned by organization ID <code className="font-mono text-[#121316]">{state.organization.id}</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-2 text-xs">
            <span className="font-bold text-[#121316]">Idempotency Guard Active</span>
            <p className="text-[#4A4B50]">
              15-minute sliding window cache prevents duplicate M-Pesa STK prompts and message re-dispatches.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
