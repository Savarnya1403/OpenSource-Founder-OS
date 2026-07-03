"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, ExternalLink, MapPin, Mail, Link2 } from "lucide-react";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { Zap } from "lucide-react";

const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Growth"];
const SECTORS = [
  "FinTech", "EdTech", "HealthTech", "AgriTech", "SaaS", "D2C",
  "DeepTech", "AI/ML", "Climate", "Logistics", "Gaming", "Other",
];

interface VC {
  id: string;
  name: string;
  stages: string[];
  sectors: string[];
  check_size: string;
  check_size_display?: string;
  notable_portfolio: string[];
  location: string;
  website: string;
  description?: string;
  apply_url?: string;
  pitch_email?: string;
  warm_intro_required?: boolean;
  partners?: string[];
  formerly?: string;
}

const STAGE_COLORS: Record<string, string> = {
  "Pre-Seed": "bg-peach-100/60 text-stone-700",
  "Seed": "bg-peach-50/60 text-stone-700",
  "Series A": "bg-green-100 text-green-700",
  "Series B": "bg-orange-100 text-orange-700",
  "Growth": "bg-red-100 text-red-700",
};

export default function VCsPage() {
  const isAuthed = isAuthenticated();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [sector, setSector] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["vcs", search, stage, sector],
    queryFn: () =>
      api
        .get("/api/vcs", { params: { search: search || undefined, stage: stage || undefined, sector: sector || undefined, limit: 50 } })
        .then((r) => r.data),
    staleTime: 60_000,
  });

  const vcs: VC[] = data?.vcs || data || [];
  const total: number = data?.total || vcs.length;

  function clearFilters() {
    setSearch("");
    setStage("");
    setSector("");
  }

  const hasFilters = !!(search || stage || sector);

  const content = (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">VC Directory</h1>
          <p className="text-stone-400 text-sm">
            {total} venture capital firms investing in Indian startups — with check sizes, sectors, and direct pitch emails.
          </p>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-5 mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search VCs by name or portfolio..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:border-peach-400"
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm btn-ghost-peach rounded-lg px-3 py-2"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:border-peach-400"
            >
              <option value="">All Stages</option>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:border-peach-400"
            >
              <option value="">All Sectors</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-peach-500" />
          </div>
        ) : vcs.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <p>No VCs match your filters. Try broadening your search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vcs.map((vc) => (
              <div key={vc.id} className="glass rounded-2xl p-5 card-hover flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-stone-900 text-base">{vc.name}</h3>
                  {vc.website && (
                    <a href={vc.website} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-peach-600 ml-2 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {vc.description && (
                  <p className="text-xs text-stone-500 mb-3 line-clamp-2">{vc.description}</p>
                )}

                {/* Stage badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(vc.stages || []).map((s) => (
                    <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[s] || "bg-peach-100/60 text-stone-600"}`}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Sector tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(vc.sectors || []).slice(0, 4).map((s) => (
                    <span key={s} className="text-xs bg-peach-50/50 text-stone-600 border border-peach-200/40 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-auto space-y-2">
                  {(vc.check_size_display || vc.check_size) && (
                    <div className="text-xs text-stone-500">
                      <span className="font-medium text-stone-700">Check size:</span> {vc.check_size_display || vc.check_size}
                    </div>
                  )}

                  {vc.notable_portfolio && vc.notable_portfolio.length > 0 && (
                    <div className="text-xs text-stone-500">
                      <span className="font-medium text-stone-700">Portfolio:</span>{" "}
                      {vc.notable_portfolio.slice(0, 3).join(", ")}
                    </div>
                  )}

                  {vc.location && (
                    <div className="flex items-center gap-1 text-xs text-stone-400">
                      <MapPin className="w-3 h-3" />
                      {vc.location}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {vc.warm_intro_required === false && (
                      <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Open applications
                      </span>
                    )}
                    {vc.warm_intro_required === true && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Warm intro preferred
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    {vc.pitch_email && (
                      <a
                        href={`mailto:${vc.pitch_email}`}
                        className="flex items-center gap-1 text-xs text-peach-600 hover:text-peach-700 font-medium"
                      >
                        <Mail className="w-3 h-3" /> Pitch
                      </a>
                    )}
                    {vc.apply_url && (
                      <a
                        href={vc.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
                      >
                        <Link2 className="w-3 h-3" /> Apply
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );

  if (isAuthed) {
    return (
      <div className="flex min-h-screen bg-peach-50/50">
        <Sidebar />
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-peach-50/50">
      <nav className="glass-strong border-b border-peach-200/30 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-peach-500 to-saffron-500 rounded-md flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-stone-900 text-sm">OpenFounder OS</span>
        </Link>
        <Link href="/login" className="text-sm font-medium text-peach-600 hover:underline">
          Sign in
        </Link>
      </nav>
      {content}
    </div>
  );
}
