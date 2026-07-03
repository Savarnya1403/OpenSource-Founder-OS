"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, TrendingUp, MapPin, Users, ChevronDown, ChevronUp, Lightbulb, DollarSign, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";

const SECTORS = [
  "FinTech", "EdTech", "HealthTech", "E-commerce", "D2C", "SaaS", "B2B SaaS",
  "Quick Commerce", "HR Tech", "Mobility", "CleanTech", "Developer Tools", "Construction Tech",
];
const STAGES = ["Seed", "Series A", "Series B", "Series C", "Series D", "Series E", "Series F", "Pre-IPO", "Acquired"];
const CITIES = ["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Noida", "Gurugram", "Pune", "Chennai"];

interface FundingRound {
  round: string;
  year: number;
  amount_usd: number;
  lead: string;
}

interface FundedStartup {
  id: string;
  name: string;
  sector: string;
  sub_sector: string;
  city: string;
  founded: number;
  founders: string[];
  founder_backgrounds: string[];
  stage: string;
  total_raised_usd: number;
  total_raised_display: string;
  latest_valuation_usd: number;
  latest_valuation_display: string;
  key_investors: string[];
  revenue_est_arr: string;
  unit_economics: string;
  key_metric: string;
  what_they_nailed: string;
  fundraising_round_history: FundingRound[];
  key_lesson: string;
  tags: string[];
}

