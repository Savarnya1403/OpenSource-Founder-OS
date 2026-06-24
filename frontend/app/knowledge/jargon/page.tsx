"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2, Search, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Zap } from "lucide-react";

interface JargonTerm {
  term: string;
  definition: string;
  india_note?: string;
  category?: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function JargonPage() {
  const isAuthed = isAuthenticated();
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["jargon", search, activeLetter],
    queryFn: () =>
      api.get("/api/knowledge/jargon", {
        params: { search: search || undefined, letter: activeLetter || undefined },
      }).then((r) => r.data),
    staleTime: 300_000,
  });

  const terms: JargonTerm[] = data?.terms || data || [];

  // Group by first letter
  const grouped = terms.reduce<Record<string, JargonTerm[]>>((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  const content = (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/knowledge" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Jargon Buster</h1>
            <p className="text-gray-500 text-sm">200+ startup, VC, and compliance terms explained with India-specific context.</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveLetter(""); }}
                placeholder="Search terms..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {(search || activeLetter) && (
              <button
                onClick={() => { setSearch(""); setActiveLetter(""); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 hover:bg-gray-50"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* A-Z nav */}
        {!search && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {ALPHABET.map((l) => (
              <button
                key={l}
                onClick={() => setActiveLetter(activeLetter === l ? "" : l)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  activeLetter === l
                    ? "bg-brand-600 text-white"
                    : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
          </div>
        ) : terms.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No terms found.
          </div>
        ) : (
          <div className="space-y-6">
            {letters.map((letter) => (
              <div key={letter}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center">
                    {letter}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="space-y-3">
                  {grouped[letter].map((t) => (
                    <div key={t.term} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{t.term}</h3>
                        {t.category && (
                          <span className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full ml-3 shrink-0">
                            {t.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{t.definition}</p>
                      {t.india_note && (
                        <div className="mt-3 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                          <span className="font-medium">India context:</span> {t.india_note}
                        </div>
                      )}
                    </div>
                  ))}
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
