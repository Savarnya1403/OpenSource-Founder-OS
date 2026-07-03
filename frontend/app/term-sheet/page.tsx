"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, BookOpen, ChevronDown, ChevronUp, Lightbulb,
  Calculator, Info, ArrowRight, Tag, Filter
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Term {
  id: string;
  term: string;
  category: string;
  difficulty: string;
  definition: string;
  formula?: string;
  example: string;
  founder_tip: string;
  related_terms: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Valuation": "bg-peach-100/60 text-peach-700 border-peach-200/60",
  "Investment Instrument": "bg-peach-50/60 text-stone-700 border-peach-200/40",
  "Investor Rights": "bg-peach-100/50 text-peach-700 border-peach-200/50",
  "Governance": "bg-peach-50/50 text-stone-700 border-peach-200/60",
  "Economics": "bg-peach-50/60 text-stone-700 border-peach-200/40",
  "Equity": "bg-peach-100/60 text-peach-700 border-peach-200/60",
  "Legal": "bg-peach-50/50 text-stone-700 border-peach-200/40",
  "Process": "bg-peach-100/40 text-stone-700 border-peach-200/40",
  "Finance": "bg-peach-50/60 text-stone-700 border-peach-200/40",
  "Metrics": "bg-peach-100/50 text-peach-700 border-peach-200/50",
  "Strategy": "bg-peach-50/60 text-stone-700 border-peach-200/40",
  "Funding Stage": "bg-peach-100/60 text-peach-700 border-peach-200/60",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  "Beginner": "bg-green-100 text-green-700",
  "Intermediate": "bg-amber-100 text-amber-700",
  "Advanced": "bg-red-100 text-red-700",
};

const CATEGORIES = [
  "", "Valuation", "Investment Instrument", "Investor Rights", "Governance",
  "Economics", "Equity", "Legal", "Process", "Finance", "Metrics", "Strategy", "Funding Stage"
];
const DIFFICULTIES = ["", "Beginner", "Intermediate", "Advanced"];

function TermCard({ term, allTerms }: { term: Term; allTerms: Term[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`glass rounded-2xl shadow-sm transition-all ${expanded ? "ring-2 ring-peach-300/50" : "hover:shadow-md"}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-stone-900 text-base">{term.term}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[term.difficulty]}`}>
                {term.difficulty}
              </span>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[term.category] || "bg-peach-50/50 text-stone-600 border-peach-200/60"}`}>
              {term.category}
            </span>
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed mb-3">{term.definition}</p>

        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs text-stone-400 hover:text-stone-600 transition-colors py-1.5 border-t border-peach-100/40">
          <span>{expanded ? "Hide details" : "Formula, example & founder tip"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-peach-100/40 pt-3">
            {/* Formula */}
            {term.formula && term.formula !== "N/A" && (
              <div className="bg-peach-50/60 border border-peach-200/40 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Calculator className="w-3 h-3" /> Formula
                </p>
                <p className="text-xs font-mono text-stone-700 leading-relaxed">{term.formula}</p>
              </div>
            )}

            {/* Example */}
            <div className="bg-peach-50/60 border border-peach-200/40 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Example
              </p>
              <p className="text-xs text-stone-700 leading-relaxed">{term.example}</p>
            </div>

            {/* Founder Tip */}
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Founder Tip
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">{term.founder_tip}</p>
            </div>

            {/* Related terms */}
            {term.related_terms.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-2">Related Terms</p>
                <div className="flex flex-wrap gap-1">
                  {term.related_terms.map((rt) => {
                    const found = allTerms.find(t => t.id === rt);
                    return found ? (
                      <button key={rt}
                        onClick={() => {
                          const el = document.getElementById(`term-${rt}`);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        className="text-[10px] text-peach-700 bg-peach-50/60 border border-peach-200/40 px-2 py-0.5 rounded-full hover:bg-peach-100/60 transition-colors">
                        {found.term}
                      </button>
                    ) : (
                      <span key={rt} className="text-[10px] text-stone-400 bg-peach-50/40 border border-peach-200/40 px-2 py-0.5 rounded-full">
                        {rt.replace(/-/g, " ")}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TermSheetPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (difficulty) params.set("difficulty", difficulty);

  const { data, isLoading } = useQuery({
    queryKey: ["term-sheet-glossary", search, category, difficulty],
    queryFn: async () => {
      const res = await fetch(`${API}/api/term-sheet/glossary?${params}`);
      return res.json();
    },
    staleTime: 60_000,
  });

  const terms: Term[] = data?.terms || [];

  const grouped = useMemo(() => {
    const g: Record<string, Term[]> = {};
    terms.forEach((t) => {
      if (!g[t.category]) g[t.category] = [];
      g[t.category].push(t);
    });
    return g;
  }, [terms]);

  const showGrouped = !search && !category && !difficulty;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Intelligence → Term Sheet Glossary
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Term Sheet Glossary</h1>
            <p className="text-stone-500 text-sm">
              45+ VC and startup finance terms explained simply — with formulas, real examples, and founder-specific tips.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Terms explained", value: `${data?.total || 45}+`, color: "text-peach-600 bg-peach-100/60" },
              { label: "Categories", value: "12", color: "text-peach-600 bg-peach-50/60" },
              { label: "Founder tips", value: `${data?.total || 45}+`, color: "text-amber-600 bg-amber-50" },
              { label: "Worked examples", value: `${data?.total || 45}+`, color: "text-green-600 bg-green-50" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 shadow-sm text-center">
                <p className={`text-xl font-bold mb-1 ${s.color.split(" ")[0]}`}>{s.value}</p>
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
                placeholder="Search terms, definitions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-peach-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-peach-400"
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="text-sm border border-peach-200/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white text-stone-700">
              <option value="">All Categories</option>
              {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
              className="text-sm border border-peach-200/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white text-stone-700">
              <option value="">All Levels</option>
              {DIFFICULTIES.filter(Boolean).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {(search || category || difficulty) && (
              <button onClick={() => { setSearch(""); setCategory(""); setDifficulty(""); }}
                className="text-sm text-stone-400 hover:text-stone-600 px-3">
                Clear
              </button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl border border-peach-200/40 p-5 animate-pulse">
                  <div className="h-4 bg-peach-100/50 rounded mb-2 w-1/2" />
                  <div className="h-3 bg-peach-100/50 rounded mb-2 w-full" />
                  <div className="h-3 bg-peach-100/50 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : terms.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No terms found</p>
            </div>
          ) : showGrouped ? (
            <div className="space-y-8">
              {Object.entries(grouped).map(([cat, catTerms]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[cat] || "bg-peach-50/50 text-stone-600 border-peach-200/60"}`}>
                      {cat}
                    </span>
                    <span className="text-xs text-stone-400">{catTerms.length} terms</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {catTerms.map((t) => (
                      <div key={t.id} id={`term-${t.id}`}>
                        <TermCard term={t} allTerms={terms} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {terms.map((t) => (
                <div key={t.id} id={`term-${t.id}`}>
                  <TermCard term={t} allTerms={terms} />
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-stone-900 text-sm">Ready to negotiate your term sheet?</p>
              <p className="text-xs text-stone-500 mt-0.5">Model your cap table, simulate dilution, and track your fundraise pipeline.</p>
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <Link href="/tools/cap-table"
                className="btn-coral text-sm font-medium px-3 py-2 rounded-lg whitespace-nowrap">
                Cap Table →
              </Link>
              <Link href="/tools/fundraise"
                className="bg-white border border-peach-200/60 text-stone-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-peach-50/60 transition-colors whitespace-nowrap">
                Fundraise Tracker →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
