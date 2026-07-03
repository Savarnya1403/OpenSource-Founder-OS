"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TrendingDown, Info } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Round {
  label: string;
  valuation: number;      // pre-money valuation (₹ Cr)
  raise: number;          // amount raised (₹ Cr)
  esop_increase: number;  // new ESOP pool added (%)
}

interface ShareholderSlice {
  name: string;
  pct: number;
  color: string;
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const COLORS = {
  founders:    "#FF8C42",
  seed_inv:    "#8B5CF6",
  seriesA_inv: "#3B82F6",
  seriesB_inv: "#10B981",
  esop:        "#F59E0B",
  angels:      "#EC4899",
};

// ─── Math ─────────────────────────────────────────────────────────────────────

function calcWaterfall(
  founderPct: number,
  seedPct: number,
  rounds: Round[]
) {
  let founders = founderPct;
  let angels   = seedPct;
  let esop     = 100 - founderPct - seedPct;
  const investors: number[] = [];

  const snapshots: ShareholderSlice[][] = [
    [
      { name: "Founders", pct: founders, color: COLORS.founders },
      { name: "Angels / Pre-seed", pct: angels, color: COLORS.angels },
      { name: "ESOP", pct: esop, color: COLORS.esop },
    ],
  ];

  for (let i = 0; i < rounds.length; i++) {
    const r = rounds[i];
    const postMoney = r.valuation + r.raise;
    const newShares = r.raise / postMoney;   // dilution fraction
    const dilution  = 1 - newShares;

    // Dilute all existing holders
    founders *= dilution;
    angels   *= dilution;
    esop     *= dilution;
    investors.forEach((_, j) => { investors[j] *= dilution; });

    // Add new ESOP (on post-dilution base)
    const esopAdd = r.esop_increase * dilution;
    esop += esopAdd;
    founders -= esopAdd * (founders / (founders + angels + esop + investors.reduce((a,b) => a+b, 0) - esopAdd));

    // New investor
    investors.push(newShares * 100);

    const snap: ShareholderSlice[] = [
      { name: "Founders", pct: founders, color: COLORS.founders },
      { name: "Angels / Pre-seed", pct: angels, color: COLORS.angels },
      { name: "ESOP Pool", pct: esop, color: COLORS.esop },
    ];
    const roundLabels = ["Seed Investors", "Series A Investors", "Series B Investors"];
    const roundColors = [COLORS.seed_inv, COLORS.seriesA_inv, COLORS.seriesB_inv];
    investors.forEach((pct, j) => {
      snap.push({ name: roundLabels[j], pct, color: roundColors[j] });
    });

    snapshots.push(snap);
  }

  return snapshots;
}

// ─── Slider ──────────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, unit, onChange, hint }: {
  label: string; value: number; min: number; max: number; step: number;
  unit: string; onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-stone-600">{label}</label>
        <span className="text-sm font-bold text-peach-600">{unit === "₹" ? `${unit}${value} Cr` : `${value}${unit}`}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #FF8C42 0%, #FF8C42 ${((value-min)/(max-min))*100}%, #FFD6C2 ${((value-min)/(max-min))*100}%, #FFD6C2 100%)`,
          accentColor: "#FF8C42",
        }}
      />
      {hint && <p className="text-[10px] text-stone-300">{hint}</p>}
    </div>
  );
}

// ─── Custom Pie Label ─────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180;
function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, pct }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; name: string; pct: number;
}) {
  if (pct < 3) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
      {pct.toFixed(1)}%
    </text>
  );
}

const STAGE_LABELS = ["Pre-Seed", "Seed", "Series A", "Series B"];

