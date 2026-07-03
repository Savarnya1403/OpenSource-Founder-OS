"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Wallet, TrendingUp, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

// ─── Cost of Living Data (India cities, 2025) ──────────────────────────────

const CITIES: Record<string, { label: string; monthly_expenses_inr: number; rent_1bhk: number; tier: 1 | 2 | 3 }> = {
  mumbai:    { label: "Mumbai",    monthly_expenses_inr: 65000,  rent_1bhk: 35000, tier: 1 },
  delhi:     { label: "Delhi NCR", monthly_expenses_inr: 55000,  rent_1bhk: 28000, tier: 1 },
  bengaluru: { label: "Bengaluru", monthly_expenses_inr: 58000,  rent_1bhk: 30000, tier: 1 },
  hyderabad: { label: "Hyderabad", monthly_expenses_inr: 48000,  rent_1bhk: 22000, tier: 1 },
  pune:      { label: "Pune",      monthly_expenses_inr: 45000,  rent_1bhk: 20000, tier: 2 },
  chennai:   { label: "Chennai",   monthly_expenses_inr: 44000,  rent_1bhk: 19000, tier: 2 },
  kolkata:   { label: "Kolkata",   monthly_expenses_inr: 40000,  rent_1bhk: 15000, tier: 2 },
  ahmedabad: { label: "Ahmedabad", monthly_expenses_inr: 35000,  rent_1bhk: 14000, tier: 2 },
  jaipur:    { label: "Jaipur",    monthly_expenses_inr: 30000,  rent_1bhk: 12000, tier: 3 },
  indore:    { label: "Indore",    monthly_expenses_inr: 28000,  rent_1bhk: 10000, tier: 3 },
  chandigarh:{ label: "Chandigarh",monthly_expenses_inr: 32000,  rent_1bhk: 13000, tier: 3 },
  surat:     { label: "Surat",     monthly_expenses_inr: 29000,  rent_1bhk: 11000, tier: 3 },
};

const STAGES: Record<string, { label: string; mrr_median: number; salary_multiplier: number; desc: string }> = {
  idea:      { label: "Idea / Pre-Product", mrr_median: 0,      salary_multiplier: 0.3,  desc: "₹0 MRR" },
  mvp:       { label: "MVP / Early Traction", mrr_median: 50000,  salary_multiplier: 0.5,  desc: "₹10K-₹2L MRR" },
  pmf:       { label: "Finding PMF",    mrr_median: 300000, salary_multiplier: 0.7,  desc: "₹2L-₹10L MRR" },
  growth:    { label: "Early Growth",   mrr_median: 1000000,salary_multiplier: 0.85, desc: "₹10L-₹50L MRR" },
  scale:     { label: "Scaling",        mrr_median: 5000000,salary_multiplier: 1.0,  desc: "₹50L+ MRR" },
};

// ─── Calculation engine ────────────────────────────────────────────────────

function calcSalary({
  city, stage, mrr, burnRate, coFounders, hasInvestors, bootstrapped
}: {
  city: string; stage: string; mrr: number; burnRate: number;
  coFounders: number; hasInvestors: boolean; bootstrapped: boolean;
}) {
  const cityData  = CITIES[city];
  const stageData = STAGES[stage];
  const monthly   = cityData.monthly_expenses_inr;

  // Base: cover living expenses
  const base = monthly * 1.3;   // 30% buffer

  // Stage adjustment
  const stageAdj = stageData.salary_multiplier;

  // MRR factor — if generating revenue, scale up
  const mrrFactor = mrr > 0 ? Math.min(1.5, 1 + (mrr / 2000000)) : 0.6;

  // Burn rate check — never draw > 15% of monthly burn
  const burnCap = burnRate * 0.15;

  // Co-founder adjustment (more founders = lower individual salary at early stage)
  const cofounderAdj = coFounders === 1 ? 1.15 : coFounders === 2 ? 1.0 : 0.90;

  // Investor flag — investors generally expect modest founder salaries pre-PMF
  const investorAdj = hasInvestors ? 0.95 : 1.0;

  // Bootstrap — can pay more from revenue
  const bootstrapAdj = bootstrapped ? 1.1 : 1.0;

  const recommended = Math.round(
    Math.min(
      base * stageAdj * mrrFactor * cofounderAdj * investorAdj * bootstrapAdj,
      burnCap > 0 ? burnCap : Infinity
    ) / 1000
  ) * 1000;

  const minimum = Math.round(monthly * 0.8 / 1000) * 1000;
  const maximum = Math.round(
    Math.min(recommended * 1.5, burnRate * 0.20) / 1000
  ) * 1000;

  const reasoning: string[] = [];
  if (mrr === 0) reasoning.push("No MRR yet — keep salary minimal to extend runway");
  if (burnRate > 0 && recommended > burnRate * 0.15) reasoning.push("Capped at 15% of monthly burn rate — investor best practice");
  if (hasInvestors) reasoning.push("With investors, keep salary below market to signal conviction");
  if (bootstrapped) reasoning.push("Bootstrap: allocate more from recurring revenue since you own the business");
  if (city === "mumbai" || city === "bengaluru") reasoning.push(`${cityData.label} COL is high — baseline covers rent + essentials`);

  const radarData = [
    { subject: "COL Coverage", value: Math.round((recommended / monthly) * 100) },
    { subject: "Runway Impact", value: burnRate > 0 ? Math.round((1 - recommended / burnRate) * 100) : 80 },
    { subject: "Traction-based", value: Math.round(stageAdj * 100) },
    { subject: "Market Rate", value: Math.round(mrrFactor * 70) },
    { subject: "Team Fairness", value: Math.round(cofounderAdj * 85) },
  ];

  return { recommended, minimum, maximum, reasoning, radarData, cityData, stageData };
}

