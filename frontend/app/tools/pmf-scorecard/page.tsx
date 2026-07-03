"use client";
import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Gauge, RotateCcw, ChevronDown, ChevronUp, TrendingUp, Info } from "lucide-react";

const STORAGE_KEY = "openfounder_pmf_scorecard";

type Sector = "b2b_saas" | "d2c" | "fintech" | "edtech" | "marketplace";

interface Question {
  id: string;
  dimension: string;
  dimensionIndex: number;
  text: string;
  subtext: string;
  type: "slider" | "radio";
  options?: { label: string; value: number; description: string }[];
  min?: number;
  max?: number;
  labels?: string[];
}

const QUESTIONS: Question[] = [
  {
    id: "retention_1", dimension: "Retention", dimensionIndex: 0,
    text: "What % of users who signed up 3 months ago are still active today?",
    subtext: "Active = using your product at least once in the last 30 days",
    type: "radio",
    options: [
      { value: 0, label: "< 10%", description: "Significant churn — product-market fit is not yet established" },
      { value: 2, label: "10–20%", description: "Early signs of retention but losing most users" },
      { value: 4, label: "21–40%", description: "Moderate retention — improving but needs work" },
      { value: 7, label: "41–60%", description: "Good retention — you're solving a real problem" },
      { value: 10, label: "> 60%", description: "Excellent retention — strong PMF signal" },
    ]
  },
  {
    id: "retention_2", dimension: "Retention", dimensionIndex: 0,
    text: "How often do your most active users use the product?",
    subtext: "Think about your top 20% of users",
    type: "radio",
    options: [
      { value: 0, label: "Rarely / once a month", description: "Low engagement — may be a nice-to-have" },
      { value: 2, label: "A few times a month", description: "Infrequent but recurring usage" },
      { value: 5, label: "Once a week", description: "Moderate habit formation" },
      { value: 8, label: "Multiple times a week", description: "Strong habit loop forming" },
      { value: 10, label: "Daily or multiple times a day", description: "Core workflow integration — strong PMF" },
    ]
  },
  {
    id: "revenue_1", dimension: "Revenue", dimensionIndex: 1,
    text: "Are customers paying for the product?",
    subtext: "And are they paying willingly — not because of a heavy discount or personal favour?",
    type: "radio",
    options: [
      { value: 0, label: "No — it's free/beta", description: "No revenue signal yet" },
      { value: 2, label: "Some freemium, no paid", description: "Users like it but not enough to pay" },
      { value: 4, label: "A few paying pilots (heavily discounted)", description: "Early revenue with significant pricing pressure" },
      { value: 7, label: "Paying customers at intended price point", description: "Clear willingness to pay — strong signal" },
      { value: 10, label: "Customers upgraded / expanded revenue", description: "Net Revenue Retention > 100% — exceptional PMF signal" },
    ]
  },
  {
    id: "revenue_2", dimension: "Revenue", dimensionIndex: 1,
    text: "What is your MoM revenue growth over the last 3 months?",
    subtext: "Calculate: (this month revenue / 3 months ago revenue)^(1/3) - 1",
    type: "radio",
    options: [
      { value: 0, label: "Revenue declining or flat", description: "Churn is outpacing growth" },
      { value: 2, label: "1–5% MoM", description: "Slow but present growth" },
      { value: 4, label: "6–15% MoM", description: "Moderate growth (100-400% annualized)" },
      { value: 7, label: "16–30% MoM", description: "Strong growth (600-2,200% annualized)" },
      { value: 10, label: "> 30% MoM", description: "Exceptional growth — strong PMF with GTM working" },
    ]
  },
  {
    id: "referral_1", dimension: "Referral", dimensionIndex: 2,
    text: "How disappointed would your users be if your product disappeared tomorrow?",
    subtext: "Survey your active users honestly. Based on Sean Ellis's PMF survey",
    type: "radio",
    options: [
      { value: 0, label: "< 20% 'Very Disappointed'", description: "Not PMF — users can live without you" },
      { value: 3, label: "20–30% 'Very Disappointed'", description: "Approaching PMF — keep iterating" },
      { value: 6, label: "31–40% 'Very Disappointed'", description: "Likely PMF — focus on the disappointed segment" },
      { value: 8, label: "> 40% 'Very Disappointed'", description: "Strong PMF — these are your true fans" },
      { value: 10, label: "> 50% 'Very Disappointed'", description: "Exceptional PMF — focus on scaling now" },
    ]
  },
  {
    id: "referral_2", dimension: "Referral", dimensionIndex: 2,
    text: "How much of your new user acquisition comes from word of mouth or referrals?",
    subtext: "Track your acquisition sources for the last 30 days",
    type: "radio",
    options: [
      { value: 0, label: "Almost none — all paid/outbound", description: "No organic pull — product doesn't market itself" },
      { value: 2, label: "< 10% organic", description: "Minimal word of mouth" },
      { value: 5, label: "10–30% organic", description: "Early viral loop forming" },
      { value: 8, label: "31–60% organic", description: "Strong word of mouth — product is talking" },
      { value: 10, label: "> 60% organic", description: "Exceptional virality — classic PMF signal" },
    ]
  },
  {
    id: "engagement_1", dimension: "Engagement", dimensionIndex: 3,
    text: "How deeply do users engage with your core feature (not just sign up)?",
    subtext: "Core feature = the thing that creates the most value",
    type: "radio",
    options: [
      { value: 0, label: "Most users never reach the core feature", description: "Activation is broken" },
      { value: 2, label: "< 20% reach core feature", description: "Significant onboarding drop-off" },
      { value: 4, label: "20–40% reach core feature", description: "Moderate activation rate" },
      { value: 7, label: "40–70% reach core feature", description: "Good activation — onboarding working" },
      { value: 10, label: "> 70% reach core feature", description: "Excellent activation — your value proposition is clear" },
    ]
  },
  {
    id: "engagement_2", dimension: "Engagement", dimensionIndex: 3,
    text: "How many of your active users are 'power users' (use 3+ features consistently)?",
    subtext: "Power users = the ones who would be most upset if you removed a feature",
    type: "radio",
    options: [
      { value: 0, label: "< 5%", description: "Single use case — vulnerable to point solutions" },
      { value: 2, label: "5–15%", description: "Some multi-feature adoption" },
      { value: 5, label: "16–30%", description: "Moderate feature breadth adoption" },
      { value: 8, label: "31–50%", description: "Strong multi-feature use — sticky product" },
      { value: 10, label: "> 50%", description: "Exceptional depth — users rely on your full suite" },
    ]
  },
  {
    id: "market_pull_1", dimension: "Market Pull", dimensionIndex: 4,
    text: "How difficult is it to close your deals / acquire customers?",
    subtext: "Think about the effort required relative to the deal size",
    type: "radio",
    options: [
      { value: 0, label: "Extremely difficult — lots of objections, long cycles", description: "Significant market resistance — messaging or product problem" },
      { value: 2, label: "Hard — requires many touchpoints", description: "Push selling is required" },
      { value: 4, label: "Moderate effort", description: "Standard sales motion" },
      { value: 7, label: "Relatively easy — customers pull us", description: "Inbound interest exceeds outbound" },
      { value: 10, label: "Customers find us and close themselves", description: "Classic market pull — PLG or strong inbound" },
    ]
  },
  {
    id: "market_pull_2", dimension: "Market Pull", dimensionIndex: 4,
    text: "How do you know your ICP (Ideal Customer Profile)? Can you describe them in 1 sentence?",
    subtext: "Clarity of ICP is a leading indicator of PMF — if you can't describe them, you don't have it yet",
    type: "radio",
    options: [
      { value: 0, label: "Not yet — we serve everyone", description: "No ICP definition — still exploring" },
      { value: 2, label: "Rough idea — multiple possible ICPs", description: "Fuzzy targeting" },
      { value: 4, label: "A few ICPs we've tested", description: "Narrowing down but not decisive" },
      { value: 7, label: "Clear ICP with data to back it", description: "Defined ICP based on actual customer patterns" },
      { value: 10, label: "Laser-sharp ICP, documented, replicated in last 5 deals", description: "Repeatable ICP — ready to scale" },
    ]
  },
];

