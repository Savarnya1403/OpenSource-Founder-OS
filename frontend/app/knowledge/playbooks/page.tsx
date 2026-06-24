"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { SECTORS } from "@/lib/utils";
import { Loader2, ArrowRight, ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";
import { Zap } from "lucide-react";

interface Playbook {
  id: string;
  title: string;
  sector: string;
  description: string;
  icon?: string;
  reading_time?: string;
}

const SECTOR_ICONS: Record<string, string> = {
  "FinTech": "💳",
  "EdTech": "📚",
  "HealthTech": "🏥",
  "AgriTech": "🌾",
  "SaaS": "💻",
  "D2C": "📦",
  "DeepTech": "🔬",
  "AI/ML": "🤖",
  "Logistics": "🚛",
  "Gaming": "🎮",
};

export default function PlaybooksPage() {
  const isAuthed = isAuthenticated();
  const [sector, setSector] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["playbooks", sector],
    queryFn: () => api.get("/api/knowledge/playbooks", { params: { sector: sector || undefined } }).then((r) => r.data),
    staleTime: 60_000,
  });

  const playbooks: Playbook[] = data?.playbooks || data || [];

  const content = (
    <main className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/knowledge" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sector Playbooks</h1>
            <p className="text-gray-500 text-sm">Deep-dive guides on building in specific sectors in India.</p>
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
        ) : playbooks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No playbooks found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playbooks.map((pb) => (
              <Link
                key={pb.id}
                href={`/knowledge/playbooks/${pb.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-2xl">
                  {pb.icon || SECTOR_ICONS[pb.sector] || "📖"}
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full w-fit mb-2">
                  {pb.sector}
                </span>
                <h3 className="font-semibold text-gray-900 mb-2">{pb.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4 flex-1">{pb.description}</p>
                {pb.reading_time && (
                  <div className="text-xs text-gray-400 mb-3">{pb.reading_time} read</div>
                )}
                <span className="text-xs font-medium text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Playbook <ArrowRight className="w-3 h-3" />
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
