"use client";
import { useState, useMemo } from "react";
import { Plus, Trash2, AlertTriangle, CheckCircle, Info, TrendingDown, DollarSign, Calendar, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  monthlyAmount: number;
  isVariable: boolean;
}

interface RevenueItem {
  id: string;
  source: string;
  monthlyAmount: number;
  growthRate: number;
}

const EXPENSE_CATEGORIES = [
  "Salaries & Benefits", "Cloud & Infrastructure", "Marketing & Ads",
  "Office & Rent", "Legal & Compliance", "Tools & Software", "Travel",
  "Customer Acquisition", "R&D", "Contractor Fees", "Other"
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: "e1", category: "Salaries & Benefits", description: "Engineering team (5 people)", monthlyAmount: 600000, isVariable: false },
  { id: "e2", category: "Salaries & Benefits", description: "Sales & Marketing team (2 people)", monthlyAmount: 200000, isVariable: false },
  { id: "e3", category: "Cloud & Infrastructure", description: "AWS / GCP", monthlyAmount: 50000, isVariable: true },
  { id: "e4", category: "Marketing & Ads", description: "Performance marketing", monthlyAmount: 150000, isVariable: true },
  { id: "e5", category: "Office & Rent", description: "Co-working space", monthlyAmount: 80000, isVariable: false },
  { id: "e6", category: "Tools & Software", description: "SaaS tools (Notion, Slack, etc.)", monthlyAmount: 30000, isVariable: false },
];

const DEFAULT_REVENUES: RevenueItem[] = [
  { id: "r1", source: "MRR (Subscriptions)", monthlyAmount: 200000, growthRate: 15 },
  { id: "r2", source: "One-time Projects", monthlyAmount: 50000, growthRate: 5 },
];

function formatINR(val: number): string {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)} Cr`;
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${Math.round(val).toLocaleString()}`;
}