const DIMENSIONS = ["Retention", "Revenue", "Referral", "Engagement", "Market Pull"];
const MAX_SCORE = 100;

const STAGES = [
  { min: 0, max: 24, label: "Pre-PMF", color: "text-red-600 bg-red-100", description: "Early stage — focus on qualitative discovery. Talk to 50 potential customers before optimizing anything.", advice: "Run 50 customer interviews in the next 30 days. Use the Customer Discovery CRM to track patterns. Focus on understanding the pain, not selling the solution." },
  { min: 25, max: 44, label: "PMF Approaching", color: "text-orange-600 bg-orange-100", description: "You have some signal but need to strengthen it. Likely 1-2 dimensions working, rest still weak.", advice: "Identify your top 10 power users and build exclusively for them for 90 days. Ignore the rest. The goal is to make that segment feel like you built this just for them." },
  { min: 45, max: 59, label: "Weak PMF", color: "text-amber-600 bg-amber-100", description: "Multiple signals present but not yet durable. You can scale slowly but not yet pour fuel on the fire.", advice: "You have PMF in a narrow segment. Before scaling, harden retention and referral. Hit 40%+ on Sean Ellis survey in your ICP before ramping paid acquisition." },
  { min: 60, max: 79, label: "Moderate PMF", color: "text-green-600 bg-green-100", description: "Clear PMF in your target segment. Time to build the engine — channel repeatability and unit economics.", advice: "PMF is validated. Now build the revenue engine. Focus on repeatability: can you hire 2 salespeople and they close at the same rate? That's your scaling test." },
  { min: 80, max: 100, label: "Strong PMF", color: "text-emerald-700 bg-emerald-100", description: "You've found it. The product sells itself in your segment. Focus on scaling GTM and expanding adjacencies.", advice: "You have strong PMF. Raise money now if you need it — this is your best fundraising leverage. Focus on expanding the ICP adjacent segments without breaking what's working." },
];

