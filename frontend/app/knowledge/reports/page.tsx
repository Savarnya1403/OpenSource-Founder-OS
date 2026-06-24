"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Search, FileText, Building2, Landmark, BarChart3, BookMarked } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { api } from "@/lib/api";

const CATEGORIES = ["All", "VC Report", "Industry Report", "Government Report", "Consulting Report"];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "VC Report": Building2,
  "Industry Report": BarChart3,
  "Government Report": Landmark,
  "Consulting Report": BookMarked,
};

const CATEGORY_COLORS: Record<string, string> = {
  "VC Report": "bg-purple-100 text-purple-700",
  "Industry Report": "bg-blue-100 text-blue-700",
  "Government Report": "bg-orange-100 text-orange-700",
  "Consulting Report": "bg-gray-100 text-gray-700",
};

interface Report {
  id: string;
  title: string;
  publisher: string;
  publisher_type: string;
  logo_emoji: string;
  year: number;
  category: string;
  description: string;
  topics: string[];
  pages: number;
  url: string;
  free: boolean;
  format: string;
  tags: string[];
}

export default function ReportsPage() {
  const isAuthed = isAuthenticated();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["reports", category, search],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (category !== "All") params.category = category;
      if (search) params.search = search;
      const res = await api.get("/api/knowledge/reports", { params });
      return res.data;
    },
  });

  const content = (
    <main className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/knowledge" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" /> Knowledge Hub
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Research Reports</h1>
          <p className="text-gray-500 text-sm">
            Free VC reports, government startup data, and industry deep-dives — curated for Indian founders.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports by name, publisher, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === c
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        {!isLoading && (
          <p className="text-xs text-gray-400 mb-4">{reports.length} reports found</p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-52" />
            ))}
          </div>
        )}

        {/* Reports grid */}
        {!isLoading && (
          <div className="grid sm:grid-cols-2 gap-4">
            {reports.map((report) => {
              const CatIcon = CATEGORY_ICONS[report.category] || FileText;
              const catColor = CATEGORY_COLORS[report.category] || "bg-gray-100 text-gray-700";
              return (
                <div
                  key={report.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shrink-0">
                      {report.logo_emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${catColor}`}>
                          <CatIcon className="w-2.5 h-2.5" />
                          {report.category}
                        </span>
                        <span className="text-[10px] text-gray-400">{report.year}</span>
                        {report.free ? (
                          <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Free</span>
                        ) : (
                          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Paid</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{report.publisher}</p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-snug">{report.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1">{report.description}</p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {report.topics.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100">
                        {t}
                      </span>
                    ))}
                    {report.topics.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{report.topics.length - 3} more</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">{report.pages} pages · {report.format}</span>
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      Read report <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && reports.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No reports found. Try a different filter.</p>
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

  return <div className="min-h-screen bg-gray-50">{content}</div>;
}
