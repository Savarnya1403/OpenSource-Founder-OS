"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, ExternalLink, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { Zap } from "lucide-react";

interface AngelNetwork {
  id: string;
  name: string;
  size: number;
  check_size_range: string;
  stages: string[];
  sectors: string[];
  focus_areas: string[];
  how_to_apply: string;
  description?: string;
  location?: string;
}

export default function AngelsPage() {
  const isAuthed = isAuthenticated();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["angels", search],
    queryFn: () => api.get("/api/angels", { params: { search: search || undefined } }).then((r) => r.data),
    staleTime: 60_000,
  });

  const networks: AngelNetwork[] = data?.networks || data || [];

  const content = (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Angel Networks</h1>
          <p className="text-stone-500 text-sm">
            {networks.length} angel networks and syndicates investing in early-stage Indian startups.
          </p>
        </div>

        {/* Search */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search angel networks..."
                className="w-full pl-9 pr-4 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
              />
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="flex items-center gap-1.5 text-sm text-stone-500 border border-peach-200/60 rounded-lg px-3 hover:bg-peach-50/60"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-peach-500" />
          </div>
        ) : networks.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No angel networks found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {networks.map((network) => (
              <div key={network.id} className="glass rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-stone-900 text-base">{network.name}</h3>
                  {network.size && (
                    <span className="flex items-center gap-1 text-xs text-stone-400 shrink-0 ml-2">
                      <Users className="w-3 h-3" />
                      {network.size.toLocaleString()} members
                    </span>
                  )}
                </div>

                {network.description && (
                  <p className="text-xs text-stone-500 mb-3 line-clamp-2">{network.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  {network.check_size_range && (
                    <div className="text-xs">
                      <span className="font-medium text-stone-700">Check size:</span>{" "}
                      <span className="text-stone-600">{network.check_size_range}</span>
                    </div>
                  )}
                  {network.stages && network.stages.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-stone-700">Stages:</span>{" "}
                      <span className="text-stone-600">{network.stages.join(", ")}</span>
                    </div>
                  )}
                  {network.location && (
                    <div className="text-xs">
                      <span className="font-medium text-stone-700">Based in:</span>{" "}
                      <span className="text-stone-600">{network.location}</span>
                    </div>
                  )}
                </div>

                {/* Sector tags */}
                {network.sectors && network.sectors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {network.sectors.slice(0, 5).map((s) => (
                      <span key={s} className="text-xs bg-peach-50/60 text-stone-700 border border-peach-200/40 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Focus areas */}
                {network.focus_areas && network.focus_areas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {network.focus_areas.slice(0, 4).map((f) => (
                      <span key={f} className="text-xs bg-peach-50/40 text-stone-600 border border-peach-200/40 px-2 py-0.5 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {network.how_to_apply && (
                  <div className="mt-auto">
                    <a
                      href={network.how_to_apply}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-peach-600 hover:text-peach-700"
                    >
                      Apply / Learn more <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );

  if (isAuthed) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
