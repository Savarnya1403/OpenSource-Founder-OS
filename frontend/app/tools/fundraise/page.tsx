"use client";
import { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Check, X, Search, Filter, TrendingUp, Mail, Phone, Linkedin, Calendar, DollarSign, Target, BarChart3, Clock } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import toast from "react-hot-toast";

type Status = "Researching" | "Reached Out" | "Intro Requested" | "Meeting Scheduled" | "Pitch Done" | "Due Diligence" | "Term Sheet" | "Closed" | "Passed";

interface InvestorContact {
  id: string;
  name: string;
  firm: string;
  type: "VC" | "Angel" | "Angel Network" | "Family Office" | "Corporate VC";
  targetAmount: number;
  status: Status;
  lastTouched: string;
  nextAction: string;
  nextActionDate: string;
  notes: string;
  email?: string;
  linkedin?: string;
  introSource?: string;
  checkSizeMin?: number;
  checkSizeMax?: number;
  stage?: string;
}

const STATUS_ORDER: Status[] = [
  "Researching", "Reached Out", "Intro Requested", "Meeting Scheduled",
  "Pitch Done", "Due Diligence", "Term Sheet", "Closed", "Passed"
];

const STATUS_COLORS: Record<Status, string> = {
  "Researching": "bg-peach-100/60 text-stone-600",
  "Reached Out": "bg-peach-50/60 text-stone-700",
  "Intro Requested": "bg-peach-100/60 text-stone-700",
  "Meeting Scheduled": "bg-peach-50/60 text-stone-700",
  "Pitch Done": "bg-yellow-100 text-yellow-700",
  "Due Diligence": "bg-orange-100 text-orange-700",
  "Term Sheet": "bg-green-100 text-green-700",
  "Closed": "bg-green-100 text-green-700",
  "Passed": "bg-red-100 text-red-700",
};

const DEFAULT_CONTACTS: InvestorContact[] = [
  {
    id: "1", name: "Rajan Anandan", firm: "Peak XV Partners", type: "VC",
    targetAmount: 2000000, status: "Meeting Scheduled",
    lastTouched: "2026-06-20", nextAction: "Send deck + financials", nextActionDate: "2026-06-28",
    notes: "Met at SaaSBOOMi. Interested in B2B SaaS angle. Need warm intro from Freshworks CEO.",
    linkedin: "https://www.linkedin.com/in/rajan-anandan/", introSource: "Avinash Raghava (SaaSBOOMi)",
    checkSizeMin: 1000000, checkSizeMax: 10000000, stage: "Seed",
  },
  {
    id: "2", name: "Nikhil Kamath", firm: "WTF Fund", type: "Angel",
    targetAmount: 500000, status: "Reached Out",
    lastTouched: "2026-06-15", nextAction: "Follow up on LinkedIn DM", nextActionDate: "2026-06-30",
    notes: "Applied to WTF Fund portal. Fintech angle aligns.",
    linkedin: "https://www.linkedin.com/in/nikhilkamath1/",
    checkSizeMin: 250000, checkSizeMax: 1000000, stage: "Pre-Seed",
  },
  {
    id: "3", name: "Kunal Shah", firm: "Self (Angel)", type: "Angel",
    targetAmount: 200000, status: "Pitch Done",
    lastTouched: "2026-06-18", nextAction: "Wait for decision", nextActionDate: "2026-07-05",
    notes: "30-min call. Likes the delta approach to solving user switching costs. Follow up in 2 weeks.",
    introSource: "Common founder connection",
    checkSizeMin: 100000, checkSizeMax: 500000, stage: "Pre-Seed",
  },
];

function formatINR(usd: number): string {
  const inr = usd * 83;
  if (inr >= 10_000_000) return `₹${(inr / 10_000_000).toFixed(1)} Cr`;
  if (inr >= 100_000) return `₹${(inr / 100_000).toFixed(0)} L`;
  return `₹${inr.toLocaleString()}`;
}

const EMPTY_CONTACT: Omit<InvestorContact, "id"> = {
  name: "", firm: "", type: "VC", targetAmount: 0, status: "Researching",
  lastTouched: new Date().toISOString().split("T")[0], nextAction: "", nextActionDate: "",
  notes: "", email: "", linkedin: "", introSource: "", checkSizeMin: 0, checkSizeMax: 0, stage: "",
};