export default function EquityWaterfallPage() {
  // Initial ownership
  const [founderPct, setFounderPct] = useState(70);
  const [angelPct, setAngelPct]     = useState(10);

  // Round parameters
  const [rounds, setRounds] = useState<Round[]>([
    { label: "Seed",     valuation: 25,  raise: 5,  esop_increase: 5 },
    { label: "Series A", valuation: 100, raise: 20, esop_increase: 5 },
    { label: "Series B", valuation: 400, raise: 80, esop_increase: 3 },
  ]);

  const [activeRound, setActiveRound] = useState(0);
  const [selectedSnapshot, setSelectedSnapshot] = useState(0);

  const esopPct = Math.max(0, 100 - founderPct - angelPct);

  function updateRound(i: number, key: keyof Round, val: number) {
    setRounds((prev) => prev.map((r, j) => j === i ? { ...r, [key]: val } : r));
  }

  const snapshots = useMemo(
    () => calcWaterfall(founderPct, angelPct, rounds.slice(0, activeRound + 1)),
    [founderPct, angelPct, rounds, activeRound]
  );

  const currentSnap = snapshots[Math.min(selectedSnapshot, snapshots.length - 1)];
  const founderFinal = currentSnap?.find((s) => s.name === "Founders")?.pct ?? founderPct;

  // Bar chart data — founder % across stages
  const barData = STAGE_LABELS.slice(0, activeRound + 2).map((label, i) => {
    const snap = snapshots[i] ?? [];
    const entry: Record<string, number | string> = { stage: label };
    snap.forEach((s) => { entry[s.name] = parseFloat(s.pct.toFixed(2)); });
    return entry;
  });

  const barKeys = currentSnap?.map((s) => s.name) ?? [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-8 py-3 glass-strong border-b border-peach-200/30 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-peach-500" />
          <span className="text-sm font-semibold text-stone-700">Equity Waterfall Simulator</span>
          <span className="badge-peach ml-2">Interactive</span>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Equity Waterfall Simulator</h1>
            <p className="text-stone-400 text-sm leading-relaxed">
              See exactly how your equity dilutes across Seed → Series A → Series B. Drag sliders to
              model different valuations and check sizes.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* Initial ownership */}
              <div className="glass rounded-2xl p-5">
                <p className="section-label mb-4">Initial Ownership (Pre-Seed)</p>
                <div className="space-y-5">
                  <Slider label="Founders" value={founderPct} min={30} max={90} step={1} unit="%" onChange={setFounderPct} />
                  <Slider label="Angels / Pre-seed" value={angelPct} min={0} max={30} step={1} unit="%" onChange={setAngelPct} />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">ESOP Pool (auto)</span>
                    <span className="font-bold text-amber-600">{esopPct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Rounds to model */}
              <div className="glass rounded-2xl p-5">
                <p className="section-label mb-3">Rounds to Model</p>
                <div className="flex gap-1 mb-4">
                  {rounds.map((r, i) => (
                    <button
                      key={r.label}
                      onClick={() => setActiveRound(i)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        i <= activeRound
                          ? "btn-coral"
                          : "bg-peach-50 text-stone-400 border border-peach-200/40"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {rounds.slice(0, activeRound + 1).map((r, i) => (
                  <div key={r.label} className="mb-5 pb-5 border-b border-peach-200/30 last:border-0 last:mb-0 last:pb-0">
                    <p className="text-xs font-semibold text-stone-700 mb-3">{r.label} Round</p>
                    <div className="space-y-4">
                      <Slider
                        label="Pre-money Valuation"
                        value={r.valuation} min={5} max={2000} step={5} unit="₹"
                        onChange={(v) => updateRound(i, "valuation", v)}
                        hint={`Post-money: ₹${r.valuation + r.raise} Cr`}
                      />
                      <Slider
                        label="Amount Raised"
                        value={r.raise} min={1} max={500} step={1} unit="₹"
                        onChange={(v) => updateRound(i, "raise", v)}
                      />
                      <Slider
                        label="ESOP Increase"
                        value={r.esop_increase} min={0} max={15} step={0.5} unit="%"
                        onChange={(v) => updateRound(i, "esop_increase", v)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Founder summary */}
              <div className="glass rounded-2xl p-5">
                <p className="section-label mb-3">Founder Retention</p>
                <div className="space-y-2">
                  {snapshots.map((snap, i) => {
                    const fPct = snap.find((s) => s.name === "Founders")?.pct ?? 0;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedSnapshot(i)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                          selectedSnapshot === i
                            ? "bg-peach-100 border border-peach-300 text-peach-800"
                            : "bg-white/40 border border-peach-100/40 text-stone-600 hover:bg-peach-50"
                        }`}
                      >
                        <span>{STAGE_LABELS[i]}</span>
                        <span className="font-bold">{fPct.toFixed(1)}%</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-peach-50/60 rounded-xl border border-peach-200/40">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Info className="w-3.5 h-3.5 text-peach-500" />
                    <span className="text-[11px] font-semibold text-stone-700">YC Benchmark</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    YC advises founders to retain ≥20% after Series A. At the numbers above,
                    you&apos;ll have <strong className="text-peach-700">{founderFinal.toFixed(1)}%</strong> at{" "}
                    {STAGE_LABELS[Math.min(selectedSnapshot, STAGE_LABELS.length - 1)]}.
                    {founderFinal < 20 && <span className="text-red-600"> ⚠ Consider a higher valuation or smaller raise.</span>}
                    {founderFinal >= 20 && <span className="text-green-600"> ✓ You&apos;re in healthy territory.</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pie */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-stone-900 text-sm">
                    Cap Table at {STAGE_LABELS[Math.min(selectedSnapshot, STAGE_LABELS.length - 1)]}
                  </p>
                  <p className="text-xs text-stone-400">Click stage buttons on the left to change view</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={currentSnap?.map((s) => ({ ...s, value: parseFloat(s.pct.toFixed(2)) }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      labelLine={false}
                      label={CustomPieLabel as unknown as boolean}
                    >
                      {currentSnap?.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${Number(v).toFixed(2)}%`, ""] as [string, string]} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {currentSnap?.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs text-stone-600">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                      <span>{s.name}</span>
                      <span className="font-semibold text-stone-800">{s.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar — dilution over time */}
              <div className="glass rounded-2xl p-6">
                <p className="font-semibold text-stone-900 text-sm mb-4">Ownership Evolution Across Rounds</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,200,160,0.30)" />
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, ""] as [string, string]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {barKeys.map((key) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={currentSnap?.find((s) => s.name === key)?.color ?? "#ccc"}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Key metrics table */}
              <div className="glass rounded-2xl p-6">
                <p className="font-semibold text-stone-900 text-sm mb-4">Round Economics Summary</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-peach-200/40">
                        {["Stage", "Pre-money", "Raise", "Post-money", "Founder %", "Dilution"].map((h) => (
                          <th key={h} className="text-left py-2 pr-4 text-stone-400 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-peach-100/40">
                        <td className="py-2 pr-4 font-medium text-stone-700">Pre-Seed</td>
                        <td className="py-2 pr-4 text-stone-500">—</td>
                        <td className="py-2 pr-4 text-stone-500">—</td>
                        <td className="py-2 pr-4 text-stone-500">—</td>
                        <td className="py-2 pr-4 font-bold text-peach-700">{founderPct.toFixed(1)}%</td>
                        <td className="py-2 pr-4 text-stone-500">0%</td>
                      </tr>
                      {rounds.slice(0, activeRound + 1).map((r, i) => {
                        const prevPct = snapshots[i]?.find((s) => s.name === "Founders")?.pct ?? founderPct;
                        const currPct = snapshots[i + 1]?.find((s) => s.name === "Founders")?.pct ?? 0;
                        const dilution = prevPct - currPct;
                        return (
                          <tr key={r.label} className="border-b border-peach-100/40">
                            <td className="py-2 pr-4 font-medium text-stone-700">{r.label}</td>
                            <td className="py-2 pr-4 text-stone-500">₹{r.valuation} Cr</td>
                            <td className="py-2 pr-4 text-stone-500">₹{r.raise} Cr</td>
                            <td className="py-2 pr-4 text-stone-500">₹{r.valuation + r.raise} Cr</td>
                            <td className="py-2 pr-4 font-bold text-peach-700">{currPct.toFixed(1)}%</td>
                            <td className="py-2 pr-4 text-red-500">-{dilution.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
