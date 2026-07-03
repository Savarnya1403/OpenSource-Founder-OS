"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Gift, Search, ExternalLink, Star } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

interface Program {
  id: string;
  name: string;
  provider: string;
  logo_emoji: string;
  category: string;
  total_value_usd: number;
  total_value_inr_display: string;
  headline: string;
  what_you_get: string[];
  eligibility: string[];
  how_to_apply: string;
  apply_url: string;
  time_to_activate: string;
  validity: string;
  india_available: boolean;
  india_notes: string;
  tags: string[];
  difficulty_to_get: string;
}

interface ProgramsData {
  programs: Program[];
  total: number;
  total_value_usd: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Cloud: "☁️",
  "Developer Tools": "🛠️",
  CRM: "🤝",
  Analytics: "📊",
  Support: "💬",
  Design: "🎨",
  "Legal & Finance": "⚖️",
  Banking: "🏦",
  Government: "🏛️",
};

const FEATURED_IDS = ["aws_activate_portfolio", "google_cloud_startup", "microsoft_founders_hub"];

export default function ProgramsPage() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterIndia, setFilterIndia] = useState(false);
  const [sortBy, setSortBy] = useState("value");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["startup-programs", filterCategory, filterIndia, sortBy, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterIndia) params.set("india_only", "true");
      if (sortBy) params.set("sort_by", sortBy);
      if (search) params.set("search", search);
      const res = await fetch(`${API}/api/tools/startup-programs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<ProgramsData>;
    },
    placeholderData: (prev) => prev,
  });

  const programs = data?.programs ?? [];
  const featured = programs.filter((p) => FEATURED_IDS.includes(p.id));
  const rest = programs.filter((p) => !FEATURED_IDS.includes(p.id));
  const categories = [...new Set(programs.map((p) => p.category))];

  const totalValueM = data ? (data.total_value_usd / 1_000_000).toFixed(0) : "0";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 glass-strong border-b border-peach-200/30 px-8 py-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-peach-500" />
          <span className="text-sm font-semibold text-stone-700">Free Credits & Programs</span>
          {data && <span className="badge-peach">{data.total} programs</span>}
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Private Startup Programs & Free Credits</h1>
            <p className="text-stone-400 text-sm">₹3+ crore in free infrastructure, tools, and credits for Indian startups.</p>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 mt-4">
            <div className="glass rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-stone-900">{data?.total ?? "28"}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Programs Listed</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-stone-900">${totalValueM}M+</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Total Value</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-stone-900">₹3Cr+</p>
              <p className="text-[11px] text-stone-400 mt-0.5">India Equivalent</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="glass rounded-2xl p-4 mb-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search AWS, Google Cloud, ESOP tools..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-peach-50/40 border border-peach-100/60 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-peach-300"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilterCategory("")}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${!filterCategory ? "btn-coral" : "btn-ghost-peach"}`}>All</button>
              {categories.map((c) => (
                <button key={c} onClick={() => setFilterCategory(c === filterCategory ? "" : c)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${filterCategory === c ? "btn-coral" : "btn-ghost-peach"}`}>
                  {CATEGORY_EMOJIS[c] || ""} {c}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setFilterIndia((p) => !p)}
                  className={`w-10 h-5 rounded-full transition-all ${filterIndia ? "bg-peach-400" : "bg-stone-200"} relative`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${filterIndia ? "left-5.5" : "left-0.5"}`} style={{ left: filterIndia ? "1.375rem" : "0.125rem" }} />
                </div>
                <span className="text-xs text-stone-600 font-medium">India available only</span>
              </label>
              <div className="flex gap-2">
                <span className="text-xs text-stone-400 self-center">Sort:</span>
                {[{ key: "value", label: "By Value" }, { key: "name", label: "A-Z" }, { key: "difficulty", label: "Easiest First" }].map((s) => (
                  <button key={s.key} onClick={() => setSortBy(s.key)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${sortBy === s.key ? "btn-coral" : "btn-ghost-peach"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-peach-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-stone-400">Loading programs...</p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 rounded-2xl p-6 text-center">
              <p className="text-sm text-red-600 font-medium">Could not load data. Ensure the backend is running at {API}.</p>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {/* Featured programs */}
              {featured.length > 0 && !search && !filterCategory && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-stone-700">Featured — Highest Value</h2>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {featured.map((p) => (
                      <div key={p.id} className="glass rounded-2xl p-5 shadow-sm border border-peach-200/40 card-hover">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{p.logo_emoji}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[p.difficulty_to_get] ?? "bg-stone-100 text-stone-500"}`}>{p.difficulty_to_get}</span>
                        </div>
                        <p className="font-bold text-stone-900 text-sm mb-0.5">{p.name}</p>
                        <p className="text-xl font-black text-peach-600 mb-1">{p.total_value_inr_display}</p>
                        <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">{p.headline}</p>
                        {p.india_available ? (
                          <span className="text-[10px] badge-green mb-3 inline-block">India Available ✓</span>
                        ) : (
                          <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full mb-3 inline-block">India: Check eligibility</span>
                        )}
                        <a href={p.apply_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs btn-coral px-4 py-2 rounded-xl w-full justify-center mt-2 font-semibold">
                          Apply Now <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All programs */}
              <div className="space-y-3">
                {(search || filterCategory ? programs : rest).map((program) => {
                  const isExpanded = expandedId === program.id;
                  return (
                    <div key={program.id} className="glass rounded-2xl shadow-sm overflow-hidden card-hover">
                      <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : program.id)}>
                        <div className="flex items-start gap-4">
                          <span className="text-2xl shrink-0">{program.logo_emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <h3 className="font-bold text-stone-900 text-sm">{program.name}</h3>
                                  {program.india_available && <span className="text-[10px] badge-green">India ✓</span>}
                                </div>
                                <p className="text-[11px] text-stone-400 mb-1">{program.provider} · {program.category}</p>
                                <p className="text-[11px] text-stone-500 leading-relaxed">{program.headline}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-base font-black text-peach-600">{program.total_value_inr_display}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[program.difficulty_to_get] ?? "bg-stone-100 text-stone-500"}`}>
                                  {program.difficulty_to_get}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {program.tags.slice(0, 4).map((tag) => (
                                <span key={tag} className="text-[10px] bg-peach-50/60 text-stone-500 px-2 py-0.5 rounded-full">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-peach-100/40 px-5 pb-5 pt-4 space-y-4">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="bg-peach-50/60 rounded-xl p-3 border border-peach-100/40">
                              <p className="text-[10px] font-bold text-peach-700 uppercase mb-2">What You Get</p>
                              <ul className="space-y-1">
                                {program.what_you_get.map((item, i) => (
                                  <li key={i} className="text-xs text-stone-700 flex gap-1.5"><span className="text-peach-400">·</span>{item}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-amber-700 uppercase mb-2">Eligibility</p>
                              <ul className="space-y-1">
                                {program.eligibility.map((e, i) => (
                                  <li key={i} className="text-xs text-amber-800 flex gap-1.5"><span>·</span>{e}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-3">
                            <div className="bg-stone-50 rounded-xl p-3">
                              <p className="text-[10px] font-semibold text-stone-500 uppercase mb-1">Time to Activate</p>
                              <p className="text-xs text-stone-700 font-medium">{program.time_to_activate}</p>
                            </div>
                            <div className="bg-stone-50 rounded-xl p-3">
                              <p className="text-[10px] font-semibold text-stone-500 uppercase mb-1">Validity</p>
                              <p className="text-xs text-stone-700 font-medium">{program.validity}</p>
                            </div>
                            <div className="bg-stone-50 rounded-xl p-3">
                              <p className="text-[10px] font-semibold text-stone-500 uppercase mb-1">India Notes</p>
                              <p className="text-xs text-stone-700 font-medium">{program.india_notes}</p>
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                            <p className="text-[10px] font-bold text-green-700 uppercase mb-1">How to Apply</p>
                            <p className="text-xs text-green-800 leading-relaxed">{program.how_to_apply}</p>
                          </div>

                          <a href={program.apply_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs btn-coral px-5 py-2.5 rounded-xl font-bold w-fit">
                            Apply / Learn More <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {programs.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center">
                  <p className="text-stone-400 text-sm">No programs match your filters. Try removing some filters.</p>
                </div>
              )}
            </>
          )}

          <div className="mt-8 glass rounded-2xl p-5 text-center">
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Program terms, eligibility, and credit amounts change frequently. Always verify directly on the program website before applying. Some programs require a referral from a VC or accelerator partner. Values shown are maximum available credits, not guaranteed amounts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
