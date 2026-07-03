"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Twitter, Linkedin, ChevronDown, ChevronUp, ExternalLink,
  MapPin, TrendingUp, Zap, Star, DollarSign, Users, Filter
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Angel {
  id: string;
  name: string;
  type: string;
  headline: string;
  current_role: string;
  notable_exits_or_companies: string[];
  check_size_range: string;
  check_size_inr: string;
  stages: string[];
  sectors: string[];
  total_investments: number;
  location: string;
  linkedin: string;
  twitter: string;
  how_to_reach: string;
  investment_thesis: string;
  known_investments: string[];
  bio: string;
  tags: string[];
}

const STAGE_COLORS: Record<string, string> = {
  "Pre-Seed": "bg-peach-50/60 text-peach-700 border-peach-200/40",
  "Seed": "bg-peach-100/40 text-stone-700 border-peach-200/60",
  "Series A": "bg-peach-50/60 text-stone-700 border-peach-200/60",
  "Series B": "bg-peach-100/40 text-stone-700 border-peach-200/40",
  "Late Stage": "bg-peach-50/50 text-stone-700 border-peach-200/60",
};

const SECTORS = [
  "", "FinTech", "Consumer", "SaaS", "D2C", "EdTech", "HealthTech",
  "DeepTech", "Gaming", "Media", "AgriTech", "CleanTech", "B2B", "Marketplace"
];

const STAGES = ["", "Pre-Seed", "Seed", "Series A", "Series B"];

