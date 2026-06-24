"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { SECTORS } from "@/lib/utils";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Zap } from "lucide-react";

interface CaseStudy {
  id: string;
  startup_name: string;
  founder: string;
  year: number;
  sector: string;
  valuation?: string;
  tagline: string;
  cover_image?: string;
}

export default function CaseStudiesPage() {
  const isAuthed = isAuthenticated();
  const [sector, setSector] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["case-studies", sector],
    queryFn: () => api.get("/api/knowledge/case-studies", { params: { sector: sector || undefined } }).then((r) => r.data),
    staleTime: 60_000,
  });

  const studies: CaseStudy[] = data?.case_studies || data || [];

  const content = (
    <main className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/knowledge" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Indian Startup Case Studies</h1>
            <p className="text-gray-500 text-sm">Real journeys, honest lessons, and the decisions that mattered.</p>
          </div>
        </div>

        {/* Sector filter */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Sectors</option>
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
          </div>
        ) : studies.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No case studies found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {studies.map((cs) => (
              <Link
                key={cs.id}
                href={`/knowledge/case-studies/${cs.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                {cs.cover_image ? (
                  <div
                    className="w-full h-28 rounded-xl mb-4 bg-cover bg-center bg-gray-100"
                    style={{ backgroundImage: `url(${cs.cover_image})` }}
                  />
                ) : (
                  <div className="w-full h-28 rounded-xl mb-4 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-300">{cs.startup_name[0]}</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{cs.startup_name}</h3>
                  {cs.valuation && (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                      {cs.valuation}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                    {cs.sector}
                  </span>
                  <span className="text-xs text-gray-400">{cs.year}</span>
                </div>

                <p className="text-xs text-gray-500 mb-3 flex-1 leading-relaxed">{cs.tagline}</p>

                {cs.founder && (
                  <div className="text-xs text-gray-400 mb-3">By {cs.founder}</div>
                )}

                <span className="text-xs font-medium text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );

  if (isAuthed) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-saffron-500 rounded-md flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">OpenFounder OS</span>
        </Link>
        <Link href="/login" className="text-sm font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </nav>
      {content}
    </div>
  );
}
