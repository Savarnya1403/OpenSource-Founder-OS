"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Scale, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

interface StageTerms {
  label: string;
  typical_stage: string;
  typical_investors: string[];
  round_size: string;
  valuation_post_money: string;
  dilution: string;
  instrument: string;
  board: string;
  esop_pool: string;
  anti_dilution: string;
  pro_rata: string;
  liquidation_preference: string;
  information_rights: string[];
  no_shop: string;
  due_diligence_timeline: string;
  typical_docs: string[];
  founder_tips: string[];
  red_flags: string[];
}

interface DealTermsData {
  stages: { pre_seed: StageTerms; seed: StageTerms; series_a: StageTerms };
  glossary: Record<string, string>;
  negotiation_tips: string[];
}

type StageKey = "pre_seed" | "seed" | "series_a";
const STAGES: { key: StageKey; label: string }[] = [
  { key: "pre_seed", label: "Pre-Seed" },
  { key: "seed", label: "Seed" },
  { key: "series_a", label: "Series A" },
];

const TERM_SECTIONS = [
  { key: "round", label: "Round Size & Valuation", fields: ["round_size", "valuation_post_money", "dilution", "instrument"] },
  { key: "board", label: "Board & Governance", fields: ["board", "information_rights", "no_shop"] },
  { key: "esop", label: "ESOP & Anti-Dilution", fields: ["esop_pool", "anti_dilution", "pro_rata"] },
  { key: "economics", label: "Liquidation & Economics", fields: ["liquidation_preference"] },
  { key: "process", label: "Due Diligence & Process", fields: ["due_diligence_timeline", "typical_docs"] },
  { key: "tips", label: "Founder Tips", fields: ["founder_tips"] },
  { key: "red_flags", label: "Red Flags to Watch", fields: ["red_flags"] },
];

const FIELD_LABELS: Record<string, string> = {
  round_size: "Typical Round Size",
  valuation_post_money: "Post-Money Valuation",
  dilution: "Founder Dilution",
  instrument: "Instrument Used",
  board: "Board Composition",
  esop_pool: "ESOP Pool",
  anti_dilution: "Anti-Dilution Protection",
  pro_rata: "Pro-Rata Rights",
  liquidation_preference: "Liquidation Preference",
  information_rights: "Information Rights",
  no_shop: "No-Shop Period",
  due_diligence_timeline: "Due Diligence Timeline",
  typical_docs: "Typical Documents",
  founder_tips: "Founder Tips",
  red_flags: "Red Flags",
};

