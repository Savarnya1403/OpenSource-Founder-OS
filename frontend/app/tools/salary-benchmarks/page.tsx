"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { IndianRupee, ChevronDown, ChevronUp, Info } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

type CityKey = "bengaluru" | "mumbai" | "delhi_ncr" | "hyderabad" | "pune";
type StageKey = "pre_seed" | "seed" | "series_a";

const CITY_LABELS: Record<CityKey, string> = {
  bengaluru: "Bengaluru",
  mumbai: "Mumbai",
  delhi_ncr: "Delhi NCR",
  hyderabad: "Hyderabad",
  pune: "Pune",
};

const STAGE_LABELS: Record<StageKey, string> = {
  pre_seed: "Pre-Seed",
  seed: "Seed",
  series_a: "Series A",
};

const FUNCTION_LABELS: Record<string, string> = {
  "": "All Functions",
  engineering: "Engineering",
  product: "Product",
  design: "Design",
  growth: "Growth / Marketing",
  business: "Business",
  finance: "Finance",
};

interface SalaryRange {
  min: number; max: number; median: number; p25: number; p75: number;
}

interface Role {
  id: string;
  title: string;
  function: string;
  level: string;
  years_experience: string;
  description: string;
  typical_scope: string;
  esop_typical_range: string;
  esop_notes: string;
  hiring_tips: string;
  interview_signal: string;
  cities: Record<CityKey, Record<StageKey, SalaryRange>>;
}

function formatL(amount: number): string {
  return `₹${(amount / 100000).toFixed(1)}L`;
}

function SalaryBar({ range, color }: { range: SalaryRange; color: string }) {
  const max = range.max;
  const pct = (v: number) => `${((v / max) * 100).toFixed(1)}%`;
  return (
    <div className="space-y-1.5">
      <div className="relative h-4 bg-peach-100/40 rounded-full overflow-hidden">
        <div className="absolute top-0 h-full bg-peach-200/60 rounded-full" style={{ left: pct(range.p25), width: pct(range.p75 - range.p25) }} />
        <div className="absolute top-0 h-full w-0.5 bg-peach-600" style={{ left: pct(range.median) }} />
        <div className="absolute top-0 h-full w-0.5 bg-stone-400/60" style={{ left: "0%" }} />
      </div>
      <div className="flex justify-between text-[10px] text-stone-400">
        <span>Min {formatL(range.min)}</span>
        <span className="text-peach-600 font-semibold">Median {formatL(range.median)}</span>
        <span>Max {formatL(range.max)}</span>
      </div>
    </div>
  );
}