const SECTOR_BENCHMARKS: Record<Sector, { label: string; benchmarks: { dimension: string; note: string }[] }> = {
  b2b_saas: { label: "B2B SaaS", benchmarks: [
    { dimension: "Retention", note: "Best-in-class: >85% annual retention. PMF threshold: >70% annual. Monthly churn > 3% is a red flag." },
    { dimension: "Revenue", note: "Seed PMF signal: ₹10-50L ARR with 2-3x YoY. Series A benchmark: ₹1-5 Cr ARR, 80%+ gross margin." },
    { dimension: "Referral", note: "Enterprise B2B rarely has viral referrals. Focus on NPS > 40 and case studies driving inbound." },
    { dimension: "Engagement", note: "DAU/MAU > 25% is strong for B2B. Weekly active use by the primary user role is the target." },
    { dimension: "Market Pull", note: "Deal velocity: average time to close should decrease over the first 20 deals as you refine ICP." },
  ]},
  d2c: { label: "D2C / Consumer", benchmarks: [
    { dimension: "Retention", note: "D2C PMF benchmark: >40% repeat purchase rate in 90 days. LTV:CAC > 3x. High reorder rate is the signal." },
    { dimension: "Revenue", note: "Gross margin > 40% is minimum. Premium D2C brands target 60-70%. Margins signal pricing power." },
    { dimension: "Referral", note: "Referral and UGC are critical for D2C. Target CAC below ₹500 for mass market, ₹2,000 for premium." },
    { dimension: "Engagement", note: "App / website return visits, review rates, and community participation signal deep engagement." },
    { dimension: "Market Pull", note: "D2C PMF shows up in organic social. If customers post about you unprompted, you're close." },
  ]},
  fintech: { label: "FinTech", benchmarks: [
    { dimension: "Retention", note: "Lending/payments: transactional retention. Look at MAU stability and reducing dormancy. >60% 6-month retention is strong." },
    { dimension: "Revenue", note: "Take rate and net interest margin are your metrics. FinTech PMF often shows in improving risk metrics alongside growth." },
    { dimension: "Referral", note: "Trust is paramount. Customer referrals in FinTech signal trust — rare and very valuable. Track referral NPS separately." },
    { dimension: "Engagement", note: "Transaction frequency and wallet share are the key signals. Are customers consolidating more activity with you?" },
    { dimension: "Market Pull", note: "Regulatory-driven adoption isn't PMF — look for customers who would use you even without mandates." },
  ]},
  edtech: { label: "EdTech", benchmarks: [
    { dimension: "Retention", note: "Course completion > 70% is exceptional. PMF signal: >50% of students enroll in a second course within 6 months." },
    { dimension: "Revenue", note: "EdTech has high CAC due to long sales cycles. Look at payback period < 12 months for sustainability." },
    { dimension: "Referral", note: "Student referrals and placement outcomes are EdTech's strongest signals. Track outcome-based referrals." },
    { dimension: "Engagement", note: "Live session attendance, assignment completion, and community participation are engagement proxies." },
    { dimension: "Market Pull", note: "EdTech PMF often comes from enterprise B2B (L&D budgets) rather than direct-to-student — identify where pull exists." },
  ]},
  marketplace: { label: "Marketplace", benchmarks: [
    { dimension: "Retention", note: "Supply and demand retention must both be tracked. If supply-side churns, the marketplace collapses. Measure both sides." },
    { dimension: "Revenue", note: "Gross Merchandise Value (GMV) and take rate. India marketplace benchmarks: 8-20% take rate depending on category." },
    { dimension: "Referral", note: "Marketplace PMF shows in organic supply-side growth — sellers/providers finding you without paid acquisition." },
    { dimension: "Engagement", note: "Repeat transactions and increasing basket size from existing users signals marketplace habit formation." },
    { dimension: "Market Pull", note: "Liquidity is the PMF signal for marketplaces. If buyers find what they want quickly and sellers get jobs, you have PMF." },
  ]},
};

