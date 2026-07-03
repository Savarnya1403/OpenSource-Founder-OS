"use client";
import { useState, useId } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Target, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2,
  Circle, AlertCircle, TrendingUp, BarChart3, Calendar, Zap, Edit2, Check, X
} from "lucide-react";

interface KeyResult {
  id: string;
  text: string;
  target: string;
  current: string;
  unit: string;
}

interface Objective {
  id: string;
  title: string;
  owner: string;
  quarter: string;
  keyResults: KeyResult[];
  color: string;
}

const COLORS = [
  "bg-peach-100/60 border-peach-300/60 text-stone-700",
  "bg-peach-50/60 border-blue-300 text-stone-700",
  "bg-green-100 border-green-300 text-green-700",
  "bg-orange-100 border-orange-300 text-orange-700",
  "bg-peach-100/60 border-peach-300/60 text-peach-700",
  "bg-peach-50/60 border-peach-200/40 text-stone-700",
];

const DEFAULT_OBJECTIVES: Objective[] = [
  {
    id: "obj-1",
    title: "Achieve strong revenue growth",
    owner: "CEO",
    quarter: "Q3 2025",
    color: COLORS[0],
    keyResults: [
      { id: "kr-1-1", text: "Grow MRR", target: "50", current: "32", unit: "₹ Lakh" },
      { id: "kr-1-2", text: "Sign new enterprise clients", target: "5", current: "2", unit: "clients" },
      { id: "kr-1-3", text: "Reduce monthly churn", target: "1", current: "2.5", unit: "%" },
    ],
  },
  {
    id: "obj-2",
    title: "Ship a world-class product",
    owner: "CTO",
    quarter: "Q3 2025",
    color: COLORS[1],
    keyResults: [
      { id: "kr-2-1", text: "Increase feature velocity", target: "12", current: "7", unit: "features/month" },
      { id: "kr-2-2", text: "Reduce p95 API latency", target: "200", current: "450", unit: "ms" },
      { id: "kr-2-3", text: "Achieve NPS score", target: "50", current: "38", unit: "NPS" },
    ],
  },
  {
    id: "obj-3",
    title: "Build a world-class team",
    owner: "CEO",
    quarter: "Q3 2025",
    color: COLORS[2],
    keyResults: [
      { id: "kr-3-1", text: "Hire key roles", target: "6", current: "2", unit: "hires" },
      { id: "kr-3-2", text: "Improve eNPS", target: "40", current: "28", unit: "eNPS" },
      { id: "kr-3-3", text: "Reduce time to hire", target: "21", current: "35", unit: "days" },
    ],
  },
];

function progressPct(current: string, target: string, inverse = false): number {
  const c = parseFloat(current);
  const t = parseFloat(target);
  if (!t || isNaN(c) || isNaN(t)) return 0;
  const pct = inverse ? (t / c) * 100 : (c / t) * 100;
  return Math.min(100, Math.max(0, pct));
}

function getProgressColor(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-400";
}

function getProgressStatus(pct: number): { label: string; icon: React.ElementType; color: string } {
  if (pct >= 100) return { label: "Achieved", icon: CheckCircle2, color: "text-green-600" };
  if (pct >= 70) return { label: "On track", icon: TrendingUp, color: "text-peach-600" };
  if (pct >= 40) return { label: "At risk", icon: AlertCircle, color: "text-amber-600" };
  return { label: "Behind", icon: AlertCircle, color: "text-red-600" };
}

