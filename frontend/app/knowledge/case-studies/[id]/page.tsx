"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Zap } from "lucide-react";

interface Milestone {
  year: string | number;
  event: string;
}

interface FundraisingRound {
  round: string;
  amount: string;
  investors: string;
  year: string | number;
}

interface UnitEconomics {
  metric: string;
  value: string;
}

interface CaseStudy {
  id: string;
  startup_name: string;
  founder: string;
  year: number;
  sector: string;
  valuation?: string;
  tagline: string;
  overview?: string;
  problem?: string;
  solution?: string;
  milestones?: Milestone[];
  fundraising?: FundraisingRound[];
  unit_economics?: UnitEconomics[];
  key_lessons?: string[];
  founder_quote?: string;
  cover_image?: string;
}

export default function CaseStudyPage() {
  const params = useParams();
  const id = params?.id as string;
  const isAuthed = isAuthenticated();

  const { data: cs, isLoading } = useQuery<CaseStudy>({
    queryKey: ["case-study", id],
    queryFn: () => api.get(`/api/knowledge/case-studies/${id}`).then((r) => r.data),
    enabled: !!id,
    staleTime: 300_000,
  });

  const content = (
    <main className="flex-1 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/knowledge/case-studies" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Case Studies
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
          </div>
        ) : !cs ? (
          <div className="text-center py-20 text-gray-400">Case study not found.</div>
        ) : (
          <article className="space-y-6">
            {/* Hero */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {cs.cover_image ? (
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${cs.cover_image})` }} />
              ) : (
                <div className="h-32 bg-gradient-to-br from-brand-500 to-saffron-400 flex items-center justify-center">
                  <span className="text-5xl font-black text-white/30">{cs.startup_name[0]}</span>
                </div>
              )}
              <div className="p-7">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{cs.startup_name}</h1>
                    {cs.founder && <p className="text-sm text-gray-500 mt-0.5">Founded by {cs.founder} · {cs.year}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                      {cs.sector}
                    </span>
                    {cs.valuation && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full font-medium">
                        {cs.valuation}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic">{cs.tagline}</p>
              </div>
            </div>

            {/* Founder quote */}
            {cs.founder_quote && (
              <blockquote className="bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-100 rounded-2xl p-6">
                <p className="text-gray-700 text-base italic leading-relaxed mb-3">"{cs.founder_quote}"</p>
                <footer className="text-sm font-medium text-brand-600">— {cs.founder}</footer>
              </blockquote>
            )}

            {/* Overview */}
            {cs.overview && (
              <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-3">Company Overview</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{cs.overview}</p>
              </section>
            )}

            {/* Problem + Solution */}
            {(cs.problem || cs.solution) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {cs.problem && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-3">The Problem</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">{cs.problem}</p>
                  </div>
                )}
                {cs.solution && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-3">The Solution</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">{cs.solution}</p>
                  </div>
                )}
              </div>
            )}

            {/* Milestones */}
            {cs.milestones && cs.milestones.length > 0 && (
              <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-5">Key Milestones</h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                  <div className="space-y-5">
                    {cs.milestones.map((m, i) => (
                      <div key={i} className="flex items-start gap-4 pl-10 relative">
                        <div className="absolute left-0 w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-brand-600">{m.year}</span>
                        </div>
                        <p className="text-sm text-gray-600 pt-1.5">{m.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Fundraising */}
            {cs.fundraising && cs.fundraising.length > 0 && (
              <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Fundraising Journey</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left py-2 text-xs font-medium text-gray-400">Round</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-400">Amount</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-400">Investors</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-400">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {cs.fundraising.map((r, i) => (
                        <tr key={i}>
                          <td className="py-3 font-medium text-gray-900">{r.round}</td>
                          <td className="py-3 text-green-700 font-medium">{r.amount}</td>
                          <td className="py-3 text-gray-500 text-xs">{r.investors}</td>
                          <td className="py-3 text-gray-500">{r.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Unit Economics */}
            {cs.unit_economics && cs.unit_economics.length > 0 && (
              <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Unit Economics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {cs.unit_economics.map((ue, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-base font-bold text-gray-900">{ue.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{ue.metric}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key lessons */}
            {cs.key_lessons && cs.key_lessons.length > 0 && (
              <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Key Lessons</h2>
                <ol className="space-y-3">
                  {cs.key_lessons.map((lesson, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-600 pt-0.5">{lesson}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </article>
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