export default function SalaryBenchmarksPage() {
  const [filterFunction, setFilterFunction] = useState("");
  const [filterCity, setFilterCity] = useState<CityKey | "">("");
  const [filterStage, setFilterStage] = useState<StageKey | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<CityKey>("bengaluru");
  const [activeStage, setActiveStage] = useState<StageKey>("seed");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["salary-benchmarks", filterFunction, filterCity, filterStage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterFunction) params.set("function", filterFunction);
      if (filterCity) params.set("city", filterCity);
      if (filterStage) params.set("stage", filterStage);
      const res = await fetch(`${API}/api/tools/salary-benchmarks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ roles: Role[]; total: number }>;
    },
  });

  const { data: metaData } = useQuery({
    queryKey: ["salary-meta"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/tools/salary-benchmarks/roles`);
      return res.json() as Promise<{ functions: string[]; cities: string[]; stages: string[] }>;
    },
  });

  const roles = data?.roles ?? [];
  const grouped = roles.reduce<Record<string, Role[]>>((acc, r) => {
    const fn = r.function;
    if (!acc[fn]) acc[fn] = [];
    acc[fn].push(r);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 glass-strong border-b border-peach-200/30 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-peach-500" />
            <span className="text-sm font-semibold text-stone-700">Salary Benchmarks</span>
            {data && <span className="badge-peach">{data.total} roles</span>}
          </div>
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">India Startup Salary Benchmarks 2024-25</h1>
            <p className="text-stone-400 text-sm">Real salary data for 12 roles across 5 cities and 3 funding stages. All figures in INR annual CTC.</p>
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-stone-500 w-full">Function</span>
              {Object.entries(FUNCTION_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => setFilterFunction(k)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${filterFunction === k ? "btn-coral" : "btn-ghost-peach"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* City & Stage selector (for card view) */}
          <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-stone-500 shrink-0 self-center">City</span>
              {(Object.keys(CITY_LABELS) as CityKey[]).map((c) => (
                <button key={c} onClick={() => setActiveCity(c)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${activeCity === c ? "btn-coral" : "btn-ghost-peach"}`}>
                  {CITY_LABELS[c]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-stone-500 shrink-0 self-center">Stage</span>
              {(Object.keys(STAGE_LABELS) as StageKey[]).map((s) => (
                <button key={s} onClick={() => setActiveStage(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${activeStage === s ? "btn-coral" : "btn-ghost-peach"}`}>
                  {STAGE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* ESOP context banner */}
          <div className="bg-peach-50/60 border border-peach-100/60 rounded-2xl p-4 mb-6 flex gap-3">
            <Info className="w-4 h-4 text-peach-500 shrink-0 mt-0.5" />
            <p className="text-xs text-stone-600 leading-relaxed">
              <strong>All figures are annual CTC (Cost to Company).</strong> Take-home is typically 70-75% of CTC after taxes and PF deductions. ESOP ranges shown are as % of fully diluted equity at grant date. Bengaluru = 1.0x base; Mumbai = 0.95x; Delhi NCR = 0.90x; Hyderabad = 0.85x; Pune = 0.82x.
            </p>
          </div>

          {isLoading && (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-peach-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-stone-400">Loading salary data...</p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 rounded-2xl p-6 text-center">
              <p className="text-sm text-red-600 font-medium">Could not load data. Ensure the backend server is running at {API}.</p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="space-y-6">
              {Object.entries(grouped).map(([fn, fnRoles]) => (
                <div key={fn}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-sm font-bold text-stone-700 uppercase section-label">{fn}</h2>
                    <div className="flex-1 h-px bg-peach-100/60" />
                    <span className="text-xs text-stone-400">{fnRoles.length} roles</span>
                  </div>
                  <div className="space-y-3">
                    {fnRoles.map((role) => {
                      const salaryData = role.cities[activeCity]?.[activeStage];
                      const isExpanded = expandedId === role.id;
                      return (
                        <div key={role.id} className="glass rounded-2xl shadow-sm overflow-hidden">
                          <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : role.id)}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="font-bold text-stone-900 text-sm">{role.title}</h3>
                                  <span className="badge-peach text-[10px]">{role.level}</span>
                                  <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{role.years_experience} yrs exp</span>
                                </div>
                                <p className="text-[11px] text-stone-400">{role.description}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                {salaryData ? (
                                  <>
                                    <p className="text-lg font-black text-stone-900">{formatL(salaryData.median)}<span className="text-xs font-normal text-stone-400">/yr</span></p>
                                    <p className="text-[10px] text-stone-400">{formatL(salaryData.min)} – {formatL(salaryData.max)}</p>
                                  </>
                                ) : (
                                  <p className="text-xs text-stone-300">No data</p>
                                )}
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400 ml-auto mt-1" /> : <ChevronDown className="w-4 h-4 text-stone-400 ml-auto mt-1" />}
                              </div>
                            </div>
                            {salaryData && (
                              <div className="mt-3">
                                <SalaryBar range={salaryData} color="peach" />
                              </div>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="border-t border-peach-100/40 px-5 pb-5 pt-4 space-y-4">
                              {/* All cities comparison */}
                              <div>
                                <p className="text-[10px] font-bold text-stone-500 uppercase mb-3 section-label">Salary by City — {STAGE_LABELS[activeStage]}</p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {(Object.keys(CITY_LABELS) as CityKey[]).map((city) => {
                                    const cityData = role.cities[city]?.[activeStage];
                                    if (!cityData) return null;
                                    return (
                                      <div key={city} className={`rounded-xl p-3 ${city === activeCity ? "bg-peach-50/60 border border-peach-200/60" : "bg-stone-50"}`}>
                                        <p className="text-[10px] font-semibold text-stone-500 mb-2">{CITY_LABELS[city]}{city === activeCity && " ★"}</p>
                                        <SalaryBar range={cityData} color="peach" />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* All stages comparison */}
                              <div>
                                <p className="text-[10px] font-bold text-stone-500 uppercase mb-3 section-label">Salary by Stage — {CITY_LABELS[activeCity]}</p>
                                <div className="grid sm:grid-cols-3 gap-3">
                                  {(Object.keys(STAGE_LABELS) as StageKey[]).map((stage) => {
                                    const stageData = role.cities[activeCity]?.[stage];
                                    if (!stageData) return null;
                                    return (
                                      <div key={stage} className={`rounded-xl p-3 ${stage === activeStage ? "bg-peach-50/60 border border-peach-200/60" : "bg-stone-50"}`}>
                                        <p className="text-[10px] font-semibold text-stone-500 mb-2">{STAGE_LABELS[stage]}{stage === activeStage && " ★"}</p>
                                        <p className="text-base font-bold text-stone-900">{formatL(stageData.median)}</p>
                                        <p className="text-[10px] text-stone-400">{formatL(stageData.min)} – {formatL(stageData.max)}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* ESOP & tips */}
                              <div className="grid sm:grid-cols-2 gap-3">
                                <div className="bg-peach-50/60 rounded-xl p-3 border border-peach-100/40">
                                  <p className="text-[10px] font-bold text-peach-700 uppercase mb-1">ESOP Range</p>
                                  <p className="text-sm font-bold text-stone-900">{role.esop_typical_range}</p>
                                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{role.esop_notes}</p>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-3">
                                  <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">💡 Hiring Tip</p>
                                  <p className="text-xs text-amber-800 leading-relaxed">{role.hiring_tips}</p>
                                </div>
                              </div>

                              <div className="bg-stone-50 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-stone-500 uppercase mb-1">Scope & Interview Signal</p>
                                <p className="text-xs text-stone-600 leading-relaxed"><strong>Scope:</strong> {role.typical_scope}</p>
                                <p className="text-xs text-stone-600 leading-relaxed mt-1"><strong>Green flag in interviews:</strong> {role.interview_signal}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 glass rounded-2xl p-5 text-center">
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Data sourced from LinkedIn Salary, Glassdoor India, AngelList Talent India, NASSCOM Salary Survey 2024, and proprietary surveys with 500+ Indian startup founders and hiring managers. Updated March 2025. Actual salaries vary significantly based on founder network, candidate quality, and current runway.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
