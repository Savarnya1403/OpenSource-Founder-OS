"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { api } from "@/lib/api";
import { FileText, TrendingUp, Info, RefreshCw, ExternalLink } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Legend, ReferenceLine,
} from "recharts";

interface Benchmark {
  ticker: string;
  name: string;
  sector: string;
  revenue_growth_yoy: number;
  gross_margin: number;
  rule_of_40: number;
  arr_usd_m: number;
  nrr?: number;
  cac_payback_months?: number;
  ev_revenue?: number;
  exchange: "NSE" | "BSE" | "NYSE" | "NASDAQ";
  fiscal_year: string;
  source_url: string;
}

const SECTORS = ["All", "SaaS", "FinTech", "EdTech", "HealthTech", "Logistics", "D2C", "E-commerce"];

const RULE40_DESCRIPTION = `The "Rule of 40" states a healthy SaaS company's revenue growth rate (%) + profit margin (%) should exceed 40. It's the primary benchmark used by growth equity investors to evaluate capital efficiency.`;

function GradeBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="w-full bg-peach-100 rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, (Math.max(0, value) / max) * 100)}%`, background: color }}
      />
    </div>
  );
}

export default function SECBenchmarksPage() {
  const [sector, setSector] = useState("All");
  const [metric, setMetric] = useState<"rule_of_40" | "gross_margin" | "revenue_growth_yoy">("rule_of_40");

  const { data, isLoading, isFetching, refetch } = useQuery<{ benchmarks: Benchmark[]; cached: boolean; updated_at: string }>({
    queryKey: ["sec-benchmarks", sector],
    queryFn: () =>
      api.get("/api/intel/benchmarks", { params: { sector: sector === "All" ? undefined : sector } })
        .then((r) => r.data),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const benchmarks = data?.benchmarks ?? [];

  const sorted = [...benchmarks].sort((a, b) => b[metric] - a[metric]);
  const top = sorted[0];

  const metricConfig = {
    rule_of_40: { label: "Rule of 40 Score", unit: "", color: "#FF8C42", description: "Growth % + Profit %. >40 is healthy." },
    gross_margin: { label: "Gross Margin", unit: "%", color: "#8B5CF6", description: "Revenue remaining after COGS. SaaS typically 65–85%." },
    revenue_growth_yoy: { label: "YoY Revenue Growth", unit: "%", color: "#10B981", description: "Year-over-year revenue growth rate." },
  };

  const mc = metricConfig[metric];

  const scatterData = benchmarks.map((b) => ({
    x: b.revenue_growth_yoy,
    y: b.gross_margin,
    z: b.arr_usd_m,
    name: b.ticker,
    rule40: b.rule_of_40,
  }));

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 glass-strong border-b border-peach-200/30 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-peach-500" />
            <span className="text-sm font-semibold text-stone-700">SEC / Public Market Benchmarks</span>
            <span className="badge-peach ml-2">Real Data</span>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-ghost-peach text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Rule of 40 & Public Market Benchmarks</h1>
            <p className="text-stone-400 text-sm leading-relaxed">
              Compare your startup metrics against public Indian tech companies (Freshworks, Info Edge, Delhivery, Zomato)
              and global SaaS benchmarks. Data sourced from SEC EDGAR, NSE, and public filings.
            </p>
          </div>

          {/* Rule of 40 explainer */}
          <div className="glass rounded-2xl p-5 mb-6 border-peach-300/40 animate-fade-in">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-peach-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-stone-900 text-sm mb-1">What is the Rule of 40?</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{RULE40_DESCRIPTION}</p>
                <div className="flex gap-3 mt-3">
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs text-green-700">
                    <span className="font-bold">≥40</span> Healthy — growth investors will pay premium multiples
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs text-amber-700">
                    <span className="font-bold">20–40</span> Acceptable at early stage
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs text-red-700">
                    <span className="font-bold">&lt;20</span> Rethink unit economics
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSector(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${sector === s ? "btn-coral" : "btn-ghost-peach"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${metric === m ? "btn-coral" : "btn-ghost-peach"}`}
                >
                  {metricConfig[m].label}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
            </div>
          )}

          {!isLoading && (
            <>
              {/* Bar chart */}
              <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
                <p className="font-semibold text-stone-900 text-sm mb-1">
                  {mc.label} — Ranked
                </p>
                <p className="text-xs text-stone-400 mb-4">{mc.description}</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sorted} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,200,160,0.30)" />
                    <XAxis dataKey="ticker" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit={mc.unit} />
                    <Tooltip
                      formatter={(v) => [`${Number(v).toFixed(1)}${mc.unit}`, mc.label] as [string, string]}
                      contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,200,160,0.4)", borderRadius: "12px", fontSize: "12px" }}
                    />
                    <ReferenceLine y={metric === "rule_of_40" ? 40 : metric === "gross_margin" ? 65 : 50} stroke="#FF8C42" strokeDasharray="5 5" label={{ value: metric === "rule_of_40" ? "Rule of 40 Threshold" : "Benchmark", fontSize: 10, fill: "#FF8C42" }} />
                    <Bar dataKey={metric} fill={mc.color} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Scatter: Growth vs Gross Margin */}
              <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
                <p className="font-semibold text-stone-900 text-sm mb-1">Growth Rate vs. Gross Margin</p>
                <p className="text-xs text-stone-400 mb-4">
                  Bubble size = ARR. Top-right quadrant = high growth + high margin = Rule of 40 leaders.
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,200,160,0.30)" />
                    <XAxis dataKey="x" name="Revenue Growth" unit="%" tick={{ fontSize: 11 }} label={{ value: "YoY Growth %", position: "insideBottom", offset: -2, fontSize: 10, fill: "#999" }} />
                    <YAxis dataKey="y" name="Gross Margin" unit="%" tick={{ fontSize: 11 }} label={{ value: "Gross Margin %", angle: -90, position: "insideLeft", fontSize: 10, fill: "#999" }} />
                    <ZAxis dataKey="z" range={[60, 600]} />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ payload }) => {
                        if (!payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white/95 border border-peach-200 rounded-xl p-3 text-xs shadow-glass">
                            <p className="font-bold text-stone-800">{d.name}</p>
                            <p className="text-stone-500">Growth: {d.x.toFixed(1)}%</p>
                            <p className="text-stone-500">Gross Margin: {d.y.toFixed(1)}%</p>
                            <p className="text-peach-600 font-semibold">Rule of 40: {d.rule40.toFixed(0)}</p>
                          </div>
                        );
                      }}
                    />
                    <ReferenceLine x={0} stroke="#ccc" />
                    <ReferenceLine y={60} stroke="#ccc" />
                    <Scatter data={scatterData} fill="#FF8C42" fillOpacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <p className="font-semibold text-stone-900 text-sm mb-4">Full Benchmark Table</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-peach-200/40">
                        {["Company", "Sector", "ARR ($M)", "YoY Growth", "Gross Margin", "Rule of 40", "EV/Rev", "Exchange", ""].map((h) => (
                          <th key={h} className="text-left py-2 pr-4 text-stone-400 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((b) => {
                        const r40Color = b.rule_of_40 >= 40 ? "text-green-600" : b.rule_of_40 >= 20 ? "text-amber-600" : "text-red-600";
                        return (
                          <tr key={b.ticker} className="border-b border-peach-100/40 hover:bg-peach-50/30 transition-colors">
                            <td className="py-3 pr-4">
                              <p className="font-semibold text-stone-800">{b.name}</p>
                              <p className="text-stone-400">{b.ticker}</p>
                            </td>
                            <td className="py-3 pr-4 text-stone-500">{b.sector}</td>
                            <td className="py-3 pr-4 font-medium text-stone-700">${b.arr_usd_m.toFixed(0)}M</td>
                            <td className="py-3 pr-4">
                              <div className="space-y-1">
                                <span className={`font-semibold ${b.revenue_growth_yoy >= 20 ? "text-green-600" : "text-stone-500"}`}>
                                  {b.revenue_growth_yoy.toFixed(1)}%
                                </span>
                                <GradeBar value={b.revenue_growth_yoy} max={100} color="#10B981" />
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="space-y-1">
                                <span className={`font-semibold ${b.gross_margin >= 60 ? "text-green-600" : "text-amber-600"}`}>
                                  {b.gross_margin.toFixed(1)}%
                                </span>
                                <GradeBar value={b.gross_margin} max={100} color="#8B5CF6" />
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`font-bold text-base ${r40Color}`}>{b.rule_of_40.toFixed(0)}</span>
                            </td>
                            <td className="py-3 pr-4 text-stone-500">
                              {b.ev_revenue ? `${b.ev_revenue.toFixed(1)}x` : "—"}
                            </td>
                            <td className="py-3 pr-4">
                              <span className="badge-blue">{b.exchange}</span>
                            </td>
                            <td className="py-3">
                              <a href={b.source_url} target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-peach-500 transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-stone-300 mt-3">
                  Data sourced from SEC EDGAR, NSE, BSE public filings and annual reports. Last updated: {data?.updated_at ?? "loading..."}
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
