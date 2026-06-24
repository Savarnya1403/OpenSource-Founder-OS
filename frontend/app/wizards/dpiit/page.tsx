"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2, ArrowLeft, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "dpiit_progress";

interface WizardStep {
  id: string | number;
  title: string;
  description: string;
  documents?: string[];
  links?: { label: string; url: string }[];
  tips?: string[];
}

interface WizardData {
  title?: string;
  description?: string;
  steps: WizardStep[];
}

export default function DPIITWizardPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return new Set(saved ? JSON.parse(saved) : []);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data, isLoading } = useQuery<WizardData>({
    queryKey: ["wizard-dpiit"],
    queryFn: () => api.get("/api/wizards/dpiit").then((r) => r.data),
    enabled: isAuthenticated(),
    staleTime: 300_000,
  });

  const steps: WizardStep[] = data?.steps || [];

  function toggleComplete(stepId: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  if (!isAuthenticated()) return null;

  const doneCount = steps.filter((s) => completed.has(String(s.id))).length;
  const progress = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-3">
            <Link href="/wizards" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DPIIT Recognition Wizard</h1>
              <p className="text-gray-500 text-sm">Your step-by-step journey to DPIIT recognition.</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Your DPIIT Journey</span>
              <span className="text-sm font-bold text-brand-600">{doneCount}/{steps.length} steps</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2">{progress}% complete</div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
            </div>
          ) : steps.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              No steps available. The wizard data is loading from the backend.
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, idx) => {
                const stepId = String(step.id);
                const isDone = completed.has(stepId);
                return (
                  <div
                    key={stepId}
                    className={`bg-white border rounded-2xl p-6 shadow-sm transition-all ${
                      isDone ? "border-green-200 bg-green-50/30" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step number */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                        isDone ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {isDone ? "✓" : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{step.description}</p>

                        {step.documents && step.documents.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-500 mb-2">Documents needed:</div>
                            <ul className="space-y-1">
                              {step.documents.map((doc, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {step.tips && step.tips.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-amber-600 mb-2">Tips:</div>
                            <ul className="space-y-1">
                              {step.tips.map((tip, i) => (
                                <li key={i} className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {step.links && step.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {step.links.map((link, i) => (
                              <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-lg"
                              >
                                {link.label} <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => toggleComplete(stepId)}
                          className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                            isDone
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          {isDone ? "Marked complete" : "Mark as complete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
