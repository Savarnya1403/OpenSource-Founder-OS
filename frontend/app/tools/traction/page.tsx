"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2, TrendingUp, TrendingDown, Minus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface TractionEntry {
  id?: string;
  date: string;
  mrr?: number;
  arr?: number;
  dau?: number;
  mau?: number;
  cac?: number;
  ltv?: number;
  nps?: number;
  notes?: string;
}

interface ChartData {
  labels: string[];
  mrr: number[];
  dau: number[];
  cac: number[];
  ltv: number[];
  nps: number[];
  latest: {
    mrr?: number;
    dau?: number;
    cac?: number;
    ltv?: number;
    nps?: number;
    mrr_change?: number;
    dau_change?: number;
    cac_change?: number;
    ltv_change?: number;
    nps_change?: number;
  };
}

function Arrow({ change }: { change?: number }) {
  if (change === undefined || change === null || isNaN(change)) return <Minus className="w-4 h-4 text-gray-300" />;
  if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-gray-300" />;
}

function ChangeLabel({ change }: { change?: number }) {
  if (change === undefined || change === null || isNaN(change)) return <span className="text-gray-300">—</span>;
  const abs = Math.abs(change).toFixed(1);
  if (change > 0) return <span className="text-green-600 text-xs">+{abs}% vs last week</span>;
  if (change < 0) return <span className="text-red-500 text-xs">{abs}% vs last week</span>;
  return <span className="text-gray-400 text-xs">No change</span>;
}

export default function TractionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<TractionEntry>({ date: today });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data: entries, isLoading: entriesLoading } = useQuery<TractionEntry[]>({
    queryKey: ["traction"],
    queryFn: () => api.get("/api/traction").then((r) => r.data?.entries || r.data || []),
    enabled: isAuthenticated(),
  });

  const { data: chart, isLoading: chartLoading } = useQuery<ChartData>({
    queryKey: ["traction-chart"],
    queryFn: () => api.get("/api/traction/chart").then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const latest = chart?.latest;

  async function logMetrics() {
    if (!form.date) return;
    setSubmitting(true);
    try {
      await api.post("/api/traction", form);
      toast.success("Metrics logged!");
      queryClient.invalidateQueries({ queryKey: ["traction"] });
      queryClient.invalidateQueries({ queryKey: ["traction-chart"] });
      setForm({ date: today });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to log metrics");
    } finally {
      setSubmitting(false);
    }
  }

  const setField = (key: keyof TractionEntry, value: string) => {
    setForm((f) => ({ ...f, [key]: value === "" ? undefined : key === "date" || key === "notes" ? value : Number(value) }));
  };

  if (!isAuthenticated()) return null;

  const recent = (entries || []).slice(-8).reverse();

  const STAT_CARDS = [
    { key: "mrr", label: "MRR", prefix: "₹", change: latest?.mrr_change, value: latest?.mrr, format: (v: number) => v.toLocaleString("en-IN") },
    { key: "dau", label: "DAU", prefix: "", change: latest?.dau_change, value: latest?.dau, format: (v: number) => v.toLocaleString() },
    { key: "cac", label: "CAC", prefix: "₹", change: latest?.cac_change, value: latest?.cac, format: (v: number) => v.toLocaleString("en-IN"), invertColor: true },
    { key: "ltv", label: "LTV", prefix: "₹", change: latest?.ltv_change, value: latest?.ltv, format: (v: number) => v.toLocaleString("en-IN") },
    { key: "nps", label: "NPS", prefix: "", change: latest?.nps_change, value: latest?.nps, format: (v: number) => String(v), suffix: "/100" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center gap-3">
            <Link href="/tools" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Traction Dashboard</h1>
              <p className="text-gray-500 text-sm">Log and track your key startup metrics over time.</p>
            </div>
          </div>

          {/* Stat cards */}
          {chartLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
              {STAT_CARDS.map(({ key, label, prefix, suffix, change, value, format }) => (
                <div key={key} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="text-xs text-gray-400 mb-1">{label}</div>
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {value !== undefined && value !== null ? `${prefix}${format(value)}${suffix || ""}` : "—"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Arrow change={change} />
                    <ChangeLabel change={change} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Log metrics form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Log Metrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setField("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">MRR (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.mrr ?? ""}
                  onChange={(e) => setField("mrr", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">DAU</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.dau ?? ""}
                  onChange={(e) => setField("dau", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">MAU</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.mau ?? ""}
                  onChange={(e) => setField("mau", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CAC (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.cac ?? ""}
                  onChange={(e) => setField("cac", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">LTV (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.ltv ?? ""}
                  onChange={(e) => setField("ltv", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">NPS (0–100)</label>
                <input
                  type="number"
                  placeholder="0"
                  min={-100}
                  max={100}
                  value={form.nps ?? ""}
                  onChange={(e) => setField("nps", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional..."
                  value={form.notes ?? ""}
                  onChange={(e) => setField("notes", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <button
              onClick={logMetrics}
              disabled={submitting || !form.date}
              className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Log metrics
            </button>
          </div>

          {/* History table */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Recent History (last 8 weeks)</h2>
            {entriesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No metrics logged yet. Use the form above to log your first entry.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left py-3 text-xs font-medium text-gray-400 pr-4">Date</th>
                      <th className="text-right py-3 text-xs font-medium text-gray-400 px-4">MRR</th>
                      <th className="text-right py-3 text-xs font-medium text-gray-400 px-4">DAU</th>
                      <th className="text-right py-3 text-xs font-medium text-gray-400 px-4">CAC</th>
                      <th className="text-right py-3 text-xs font-medium text-gray-400 px-4">LTV</th>
                      <th className="text-right py-3 text-xs font-medium text-gray-400 pl-4">NPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recent.map((entry, i) => (
                      <tr key={entry.id || i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 text-gray-500 pr-4 whitespace-nowrap">{entry.date}</td>
                        <td className="py-3 text-right px-4 font-medium text-gray-900">
                          {entry.mrr !== undefined ? `₹${entry.mrr.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="py-3 text-right px-4 text-gray-700">
                          {entry.dau !== undefined ? entry.dau.toLocaleString() : "—"}
                        </td>
                        <td className="py-3 text-right px-4 text-gray-700">
                          {entry.cac !== undefined ? `₹${entry.cac.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="py-3 text-right px-4 text-gray-700">
                          {entry.ltv !== undefined ? `₹${entry.ltv.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="py-3 text-right pl-4 text-gray-700">
                          {entry.nps !== undefined ? entry.nps : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