export default function FundraisePage() {
  const [contacts, setContacts] = useState<InvestorContact[]>(DEFAULT_CONTACTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<InvestorContact, "id">>(EMPTY_CONTACT);
  const [raiseTarget, setRaiseTarget] = useState(2000000);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const filtered = useMemo(() => {
    let list = contacts;
    if (search) list = list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.firm.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) list = list.filter((c) => c.status === filterStatus);
    return list;
  }, [contacts, search, filterStatus]);

  const stats = useMemo(() => {
    const active = contacts.filter((c) => !["Passed", "Researching"].includes(c.status));
    const committed = contacts.filter((c) => ["Term Sheet", "Closed"].includes(c.status));
    const totalTargeted = contacts.filter((c) => c.status !== "Passed").reduce((a, c) => a + c.targetAmount, 0);
    const totalCommitted = committed.reduce((a, c) => a + c.targetAmount, 0);
    const overdueActions = contacts.filter((c) => c.nextActionDate && new Date(c.nextActionDate) < new Date() && c.status !== "Closed" && c.status !== "Passed");
    return { active: active.length, total: contacts.length, totalTargeted, totalCommitted, overdueActions: overdueActions.length, committed: committed.length };
  }, [contacts]);

  function saveContact() {
    if (!form.name || !form.firm) return;
    if (editingId) {
      setContacts(contacts.map((c) => c.id === editingId ? { ...form, id: editingId } : c));
      toast.success("Contact updated");
    } else {
      setContacts([...contacts, { ...form, id: Date.now().toString() }]);
      toast.success("Investor added to pipeline");
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_CONTACT);
  }

  function startEdit(contact: InvestorContact) {
    setForm({ ...contact });
    setEditingId(contact.id);
    setShowForm(true);
  }

  function deleteContact(id: string) {
    setContacts(contacts.filter((c) => c.id !== id));
    toast.success("Removed from pipeline");
  }

  function updateStatus(id: string, status: Status) {
    setContacts(contacts.map((c) => c.id === id ? { ...c, status, lastTouched: new Date().toISOString().split("T")[0] } : c));
  }

  const kanbanGroups = useMemo(() => {
    const groups: Record<Status, InvestorContact[]> = {} as any;
    STATUS_ORDER.forEach((s) => { groups[s] = contacts.filter((c) => c.status === s); });
    return groups;
  }, [contacts]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-x-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 mb-1">Fundraise Tracker</h1>
              <p className="text-stone-500 text-sm">Your investor pipeline CRM. Track every conversation from first outreach to close.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex glass rounded-lg p-1">
                {(["list", "kanban"] as const).map((m) => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${viewMode === m ? "btn-coral" : "text-stone-500 hover:text-stone-700"}`}>
                    {m}
                  </button>
                ))}
              </div>
              <button onClick={() => { setForm(EMPTY_CONTACT); setEditingId(null); setShowForm(true); }}
                className="flex items-center gap-1.5 btn-coral text-sm font-medium px-4 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Add Investor
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              { label: "In Pipeline", value: stats.active, icon: TrendingUp, color: "text-peach-600" },
              { label: "Raise Target", value: formatINR(raiseTarget), icon: Target, color: "text-peach-600" },
              { label: "Targeted Amount", value: formatINR(stats.totalTargeted), icon: DollarSign, color: "text-peach-600" },
              { label: "Committed / Close", value: formatINR(stats.totalCommitted), icon: BarChart3, color: "text-green-600" },
              { label: "Overdue Actions", value: stats.overdueActions, icon: Clock, color: stats.overdueActions > 0 ? "text-red-600" : "text-stone-400" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <p className="text-xs text-stone-400">{s.label}</p>
                </div>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Raise target */}
          <div className="glass rounded-2xl p-4 mb-6 shadow-sm flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-stone-700">Raise Target:</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input type="number" value={raiseTarget} onChange={(e) => setRaiseTarget(parseFloat(e.target.value) || 0)}
                  className="pl-6 pr-3 py-1.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400 w-40" />
              </div>
              <span className="text-sm text-stone-400">({formatINR(raiseTarget)})</span>
            </div>
            <div className="flex-1 bg-peach-200/50 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((stats.totalCommitted / raiseTarget) * 100, 100)}%` }} />
            </div>
            <span className="text-sm font-semibold text-green-600">
              {((stats.totalCommitted / raiseTarget) * 100).toFixed(0)}% committed
            </span>
          </div>

          {/* Add/Edit form */}
          {showForm && (
            <div className="bg-white border border-peach-200/50 rounded-2xl p-6 mb-6 shadow-md">
              <h3 className="font-semibold text-stone-900 mb-4">{editingId ? "Edit Investor" : "Add Investor to Pipeline"}</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Investor Name" className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400" />
                <input value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })}
                  placeholder="Firm / Fund Name" className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400" />
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400">
                  {["VC", "Angel", "Angel Network", "Family Office", "Corporate VC"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: parseFloat(e.target.value) })}
                  placeholder="Target allocation (USD)" className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400" />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                  className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400">
                  {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" value={form.nextActionDate} onChange={(e) => setForm({ ...form, nextActionDate: e.target.value })}
                  className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400" />
                <input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
                  placeholder="Next action (e.g., Send deck)" className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400" />
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email (optional)" className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400" />
                <input value={form.introSource} onChange={(e) => setForm({ ...form, introSource: e.target.value })}
                  placeholder="Intro source / connection" className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400" />
              </div>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes, key interests, concerns, next steps..."
                rows={3}
                className="w-full px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400 mb-4 resize-none" />
              <div className="flex gap-3">
                <button onClick={saveContact}
                  className="flex items-center gap-1.5 btn-coral text-sm font-medium px-5 py-2 rounded-lg">
                  <Check className="w-4 h-4" /> {editingId ? "Update" : "Add to Pipeline"}
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="flex items-center gap-1.5 text-sm text-stone-500 border border-peach-200/60 px-5 py-2 rounded-lg hover:bg-peach-50/60">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search investors..."
                className="w-full pl-9 pr-4 py-2 bg-white/60 border border-peach-200/60 glass rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-white/60 border border-peach-200/60 glass rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400">
              <option value="">All Statuses</option>
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* List view */}
          {viewMode === "list" && (
            <div className="glass rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-peach-50/30 border-b border-peach-200/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">Investor</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">Target</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">Next Action</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">Notes</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const isOverdue = c.nextActionDate && new Date(c.nextActionDate) < new Date() && !["Closed", "Passed"].includes(c.status);
                    return (
                      <tr key={c.id} className="border-b border-peach-100/40 hover:bg-peach-50/60/50">
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-semibold text-stone-900">{c.name}</p>
                            <p className="text-xs text-stone-500">{c.firm}</p>
                            {c.introSource && <p className="text-[10px] text-peach-600 mt-0.5">via {c.introSource}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <select value={c.status}
                            onChange={(e) => updateStatus(c.id, e.target.value as Status)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:outline-none focus:border-peach-400 ${STATUS_COLORS[c.status]}`}>
                            {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-stone-900">
                          {formatINR(c.targetAmount)}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs text-stone-700">{c.nextAction}</p>
                          {c.nextActionDate && (
                            <p className={`text-[10px] mt-0.5 ${isOverdue ? "text-red-600 font-semibold" : "text-stone-400"}`}>
                              {isOverdue ? "⚠️ Overdue: " : ""}{c.nextActionDate}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <p className="text-xs text-stone-500 line-clamp-2">{c.notes}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {c.email && (
                              <a href={`mailto:${c.email}`} className="text-stone-300 hover:text-peach-600">
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {c.linkedin && (
                              <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-peach-600">
                                <Linkedin className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button onClick={() => startEdit(c)} className="text-stone-300 hover:text-peach-600">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteContact(c.id)} className="text-stone-300 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-stone-400">
                  <p>No investors in pipeline yet. Add your first investor above!</p>
                </div>
              )}
            </div>
          )}

          {/* Kanban view */}
          {viewMode === "kanban" && (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {STATUS_ORDER.filter((s) => s !== "Passed").map((status) => (
                <div key={status} className="min-w-48 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>{status}</span>
                    <span className="text-xs text-stone-400">{kanbanGroups[status]?.length || 0}</span>
                  </div>
                  <div className="space-y-2">
                    {(kanbanGroups[status] || []).map((c) => (
                      <div key={c.id} className="glass rounded-xl p-3 shadow-sm">
                        <p className="text-xs font-semibold text-stone-900">{c.name}</p>
                        <p className="text-[10px] text-stone-400">{c.firm}</p>
                        <p className="text-[10px] text-green-600 font-medium mt-1">{formatINR(c.targetAmount)}</p>
                        {c.nextAction && <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">{c.nextAction}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
