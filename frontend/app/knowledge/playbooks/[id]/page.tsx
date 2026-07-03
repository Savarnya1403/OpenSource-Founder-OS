"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Zap } from "lucide-react";

interface PlaybookSection {
  id: string;
  title: string;
  body: string;
}

interface Playbook {
  id: string;
  title: string;
  sector: string;
  description?: string;
  reading_time?: string;
  sections: PlaybookSection[];
}

export default function PlaybookPage() {
  const params = useParams();
  const id = params?.id as string;
  const isAuthed = isAuthenticated();
  const [activeSection, setActiveSection] = useState(0);

  const { data: pb, isLoading } = useQuery<Playbook>({
    queryKey: ["playbook", id],
    queryFn: () => api.get(`/api/knowledge/playbooks/${id}`).then((r) => r.data),
    enabled: !!id,
    staleTime: 300_000,
  });

  const sections = pb?.sections || [];

  const content = (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/knowledge/playbooks" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Playbooks
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-peach-500" />
          </div>
        ) : !pb ? (
          <div className="text-center py-20 text-stone-400">Playbook not found.</div>
        ) : (
          <div className="flex gap-6">
            {/* Table of contents sidebar */}
            {sections.length > 1 && (
              <aside className="w-56 shrink-0 hidden lg:block">
                <div className="glass rounded-2xl p-4 shadow-sm sticky top-8">
                  <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Contents</div>
                  <nav className="space-y-1">
                    {sections.map((sec, i) => (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSection(i)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                          activeSection === i
                            ? "bg-peach-50/60 text-peach-700 font-medium"
                            : "text-stone-500 hover:bg-peach-50/60 hover:text-stone-900"
                        }`}
                      >
                        {i + 1}. {sec.title}
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="glass rounded-2xl p-7 shadow-sm mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-peach-50/60 text-stone-700 border border-peach-200/40 px-2.5 py-1 rounded-full font-medium">
                    {pb.sector}
                  </span>
                  {pb.reading_time && (
                    <span className="text-xs text-stone-400">{pb.reading_time} read</span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-stone-900 mb-2">{pb.title}</h1>
                {pb.description && <p className="text-stone-500 text-sm">{pb.description}</p>}
              </div>

              {/* Section content */}
              {sections.length === 0 ? (
                <div className="text-center py-10 text-stone-400">No content available yet.</div>
              ) : sections.length === 1 ? (
                <div className="glass rounded-2xl p-7 shadow-sm">
                  <div className="prose prose-sm max-w-none text-stone-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{sections[0].body}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((sec, i) => (
                    <div
                      key={sec.id}
                      id={`section-${i}`}
                      className="glass rounded-2xl p-7 shadow-sm"
                    >
                      <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-peach-50/60 border border-peach-200/60 text-peach-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        {sec.title}
                      </h2>
                      <div className="prose prose-sm max-w-none text-stone-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{sec.body}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
