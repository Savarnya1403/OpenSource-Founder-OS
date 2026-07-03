"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, AlertCircle,
  Rocket, TrendingUp, BarChart3, Award, Clock, Zap
} from "lucide-react";

interface ChecklistItem {
  id: string;
  text: string;
  priority: "must" | "should" | "nice";
  detail?: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

interface Stage {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  timeline: string;
  target_raise: string;
  sections: ChecklistSection[];
}

const STAGES: Stage[] = [
  {
    id: "pre-seed",
    title: "Pre-Seed",
    subtitle: "Idea → MVP",
    icon: Rocket,
    color: "text-peach-600",
    bg: "bg-peach-50/60 border-peach-200/40",
    timeline: "0–12 months",
    target_raise: "₹25L – ₹2 Cr",
    sections: [
      {
        id: "team",
        title: "Team",
        items: [
          { id: "cofounders", text: "Co-founder(s) identified with complementary skills (tech + business)", priority: "must" },
          { id: "fulltime", text: "All core founders working full-time", priority: "must" },
          { id: "equity-split", text: "Founder equity split agreed and documented", priority: "must", detail: "Equal or justified split with vesting. Handshake deals lead to disasters." },
          { id: "vesting", text: "4-year vesting with 1-year cliff in place for all founders", priority: "must" },
          { id: "roles", text: "Clear roles defined — who does what", priority: "should" },
          { id: "culture", text: "Work style and decision-making framework agreed upon", priority: "should" },
        ],
      },
      {
        id: "problem-validation",
        title: "Problem Validation",
        items: [
          { id: "customer-interviews", text: "50+ customer discovery interviews completed", priority: "must", detail: "Real conversations, not surveys. Understanding the pain, not validating your solution." },
          { id: "pain-documented", text: "Pain point documented with specific customer quotes", priority: "must" },
          { id: "persona", text: "ICP (Ideal Customer Profile) defined with specifics", priority: "must" },
          { id: "problem-size", text: "Problem size and frequency validated with data", priority: "should" },
          { id: "willingness-to-pay", text: "Willingness to pay tested (even informally)", priority: "should" },
          { id: "existing-solutions", text: "Understanding of why existing solutions fail your customer", priority: "must" },
        ],
      },
      {
        id: "product",
        title: "Product",
        items: [
          { id: "mvp", text: "MVP shipped and in hands of real users", priority: "must" },
          { id: "early-users", text: "10–50 real users using the product (not friends/family)", priority: "must" },
          { id: "feedback-loop", text: "Weekly feedback loop with early users established", priority: "must" },
          { id: "key-metric", text: "One north star metric identified and tracked", priority: "should" },
          { id: "retention-signal", text: "Some retention signal visible (users coming back)", priority: "must" },
          { id: "tech-stack", text: "Tech stack chosen and scalable enough for next 12 months", priority: "should" },
        ],
      },
      {
        id: "legal",
        title: "Legal & Structure",
        items: [
          { id: "incorporated", text: "Company incorporated (Private Limited in India)", priority: "must", detail: "Private Limited is the right structure for startup fundraising." },
          { id: "ip-assigned", text: "IP assignment agreements signed by all founders", priority: "must" },
          { id: "employment-agreements", text: "Employment/consulting agreements in place for all team members", priority: "must" },
          { id: "dpiit", text: "DPIIT Startup recognition applied for", priority: "should", detail: "Unlocks tax benefits, patent fee waivers, and scheme eligibility." },
          { id: "bank-account", text: "Business bank account opened", priority: "must" },
          { id: "gst", text: "GST registration if revenue > ₹20L threshold", priority: "should" },
        ],
      },
      {
        id: "fundraising-readiness",
        title: "Fundraising Readiness",
        items: [
          { id: "pitch-deck", text: "10-slide pitch deck prepared", priority: "must" },
          { id: "one-pager", text: "Crisp 1-page executive summary / email pitch", priority: "must" },
          { id: "use-of-funds", text: "Clear use of funds defined (what does ₹X unlock?)", priority: "must" },
          { id: "target-investors", text: "List of 30+ target angel investors researched", priority: "should" },
          { id: "intro-paths", text: "Warm intro paths mapped for top 10 investors", priority: "should" },
        ],
      },
    ],
  },
  {
    id: "seed",
    title: "Seed",
    subtitle: "MVP → PMF",
    icon: TrendingUp,
    color: "text-peach-600",
    bg: "bg-peach-50/60 border-peach-200/40",
    timeline: "6–18 months post-incorporation",
    target_raise: "₹2 Cr – ₹15 Cr",
    sections: [
      {
        id: "traction",
        title: "Traction Milestones",
        items: [
          { id: "paying-customers", text: "25–100 paying customers (B2B) or 10K+ active users (B2C)", priority: "must" },
          { id: "mrr", text: "₹5–25 lakh MRR (SaaS) or equivalent revenue signal", priority: "should" },
          { id: "retention", text: "Monthly retention > 60% (consumer) or churn < 3% (B2B SaaS)", priority: "must" },
          { id: "nps", text: "NPS measured — aim for 40+", priority: "should" },
          { id: "organic-growth", text: "Some organic / word-of-mouth growth visible", priority: "must" },
          { id: "unit-economics", text: "Unit economics tracked — CAC, LTV, payback period", priority: "must" },
        ],
      },
      {
        id: "gtm",
        title: "Go-to-Market",
        items: [
          { id: "repeatable-gtm", text: "Repeatable customer acquisition motion identified", priority: "must", detail: "You know HOW to acquire customers, even if CAC is still high." },
          { id: "sales-cycle", text: "Sales cycle length understood and documented", priority: "should" },
          { id: "first-channel", text: "Primary acquisition channel identified and proven", priority: "must" },
          { id: "pricing-validated", text: "Pricing model validated with paying customers", priority: "must" },
          { id: "case-study", text: "1–3 case studies / customer success stories documented", priority: "should" },
        ],
      },
      {
        id: "team-seed",
        title: "Team",
        items: [
          { id: "team-5", text: "Core team of 3–7 people in place", priority: "should" },
          { id: "technical-talent", text: "Solid technical talent on payroll (not outsourced for core product)", priority: "must" },
          { id: "esop", text: "ESOP policy in place for early hires", priority: "must", detail: "10-15% ESOP pool is standard." },
          { id: "advisor", text: "1–2 credible advisors with equity + active involvement", priority: "should" },
        ],
      },
      {
        id: "financials-seed",
        title: "Financials",
        items: [
          { id: "clean-books", text: "Clean financial records (P&L, balance sheet) for last 12 months", priority: "must" },
          { id: "burn-rate", text: "Monthly burn rate tracked and under control", priority: "must" },
          { id: "runway", text: "At least 9 months runway before starting fundraise", priority: "must" },
          { id: "projections", text: "3-year financial model / projections prepared", priority: "should" },
          { id: "bank-statements", text: "6 months bank statements ready for due diligence", priority: "must" },
        ],
      },
      {
        id: "legal-seed",
        title: "Legal & Compliance",
        items: [
          { id: "annual-filings", text: "MCA annual returns filed (ROC compliance)", priority: "must" },
          { id: "tds", text: "TDS compliance in place", priority: "must" },
          { id: "contracts", text: "Customer contracts / MSAs in standard form", priority: "should" },
          { id: "ip-clean", text: "IP clean — no open-source licenses creating liability", priority: "must" },
          { id: "cap-table", text: "Clean cap table (use Carta, Ledgr, or similar)", priority: "must" },
        ],
      },
      {
        id: "fundraising-seed",
        title: "Fundraising Readiness",
        items: [
          { id: "seed-deck", text: "Investor-ready pitch deck (traction-led, not just vision)", priority: "must" },
          { id: "data-room", text: "Data room prepared (financials, cap table, contracts, team info)", priority: "must" },
          { id: "vc-list", text: "Target list of 20+ Seed VCs researched (Blume, 3one4, Stellaris, Surge etc.)", priority: "should" },
          { id: "lead-investor", text: "Lead investor strategy — who do you want to lead?", priority: "should" },
          { id: "safe-vs-priced", text: "Decided on instrument: SAFE/CCD vs. priced round", priority: "must" },
        ],
      },
    ],
  },
  {
    id: "series-a",
    title: "Series A",
    subtitle: "PMF → Scale",
    icon: BarChart3,
    color: "text-peach-600",
    bg: "bg-peach-50/60 border-peach-200/40",
    timeline: "18–36 months post-incorporation",
    target_raise: "₹20 Cr – ₹100 Cr",
    sections: [
      {
        id: "revenue",
        title: "Revenue & Growth",
        items: [
          { id: "mrr-a", text: "₹50 lakh – ₹2 Cr MRR (SaaS) or ₹10–50 Cr ARR equivalent", priority: "must" },
          { id: "growth-rate", text: "Growing 2-3x year-over-year", priority: "must" },
          { id: "nrr", text: "NRR > 110% (existing customers expanding revenue)", priority: "must", detail: "This is the #1 signal of PMF for B2B SaaS VCs." },
          { id: "cac-payback", text: "CAC payback period < 18 months", priority: "must" },
          { id: "gross-margin", text: "Gross margin > 60% (SaaS), > 40% (marketplace)", priority: "should" },
          { id: "rule-of-40", text: "Rule of 40 score tracked (growth + profitability)", priority: "nice" },
        ],
      },
      {
        id: "pmf-signals",
        title: "PMF Signals",
        items: [
          { id: "sean-ellis", text: "Sean Ellis PMF test: > 40% users say 'very disappointed' without product", priority: "should" },
          { id: "organic", text: "Meaningful organic / referral component to acquisition", priority: "must" },
          { id: "enterprise-clients", text: "3–5 marquee enterprise clients (B2B) with case studies", priority: "should" },
          { id: "expansion-revenue", text: "Expansion revenue from existing customers", priority: "must" },
          { id: "logo-retention", text: "Logo retention > 85% annually", priority: "must" },
        ],
      },
      {
        id: "team-a",
        title: "Team & Org",
        items: [
          { id: "team-20", text: "Team of 15–40 people in key functions", priority: "should" },
          { id: "leadership", text: "VP-level leadership in Product, Sales, Engineering", priority: "must" },
          { id: "sales-team", text: "Dedicated sales team with proven quota attainment", priority: "must" },
          { id: "hiring-plan", text: "12-month hiring plan tied to fundraise milestones", priority: "must" },
          { id: "attrition", text: "Attrition under 20% annually", priority: "should" },
        ],
      },
      {
        id: "operations",
        title: "Operations",
        items: [
          { id: "okrs", text: "OKR framework in place — company and team level", priority: "should" },
          { id: "board", text: "Board formed with 1 independent director", priority: "must" },
          { id: "investor-updates", text: "Monthly investor updates sent consistently", priority: "must" },
          { id: "scalable-infra", text: "Infrastructure scaled to handle 10x current load", priority: "must" },
          { id: "security", text: "SOC 2 Type 1 (if B2B SaaS) or security audit completed", priority: "should" },
        ],
      },
      {
        id: "financials-a",
        title: "Financial Maturity",
        items: [
          { id: "cfo", text: "CFO or Controller hired (or strong finance function)", priority: "must" },
          { id: "audited", text: "Audited financials (by Big 4 or top firm) for last 2 years", priority: "must" },
          { id: "mrr-dashboard", text: "Real-time MRR, churn, and cohort dashboards in place", priority: "must" },
          { id: "budget", text: "Annual operating plan and budget prepared", priority: "must" },
          { id: "cash-efficiency", text: "Clear path to cash-flow break-even visible in 24–36 months", priority: "should" },
        ],
      },
      {
        id: "fundraising-a",
        title: "Series A Fundraising",
        items: [
          { id: "tier1-vc", text: "Targeting Tier 1 VCs: Sequoia India, Accel, Lightspeed, Matrix, Peak XV, Elevation", priority: "should" },
          { id: "metrics-deck", text: "Metrics-led deck (traction first, vision second)", priority: "must" },
          { id: "data-room-deep", text: "Deep data room: cohorts, unit economics, customer interviews, technical architecture", priority: "must" },
          { id: "valuation-prep", text: "Valuation benchmarked against public comps and recent transactions", priority: "must" },
          { id: "term-sheet-knowledge", text: "Founders educated on liquidation preference, pro-rata, board composition", priority: "must" },
          { id: "lawyer", text: "Startup-specialist lawyer engaged (Khaitan, AZB, Trilegal)", priority: "must" },
        ],
      },
    ],
  },
];

const PRIORITY_COLORS = {
  must: "text-red-600",
  should: "text-amber-600",
  nice: "text-stone-400",
};

const PRIORITY_LABELS = {
  must: "Must have",
  should: "Should have",
  nice: "Nice to have",
};

export default function ChecklistPage() {
  const [activeStage, setActiveStage] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(STAGES[0].sections.map(s => s.id)));

