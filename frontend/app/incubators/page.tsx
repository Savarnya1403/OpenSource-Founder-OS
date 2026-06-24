"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Building,
  MapPin,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Banknote,
  GraduationCap,
  Zap,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { api } from "@/lib/api";

const SECTORS = [
  "All Sectors", "Deep Tech", "FinTech", "HealthTech", "AgriTech",
  "CleanTech", "EdTech", "AI", "IoT", "Social Impact", "B2B SaaS",
];

const STAGES = ["All Stages", "Idea", "Pre-Revenue", "Early Revenue", "Growth"];

const STATES = [
  "All States", "Karnataka", "Maharashtra", "Tamil Nadu", "Delhi",
  "Telangana", "Gujarat", "Kerala", "Rajasthan", "West Bengal", "Uttar Pradesh",
];

const TYPE_COLORS: Record<string, string> = {
  "Incubator": "bg-blue-100 text-blue-700",
  "Accelerator": "bg-green-100 text-green-700",
  "Technology Business Incubator": "bg-purple-100 text-purple-700",
  "Innovation Hub": "bg-amber-100 text-amber-700",
  "Technology Innovation Hub": "bg-orange-100 text-orange-700",
  "Impact Incubator": "bg-teal-100 text-teal-700",
  "VC Fund": "bg-rose-100 text-rose-700",
};

interface Incubator {
  id: string;
  name: string;
  short_name: string;
  institution: string;
  city: string;
  state: string;
  type: string[];
  focus_sectors: string[];
  stage: string[];
  description: string;
  programs: string[];
  funding_available: string;
  equity_taken: boolean;
  website: string;
  apply_url: string;
  linkedin: string;
  contact_email: string;
  notable_alumni: string[];
  established: number;
  tags: string[];
}

export default function IncubatorsPage() {
  const isAuthed = isAuthenticated();
  const [sector, setSector] = useState("All Sectors");
  const [stage, setStage] = useState("All Stages");
  const [state, setState] = useState("All States");
  const [search, setSearch] = useState("");
  const [equityFree, setEquityFree] = useState(false);

  const { data: incubators = [], isLoading } = useQuery<Incubator[]>({
    queryKey: ["incubators", sector, stage, state, search, equityFree],
    queryFn: async () => {
      const params: Record<string, string | boolean> = {};
      if (sector !== "All Sectors") params.sector = sector;
      if (stage !== "All Stages") params.stage = stage;
      if (state !== "All States") params.state = state;
      if (search) params.search = search;
      if (equityFree) params.equity_free = true;
      const res = await api.get("/api/incubators", { params });
      return res.data;
    },
  });

  const content = (
    <main className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Incubators Directory</h1>
          <p className="text-gray-500 text-sm">
            India&apos;s top incubators and accelerators — with funding details, apply links, and sector focus.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, sector, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={equityFree}
                onChange={(e) => setEquityFree(e.target.checked)}
                className="rounded border-gray-300 text-brand-600"
              />
              <span className="text-xs text-gray-600">No equity taken</span>
            </label>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-48" />
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && (
          <>
            <p className="text-xs text-gray-400 mb-4">{incubators.length} incubators found</p>
            <div className="space-y-4">
              {incubators.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Left */}
                    <div className="flex-1">
                      {/* Types */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {inc.type.map((t) => (
                          <span
                            key={t}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              TYPE_COLORS[t] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                        {inc.established && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            Est. {inc.established}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-0.5">{inc.name}</h3>
                      <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> {inc.institution}
                      </p>
                      <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {inc.city}, {inc.state}
                      </p>

                      <p className="text-xs text-gray-500 leading-relaxed mb-3">{inc.description}</p>

                      {/* Sectors */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {inc.focus_sectors.slice(0, 5).map((s) => (
                          <span key={s} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100">
                            {s}
                          </span>
                        ))}
                        {inc.focus_sectors.length > 5 && (
                          <span className="text-[10px] text-gray-400">+{inc.focus_sectors.length - 5}</span>
                        )}
                      </div>

                      {/* Programs */}
                      {inc.programs.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {inc.programs.slice(0, 2).map((p) => (
                            <span key={p} className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                              {p}
                            </span>
                          ))}
                          {inc.programs.length > 2 && (
                            <span className="text-[10px] text-gray-400">+{inc.programs.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right */}
                    <div className="sm:w-52 shrink-0 space-y-3">
                      {/* Funding box */}
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <Banknote className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400">Funding</p>
                            <p className="text-xs font-medium text-gray-700">{inc.funding_available}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {inc.equity_taken ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          )}
                          <p className="text-[10px] text-gray-600">
                            {inc.equity_taken ? "Equity required" : "No equity taken"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">Stages</p>
                          <p className="text-xs text-gray-600">{inc.stage.join(", ")}</p>
                        </div>
                      </div>

                      {/* CTAs */}
                      <a
                        href={inc.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-medium hover:bg-brand-700 transition-colors w-full"
                      >
                        Apply now <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={inc.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600 w-full"
                      >
                        Visit website <ExternalLink className="w-3 h-3" />
                      </a>

                      {/* Notable alumni */}
                      {inc.notable_alumni.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-400 mb-1">Notable alumni</p>
                          <p className="text-[10px] text-gray-600">{inc.notable_alumni.join(", ")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {incubators.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Building className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No incubators found. Try different filters.</p>
              </div>
            )}
          </>
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