function fmt(n: number) {
  if (n >= 100000) return `₹${(n/100000).toFixed(1)}L/mo`;
  return `₹${(n/1000).toFixed(0)}K/mo`;
}

export default function SalaryCalcPage() {
  const [city, setCity]             = useState("bengaluru");
  const [stage, setStage]           = useState("mvp");
  const [mrr, setMrr]               = useState(0);
  const [burnRate, setBurnRate]      = useState(500000);
  const [coFounders, setCoFounders]  = useState(2);
  const [hasInvestors, setHasInvestors] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const result = useMemo(
    () => calcSalary({ city, stage, mrr, burnRate, coFounders, hasInvestors, bootstrapped }),
    [city, stage, mrr, burnRate, coFounders, hasInvestors, bootstrapped]
  );

  function SliderField({ label, value, min, max, step, unit, onChange, hint }: {
    label: string; value: number; min: number; max: number; step: number;
    unit: string; onChange: (v: number) => void; hint?: string;
  }) {
    const display = unit === "₹" ? `₹${(value/1000).toFixed(0)}K` : `${value} ${unit}`;
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <label className="text-xs font-medium text-stone-600">{label}</label>
          <span className="text-xs font-bold text-peach-600">{display}</span>
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FF8C42 0%, #FF8C42 ${((value-min)/(max-min))*100}%, #FFD6C2 ${((value-min)/(max-min))*100}%, #FFD6C2 100%)`,
          }}
        />
        {hint && <p className="text-[10px] text-stone-300">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-8 py-3 glass-strong border-b border-peach-200/30 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-peach-500" />
          <span className="text-sm font-semibold text-stone-700">Founder Salary Calculator</span>
          <span className="badge-peach ml-2">India COL Data</span>
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">What Should You Pay Yourself?</h1>
            <p className="text-stone-400 text-sm leading-relaxed">
              Based on your city's cost of living, traction stage, burn rate, and investor expectations.
              Uses real India 2025 COL data across 12 cities.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              {/* City */}
              <div className="glass rounded-2xl p-5">
                <p className="section-label mb-3">Your City</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CITIES).map(([key, c]) => (
                    <button
                      key={key}
                      onClick={() => setCity(key)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                        city === key
                          ? "btn-coral"
                          : "bg-white/50 border border-peach-200/40 text-stone-500 hover:bg-peach-50"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-stone-400 bg-peach-50/60 rounded-lg px-3 py-2">
                  <Info className="w-3.5 h-3.5 text-peach-400 shrink-0" />
                  <span>1BHK rent in {CITIES[city].label}: ₹{(CITIES[city].rent_1bhk/1000).toFixed(0)}K/mo</span>
                </div>
              </div>

              {/* Stage */}
              <div className="glass rounded-2xl p-5">
                <p className="section-label mb-3">Startup Stage</p>
                <div className="space-y-2">
                  {Object.entries(STAGES).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => setStage(key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                        stage === key
                          ? "bg-peach-100 border-2 border-peach-400 text-peach-800"
                          : "bg-white/40 border border-peach-100/60 text-stone-600 hover:bg-peach-50"
                      }`}
                    >
                      <span className="font-medium">{s.label}</span>
                      <span className="text-stone-400">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial inputs */}
              <div className="glass rounded-2xl p-5 space-y-5">
                <p className="section-label">Financial Inputs</p>
                <SliderField
                  label="Monthly Recurring Revenue (MRR)"
                  value={mrr} min={0} max={10000000} step={50000} unit="₹"
                  onChange={setMrr}
                  hint="₹0 if pre-revenue"
                />
                <SliderField
                  label="Monthly Burn Rate"
                  value={burnRate} min={100000} max={10000000} step={50000} unit="₹"
                  onChange={setBurnRate}
                  hint="Total monthly cash outflow (incl. salaries, ops)"
                />
                <div className="space-y-2">
                  <label className="text-xs font-medium text-stone-600">Number of Co-founders</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setCoFounders(n)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                          coFounders === n ? "btn-coral" : "bg-white/50 border border-peach-200/40 text-stone-500"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="glass rounded-2xl p-5">
                <p className="section-label mb-3">Additional Factors</p>
                <div className="space-y-3">
                  {[
                    { label: "I have external investors (VC / Angel)", value: hasInvestors, onChange: setHasInvestors, hint: "Investors expect modest salaries pre-Series A" },
                    { label: "Bootstrapped (self-funded)", value: bootstrapped, onChange: setBootstrapped, hint: "You can pay more from recurring revenue" },
                  ].map(({ label, value, onChange, hint }) => (
                    <div key={label} className="flex items-start gap-3">
                      <button
                        onClick={() => onChange(!value)}
                        className={`w-10 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${value ? "bg-peach-500" : "bg-stone-200"}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${value ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                      <div>
                        <p className="text-xs font-medium text-stone-700">{label}</p>
                        <p className="text-[11px] text-stone-400">{hint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {/* Primary recommendation */}
              <div className="glass rounded-2xl p-6 text-center border-peach-300/40" style={{ background: "linear-gradient(135deg, rgba(255,240,229,0.8) 0%, rgba(255,214,194,0.6) 100%)" }}>
                <p className="section-label mb-2">Recommended Monthly Salary</p>
                <div className="text-5xl font-extrabold text-peach-700 mb-1">
                  {fmt(result.recommended)}
                </div>
                <p className="text-sm text-stone-500">
                  ≈ ₹{(result.recommended * 12 / 100000).toFixed(1)}L per annum
                </p>
              </div>

              {/* Range */}
              <div className="glass rounded-2xl p-5">
                <p className="section-label mb-4">Salary Range</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                    <p className="text-[10px] text-red-500 font-semibold mb-1">Minimum</p>
                    <p className="text-base font-bold text-red-700">{fmt(result.minimum)}</p>
                    <p className="text-[10px] text-stone-400 mt-1">Covers basics</p>
                  </div>
                  <div className="bg-peach-100/60 border-2 border-peach-400 rounded-xl p-3">
                    <p className="text-[10px] text-peach-600 font-semibold mb-1">Recommended</p>
                    <p className="text-base font-bold text-peach-700">{fmt(result.recommended)}</p>
                    <p className="text-[10px] text-stone-400 mt-1">Optimal balance</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                    <p className="text-[10px] text-green-600 font-semibold mb-1">Maximum</p>
                    <p className="text-base font-bold text-green-700">{fmt(Math.max(result.maximum, result.recommended))}</p>
                    <p className="text-[10px] text-stone-400 mt-1">If hitting targets</p>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="glass rounded-2xl p-5">
                <p className="section-label mb-3">Why This Number?</p>
                <div className="space-y-2">
                  {result.reasoning.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-stone-600">
                      <Info className="w-3.5 h-3.5 text-peach-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{r}</span>
                    </div>
                  ))}
                  <div className="flex items-start gap-2 text-xs text-stone-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span>{CITIES[city].label} monthly living cost: ₹{(CITIES[city].monthly_expenses_inr/1000).toFixed(0)}K (incl. ₹{(CITIES[city].rent_1bhk/1000).toFixed(0)}K rent)</span>
                  </div>
                </div>
              </div>

              {/* Radar */}
              <div className="glass rounded-2xl p-5">
                <p className="section-label mb-3">Salary Health Score</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={result.radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="rgba(255,200,160,0.40)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#6b6361" }} />
                    <Radar dataKey="value" stroke="#FF8C42" fill="#FF8C42" fillOpacity={0.25} />
                    <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, ""] as [string, string]} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* COL breakdown */}
              <div className="glass rounded-2xl p-5">
                <p className="section-label mb-3">Cost of Living Breakdown — {CITIES[city].label}</p>
                <div className="space-y-2">
                  {[
                    { label: "Rent (1BHK)", amount: CITIES[city].rent_1bhk },
                    { label: "Food & groceries", amount: Math.round(CITIES[city].monthly_expenses_inr * 0.20) },
                    { label: "Transport", amount: Math.round(CITIES[city].monthly_expenses_inr * 0.10) },
                    { label: "Utilities & internet", amount: Math.round(CITIES[city].monthly_expenses_inr * 0.06) },
                    { label: "Healthcare & misc", amount: Math.round(CITIES[city].monthly_expenses_inr * 0.08) },
                    { label: "Buffer / savings", amount: Math.round(CITIES[city].monthly_expenses_inr * 0.16) },
                  ].map(({ label, amount }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">{label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-peach-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-peach-400"
                            style={{ width: `${(amount / CITIES[city].monthly_expenses_inr) * 100}%` }}
                          />
                        </div>
                        <span className="font-semibold text-stone-700 w-16 text-right">₹{(amount/1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-peach-200/40 pt-2 flex justify-between text-xs font-bold">
                    <span className="text-stone-700">Total Monthly</span>
                    <span className="text-peach-700">₹{(CITIES[city].monthly_expenses_inr/1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>

              {/* YC context */}
              <div className="glass rounded-2xl p-4 bg-amber-50/40 border-amber-200/40">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-stone-700">YC Partner Perspective</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  YC partners advise keeping founder salaries at{" "}
                  <strong>≤₹1L/month at Seed stage</strong> — not because you don&apos;t deserve more,
                  but because it extends runway and signals commitment to co-founders and investors.
                  Once you hit ₹50L ARR, scale your salary proportionally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
