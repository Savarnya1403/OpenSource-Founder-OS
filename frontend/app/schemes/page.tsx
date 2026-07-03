"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X, Loader2 } from "lucide-react";
import { schemesApi, Scheme } from "@/lib/api";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { Zap } from "lucide-react";

const STAGES = ["Idea", "Pre-Revenue", "Early Revenue", "Growth", "Scale"];

export default function SchemesPage() {
  const isAuthed = isAuthenticated();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("");
  const [ministry, setMinistry] = useState("");
  const [requiresDpiit, setRequiresDpiit] = useState<boolean | undefined>(undefined);

  const { data: meta } = useQuery({
    queryKey: ["schemes-meta"],
    queryFn: () => schemesApi.meta().then((r) => r.data),
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["schemes", search, sector, stage, ministry, requiresDpiit],
    queryFn: () =>
      schemesApi
        .list({ search: search || undefined, sector: sector || undefined, stage: stage || undefined, ministry: ministry || undefined, requires_dpiit: requiresDpiit, limit: 50 })
        .then((r) => r.data),
    staleTime: 30_000,
  });

  const schemes: Scheme[] = data?.schemes || [];
  const total: number = data?.total || 0;

  function clearFilters() {
    setSearch("");
    setSector("");
    setStage("");
    setMinistry("");
    setRequiresDpiit(undefined);
  }

  const hasFilters = !!(search || sector || stage || ministry || requiresDpiit !== undefined);

  const content = (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Government Schemes</h1>
          <p className="text-stone-500 text-sm">
            {total} scheme{total !== 1 ? "s" : ""} from central and state governments for Indian startups.
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
                placeholder="Search schemes..."
                className="w-full pl-9 pr-4 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-stone-500 border border-peach-200/60 rounded-lg px-3 hover:bg-peach-50/60"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
            >
              <option value="">All Sectors</option>
              {meta?.sectors?.map((s: string) => <option key={s} value={s}>{s}</option>)}
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
              value={ministry}
              onChange={(e) => setMinistry(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
            >
              <option value="">All Ministries</option>
              {meta?.ministries?.map((m: string) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={requiresDpiit === undefined ? "" : String(requiresDpiit)}
              onChange={(e) => setRequiresDpiit(e.target.value === "" ? undefined : e.target.value === "true")}
              className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
            >
              <option value="">DPIIT: Any</option>
              <option value="true">DPIIT Required</option>
              <option value="false">No DPIIT Needed</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-peach-500" />
          </div>
        ) : schemes.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <Filter className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No schemes match your filters. Try broadening your search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemes.map((s) => (
              <SchemeCard key={s.id} scheme={s} />
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