  const stage = STAGES[activeStage];

  const toggleItem = (id: string) => {
    setChecked(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const stageItems = stage.sections.flatMap(s => s.items);
  const must = stageItems.filter(i => i.priority === "must");
  const mustDone = must.filter(i => checked.has(i.id));
  const totalDone = stageItems.filter(i => checked.has(i.id));
  const readyPct = must.length > 0 ? Math.round((mustDone.length / must.length) * 100) : 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Founder Tools → Startup Checklist
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Startup Readiness Checklist</h1>
            <p className="text-stone-500 text-sm">
              Stage-specific checklists for Pre-Seed, Seed, and Series A — covering team, product, legal, finance, and fundraising.
            </p>
          </div>

          {/* Stage tabs */}
          <div className="flex gap-3 mb-6">
            {STAGES.map((s, idx) => {
              const SIcon = s.icon;
              return (
                <button key={s.id} onClick={() => {
                  setActiveStage(idx);
                  setExpandedSections(new Set(STAGES[idx].sections.map(sec => sec.id)));
                }}
                  className={`flex-1 flex items-center gap-2 p-4 rounded-2xl border transition-all ${activeStage === idx ? `${s.bg} border-opacity-100` : "bg-white border-peach-200/40 hover:border-peach-200/60"}`}>
                  <SIcon className={`w-5 h-5 ${activeStage === idx ? s.color : "text-stone-400"}`} />
                  <div className="text-left">
                    <p className={`font-bold text-sm ${activeStage === idx ? s.color : "text-stone-700"}`}>{s.title}</p>
                    <p className="text-xs text-stone-400">{s.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stage info */}
          <div className="glass rounded-2xl p-5 mb-6 shadow-sm flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">Timeline</p>
              <p className="text-sm font-semibold text-stone-800 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" /> {stage.timeline}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">Target Raise</p>
              <p className="text-sm font-semibold text-stone-800 mt-0.5 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-stone-400" /> {stage.target_raise}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-1">Must-have readiness</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-peach-200/50 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${readyPct >= 80 ? "bg-green-500" : readyPct >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                    style={{ width: `${readyPct}%` }} />
                </div>
                <span className="text-xs font-bold text-stone-700">{readyPct}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">Completed</p>
              <p className="text-sm font-semibold text-stone-800 mt-0.5">{totalDone.length} / {stageItems.length}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1.5 text-red-600"><AlertCircle className="w-3.5 h-3.5" /> Must have</span>
            <span className="flex items-center gap-1.5 text-amber-600"><Circle className="w-3.5 h-3.5" /> Should have</span>
            <span className="flex items-center gap-1.5 text-stone-400"><Circle className="w-3.5 h-3.5" /> Nice to have</span>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {stage.sections.map((section) => {
              const isExpanded = expandedSections.has(section.id);
              const sectionDone = section.items.filter(i => checked.has(i.id)).length;
              return (
                <div key={section.id} className="glass rounded-2xl shadow-sm overflow-hidden">
                  <button onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-peach-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${sectionDone === section.items.length ? "bg-green-100 text-green-700" : "bg-peach-100/60 text-stone-600"}`}>
                        {sectionDone === section.items.length ? <CheckCircle2 className="w-4 h-4" /> : `${sectionDone}`}
                      </div>
                      <h3 className="font-semibold text-stone-900 text-sm">{section.title}</h3>
                      <span className="text-xs text-stone-400">{sectionDone}/{section.items.length}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-2 border-t border-peach-100/40 pt-3">
                      {section.items.map((item) => (
                        <div key={item.id}>
                          <label className="flex items-start gap-3 cursor-pointer group p-2 rounded-xl hover:bg-peach-50/60 transition-colors">
                            <div className="mt-0.5 shrink-0">
                              {checked.has(item.id)
                                ? <CheckCircle2 className="w-4 h-4 text-green-500" onClick={() => toggleItem(item.id)} />
                                : <Circle className={`w-4 h-4 ${PRIORITY_COLORS[item.priority]}`} onClick={() => toggleItem(item.id)} />
                              }
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm leading-relaxed ${checked.has(item.id) ? "line-through text-stone-400" : "text-stone-700"}`}>
                                  {item.text}
                                </span>
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                                  item.priority === "must" ? "bg-red-50 text-red-600" :
                                  item.priority === "should" ? "bg-amber-50 text-amber-600" :
                                  "bg-peach-50/30 text-stone-400"
                                }`}>
                                  {PRIORITY_LABELS[item.priority]}
                                </span>
                              </div>
                              {item.detail && !checked.has(item.id) && (
                                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{item.detail}</p>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Readiness summary */}
          {readyPct === 100 && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-800">All must-haves complete for {stage.title}!</p>
                <p className="text-sm text-green-700 mt-0.5">You're ready to start fundraising at this stage. Check off the "should have" items for maximum readiness.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
