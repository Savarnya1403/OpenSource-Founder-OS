"use client";
import { useState, useMemo } from "react";
import { Plus, Trash2, GitFork, Info, Download, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

interface Shareholder {
  id: string;
  name: string;
  type: "Founder" | "Employee" | "Investor" | "ESOP" | "Advisor";
  shares: number;
  investedAmount: number;
  roundName: string;
  pricePerShare: number;
  isEsop?: boolean;
}

interface Round {
  id: string;
  name: string;
  preMoneyValuation: number;
  investmentAmount: number;
  pricePerShare: number;
  newShares: number;
  leadInvestor: string;
  date: string;
}

const DEFAULT_SHAREHOLDERS: Shareholder[] = [
  { id: "f1", name: "Founder 1 (CEO)", type: "Founder", shares: 4000000, investedAmount: 0, roundName: "Founding", pricePerShare: 0.001 },
  { id: "f2", name: "Founder 2 (CTO)", type: "Founder", shares: 3000000, investedAmount: 0, roundName: "Founding", pricePerShare: 0.001 },
  { id: "f3", name: "Founder 3 (COO)", type: "Founder", shares: 1500000, investedAmount: 0, roundName: "Founding", pricePerShare: 0.001 },
  { id: "esop", name: "ESOP Pool", type: "ESOP", shares: 1500000, investedAmount: 0, roundName: "Founding", pricePerShare: 0.001, isEsop: true },
];

const TYPE_COLORS: Record<string, string> = {
  Founder: "bg-peach-100/60 text-stone-700",
  Employee: "bg-peach-50/60 text-stone-700",
  Investor: "bg-green-100 text-green-700",
  ESOP: "bg-orange-100 text-orange-700",
  Advisor: "bg-peach-100/60 text-peach-700",
};

const ROUND_TEMPLATES = [
  { name: "Pre-Seed", preMoneyValuation: 20000000, investmentAmount: 5000000 },
  { name: "Seed", preMoneyValuation: 50000000, investmentAmount: 10000000 },
  { name: "Series A", preMoneyValuation: 150000000, investmentAmount: 25000000 },
  { name: "Series B", preMoneyValuation: 400000000, investmentAmount: 60000000 },
];

function formatINR(usd: number): string {
  const inr = usd * 83;
  if (inr >= 10_000_000) return `₹${(inr / 10_000_000).toFixed(1)} Cr`;
  if (inr >= 100_000) return `₹${(inr / 100_000).toFixed(1)} L`;
  return `₹${inr.toLocaleString()}`;
}

function formatUSD(val: number): string {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toFixed(2)}`;
}

export default function CapTablePage() {
  const [shareholders, setShareholders] = useState<Shareholder[]>(DEFAULT_SHAREHOLDERS);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [totalFoundingShares] = useState(10_000_000);
  const [newRound, setNewRound] = useState({ name: "", preMoneyValuation: "", investmentAmount: "", leadInvestor: "", date: "" });
  const [newShareholder, setNewShareholder] = useState({ name: "", type: "Investor" as const, shares: "", investedAmount: "", roundName: "Founding", pricePerShare: "" });
  const [showAddShareholder, setShowAddShareholder] = useState(false);
  const [showAddRound, setShowAddRound] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  const totalShares = useMemo(() => shareholders.reduce((a, s) => a + s.shares, 0), [shareholders]);

  const latestValuation = useMemo(() => {
    if (rounds.length === 0) return null;
    const last = rounds[rounds.length - 1];
    return last.preMoneyValuation + last.investmentAmount;
  }, [rounds]);

  function fmt(val: number): string {
    return currency === "INR" ? formatINR(val) : formatUSD(val);
  }

  function addRound() {
    if (!newRound.name || !newRound.preMoneyValuation || !newRound.investmentAmount) return;
    const preMoney = parseFloat(newRound.preMoneyValuation);
    const investment = parseFloat(newRound.investmentAmount);
    const postMoney = preMoney + investment;
    const pricePerShare = preMoney / totalShares;
    const newShares = Math.round(investment / pricePerShare);
    const round: Round = {
      id: Date.now().toString(),
      name: newRound.name,
      preMoneyValuation: preMoney,
      investmentAmount: investment,
      pricePerShare,
      newShares,
      leadInvestor: newRound.leadInvestor,
      date: newRound.date,
    };
    setRounds([...rounds, round]);
    const investorShareholder: Shareholder = {
      id: Date.now().toString(),
      name: newRound.leadInvestor || `${newRound.name} Investors`,
      type: "Investor",
      shares: newShares,
      investedAmount: investment,
      roundName: newRound.name,
      pricePerShare,
    };
    setShareholders([...shareholders, investorShareholder]);
    setNewRound({ name: "", preMoneyValuation: "", investmentAmount: "", leadInvestor: "", date: "" });
    setShowAddRound(false);
  }

  function addShareholder() {
    if (!newShareholder.name || !newShareholder.shares) return;
    const sh: Shareholder = {
      id: Date.now().toString(),
      name: newShareholder.name,
      type: newShareholder.type,
      shares: parseFloat(newShareholder.shares),
      investedAmount: parseFloat(newShareholder.investedAmount) || 0,
      roundName: newShareholder.roundName,
      pricePerShare: parseFloat(newShareholder.pricePerShare) || 0,
    };
    setShareholders([...shareholders, sh]);
    setNewShareholder({ name: "", type: "Investor", shares: "", investedAmount: "", roundName: "Founding", pricePerShare: "" });
    setShowAddShareholder(false);
  }

  function removeShareholder(id: string) {
    setShareholders(shareholders.filter((s) => s.id !== id));
  }

  function applyTemplate(t: typeof ROUND_TEMPLATES[0]) {
    setNewRound((prev) => ({ ...prev, name: t.name, preMoneyValuation: t.preMoneyValuation.toString(), investmentAmount: t.investmentAmount.toString() }));
  }

  function reset() {
    setShareholders(DEFAULT_SHAREHOLDERS);
    setRounds([]);
  }

  const currentValuationPerShare = latestValuation ? latestValuation / totalShares : null;
  const foundingPPS = 0.001;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-x-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 mb-1">Cap Table Simulator</h1>
              <p className="text-stone-500 text-sm">Model equity dilution through funding rounds. See exactly who owns what.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex glass rounded-lg p-1">
                {(["USD", "INR"] as const).map((c) => (
                  <button key={c} onClick={() => setCurrency(c)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${currency === c ? "btn-coral" : "text-stone-500 hover:text-stone-700"}`}>
                    {c}
                  </button>
                ))}
              </div>
              <button onClick={reset}
                className="flex items-center gap-1.5 text-sm text-stone-500 border border-peach-200/60 glass rounded-lg px-3 py-2 hover:bg-peach-50/60">
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="glass rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-stone-400 mb-1">Total Shares</p>
              <p className="text-xl font-bold text-stone-900">{totalShares.toLocaleString()}</p>
            </div>
            <div className="glass rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-stone-400 mb-1">Post-Money Valuation</p>
              <p className="text-xl font-bold text-green-600">{latestValuation ? fmt(latestValuation) : "—"}</p>
            </div>
            <div className="glass rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-stone-400 mb-1">Price Per Share</p>
              <p className="text-xl font-bold text-peach-600">{currentValuationPerShare ? `${currency === "INR" ? "₹" : "$"}${currentValuationPerShare.toFixed(3)}` : "—"}</p>
            </div>
            <div className="glass rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-stone-400 mb-1">Funding Rounds</p>
              <p className="text-xl font-bold text-orange-600">{rounds.length}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cap Table */}
            <div className="lg:col-span-2">
              <div className="glass rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-5 border-b border-peach-100/40">
                  <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-peach-500" />
                    Cap Table
                  </h2>
                  <button
                    onClick={() => setShowAddShareholder(!showAddShareholder)}
                    className="flex items-center gap-1.5 text-xs font-medium text-peach-600 border border-peach-200/50 bg-peach-50/60 rounded-lg px-3 py-1.5 hover:bg-peach-100/60"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Shareholder
                  </button>
                </div>

                {showAddShareholder && (
                  <div className="p-4 bg-peach-50/60 border-b border-peach-200/30">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        value={newShareholder.name}
                        onChange={(e) => setNewShareholder({ ...newShareholder, name: e.target.value })}
                        placeholder="Name (e.g., Angel Investor)"
                        className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                      />
                      <select
                        value={newShareholder.type}
                        onChange={(e) => setNewShareholder({ ...newShareholder, type: e.target.value as any })}
                        className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
                      >
                        {["Founder", "Investor", "Employee", "ESOP", "Advisor"].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input
                        value={newShareholder.shares}
                        onChange={(e) => setNewShareholder({ ...newShareholder, shares: e.target.value })}
                        placeholder="Number of shares"
                        type="number"
                        className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                      />
                      <input
                        value={newShareholder.investedAmount}
                        onChange={(e) => setNewShareholder({ ...newShareholder, investedAmount: e.target.value })}
                        placeholder="Invested amount (USD)"
                        type="number"
                        className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addShareholder}
                        className="flex-1 btn-coral text-sm font-medium px-4 py-2 rounded-lg">
                        Add
                      </button>
                      <button onClick={() => setShowAddShareholder(false)}
                        className="px-4 py-2 text-sm text-stone-500 border border-peach-200/60 rounded-lg hover:bg-peach-50/60">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-peach-100/40">
                        <th className="text-left p-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Shareholder</th>
                        <th className="text-right p-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Shares</th>
                        <th className="text-right p-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Ownership %</th>
                        <th className="text-right p-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Value</th>
                        <th className="text-right p-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Round</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {shareholders.map((sh) => {
                        const pct = ((sh.shares / totalShares) * 100).toFixed(2);
                        const value = latestValuation ? (sh.shares / totalShares) * latestValuation : sh.shares * foundingPPS;
                        return (
                          <tr key={sh.id} className="border-b border-peach-100/40 hover:bg-peach-50/60/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[sh.type]}`}>{sh.type}</span>
                                <span className="text-sm font-medium text-stone-900">{sh.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right text-sm text-stone-600">{sh.shares.toLocaleString()}</td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-peach-200/50 rounded-full h-1.5">
                                  <div className="bg-peach-50/600 h-1.5 rounded-full" style={{ width: `${Math.min(parseFloat(pct), 100)}%` }} />
                                </div>
                                <span className="text-sm font-semibold text-stone-900 w-12 text-right">{pct}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-right text-sm font-medium text-stone-700">{fmt(value)}</td>
                            <td className="p-4 text-right text-xs text-stone-400">{sh.roundName}</td>
                            <td className="p-4">
                              <button onClick={() => removeShareholder(sh.id)}
                                className="text-stone-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-peach-50/30">
                        <td className="p-4 text-sm font-bold text-stone-900">Total</td>
                        <td className="p-4 text-right text-sm font-bold text-stone-900">{totalShares.toLocaleString()}</td>
                        <td className="p-4 text-right text-sm font-bold text-stone-900">100.00%</td>
                        <td className="p-4 text-right text-sm font-bold text-green-600">{latestValuation ? fmt(latestValuation) : "—"}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-4">
              {/* Add round */}
              <div className="glass rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-stone-900 text-sm">Simulate a Round</h3>
                  <button onClick={() => setShowAddRound(!showAddRound)}
                    className="text-xs text-peach-600 hover:text-peach-700 font-medium">
                    {showAddRound ? "Hide" : "Add"}
                  </button>
                </div>

                {/* Round templates */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {ROUND_TEMPLATES.map((t) => (
                    <button key={t.name} onClick={() => { applyTemplate(t); setShowAddRound(true); }}
                      className="text-xs bg-peach-50/40 hover:bg-peach-50/60 hover:text-peach-700 border border-peach-200/40 rounded-lg px-2 py-1.5 text-stone-600 text-left transition-colors">
                      {t.name}
                    </button>
                  ))}
                </div>

                {showAddRound && (
                  <div className="space-y-2">
                    <input
                      value={newRound.name}
                      onChange={(e) => setNewRound({ ...newRound, name: e.target.value })}
                      placeholder="Round name (e.g., Series A)"
                      className="w-full px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        value={newRound.preMoneyValuation}
                        onChange={(e) => setNewRound({ ...newRound, preMoneyValuation: e.target.value })}
                        placeholder="Pre-money valuation"
                        type="number"
                        className="w-full pl-6 pr-3 py-2 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        value={newRound.investmentAmount}
                        onChange={(e) => setNewRound({ ...newRound, investmentAmount: e.target.value })}
                        placeholder="Investment amount"
                        type="number"
                        className="w-full pl-6 pr-3 py-2 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                      />
                    </div>
                    <input
                      value={newRound.leadInvestor}
                      onChange={(e) => setNewRound({ ...newRound, leadInvestor: e.target.value })}
                      placeholder="Lead investor name"
                      className="w-full px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                    />
                    {newRound.preMoneyValuation && newRound.investmentAmount && (
                      <div className="bg-peach-50/60 rounded-xl p-3">
                        <p className="text-xs text-green-600 font-semibold mb-1">Round Preview</p>
                        <div className="space-y-0.5 text-xs text-green-800">
                          <p>Post-Money: {fmt(parseFloat(newRound.preMoneyValuation) + parseFloat(newRound.investmentAmount))}</p>
                          <p>New PPS: {currency === "INR" ? "₹" : "$"}{(parseFloat(newRound.preMoneyValuation) / totalShares).toFixed(4)}</p>
                          <p>New Shares: {Math.round(parseFloat(newRound.investmentAmount) / (parseFloat(newRound.preMoneyValuation) / totalShares)).toLocaleString()}</p>
                          <p>Dilution: {((parseFloat(newRound.investmentAmount) / (parseFloat(newRound.preMoneyValuation) + parseFloat(newRound.investmentAmount))) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    )}
                    <button onClick={addRound}
                      className="w-full btn-coral text-sm font-medium px-4 py-2 rounded-lg">
                      Add Round
                    </button>
                  </div>
                )}
              </div>

              {/* Rounds history */}
              {rounds.length > 0 && (
                <div className="glass rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-stone-900 text-sm mb-4">Funding History</h3>
                  <div className="space-y-3">
                    {rounds.map((r, i) => (
                      <div key={r.id} className="flex items-center justify-between border-b border-peach-100/40 pb-3 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-stone-900">{r.name}</p>
                          <p className="text-xs text-stone-400">{r.leadInvestor}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">{fmt(r.investmentAmount)}</p>
                          <p className="text-xs text-stone-400">{fmt(r.preMoneyValuation + r.investmentAmount)} post</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800 mb-1">Cap Table Tips</p>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• Keep ESOP pool 10-15% before Series A</li>
                      <li>• Pre-seed: founders should retain 80%+</li>
                      <li>• Each round dilutes all existing shareholders proportionally</li>
                      <li>• Indian law requires private limited company for VC investment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
