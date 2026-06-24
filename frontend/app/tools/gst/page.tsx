"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import Link from "next/link";

const MODELS = [
  { value: "saas", label: "B2B SaaS" },
  { value: "d2c", label: "D2C (Direct to Consumer)" },
  { value: "marketplace", label: "Marketplace" },
  { value: "manufacturing", label: "Manufacturing" },
];

interface GSTGuide {
  model: string;
  gst_rate: number;
  itc_eligible: boolean;
  itc_notes: string;
  reverse_charge: boolean;
  reverse_charge_notes: string;
  filing_frequency: string;
  key_rules: string[];
  special_notes?: string;
}

interface GSTResult {
  monthly_revenue: number;
  gst_rate: number;
  gst_collected: number;
  itc_estimate: number;
  net_liability: number;
  effective_rate: number;
  b2b_pct: number;
  export_pct: number;
}

export default function GSTPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [model, setModel] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState(500000);
  const [b2bPct, setB2bPct] = useState(60);
  const [exportPct, setExportPct] = useState(0);
  const [result, setResult] = useState<GSTResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data: guide, isLoading: guideLoading } = useQuery<GSTGuide>({
    queryKey: ["gst-guide", model],
    queryFn: () => api.get(`/api/tools/gst/guide?model=${model}`).then((r) => r.data),
    enabled: !!model,
    staleTime: 300_000,
  });

  async function calculate() {
    setCalculating(true);
    try {
      const res = await api.post("/api/tools/gst/calculate", {
        model,
        monthly_revenue: monthlyRevenue,
        b2b_pct: b2bPct,
        export_pct: exportPct,
      });
      setResult(res.data);
      setStep(3);
    } catch {
      // Fallback calculation
      const rate = guide?.gst_rate || 18;
      const taxableRevenue = monthlyRevenue * (1 - exportPct / 100);
      const gstCollected = taxableRevenue * (rate / 100);
      const itcEstimate = guide?.itc_eligible ? gstCollected * 0.3 : 0;
      const netLiability = Math.max(0, gstCollected - itcEstimate);
      const effectiveRate = monthlyRevenue > 0 ? (netLiability / monthlyRevenue) * 100 : 0;
      setResult({
        monthly_revenue: monthlyRevenue,
        gst_rate: rate,
        gst_collected: Math.round(gstCollected),
        itc_estimate: Math.round(itcEstimate),
        net_liability: Math.round(netLiability),
        effective_rate: Math.round(effectiveRate * 100) / 100,
        b2b_pct: b2bPct,
        export_pct: exportPct,
      });
      setStep(3);
    } finally {
      setCalculating(false);
    }
  }

  if (!isAuthenticated()) return null;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-3">
            <Link href="/tools" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GST Impact Modeler</h1>
              <p className="text-gray-500 text-sm">Understand GST rates, ITC rules, and net liability for your business model.</p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {s}
                </div>
                <span className={`text-sm ${step === s ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                  {s === 1 ? "Business Model" : s === 2 ? "Revenue Details" : "Results"}
                </span>
                {s < 3 && <ChevronRight className="w-4 h-4 text-gray-200" />}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-1">Select your business model</h2>
                <p className="text-sm text-gray-500 mb-5">GST rates and ITC eligibility vary significantly by model.</p>

                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {MODELS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setModel(m.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        model === m.value
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div className="font-medium text-gray-900 text-sm">{m.label}</div>
                    </button>
                  ))}
                </div>

                {guideLoading && model && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                  </div>
                )}

                {guide && model && !guideLoading && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-5 space-y-3">
                    <div className="font-medium text-green-900 text-sm">GST Guide: {MODELS.find(m => m.value === model)?.label}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-2xl font-bold text-gray-900">{guide.gst_rate}%</div>
                        <div className="text-xs text-gray-500">GST Rate</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className={`text-sm font-semibold ${guide.itc_eligible ? "text-green-700" : "text-red-600"}`}>
                          {guide.itc_eligible ? "ITC Eligible" : "No ITC"}
                        </div>
                        <div className="text-xs text-gray-500">{guide.filing_frequency} filing</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">ITC Notes</div>
                      <p className="text-xs text-gray-600">{guide.itc_notes}</p>
                    </div>
                    {guide.reverse_charge && (
                      <div>
                        <div className="text-xs font-medium text-orange-700 mb-1">Reverse Charge Applies</div>
                        <p className="text-xs text-orange-600">{guide.reverse_charge_notes}</p>
                      </div>
                    )}
                    {guide.key_rules && guide.key_rules.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-2">Key Rules</div>
                        <ul className="space-y-1">
                          {guide.key_rules.map((r, i) => (
                            <li key={i} className="text-xs text-gray-600 flex gap-2">
                              <span className="text-green-500 shrink-0">•</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {guide.special_notes && (
                      <div className="text-xs text-blue-700 bg-blue-50 rounded-lg p-3">{guide.special_notes}</div>
                    )}
                  </div>
                )}

                <button
                  disabled={!model}
                  onClick={() => setStep(2)}
                  className="w-full mt-5 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-1">Enter your revenue details</h2>
              <p className="text-sm text-gray-500 mb-5">Model: {MODELS.find(m => m.value === model)?.label}</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Revenue (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={monthlyRevenue}
                      onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    B2B Sales % <span className="text-gray-400 font-normal">(sales to registered businesses — ITC flows back)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={b2bPct}
                      onChange={(e) => setB2bPct(Number(e.target.value))}
                      className="flex-1"
                    />
                    <div className="w-16 text-right font-semibold text-gray-900">{b2bPct}%</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Export Sales % <span className="text-gray-400 font-normal">(zero-rated under GST)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={exportPct}
                      onChange={(e) => setExportPct(Number(e.target.value))}
                      className="flex-1"
                    />
                    <div className="w-16 text-right font-semibold text-gray-900">{exportPct}%</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={calculate}
                    disabled={calculating || monthlyRevenue <= 0}
                    className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {calculating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Calculate GST Impact
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Results */}
          {step === 3 && result && (
            <div className="space-y-5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-1">GST Impact Summary</h2>
                <p className="text-sm text-gray-500 mb-5">
                  {MODELS.find(m => m.value === model)?.label} · Monthly revenue: {fmt(result.monthly_revenue)}
                </p>

                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className="py-3 text-gray-500">GST Rate</td>
                      <td className="py-3 font-medium text-gray-900 text-right">{result.gst_rate}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-500">Taxable Revenue (excl. exports)</td>
                      <td className="py-3 font-medium text-gray-900 text-right">{fmt(Math.round(result.monthly_revenue * (1 - result.export_pct / 100)))}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-500">GST Collected from Customers</td>
                      <td className="py-3 font-semibold text-gray-900 text-right">{fmt(result.gst_collected)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-500">Input Tax Credit (ITC) Estimate</td>
                      <td className="py-3 font-medium text-green-700 text-right">− {fmt(result.itc_estimate)}</td>
                    </tr>
                    <tr className="bg-gray-50 rounded-lg">
                      <td className="py-3 px-3 font-semibold text-gray-900 rounded-l-lg">Net GST Liability</td>
                      <td className="py-3 px-3 font-bold text-gray-900 text-right rounded-r-lg text-base">{fmt(result.net_liability)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-500">Effective GST Rate on Revenue</td>
                      <td className="py-3 font-medium text-gray-900 text-right">{result.effective_rate}%</td>
                    </tr>
                  </tbody>
                </table>

                {result.export_pct > 0 && (
                  <div className="mt-4 text-xs text-blue-700 bg-blue-50 rounded-lg p-3">
                    {fmt(Math.round(result.monthly_revenue * result.export_pct / 100))} of your revenue is zero-rated exports — no GST charged but you can still claim ITC refunds.
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(2); setResult(null); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Adjust inputs
                </button>
                <button
                  onClick={() => { setStep(1); setModel(""); setResult(null); }}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