function renderValue(key: string, value: unknown): React.ReactNode {
  if (Array.isArray(value)) {
    if (key === "founder_tips") {
      return (
        <ul className="space-y-1.5">
          {(value as string[]).map((tip, i) => (
            <li key={i} className="flex gap-2 text-xs text-stone-600 leading-relaxed">
              <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      );
    }
    if (key === "red_flags") {
      return (
        <ul className="space-y-1.5">
          {(value as string[]).map((flag, i) => (
            <li key={i} className="flex gap-2 text-xs text-red-700 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              {flag}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <ul className="space-y-1">
        {(value as string[]).map((v, i) => (
          <li key={i} className="text-xs text-stone-600 flex gap-1.5"><span className="text-peach-400">·</span>{v}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-xs text-stone-700 leading-relaxed">{String(value)}</p>;
}

export default function DealTermsPage() {
  const [activeStage, setActiveStage] = useState<StageKey>("seed");
  const [expandedSection, setExpandedSection] = useState<string>("round");
  const [showGlossary, setShowGlossary] = useState(false);
  const [showNegTips, setShowNegTips] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["deal-terms"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/tools/deal-terms`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<DealTermsData>;
    },
  });

  const currentStage = data?.stages[activeStage];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 glass-strong border-b border-peach-200/30 px-8 py-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-peach-500" />
          <span className="text-sm font-semibold text-stone-700">India VC Deal Terms</span>
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">India VC Deal Terms Benchmarks</h1>
            <p className="text-stone-400 text-sm">Pre-Seed, Seed & Series A terms — what's market, what's negotiable, and what's a red flag.</p>
          </div>

          {/* Stage comparison mini-table */}
          {data && (
            <div className="glass rounded-2xl p-5 mb-6 shadow-sm overflow-x-auto">
              <p className="text-[10px] font-bold text-stone-500 uppercase mb-4 section-label">Quick Comparison</p>
              <table className="w-full text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-peach-100/60">
                    <th className="text-left text-stone-400 font-semibold pb-2 w-32">Term</th>
                    {STAGES.map((s) => (
                      <th key={s.key} className="text-left text-stone-700 font-bold pb-2">{s.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-peach-50/60">
                  {[
                    { key: "round_size", label: "Round" },
                    { key: "valuation_post_money", label: "Post-Money Val." },
                    { key: "dilution", label: "Dilution" },
                    { key: "instrument", label: "Instrument" },
                    { key: "esop_pool", label: "ESOP Pool" },
                    { key: "liquidation_preference", label: "Liquidation Pref." },
                  ].map((row) => (
                    <tr key={row.key}>
                      <td className="text-stone-400 py-2 pr-4 font-medium">{row.label}</td>
                      {STAGES.map((s) => {
                        const stageData = data.stages[s.key] as unknown as Record<string, unknown>;
                        return (
                          <td key={s.key} className={`py-2 pr-4 text-stone-700 ${activeStage === s.key ? "font-semibold text-stone-900" : ""}`}>
                            {String(stageData[row.key] || "—")}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stage tabs */}
          <div className="flex gap-2 mb-6">
            {STAGES.map((s) => (
              <button key={s.key} onClick={() => setActiveStage(s.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeStage === s.key ? "btn-coral" : "btn-ghost-peach"}`}>
                {s.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-peach-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-stone-400">Loading deal terms...</p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 rounded-2xl p-6 text-center">
              <p className="text-sm text-red-600 font-medium">Could not load data. Ensure the backend is running at {API}.</p>
            </div>
          )}

          {currentStage && (
            <div className="space-y-3">
              {/* Stage overview */}
              <div className="glass rounded-2xl p-5 mb-2 shadow-sm">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge-peach">{currentStage.label}</span>
                  <span className="text-[11px] text-stone-500">{currentStage.typical_stage}</span>
                </div>
                <div className="flex flex-wrap gap-3 mb-3">
                  {currentStage.typical_investors.map((inv) => (
                    <span key={inv} className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{inv}</span>
                  ))}
                </div>
              </div>

              {/* Accordion sections */}
              {TERM_SECTIONS.map((section) => {
                const isExpanded = expandedSection === section.key;
                return (
                  <div key={section.key} className="glass rounded-2xl shadow-sm overflow-hidden">
                    <button className="w-full flex items-center justify-between p-5 text-left hover:bg-peach-50/20 transition-colors"
                      onClick={() => setExpandedSection(isExpanded ? "" : section.key)}>
                      <span className="font-bold text-stone-900 text-sm">{section.label}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-peach-100/40 pt-4 space-y-4">
                        {section.fields.map((fieldKey) => {
                          const value = (currentStage as Record<string, unknown>)[fieldKey];
                          if (!value) return null;
                          const isBad = fieldKey === "red_flags";
                          const isGood = fieldKey === "founder_tips";
                          return (
                            <div key={fieldKey} className={`rounded-xl p-4 ${isBad ? "bg-red-50 border border-red-100" : isGood ? "bg-green-50 border border-green-100" : "bg-peach-50/40 border border-peach-100/40"}`}>
                              <p className={`text-[10px] font-bold uppercase mb-2 ${isBad ? "text-red-700" : isGood ? "text-green-700" : "text-stone-500"}`}>
                                {FIELD_LABELS[fieldKey]}
                              </p>
                              {renderValue(fieldKey, value)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Negotiation Tips */}
          {data && (
            <div className="mt-6 glass rounded-2xl shadow-sm overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 text-left hover:bg-peach-50/20 transition-colors"
                onClick={() => setShowNegTips((p) => !p)}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">Universal Negotiation Tips</span>
                  <span className="badge-peach">{data.negotiation_tips.length} tips</span>
                </div>
                {showNegTips ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </button>
              {showNegTips && (
                <div className="px-5 pb-5 border-t border-peach-100/40 pt-4">
                  <ul className="space-y-3">
                    {data.negotiation_tips.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-xs text-stone-700 leading-relaxed">
                        <span className="text-peach-500 font-bold shrink-0">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Glossary */}
          {data && (
            <div className="mt-4 glass rounded-2xl shadow-sm overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 text-left hover:bg-peach-50/20 transition-colors"
                onClick={() => setShowGlossary((p) => !p)}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">Term Glossary</span>
                  <span className="badge-peach">{Object.keys(data.glossary).length} terms</span>
                </div>
                {showGlossary ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </button>
              {showGlossary && (
                <div className="px-5 pb-5 border-t border-peach-100/40 pt-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Object.entries(data.glossary).map(([term, definition]) => (
                      <div key={term} className="bg-stone-50 rounded-xl p-3">
                        <p className="text-xs font-bold text-stone-800 mb-1">{term}</p>
                        <p className="text-[11px] text-stone-500 leading-relaxed">{definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 glass rounded-2xl p-5 text-center">
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Data based on 200+ India startup deals (2022-2025) compiled from founder reports, term sheet analyses, and interviews with 40+ Indian VCs. Terms are indicative — every deal is unique. Always engage a startup-experienced lawyer before signing any term sheet.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
