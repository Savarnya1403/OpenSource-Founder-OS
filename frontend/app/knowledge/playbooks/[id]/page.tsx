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
    <main className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/knowledge/playbooks" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Playbooks
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
          </div>
        ) : !pb ? (
          <div className="text-center py-20 text-gray-400">Playbook not found.</div>
        ) : (
          <div className="flex gap-6">
            {/* Table of contents sidebar */}
            {sections.length > 1 && (
              <aside className="w-56 shrink-0 hidden lg:block">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm sticky top-8">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contents</div>
                  <nav className="space-y-1">
                    {sections.map((sec, i) => (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSection(i)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                          activeSection === i
                            ? "bg-brand-50 text-brand-700 font-medium"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
              <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                    {pb.sector}
                  </span>
                  {pb.reading_time && (
                    <span className="text-xs text-gray-400">{pb.reading_time} read</span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{pb.title}</h1>
                {pb.description && <p className="text-gray-500 text-sm">{pb.description}</p>}
              </div>

              {/* Section content */}
              {sections.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No content available yet.</div>
              ) : sections.length === 1 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{sections[0].body}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((sec, i) => (
                    <div
                      key={sec.id}
                      id={`section-${i}`}
                      className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm"
                    >
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        {sec.title}
                      </h2>
                      <div className="prose prose-sm max-w-none text-gray-700">
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