function AngelCard({ angel }: { angel: Angel }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-stone-900 text-base">{angel.name}</h3>
              {angel.total_investments > 50 && (
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5" /> Super Angel
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 line-clamp-1">{angel.headline}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {angel.twitter && (
              <a href={angel.twitter} target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-50 hover:bg-sky-100 transition-colors">
                <Twitter className="w-3.5 h-3.5 text-sky-500" />
              </a>
            )}
            {angel.linkedin && (
              <a href={angel.linkedin} target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-peach-50/60 hover:bg-peach-100/60 transition-colors">
                <Linkedin className="w-3.5 h-3.5 text-peach-600" />
              </a>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-peach-50/50 rounded-xl p-2 text-center">
            <p className="text-xs font-bold text-stone-900">{angel.total_investments}+</p>
            <p className="text-[9px] text-stone-500">Investments</p>
          </div>
          <div className="bg-peach-50/50 rounded-xl p-2 text-center">
            <p className="text-xs font-bold text-stone-900 line-clamp-1">{angel.check_size_inr.split("–")[0]}</p>
            <p className="text-[9px] text-stone-500">Min check</p>
          </div>
          <div className="bg-peach-50/50 rounded-xl p-2 text-center">
            <p className="text-xs font-bold text-stone-900 line-clamp-1">{angel.location.split(",")[0]}</p>
            <p className="text-[9px] text-stone-500">Base</p>
          </div>
        </div>

        {/* Stages */}
        <div className="flex flex-wrap gap-1 mb-3">
          {angel.stages.slice(0, 3).map((s) => (
            <span key={s} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STAGE_COLORS[s] || "bg-peach-50/50 text-stone-600 border-peach-200/60"}`}>
              {s}
            </span>
          ))}
        </div>

        {/* Sectors */}
        <div className="flex flex-wrap gap-1 mb-3">
          {angel.sectors.slice(0, 4).map((sec) => (
            <span key={sec} className="text-[10px] bg-peach-50/60 text-stone-700 px-2 py-0.5 rounded-full border border-peach-200/40">
              {sec}
            </span>
          ))}
          {angel.sectors.length > 4 && (
            <span className="text-[10px] text-stone-400">+{angel.sectors.length - 4} more</span>
          )}
        </div>

        {/* Notable exits */}
        {angel.notable_exits_or_companies.length > 0 && (
          <div className="mb-3 bg-amber-50 rounded-xl p-2.5">
            <p className="text-[10px] font-semibold text-amber-700 mb-1">Known from</p>
            <p className="text-xs text-amber-800 line-clamp-2">{angel.notable_exits_or_companies.slice(0, 2).join(" · ")}</p>
          </div>
        )}

        {/* Expand toggle */}
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs text-stone-400 hover:text-stone-600 transition-colors pt-1 border-t border-peach-100/40">
          <span>{expanded ? "Show less" : "Investment thesis & portfolio"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-peach-100/40 pt-3">
            {/* Thesis */}
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Investment Thesis</p>
              <p className="text-xs text-stone-600 leading-relaxed">{angel.investment_thesis}</p>
            </div>

            {/* Known investments */}
            {angel.known_investments.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Known Investments</p>
                <div className="flex flex-wrap gap-1">
                  {angel.known_investments.slice(0, 10).map((inv) => (
                    <span key={inv} className="text-[10px] bg-peach-50/40 border border-peach-200/40 text-stone-600 px-2 py-0.5 rounded-full">
                      {inv}
                    </span>
                  ))}
                  {angel.known_investments.length > 10 && (
                    <span className="text-[10px] text-stone-400">+{angel.known_investments.length - 10} more</span>
                  )}
                </div>
              </div>
            )}

            {/* How to reach */}
            <div className="bg-peach-50/60 rounded-xl p-2.5">
              <p className="text-[10px] font-semibold text-green-700 mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> How to Reach
              </p>
              <p className="text-xs text-green-800">{angel.how_to_reach}</p>
            </div>

            {/* Bio */}
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">About</p>
              <p className="text-xs text-stone-500 leading-relaxed">{angel.bio}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IndividualAngelsPage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("");

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (sector) params.set("sector", sector);
  if (stage) params.set("stage", stage);
  params.set("limit", "100");

  const { data, isLoading } = useQuery({
    queryKey: ["individual-angels", search, sector, stage],
    queryFn: async () => {
      const res = await fetch(`${API}/api/individual-angels?${params}`);
      return res.json();
    },
    staleTime: 60_000,
  });

  const angels: Angel[] = data?.angels || [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Investor Network → Individual Angels
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Indian Angel Investors</h1>
            <p className="text-stone-500 text-sm">
              48 prominent individual angel investors from the Indian startup ecosystem — with check sizes, thesis, and how to reach them.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Angel Investors", value: `${data?.total || 48}`, icon: Users, color: "text-peach-600 bg-peach-100/60" },
              { label: "Super Angels (50+ deals)", value: "12", icon: Star, color: "text-amber-600 bg-amber-50" },
              { label: "Avg check size", value: "₹25L–₹2 Cr", icon: DollarSign, color: "text-green-600 bg-green-50" },
              { label: "Sectors covered", value: "15+", icon: Filter, color: "text-peach-600 bg-peach-50/60" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 shadow-sm">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-lg font-bold text-stone-900">{s.value}</p>
                <p className="text-xs text-stone-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap gap-3">
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
              <input
                type="text"
                placeholder="Search by name, company, portfolio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-peach-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-peach-400"
              />
            </div>
            <select value={sector} onChange={(e) => setSector(e.target.value)}
              className="text-sm border border-peach-200/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white text-stone-700">
              <option value="">All Sectors</option>
              {SECTORS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={stage} onChange={(e) => setStage(e.target.value)}
              className="text-sm border border-peach-200/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white text-stone-700">
              <option value="">All Stages</option>
              {STAGES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {(search || sector || stage) && (
              <button onClick={() => { setSearch(""); setSector(""); setStage(""); }}
                className="text-sm text-stone-400 hover:text-stone-600 px-3">
                Clear
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="text-xs text-stone-400 mb-4">
            Showing {angels.length} of {data?.total || 0} angel investors
          </p>

          {/* Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl border border-peach-200/40 p-5 animate-pulse">
                  <div className="h-4 bg-peach-100/50 rounded mb-3 w-2/3" />
                  <div className="h-3 bg-peach-100/50 rounded mb-5 w-full" />
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[0,1,2].map(j => <div key={j} className="h-10 bg-peach-100/50 rounded-xl" />)}
                  </div>
                  <div className="h-3 bg-peach-100/50 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : angels.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No angels found</p>
              <p className="text-sm mt-1">Try different filters</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {angels.map((a) => <AngelCard key={a.id} angel={a} />)}
            </div>
          )}

          {/* Angel networks callout */}
          <div className="mt-8 bg-gradient-to-r from-violet-50 to-peach-50 border border-violet-100 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-stone-900 text-sm">Looking for angel networks?</p>
              <p className="text-xs text-stone-500 mt-0.5">iSPIRT, LetsVenture, Mumbai Angels, Indian Angel Network, 100X.VC and more.</p>
            </div>
            <Link href="/angels"
              className="shrink-0 ml-4 btn-coral text-sm font-medium px-4 py-2 rounded-lg">
              View Networks →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