function formatUSD(val: number): string {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(0)}M`;
  return `$${val.toLocaleString()}`;
}

const STAGE_COLORS: Record<string, string> = {
  "Seed": "bg-peach-100/60 text-stone-700",
  "Series A": "bg-peach-50/60 text-stone-700",
  "Series B": "bg-peach-50/60 text-stone-700",
  "Series C": "bg-green-100 text-green-700",
  "Series D": "bg-orange-100 text-orange-700",
  "Series E": "bg-red-100 text-red-700",
  "Series F": "bg-peach-100/60 text-peach-700",
};

function getStageColor(stage: string): string {
  for (const [k, v] of Object.entries(STAGE_COLORS)) {
    if (stage.includes(k)) return v;
  }
  return "bg-peach-100/60 text-stone-600";
}

function StartupCard({ startup }: { startup: FundedStartup }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-stone-900 text-base">{startup.name}</h3>
          <p className="text-xs text-stone-500">{startup.sub_sector} · {startup.sector}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${getStageColor(startup.stage)}`}>
          {startup.stage.split(" (")[0]}
        </span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-peach-50/60 rounded-xl p-2.5">
          <p className="text-[10px] text-stone-500 font-medium mb-0.5">Total Raised</p>
          <p className="text-sm font-bold text-stone-800">{startup.total_raised_display}</p>
        </div>
        <div className="bg-peach-50/60 rounded-xl p-2.5">
          <p className="text-[10px] text-stone-500 font-medium mb-0.5">Valuation</p>
          <p className="text-sm font-bold text-stone-800">{startup.latest_valuation_display}</p>
        </div>
      </div>

      {/* Founders */}
      <div className="flex items-center gap-1.5 mb-3">
        <Users className="w-3.5 h-3.5 text-stone-400" />
        <p className="text-xs text-stone-600">{startup.founders.join(", ")}</p>
      </div>

      {/* Location + Founded */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <MapPin className="w-3 h-3" />
          {startup.city}
        </div>
        <span className="text-gray-200">·</span>
        <p className="text-xs text-stone-400">Est. {startup.founded}</p>
      </div>

      {/* Key metric */}
      <div className="bg-peach-50/60 rounded-xl px-3 py-2 mb-3">
        <div className="flex items-start gap-1.5">
          <BarChart3 className="w-3 h-3 text-peach-500 mt-0.5 shrink-0" />
          <p className="text-xs text-stone-800">{startup.key_metric}</p>
        </div>
      </div>

      {/* Investors (first 3) */}
      <div className="mb-3">
        <p className="text-[10px] text-stone-400 font-medium mb-1">Key Investors</p>
        <div className="flex flex-wrap gap-1">
          {startup.key_investors.slice(0, 4).map((inv) => (
            <span key={inv} className="text-[10px] bg-peach-50/40 text-stone-600 border border-peach-200/40 px-2 py-0.5 rounded-full">{inv}</span>
          ))}
          {startup.key_investors.length > 4 && (
            <span className="text-[10px] text-stone-400">+{startup.key_investors.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Lesson highlight */}
      <div className="bg-amber-50 rounded-xl px-3 py-2 mb-3">
        <div className="flex items-start gap-1.5">
          <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-800 leading-relaxed"><strong>Key Lesson:</strong> {startup.key_lesson}</p>
        </div>
      </div>

      {/* Expand for funding history */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 mb-2"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? "Hide" : "Show"} funding history
      </button>

      {expanded && (
        <div className="border-t border-peach-100/40 pt-3 space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Funding History</p>
            <div className="space-y-1.5">
              {startup.fundraising_round_history.map((round, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getStageColor(round.round)}`}>{round.round}</span>
                    <span className="text-stone-400">{round.year}</span>
                    <span className="text-stone-400">— {round.lead}</span>
                  </div>
                  <span className="font-semibold text-stone-700">{round.amount_usd > 0 ? formatUSD(round.amount_usd) : "Bootstrapped"}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">What They Nailed</p>
            <p className="text-xs text-stone-600">{startup.what_they_nailed}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Unit Economics</p>
            <p className="text-xs text-stone-600">{startup.unit_economics}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Revenue Estimate</p>
            <p className="text-xs text-stone-600">{startup.revenue_est_arr}</p>
          </div>
          {startup.founder_backgrounds.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Founder Backgrounds</p>
              <p className="text-xs text-stone-600">{startup.founder_backgrounds.join(", ")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FundedStartupsPage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("");
  const [city, setCity] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["funded-startups", search, sector, stage, city],
    queryFn: () =>
      api.get("/api/funded-startups", {
        params: { search: search || undefined, sector: sector || undefined, stage: stage || undefined, city: city || undefined, limit: 50 },
      }).then((r) => r.data),
    staleTime: 60_000,
  });

  const startups: FundedStartup[] = data?.startups || [];
  const total: number = data?.total || startups.length;
  const hasFilters = !!(search || sector || stage || city);

  const totalRaised = startups.reduce((acc, s) => acc + (s.total_raised_usd || 0), 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Funded Indian Startups</h1>
            <p className="text-stone-500 text-sm">
              Deep-dive intelligence on {total} funded startups — funding history, investor lists, unit economics, and key lessons.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Startups Tracked", value: `${total}+`, icon: TrendingUp, color: "text-peach-600" },
              { label: "Total Capital Raised", value: formatUSD(totalRaised), icon: DollarSign, color: "text-green-600" },
              { label: "Unicorns", value: "12+", icon: BarChart3, color: "text-peach-600" },
              { label: "Funding Rounds Tracked", value: `${startups.reduce((a, s) => a + s.fundraising_round_history.length, 0)}+`, icon: Lightbulb, color: "text-orange-600" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-peach-100/60 flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-stone-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-5 mb-6">
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search startups by name, sector, investor, or founder..."
                  className="w-full pl-9 pr-4 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                />
              </div>
              {hasFilters && (
                <button
                  onClick={() => { setSearch(""); setSector(""); setStage(""); setCity(""); }}
                  className="flex items-center gap-1.5 text-sm text-stone-500 border border-peach-200/60 rounded-lg px-3 hover:bg-peach-50/60"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
              >
                <option value="">All Sectors</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
              >
                <option value="">All Stages</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
              >
                <option value="">All Cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-peach-500" />
            </div>
          ) : startups.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p>No startups match your filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {startups.map((s) => <StartupCard key={s.id} startup={s} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