function KRRow({
  kr,
  onUpdate,
  onDelete,
}: {
  kr: KeyResult;
  onUpdate: (updated: KeyResult) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(kr);
  const isInverse = ["churn", "latency", "days", "time"].some(w => kr.text.toLowerCase().includes(w));
  const pct = progressPct(kr.current, kr.target, isInverse);
  const { label, icon: StatusIcon, color: statusColor } = getProgressStatus(pct);

  const save = () => { onUpdate(draft); setEditing(false); };

  return (
    <div className="border border-peach-200/40 rounded-xl p-3">
      {editing ? (
        <div className="space-y-2">
          <input value={draft.text} onChange={e => setDraft({ ...draft, text: e.target.value })}
            className="w-full text-sm border border-peach-200/60 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-400" placeholder="Key Result" />
          <div className="flex gap-2">
            <input value={draft.current} onChange={e => setDraft({ ...draft, current: e.target.value })}
              className="w-24 text-sm border border-peach-200/60 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-400" placeholder="Current" />
            <span className="text-stone-400 self-center text-sm">/</span>
            <input value={draft.target} onChange={e => setDraft({ ...draft, target: e.target.value })}
              className="w-24 text-sm border border-peach-200/60 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-400" placeholder="Target" />
            <input value={draft.unit} onChange={e => setDraft({ ...draft, unit: e.target.value })}
              className="w-28 text-sm border border-peach-200/60 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-400" placeholder="Unit" />
            <button onClick={save} className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-peach-100/60 text-stone-600 hover:bg-peach-200/60"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm text-stone-700">{kr.text}</p>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing(true)} className="p-1 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-peach-100/60">
                <Edit2 className="w-3 h-3" />
              </button>
              <button onClick={onDelete} className="p-1 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full bg-peach-200/50 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all ${getProgressColor(pct)}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-stone-900">{kr.current}</span>
              <span className="text-xs text-stone-400">/ {kr.target} {kr.unit}</span>
              <span className={`text-[10px] font-semibold ${statusColor} flex items-center gap-0.5 ml-1`}>
                <StatusIcon className="w-3 h-3" /> {label}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OKRPage() {
  const [objectives, setObjectives] = useState<Objective[]>(DEFAULT_OBJECTIVES);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["obj-1", "obj-2", "obj-3"]));
  const [showAddObj, setShowAddObj] = useState(false);
  const [newObjTitle, setNewObjTitle] = useState("");
  const [newObjOwner, setNewObjOwner] = useState("");
  const [newObjQuarter, setNewObjQuarter] = useState("Q3 2025");

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const addObjective = () => {
    if (!newObjTitle.trim()) return;
    const id = `obj-${Date.now()}`;
    setObjectives(prev => [...prev, {
      id,
      title: newObjTitle,
      owner: newObjOwner || "Team",
      quarter: newObjQuarter,
      color: COLORS[prev.length % COLORS.length],
      keyResults: [],
    }]);
    setExpanded(prev => new Set([...prev, id]));
    setNewObjTitle("");
    setNewObjOwner("");
    setShowAddObj(false);
  };

  const deleteObjective = (id: string) => {
    setObjectives(prev => prev.filter(o => o.id !== id));
  };

  const addKR = (objId: string) => {
    const id = `kr-${Date.now()}`;
    setObjectives(prev => prev.map(o => o.id !== objId ? o : {
      ...o,
      keyResults: [...o.keyResults, { id, text: "New Key Result", target: "100", current: "0", unit: "units" }],
    }));
  };

  const updateKR = (objId: string, updated: KeyResult) => {
    setObjectives(prev => prev.map(o => o.id !== objId ? o : {
      ...o,
      keyResults: o.keyResults.map(kr => kr.id === updated.id ? updated : kr),
    }));
  };

  const deleteKR = (objId: string, krId: string) => {
    setObjectives(prev => prev.map(o => o.id !== objId ? o : {
      ...o,
      keyResults: o.keyResults.filter(kr => kr.id !== krId),
    }));
  };

  const allKRs = objectives.flatMap(o => o.keyResults);
  const avgProgress = allKRs.length > 0
    ? Math.round(allKRs.reduce((sum, kr) => {
        const isInverse = ["churn", "latency", "days", "time"].some(w => kr.text.toLowerCase().includes(w));
        return sum + progressPct(kr.current, kr.target, isInverse);
      }, 0) / allKRs.length)
    : 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
              <Target className="w-3.5 h-3.5" />
              Founder Tools → OKR Tracker
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-stone-900 mb-1">OKR Tracker</h1>
                <p className="text-stone-500 text-sm">Objectives & Key Results — track what matters this quarter.</p>
              </div>
              <button onClick={() => setShowAddObj(true)}
                className="flex items-center gap-1.5 btn-coral text-sm font-medium px-4 py-2 rounded-xl">
                <Plus className="w-4 h-4" /> Add Objective
              </button>
            </div>
          </div>

          {/* Summary bar */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Objectives", value: `${objectives.length}`, icon: Target, color: "text-peach-600 bg-peach-100/60" },
              { label: "Key Results", value: `${allKRs.length}`, icon: BarChart3, color: "text-peach-600 bg-peach-100/60" },
              { label: "Overall progress", value: `${avgProgress}%`, icon: TrendingUp, color: avgProgress >= 70 ? "text-green-600 bg-green-50" : avgProgress >= 40 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50" },
              { label: "On track (>70%)", value: `${allKRs.filter(kr => {
                const inv = ["churn", "latency", "days", "time"].some(w => kr.text.toLowerCase().includes(w));
                return progressPct(kr.current, kr.target, inv) >= 70;
              }).length}`, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 shadow-sm">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-lg font-bold text-stone-900">{s.value}</p>
                <p className="text-xs text-stone-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Add objective form */}
          {showAddObj && (
            <div className="glass rounded-2xl p-5 mb-5 border-peach-200/40">
              <h3 className="font-semibold text-stone-900 text-sm mb-3">New Objective</h3>
              <div className="space-y-3">
                <input value={newObjTitle} onChange={e => setNewObjTitle(e.target.value)}
                  placeholder="Objective title (e.g. 'Launch in 3 new markets')"
                  className="w-full text-sm border border-peach-200/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-peach-400" />
                <div className="flex gap-3">
                  <input value={newObjOwner} onChange={e => setNewObjOwner(e.target.value)}
                    placeholder="Owner (e.g. CEO, CTO)"
                    className="flex-1 text-sm border border-peach-200/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-peach-400" />
                  <input value={newObjQuarter} onChange={e => setNewObjQuarter(e.target.value)}
                    placeholder="Quarter (e.g. Q3 2025)"
                    className="flex-1 text-sm border border-peach-200/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-peach-400" />
                </div>
                <div className="flex gap-2">
                  <button onClick={addObjective}
                    className="btn-coral text-sm font-medium px-4 py-2 rounded-xl">
                    Add Objective
                  </button>
                  <button onClick={() => setShowAddObj(false)}
                    className="text-stone-500 text-sm px-4 py-2 rounded-xl hover:bg-peach-100/60 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Objectives */}
          <div className="space-y-4">
            {objectives.map((obj) => {
              const isExp = expanded.has(obj.id);
              const objPct = obj.keyResults.length > 0
                ? Math.round(obj.keyResults.reduce((sum, kr) => {
                    const inv = ["churn", "latency", "days", "time"].some(w => kr.text.toLowerCase().includes(w));
                    return sum + progressPct(kr.current, kr.target, inv);
                  }, 0) / obj.keyResults.length)
                : 0;

              return (
                <div key={obj.id} className="glass rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`mt-0.5 w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${obj.color}`}>
                          <Target className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-stone-900 text-base">{obj.title}</h3>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Zap className="w-3 h-3" /> {obj.owner}
                            </span>
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {obj.quarter}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className={`text-sm font-bold ${getProgressColor(objPct).replace("bg-", "text-")}`}>
                            {objPct}%
                          </p>
                          <p className="text-[10px] text-stone-400">{obj.keyResults.length} KRs</p>
                        </div>
                        <button onClick={() => deleteObjective(obj.id)}
                          className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleExpand(obj.id)}
                          className="p-1.5 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-peach-100/60 transition-colors">
                          {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-peach-200/50 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${getProgressColor(objPct)}`} style={{ width: `${objPct}%` }} />
                    </div>
                  </div>

                  {isExp && (
                    <div className="px-5 pb-5 border-t border-peach-100/40 pt-3 space-y-2">
                      {obj.keyResults.length === 0 && (
                        <p className="text-sm text-stone-400 text-center py-3">No key results yet — add your first one below</p>
                      )}
                      {obj.keyResults.map((kr) => (
                        <KRRow key={kr.id} kr={kr}
                          onUpdate={(updated) => updateKR(obj.id, updated)}
                          onDelete={() => deleteKR(obj.id, kr.id)} />
                      ))}
                      <button onClick={() => addKR(obj.id)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-stone-400 hover:text-peach-600 border border-dashed border-peach-200/60 hover:border-peach-300/60 rounded-xl py-2.5 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Key Result
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* OKR tips */}
          <div className="mt-8 glass rounded-2xl border-peach-200/40 p-5">
            <h3 className="font-semibold text-stone-800 text-sm mb-3">OKR Writing Tips for Founders</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Objectives: ambitious, qualitative, inspiring. What do you want to achieve?",
                "Key Results: measurable, time-bound, binary or numerical. How will you know you achieved it?",
                "3 Objectives max per quarter. More = distraction. Less = not ambitious enough.",
                "2-4 Key Results per Objective. Each should be independently measurable.",
                "70% achievement = ideal. 100% means you set the bar too low. 40% = unrealistic.",
                "Review OKRs weekly. Score monthly. Set next quarter 2 weeks before end of current.",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-stone-700">
                  <span className="w-4 h-4 rounded-full bg-peach-100/60 text-peach-600 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
