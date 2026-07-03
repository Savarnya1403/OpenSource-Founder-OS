"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

interface IPSection {
  fees?: { item: string; amount: string }[];
  timeline?: string;
  process_steps?: string[];
  attorney_finder?: string;
  description?: string;
  key_points?: string[];
}

interface IPData {
  patent?: IPSection;
  trademark?: IPSection;
  copyright?: IPSection;
}

const TABS = [
  { key: "patent" as const, label: "Patent", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  { key: "trademark" as const, label: "Trademark", color: "text-peach-600", bg: "bg-peach-50/60 border-peach-200/40" },
  { key: "copyright" as const, label: "Copyright", color: "text-green-600", bg: "bg-green-50 border-green-200" },
];

export default function IPWizardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"patent" | "trademark" | "copyright">("patent");

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data, isLoading } = useQuery<IPData>({
    queryKey: ["wizard-ip"],
    queryFn: () => api.get("/api/wizards/ip").then((r) => r.data),
    enabled: isAuthenticated(),
    staleTime: 300_000,
  });

  if (!isAuthenticated()) return null;

  const section = data?.[activeTab];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-3">
            <Link href="/wizards" className="text-stone-400 hover:text-stone-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">IP Filing Assistant</h1>
              <p className="text-stone-500 text-sm">Patents, trademarks, and copyrights for Indian startups.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === key
                    ? "bg-white border border-peach-200/60 text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700 hover:bg-white/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-peach-500" />
            </div>
          ) : !section ? (
            <div className="text-center py-20 text-stone-400">
              IP data is loading from the backend.
            </div>
          ) : (
            <div className="space-y-5">
              {section.description && (
                <div className="glass rounded-2xl p-6 shadow-sm">
                  <p className="text-stone-600 text-sm leading-relaxed">{section.description}</p>
                </div>
              )}

              {section.timeline && (
                <div className="glass rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-stone-900 mb-2">Timeline</h3>
                  <div className="text-sm text-stone-600 bg-peach-50/40 rounded-lg px-4 py-3">{section.timeline}</div>
                </div>
              )}

              {section.fees && section.fees.length > 0 && (
                <div className="glass rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-stone-900 mb-4">Fee Schedule</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-peach-200/40">
                        <th className="text-left py-2 text-xs font-medium text-stone-400">Item</th>
                        <th className="text-right py-2 text-xs font-medium text-stone-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {section.fees.map((fee, i) => (
                        <tr key={i}>
                          <td className="py-3 text-stone-600">{fee.item}</td>
                          <td className="py-3 text-right font-medium text-stone-900">{fee.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.process_steps && section.process_steps.length > 0 && (
                <div className="glass rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-stone-900 mb-4">Process Steps</h3>
                  <ol className="space-y-3">
                    {section.process_steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-peach-50/60 border border-peach-200/60 text-peach-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-stone-600 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {section.key_points && section.key_points.length > 0 && (
                <div className="glass rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-stone-900 mb-4">Key Points</h3>
                  <ul className="space-y-2">
                    {section.key_points.map((pt, i) => (
                      <li key={i} className="text-sm text-stone-600 flex gap-2">
                        <span className="text-peach-500 shrink-0 mt-0.5">•</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.attorney_finder && (
                <div className="glass rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-stone-900 mb-3">Find a Patent/IP Attorney</h3>
                  <p className="text-sm text-stone-500 mb-4">
                    Engaging a qualified IP attorney can significantly improve your chances of a successful filing.
                  </p>
                  <a
                    href={section.attorney_finder}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 btn-coral px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Find an attorney <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
