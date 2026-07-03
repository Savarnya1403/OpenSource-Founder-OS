"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, ExternalLink, MapPin, Clock, DollarSign, Users, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";

const STAGES = ["Pre-Idea", "Idea", "Pre-Seed", "Seed", "Series A"];
const SECTORS = ["FinTech", "EdTech", "HealthTech", "B2B SaaS", "Deep Tech", "AgriTech", "CleanTech", "AI", "Consumer"];

interface Accelerator {
  id: string;
  name: string;
  type: string;
  cohort_size: string;
  equity: string;
  check_size: string | null;
  check_size_inr: string | null;
  stage: string[];
  duration_weeks: number | null;
  location: string;
  mode: string;
  sectors: string[];
  website: string;
  apply_url: string;
  description: string;
  what_you_get: string[];
  eligibility: string;
  application_frequency: string;
  success_metrics: string;
  notable_alumni_india: string[];
  tags: string[];
}

const EQUITY_COLORS: Record<string, string> = {
  "0%": "bg-green-100 text-green-700",
  "5-10%": "bg-peach-50/60 text-stone-700",
  "7%": "bg-peach-50/60 text-stone-700",
  "10%": "bg-peach-100/60 text-stone-700",
  "7-10%": "bg-peach-100/60 text-stone-700",
};

function getEquityColor(equity: string): string {
  if (equity === "0%") return "bg-green-100 text-green-700";
  if (equity.includes("%")) return "bg-peach-100/60 text-stone-700";
  return "bg-peach-100/60 text-stone-600";
}

function AcceleratorCard({ accel }: { accel: Accelerator }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 text-sm leading-tight mb-0.5">{accel.name}</h3>
          <span className="text-[10px] bg-peach-50/40 text-stone-500 border border-peach-200/40 px-2 py-0.5 rounded-full">{accel.type}</span>
        </div>
        {accel.website && (
          <a href={accel.website} target="_blank" rel="noopener noreferrer"
            className="text-stone-400 hover:text-peach-600 ml-2 shrink-0">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <p className="text-xs text-stone-500 mb-4 line-clamp-3">{accel.description}</p>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-peach-50/50 rounded-xl p-2.5">
          <p className="text-[10px] text-stone-400 font-medium mb-0.5">Equity</p>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${getEquityColor(accel.equity)}`}>
            {accel.equity}
          </span>
        </div>
        <div className="bg-peach-50/50 rounded-xl p-2.5">
          <p className="text-[10px] text-stone-400 font-medium mb-0.5">Check Size</p>
          <p className="text-xs font-semibold text-stone-800 truncate">{accel.check_size_inr || accel.check_size || "Non-monetary"}</p>
        </div>
        {accel.duration_weeks && (
          <div className="bg-peach-50/50 rounded-xl p-2.5">
            <p className="text-[10px] text-stone-400 font-medium mb-0.5">Duration</p>
            <p className="text-xs font-semibold text-stone-800">{accel.duration_weeks} weeks</p>
          </div>
        )}
        <div className="bg-peach-50/50 rounded-xl p-2.5">
          <p className="text-[10px] text-stone-400 font-medium mb-0.5">Mode</p>
          <p className="text-xs font-semibold text-stone-800">{accel.mode}</p>
        </div>
      </div>

      {/* Stage badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {accel.stage.map((s) => (
          <span key={s} className="text-[10px] bg-peach-50/60 text-stone-700 border border-peach-200/40 px-2 py-0.5 rounded-full font-medium">{s}</span>
        ))}
      </div>

      <div className="flex items-center gap-1 text-xs text-stone-400 mb-2">
        <MapPin className="w-3 h-3" />
        {accel.location}
      </div>

      <div className="flex items-center gap-1 text-xs text-stone-400 mb-4">
        <Clock className="w-3 h-3" />
        {accel.application_frequency}
      </div>

      {/* Expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 mb-2"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? "Hide" : "Show"} what you get & eligibility
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-peach-100/40 pt-3">
          <div>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">What You Get</p>
            <ul className="space-y-1">
              {accel.what_you_get.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-stone-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Eligibility</p>
            <p className="text-xs text-stone-600">{accel.eligibility}</p>
          </div>
          {accel.success_metrics && (
            <div className="bg-green-50 rounded-xl px-3 py-2">
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-0.5">Track Record</p>
              <p className="text-xs text-green-800">{accel.success_metrics}</p>
            </div>
          )}
          {accel.notable_alumni_india.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Notable Alumni</p>
              <p className="text-xs text-stone-600">{accel.notable_alumni_india.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto pt-3 flex gap-2">
        {accel.apply_url && (
          <a
            href={accel.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center btn-coral text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            Apply Now →
          </a>
        )}
        {accel.website && (
          <a
            href={accel.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-peach-50/40 text-stone-600 text-xs font-medium px-3 py-2 rounded-lg hover:bg-peach-100/60 transition-colors"
          >
            Learn More
          </a>
        )}
      </div>
    </div>
  );
}

export default function AcceleratorsPage() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [sector, setSector] = useState("");
  const [equityFreeOnly, setEquityFreeOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["accelerators", search, stage, sector, equityFreeOnly],
    queryFn: () =>
      api.get("/api/accelerators", {
        params: {
          search: search || undefined,
          stage: stage || undefined,
          sector: sector || undefined,
          equity_free: equityFreeOnly || undefined,
          limit: 50,
        },
      }).then((r) => r.data),
    staleTime: 60_000,
  });

  const accels: Accelerator[] = data?.accelerators || [];
  const total: number = data?.total || accels.length;
  const hasFilters = !!(search || stage || sector || equityFreeOnly);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Accelerator Programs</h1>
            <p className="text-stone-500 text-sm">
              {total} programs — from YC and Antler to government-backed incubators. Find the right launchpad for your startup.
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Programs Listed", value: "20+", color: "text-peach-600" },
              { label: "Equity-Free Options", value: "8+", color: "text-green-600" },
              { label: "Pre-Seed to Series A", value: "All Stages", color: "text-peach-600" },
              { label: "Collective Portfolio Value", value: "$15B+", color: "text-orange-600" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 text-center shadow-sm">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
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
                  placeholder="Search by name, type, or sector..."
                  className="w-full pl-9 pr-4 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                />
              </div>
              {hasFilters && (
                <button
                  onClick={() => { setSearch(""); setStage(""); setSector(""); setEquityFreeOnly(false); }}
                  className="flex items-center gap-1.5 text-sm text-stone-500 border border-peach-200/60 rounded-lg px-3 hover:bg-peach-50/60"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
              >
                <option value="">All Stages</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
              >
                <option value="">All Sectors</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equityFreeOnly}
                  onChange={(e) => setEquityFreeOnly(e.target.checked)}
                  className="w-4 h-4 accent-peach-600"
                />
                <span className="text-sm text-stone-600">Equity-free only</span>
              </label>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-peach-500" />
            </div>
          ) : accels.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p>No accelerators match your filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accels.map((accel) => (
                <AcceleratorCard key={accel.id} accel={accel} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
