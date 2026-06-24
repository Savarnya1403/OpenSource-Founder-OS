"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, chatApi } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2, ChevronRight, ChevronLeft, Brain, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SectorBaseline {
  sector: string;
  total_market_size_cr: number;
  internet_users_mn: number;
  gdp_contribution_pct: number;
  description?: string;
}

interface MarketResult {
  tam_cr: number;
  sam_cr: number;
  som_cr: number;
  tam_users: number;
  sam_users: number;
  som_users: number;
  arpu: number;
  geography: string;
  sector: string;
}

const GEOGRAPHIES = [
  { value: "all_india", label: "All India" },
  { value: "metro", label: "Metro cities only" },
  { value: "tier1", label: "Tier 1 & Metro" },
  { value: "tier1_2", label: "Tier 1, 2 & Metro" },
  { value: "custom", label: "Custom states" },
];

export default function MarketSizePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState("");
  const [geography, setGeography] = useState("all_india");
  const [targetSegmentPct, setTargetSegmentPct] = useState(10);
  const [productAdoptionPct, setProductAdoptionPct] = useState(5);
  const [arpu, setArpu] = useState(1200);
  const [result, setResult] = useState<MarketResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data: sectors, isLoading: sectorsLoading } = useQuery<SectorBaseline[]>({
    queryKey: ["market-size-sectors"],
    queryFn: () => api.get("/api/tools/market-size/sectors").then((r) => r.data),
    staleTime: 300_000,
  });

  const selected = sectors?.find((s) => s.sector === selectedSector);

  async function calculate() {
    if (!selectedSector) return;
    setCalculating(true);
    try {
      const res = await api.post("/api/tools/market-size/calculate", {
        sector: selectedSector,
        geography,
        total_population: 1400,
        internet_penetration: 55,
        target_segment_pct: targetSegmentPct,
        product_adoption_pct: productAdoptionPct,
        arpu,
      });
      setResult(res.data);
      setStep(3);
    } catch (e) {
      // Fallback calculation client-side if API not ready
      const internetUsers = 770; // mn
      const geoMultiplier = geography === "metro" ? 0.18 : geography === "tier1" ? 0.35 : geography === "tier1_2" ? 0.6 : 1;
      const addressable = internetUsers * geoMultiplier;
      const tamUsers = addressable * 1_000_000;
      const samUsers = tamUsers * (targetSegmentPct / 100);
      const somUsers = samUsers * (productAdoptionPct / 100);
      const crDivisor = 10_000_000;
      setResult({
        tam_cr: Math.round((tamUsers * arpu) / crDivisor),
        sam_cr: Math.round((samUsers * arpu) / crDivisor),
        som_cr: Math.round((somUsers * arpu) / crDivisor),
        tam_users: Math.round(tamUsers),
        sam_users: Math.round(samUsers),
        som_users: Math.round(somUsers),
        arpu,
        geography,
        sector: selectedSector,
      });
      setStep(3);
    } finally {
      setCalculating(false);
    }
  }

  async function getAiAnalysis() {
    if (!result) return;
    setAiLoading(true);
    try {
      const res = await chatApi.message({
        message: `Analyze this market sizing for a ${result.sector} startup in India:
TAM: ₹${result.tam_cr.toLocaleString()} Cr (${(result.tam_users / 1_000_000).toFixed(1)}M users)
SAM: ₹${result.sam_cr.toLocaleString()} Cr (${(result.sam_users / 1_000_000).toFixed(1)}M users)
SOM: ₹${result.som_cr.toLocaleString()} Cr (${(result.som_users / 1_000_000).toFixed(1)}M users)
ARPU: ₹${result.arpu}/year, Geography: ${result.geography}

Give a concise 3-point analysis: (1) Is this realistic for an early-stage startup? (2) What's the investor perception likely to be? (3) One key risk to highlight.`,
      });
      setAiAnalysis(res.data?.response || res.data?.message || "");
    } catch {
      setAiAnalysis("Could not load AI analysis. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  if (!isAuthenticated()) return null;

  const maxBar = result ? Math.max(result.tam_cr, 1) : 1;

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
              <h1 className="text-2xl font-bold text-gray-900">TAM/SAM/SOM Wizard</h1>
              <p className="text-gray-500 text-sm">Calculate your addressable market using India baseline data.</p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {s}
                </div>
                <span className={`text-sm ${step === s ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                  {s === 1 ? "Choose Sector" : s === 2 ? "Your Inputs" : "Results"}
                </span>
                {s < 3 && <ChevronRight className="w-4 h-4 text-gray-200" />}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-1">Select your sector</h2>
              <p className="text-sm text-gray-500 mb-5">We'll pre-load India baseline data for your sector.</p>

              {sectorsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select a sector...</option>
                    {(sectors || []).map((s) => (
                      <option key={s.sector} value={s.sector}>{s.sector}</option>
                    ))}
                  </select>

                  {selected && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                      <div className="text-sm font-medium text-blue-900">{selected.sector} — India Baseline</div>
                      {selected.description && (
                        <p className="text-xs text-blue-700">{selected.description}</p>
                      )}
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">₹{selected.total_market_size_cr?.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Cr total market</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{selected.internet_users_mn}M</div>
                          <div className="text-xs text-gray-500">Internet users</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{selected.gdp_contribution_pct}%</div>
                          <div className="text-xs text-gray-500">GDP contribution</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!selectedSector}
                    onClick={() => setStep(2)}
                    className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-1">Your market parameters</h2>
              <p className="text-sm text-gray-500 mb-5">Define your target and revenue model.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Geography</label>
                  <select
                    value={geography}
                    onChange={(e) => setGeography(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {GEOGRAPHIES.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Target Segment % <span className="text-gray-400 font-normal">(what % of internet users are your potential customers?)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0.1}
                      max={100}
                      step={0.1}
                      value={targetSegmentPct}
                      onChange={(e) => setTargetSegmentPct(Number(e.target.value))}
                      className="flex-1"
                    />
                    <div className="w-16 text-right font-semibold text-gray-900">{targetSegmentPct}%</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Adoption % <span className="text-gray-400 font-normal">(what % of your segment will adopt your product?)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0.1}
                      max={50}
                      step={0.1}
                      value={productAdoptionPct}
                      onChange={(e) => setProductAdoptionPct(Number(e.target.value))}
                      className="flex-1"
                    />
                    <div className="w-16 text-right font-semibold text-gray-900">{productAdoptionPct}%</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual Revenue per User (ARPU) in ₹</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      min={1}
                      value={arpu}
                      onChange={(e) => setArpu(Number(e.target.value))}
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">E.g. SaaS at ₹999/mo = ₹11,988/year ARPU</p>
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
                    disabled={calculating}
                    className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Calculate Market Size
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Results */}
          {step === 3 && result && (
            <div className="space-y-5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-1">Your Market Sizing</h2>
                <p className="text-sm text-gray-500 mb-6">Sector: {result.sector} · Geography: {GEOGRAPHIES.find(g => g.value === result.geography)?.label}</p>

                {/* Visual bars */}
                <div className="space-y-4 mb-6">
                  {[
                    { label: "TAM", sublabel: "Total Addressable Market", value: result.tam_cr, users: result.tam_users, color: "bg-blue-500" },
                    { label: "SAM", sublabel: "Serviceable Addressable Market", value: result.sam_cr, users: result.sam_users, color: "bg-brand-500" },
                    { label: "SOM", sublabel: "Serviceable Obtainable Market", value: result.som_cr, users: result.som_users, color: "bg-green-500" },
                  ].map(({ label, sublabel, value, users, color }) => (
                    <div key={label}>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <div>
                          <span className="font-bold text-gray-900">{label}</span>
                          <span className="text-xs text-gray-400 ml-2">{sublabel}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900">₹{value.toLocaleString()} Cr</span>
                          <span className="text-xs text-gray-400 ml-2">{(users / 1_000_000).toFixed(1)}M users</span>
                        </div>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all`}
                          style={{ width: `${Math.min(100, (value / maxBar) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* The math */}
                <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-1.5">
                  <div className="font-medium text-gray-700 mb-2">The math</div>
                  <div>TAM = {(result.tam_users / 1_000_000).toFixed(1)}M addressable users × ₹{result.arpu.toLocaleString()} ARPU = <span className="font-semibold text-gray-900">₹{result.tam_cr.toLocaleString()} Cr</span></div>
                  <div>SAM = {(result.sam_users / 1_000_000).toFixed(1)}M target segment users × ₹{result.arpu.toLocaleString()} ARPU = <span className="font-semibold text-gray-900">₹{result.sam_cr.toLocaleString()} Cr</span></div>
                  <div>SOM = {(result.som_users / 1_000_000).toFixed(1)}M reachable users × ₹{result.arpu.toLocaleString()} ARPU = <span className="font-semibold text-gray-900">₹{result.som_cr.toLocaleString()} Cr</span></div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-violet-500" />
                    AI Analysis
                  </h3>
                  {!aiAnalysis && (
                    <button
                      onClick={getAiAnalysis}
                      disabled={aiLoading}
                      className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {aiLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                      Get AI Analysis
                    </button>
                  )}
                </div>
                {aiAnalysis ? (
                  <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{aiAnalysis}</p>
                ) : (
                  <p className="text-sm text-gray-400">Click "Get AI Analysis" to get an expert take on your market sizing from our AI cofounder.</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(2); setResult(null); setAiAnalysis(""); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Adjust inputs
                </button>
                <button
                  onClick={() => { setStep(1); setResult(null); setSelectedSector(""); setAiAnalysis(""); }}
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