const RUNWAY_ALERTS = {
  critical: { months: 3, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle, msg: "Critical: Less than 3 months runway. Raise bridge or cut costs immediately." },
  warning: { months: 6, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: AlertTriangle, msg: "Warning: Under 6 months runway. Start fundraising now — it takes 6-9 months." },
  ok: { months: 12, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", icon: Info, msg: "Moderate: 6-12 months runway. Good time to start Series A conversations." },
  healthy: { months: 999, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle, msg: "Healthy: 12+ months runway. Focus on growth and metrics." },
};

function getRunwayAlert(months: number) {
  if (months < 3) return RUNWAY_ALERTS.critical;
  if (months < 6) return RUNWAY_ALERTS.warning;
  if (months < 12) return RUNWAY_ALERTS.ok;
  return RUNWAY_ALERTS.healthy;
}

export default function BurnRatePage() {
  const [bank, setBank] = useState<number>(5000000);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(DEFAULT_EXPENSES);
  const [revenues, setRevenues] = useState<RevenueItem[]>(DEFAULT_REVENUES);
  const [projectionMonths, setProjectionMonths] = useState(12);
  const [newExpense, setNewExpense] = useState({ category: "Salaries & Benefits", description: "", monthlyAmount: "", isVariable: false });
  const [newRevenue, setNewRevenue] = useState({ source: "", monthlyAmount: "", growthRate: "10" });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);

  const grossBurn = useMemo(() => expenses.reduce((a, e) => a + e.monthlyAmount, 0), [expenses]);
  const currentRevenue = useMemo(() => revenues.reduce((a, r) => a + r.monthlyAmount, 0), [revenues]);
  const netBurn = useMemo(() => grossBurn - currentRevenue, [grossBurn, currentRevenue]);
  const runwayMonths = useMemo(() => (netBurn > 0 ? bank / netBurn : 999), [bank, netBurn]);

  const alert = getRunwayAlert(runwayMonths);
  const AlertIcon = alert.icon;

  const projection = useMemo(() => {
    const months = [];
    let remainingCash = bank;
    let currentRev = currentRevenue;
    for (let i = 1; i <= projectionMonths; i++) {
      const avgGrowth = revenues.reduce((a, r) => a + r.growthRate, 0) / Math.max(revenues.length, 1);
      currentRev = currentRev * (1 + avgGrowth / 100);
      const net = grossBurn - currentRev;
      remainingCash -= net;
      months.push({
        month: i,
        revenue: Math.round(currentRev),
        burn: grossBurn,
        netBurn: Math.round(net),
        cash: Math.round(remainingCash),
        solvent: remainingCash > 0,
      });
    }
    return months;
  }, [bank, grossBurn, currentRevenue, revenues, projectionMonths]);

  const expenseByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach((e) => { cats[e.category] = (cats[e.category] || 0) + e.monthlyAmount; });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  function addExpense() {
    if (!newExpense.description || !newExpense.monthlyAmount) return;
    const e: ExpenseItem = { id: Date.now().toString(), ...newExpense, monthlyAmount: parseFloat(newExpense.monthlyAmount) };
    setExpenses([...expenses, e]);
    setNewExpense({ category: "Salaries & Benefits", description: "", monthlyAmount: "", isVariable: false });
    setShowAddExpense(false);
  }

  function addRevenue() {
    if (!newRevenue.source || !newRevenue.monthlyAmount) return;
    const r: RevenueItem = { id: Date.now().toString(), source: newRevenue.source, monthlyAmount: parseFloat(newRevenue.monthlyAmount), growthRate: parseFloat(newRevenue.growthRate) };
    setRevenues([...revenues, r]);
    setNewRevenue({ source: "", monthlyAmount: "", growthRate: "10" });
    setShowAddRevenue(false);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Burn Rate & Runway Calculator</h1>
            <p className="text-stone-500 text-sm">Know exactly how long your money lasts. Model growth scenarios and plan your fundraise.</p>
          </div>

          {/* Bank balance input */}
          <div className="glass rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="font-semibold text-stone-900 mb-4">Current Cash in Bank</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">₹</span>
                  <input
                    type="number"
                    value={bank}
                    onChange={(e) => setBank(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 border border-peach-200/60 rounded-xl text-lg font-semibold focus:outline-none focus:outline-none focus:border-peach-400"
                    placeholder="5000000"
                  />
                </div>
                <p className="text-sm text-stone-400 mt-1">{formatINR(bank)}</p>
              </div>
              <div className="text-center px-6">
                <p className="text-xs text-stone-400 mb-1">Net Monthly Burn</p>
                <p className={`text-2xl font-bold ${netBurn > 0 ? "text-red-600" : "text-green-600"}`}>
                  {netBurn > 0 ? "-" : "+"}{formatINR(Math.abs(netBurn))}
                </p>
              </div>
              <div className="text-center px-6">
                <p className="text-xs text-stone-400 mb-1">Runway</p>
                <p className={`text-2xl font-bold ${alert.color}`}>
                  {runwayMonths > 36 ? "36+" : runwayMonths.toFixed(1)} mo
                </p>
              </div>
            </div>
          </div>

          {/* Alert */}
          <div className={`${alert.bg} border ${alert.border} rounded-2xl p-4 mb-6 flex items-start gap-3`}>
            <AlertIcon className={`w-5 h-5 ${alert.color} mt-0.5 shrink-0`} />
            <p className={`text-sm font-medium ${alert.color}`}>{alert.msg}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Expenses */}
            <div className="glass rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-peach-100/40">
                <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  Monthly Expenses
                  <span className="text-sm font-normal text-red-600">{formatINR(grossBurn)}/mo</span>
                </h3>
                <button onClick={() => setShowAddExpense(!showAddExpense)}
                  className="flex items-center gap-1 text-xs text-peach-600 border border-peach-200/50 bg-peach-50/60 rounded-lg px-2.5 py-1.5 hover:bg-peach-100/60">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {showAddExpense && (
                <div className="p-4 bg-red-50 border-b border-red-100 space-y-2">
                  <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none">
                    {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Description" className="w-full px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none" />
                  <input value={newExpense.monthlyAmount} onChange={(e) => setNewExpense({ ...newExpense, monthlyAmount: e.target.value })}
                    placeholder="Monthly amount (₹)" type="number" className="w-full px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none" />
                  <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                    <input type="checkbox" checked={newExpense.isVariable} onChange={(e) => setNewExpense({ ...newExpense, isVariable: e.target.checked })} className="accent-peach-600" />
                    Variable cost (scales with usage/revenue)
                  </label>
                  <div className="flex gap-2">
                    <button onClick={addExpense} className="flex-1 bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700">Add Expense</button>
                    <button onClick={() => setShowAddExpense(false)} className="px-4 py-2 text-sm text-stone-500 border border-peach-200/60 rounded-lg hover:bg-peach-50/60">Cancel</button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-50">
                {expenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-peach-50/60/50">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{e.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-peach-100/60 text-stone-500 px-2 py-0.5 rounded-full">{e.category}</span>
                        {e.isVariable && <span className="text-[10px] bg-peach-100/60 text-peach-600 px-2 py-0.5 rounded-full">Variable</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-red-600">{formatINR(e.monthlyAmount)}/mo</p>
                      <button onClick={() => setExpenses(expenses.filter((ex) => ex.id !== e.id))}
                        className="text-gray-200 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category breakdown */}
              <div className="p-5 border-t border-peach-100/40">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">By Category</p>
                {expenseByCategory.map(([cat, amount]) => (
                  <div key={cat} className="flex items-center gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-stone-600">{cat}</span>
                        <span className="font-medium text-stone-900">{formatINR(amount)}</span>
                      </div>
                      <div className="w-full bg-peach-200/50 rounded-full h-1">
                        <div className="bg-red-400 h-1 rounded-full" style={{ width: `${(amount / grossBurn) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue */}
            <div className="glass rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-peach-100/40">
                <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Monthly Revenue
                  <span className="text-sm font-normal text-green-600">{formatINR(currentRevenue)}/mo</span>
                </h3>
                <button onClick={() => setShowAddRevenue(!showAddRevenue)}
                  className="flex items-center gap-1 text-xs text-peach-600 border border-peach-200/50 bg-peach-50/60 rounded-lg px-2.5 py-1.5 hover:bg-peach-100/60">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {showAddRevenue && (
                <div className="p-4 bg-green-50 border-b border-green-100 space-y-2">
                  <input value={newRevenue.source} onChange={(e) => setNewRevenue({ ...newRevenue, source: e.target.value })}
                    placeholder="Revenue source (e.g., SaaS subscriptions)" className="w-full px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none" />
                  <input value={newRevenue.monthlyAmount} onChange={(e) => setNewRevenue({ ...newRevenue, monthlyAmount: e.target.value })}
                    placeholder="Current monthly amount (₹)" type="number" className="w-full px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none" />
                  <div className="flex items-center gap-2">
                    <input value={newRevenue.growthRate} onChange={(e) => setNewRevenue({ ...newRevenue, growthRate: e.target.value })}
                      placeholder="Monthly growth %" type="number" className="flex-1 px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none" />
                    <span className="text-sm text-stone-400">% MoM growth</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addRevenue} className="flex-1 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700">Add Revenue</button>
                    <button onClick={() => setShowAddRevenue(false)} className="px-4 py-2 text-sm text-stone-500 border border-peach-200/60 rounded-lg hover:bg-peach-50/60">Cancel</button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-50">
                {revenues.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-peach-50/60/50">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{r.source}</p>
                      <p className="text-xs text-green-600 mt-0.5">+{r.growthRate}% MoM growth</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-green-600">{formatINR(r.monthlyAmount)}/mo</p>
                      <button onClick={() => setRevenues(revenues.filter((rv) => rv.id !== r.id))}
                        className="text-gray-200 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="p-5 border-t border-peach-100/40 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Gross Burn</span>
                  <span className="font-semibold text-red-600">{formatINR(grossBurn)}/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Revenue</span>
                  <span className="font-semibold text-green-600">{formatINR(currentRevenue)}/mo</span>
                </div>
                <div className="flex justify-between text-sm border-t border-peach-200/40 pt-2">
                  <span className="font-semibold text-stone-900">Net Burn</span>
                  <span className={`font-bold ${netBurn > 0 ? "text-red-600" : "text-green-600"}`}>
                    {netBurn > 0 ? "-" : "+"}{formatINR(Math.abs(netBurn))}/mo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Projection Table */}
          <div className="glass rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-peach-100/40">
              <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-peach-500" />
                Cash Flow Projection
              </h3>
              <select value={projectionMonths} onChange={(e) => setProjectionMonths(parseInt(e.target.value))}
                className="px-3 py-1.5 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none">
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-peach-50/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">Month</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">Revenue</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">Gross Burn</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">Net Burn</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">Cash Left</th>
                  </tr>
                </thead>
                <tbody>
                  {projection.map((m) => (
                    <tr key={m.month} className={`border-t border-peach-100/40 ${!m.solvent ? "bg-red-50" : ""}`}>
                      <td className="px-4 py-3 text-sm text-stone-600">Month {m.month}</td>
                      <td className="px-4 py-3 text-right text-sm text-green-600 font-medium">{formatINR(m.revenue)}</td>
                      <td className="px-4 py-3 text-right text-sm text-red-500">{formatINR(m.burn)}</td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${m.netBurn > 0 ? "text-red-600" : "text-green-600"}`}>
                        {m.netBurn > 0 ? "-" : "+"}{formatINR(Math.abs(m.netBurn))}
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-bold ${m.cash <= 0 ? "text-red-700" : m.cash < grossBurn * 3 ? "text-orange-600" : "text-stone-900"}`}>
                        {m.cash <= 0 ? "ZERO CASH ⚠️" : formatINR(m.cash)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