type Answers = Record<string, number>;

export default function PMFScorecardPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [sector, setSector] = useState<Sector>("b2b_saas");
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setAnswers(data.answers || {});
      setSector(data.sector || "b2b_saas");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, sector }));
  }, [answers, sector]);

  const totalScore = useMemo(() => Object.values(answers).reduce((s, v) => s + v, 0), [answers]);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / QUESTIONS.length) * 100;

  const dimensionScores = useMemo(() => {
    return DIMENSIONS.map((dim) => {
      const qs = QUESTIONS.filter((q) => q.dimension === dim);
      const score = qs.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
      const max = 20;
      return { dim, score, max, pct: Math.round((score / max) * 100) };
    });
  }, [answers]);

  const stage = STAGES.find((s) => totalScore >= s.min && totalScore <= s.max) ?? STAGES[0];

  const reset = () => {
    setAnswers({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 glass-strong border-b border-peach-200/30 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-peach-500" />
            <span className="text-sm font-semibold text-stone-700">PMF Scorecard</span>
            {answeredCount > 0 && <span className="badge-peach">{answeredCount}/{QUESTIONS.length} answered</span>}
          </div>
          {answeredCount > 0 && (
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        <div className="p-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Product-Market Fit Scorecard</h1>
            <p className="text-stone-400 text-sm">10-question self-assessment across 5 dimensions. India sector benchmarks included.</p>
          </div>

          {/* Progress and score */}
          <div className="glass rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase mb-1 section-label">Your PMF Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-stone-900">{answeredCount === QUESTIONS.length ? totalScore : "--"}</span>
                  <span className="text-lg text-stone-300 mb-1">/ {MAX_SCORE}</span>
                </div>
              </div>
              {answeredCount === QUESTIONS.length && (
                <div className={`px-4 py-2 rounded-xl text-sm font-bold ${stage.color}`}>{stage.label}</div>
              )}
            </div>
            <div className="w-full bg-peach-100/40 rounded-full h-2 mb-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-peach-400 to-coral transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[11px] text-stone-400">{answeredCount === QUESTIONS.length ? "All questions answered" : `${QUESTIONS.length - answeredCount} questions remaining`}</p>

            {answeredCount === QUESTIONS.length && (
              <div className="mt-4 bg-peach-50/60 rounded-xl p-4 border border-peach-100/40">
                <p className="text-xs text-stone-500 mb-1 font-medium">{stage.description}</p>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">💡 {stage.advice}</p>
              </div>
            )}
          </div>

          {/* Dimension scores */}
          {answeredCount > 0 && (
            <div className="glass rounded-2xl p-5 mb-6 shadow-sm">
              <p className="text-xs font-semibold text-stone-500 uppercase mb-4 section-label">Score by Dimension</p>
              <div className="space-y-3">
                {dimensionScores.map(({ dim, score, max, pct }) => (
                  <div key={dim} className="flex items-center gap-3">
                    <span className="w-28 text-xs font-medium text-stone-700 shrink-0">{dim}</span>
                    <div className="flex-1 bg-peach-100/40 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-peach-400 to-coral transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-stone-600 font-semibold w-14 text-right">{score}/{max} ({pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sector selector */}
          <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-stone-500 shrink-0">Your sector:</span>
            {(Object.keys(SECTOR_BENCHMARKS) as Sector[]).map((s) => (
              <button key={s} onClick={() => setSector(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${sector === s ? "btn-coral" : "btn-ghost-peach"}`}>
                {SECTOR_BENCHMARKS[s].label}
              </button>
            ))}
            <button onClick={() => setShowBenchmarks((p) => !p)} className="ml-auto text-xs text-peach-500 hover:text-peach-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {showBenchmarks ? "Hide" : "Show"} {SECTOR_BENCHMARKS[sector].label} benchmarks
            </button>
          </div>

          {/* Benchmarks */}
          {showBenchmarks && (
            <div className="glass rounded-2xl p-5 mb-6 shadow-sm border border-peach-100/40">
              <p className="text-xs font-bold text-stone-700 mb-3">{SECTOR_BENCHMARKS[sector].label} PMF Benchmarks</p>
              <div className="space-y-3">
                {SECTOR_BENCHMARKS[sector].benchmarks.map((b) => (
                  <div key={b.dimension} className="flex gap-3">
                    <span className="w-24 text-xs font-semibold text-peach-600 shrink-0 pt-0.5">{b.dimension}</span>
                    <p className="text-xs text-stone-600 leading-relaxed">{b.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions grouped by dimension */}
          {DIMENSIONS.map((dim, dimIndex) => {
            const qs = QUESTIONS.filter((q) => q.dimension === dim);
            const dimScore = dimensionScores[dimIndex];
            const isExpanded = expandedDimension === null || expandedDimension === dim;
            return (
              <div key={dim} className="glass rounded-2xl mb-4 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-peach-50/20 transition-colors"
                  onClick={() => setExpandedDimension(isExpanded && expandedDimension === dim ? null : dim)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-stone-900">{dim}</span>
                    <span className="text-xs text-stone-400">{qs.filter((q) => answers[q.id] !== undefined).length}/{qs.length} answered</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {dimScore.score > 0 && <span className={`text-xs font-bold px-3 py-1 rounded-full ${dimScore.pct >= 70 ? "bg-green-100 text-green-700" : dimScore.pct >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{dimScore.score}/{dimScore.max}</span>}
                    {expandedDimension === dim ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </div>
                </button>
                {expandedDimension === dim && (
                  <div className="px-5 pb-5 space-y-6 border-t border-peach-100/40 pt-4">
                    {qs.map((q) => (
                      <div key={q.id}>
                        <p className="text-sm font-semibold text-stone-800 mb-0.5">{q.text}</p>
                        <p className="text-xs text-stone-400 mb-3 flex items-center gap-1"><Info className="w-3 h-3" />{q.subtext}</p>
                        <div className="space-y-2">
                          {q.options?.map((opt) => (
                            <button key={opt.value} onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                              className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all border ${answers[q.id] === opt.value ? "border-peach-400 bg-peach-50/60 text-stone-800 font-semibold" : "border-peach-100/40 hover:border-peach-200 hover:bg-peach-50/30 text-stone-600"}`}>
                              <div className="flex items-start gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${answers[q.id] === opt.value ? "border-peach-500 bg-peach-500" : "border-stone-300"}`}>
                                  {answers[q.id] === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                                <div>
                                  <span className="font-semibold">{opt.label}</span>
                                  <span className="text-stone-400 ml-2 text-[11px]">{opt.description}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {expandedDimension !== dim && (
                  <div className="px-5 pb-4 -mt-2">
                    <button onClick={() => setExpandedDimension(dim)} className="text-xs text-peach-500 hover:text-peach-700 font-medium">
                      Answer {qs.length} questions →
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-6 glass rounded-2xl p-5 text-center">
            <p className="text-xs text-stone-400 leading-relaxed">
              PMF framework based on Sean Ellis's "40% Very Disappointed" test, Sequoia's definition of PMF, and Ranjit Rao's India-specific benchmarks.<br />
              Scores are self-reported — be honest for accurate results. Revisit every 4-6 weeks to track progress.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
