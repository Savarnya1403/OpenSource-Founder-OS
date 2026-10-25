"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import {
  Plus, Trash2, ArrowLeft, ChevronDown, ChevronUp,
  TrendingUp, Users, Target, CheckCircle2, XCircle,
  Clock, IndianRupee, Linkedin, StickyNote, Calendar,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const STAGES = ["Identified", "Approached", "Meeting", "Due Diligence", "Term Sheet", "Closed", "Passed"];
const STAGE_COLORS: Record<string, string> = {
  "Identified": "bg-gray-100 text-gray-700 border-gray-200",
  "Approached": "bg-blue-100 text-blue-700 border-blue-200",
  "Meeting": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Due Diligence": "bg-orange-100 text-orange-700 border-orange-200",
  "Term Sheet": "bg-purple-100 text-purple-700 border-purple-200",
  "Closed": "bg-green-100 text-green-700 border-green-200",
  "Passed": "bg-red-100 text-red-700 border-red-200",
};

interface Deal {
  id: number;
  investor_name: string;
  investor_type?: string;
  fund_name?: string;
  contact_name?: string;
  contact_linkedin?: string;
  stage: string;
  check_size_cr?: number;
  intro_source?: string;
  last_contact_date?: string;
  next_action?: string;
  next_action_date?: string;
  notes?: string;
  is_lead: boolean;
  created_at: string;
  updated_at: string;
}

const EMPTY_FORM = {
  investor_name: "",
  investor_type: "VC",
  fund_name: "",
  contact_name: "",
  contact_linkedin: "",
  stage: "Identified",
  check_size_cr: "",
  intro_source: "",
  last_contact_date: "",
  next_action: "",
  next_action_date: "",
  notes: "",
  is_lead: false,
};

export default function FundraisePipelinePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM & { is_lead: boolean }>({ ...EMPTY_FORM });
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    Identified: true, Approached: true, Meeting: true, "Due Diligence": true, "Term Sheet": true,
  });

  useEffect(() => { if (!isAuthenticated()) router.replace("/login"); }, [router]);

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["pipeline"],
    queryFn: async () => (await api.get("/api/pipeline")).data,
  });

  const { data: summary } = useQuery({
    queryKey: ["pipeline-summary"],
    queryFn: async () => (await api.get("/api/pipeline/summary")).data,
  });

  const createMut = useMutation({
    mutationFn: (payload: object) => api.post("/api/pipeline", payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipeline"] }); qc.invalidateQueries({ queryKey: ["pipeline-summary"] }); setShowForm(false); setForm({ ...EMPTY_FORM }); toast.success("Deal added"); },
    onError: () => toast.error("Failed to add deal"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Record<string, unknown>) => api.patch(`/api/pipeline/${id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipeline"] }); qc.invalidateQueries({ queryKey: ["pipeline-summary"] }); setEditingId(null); toast.success("Updated"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/api/pipeline/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipeline"] }); qc.invalidateQueries({ queryKey: ["pipeline-summary"] }); toast.success("Removed"); },
  });

  const byStage = (stage: string) => deals.filter((d) => d.stage === stage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      check_size_cr: form.check_size_cr ? parseFloat(form.check_size_cr as unknown as string) : null,
      last_contact_date: form.last_contact_date || null,
      next_action_date: form.next_action_date || null,
      fund_name: form.fund_name || null,
      contact_name: form.contact_name || null,
      contact_linkedin: form.contact_linkedin || null,
      intro_source: form.intro_source || null,
      next_action: form.next_action || null,
      notes: form.notes || null,
    };
    if (editingId) updateMut.mutate({ id: editingId, ...payload });
    else createMut.mutate(payload);
  };

  const startEdit = (deal: Deal) => {
    setEditingId(deal.id);
    setForm({
      investor_name: deal.investor_name,
      investor_type: deal.investor_type || "VC",
      fund_name: deal.fund_name || "",
      contact_name: deal.contact_name || "",
      contact_linkedin: deal.contact_linkedin || "",
      stage: deal.stage,
      check_size_cr: deal.check_size_cr?.toString() || "" as unknown as "",
      intro_source: deal.intro_source || "",
      last_contact_date: deal.last_contact_date || "",
      next_action: deal.next_action || "",
      next_action_date: deal.next_action_date || "",
      notes: deal.notes || "",
      is_lead: deal.is_lead,
    });
    setShowForm(true);
  };

  const stageIcon = (stage: string) => {
    if (stage === "Closed") return <CheckCircle2 size={14} className="text-green-600" />;
    if (stage === "Passed") return <XCircle size={14} className="text-red-500" />;
    if (stage === "Term Sheet") return <Target size={14} className="text-purple-600" />;
    return <Clock size={14} className="text-gray-500" />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/tools" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fundraising Pipeline</h1>
                <p className="text-sm text-gray-500 mt-0.5">Track every investor conversation — from first outreach to term sheet</p>
              </div>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ ...EMPTY_FORM }); }}
              className="flex items-center gap-2 bg-peach-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-peach-700 transition-colors"
            >
              <Plus size={16} /> Add Investor
            </button>
          </div>

          {/* Summary bar */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Total Tracked", val: summary.total, color: "text-gray-700" },
                { label: "Active Convos", val: summary.active, color: "text-blue-600" },
                { label: "Term Sheets", val: summary.by_stage?.["Term Sheet"] || 0, color: "text-purple-600" },
                { label: "Closed", val: summary.closed, color: "text-green-600" },
                { label: "Target Raise", val: summary.total_target_cr ? `₹${summary.total_target_cr}Cr` : "—", color: "text-peach-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Add / Edit form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">{editingId ? "Edit Deal" : "Add Investor"}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Investor / Fund Name *</label>
                  <input required value={form.investor_name} onChange={(e) => setForm({ ...form, investor_name: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400"
                    placeholder="e.g. Peak XV Partners" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Type</label>
                  <select value={form.investor_type} onChange={(e) => setForm({ ...form, investor_type: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400">
                    {["VC", "Angel", "Family Office", "Accelerator", "Corporate VC", "Government"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Stage</label>
                  <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400">
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Contact Name</label>
                  <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400"
                    placeholder="Partner name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Check Size (₹ Crore)</label>
                  <input type="number" step="0.5" value={form.check_size_cr} onChange={(e) => setForm({ ...form, check_size_cr: e.target.value as unknown as "" })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400"
                    placeholder="e.g. 5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">How Sourced</label>
                  <input value={form.intro_source} onChange={(e) => setForm({ ...form, intro_source: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400"
                    placeholder="Warm intro / Cold email / Event" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Last Contact</label>
                  <input type="date" value={form.last_contact_date} onChange={(e) => setForm({ ...form, last_contact_date: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Next Action</label>
                  <input value={form.next_action} onChange={(e) => setForm({ ...form, next_action: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400"
                    placeholder="Send deck / Follow up / DD docs" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Due Date</label>
                  <input type="date" value={form.next_action_date} onChange={(e) => setForm({ ...form, next_action_date: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-medium text-gray-600">Notes</label>
                  <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400"
                    placeholder="Meeting notes, concerns raised, feedback..." />
                </div>
                <div className="md:col-span-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={form.is_lead} onChange={(e) => setForm({ ...form, is_lead: e.target.checked })} className="rounded" />
                    Mark as Lead Investor
                  </label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                      className="px-4 py-2 text-sm bg-peach-600 text-white rounded-lg hover:bg-peach-700 disabled:opacity-50">
                      {editingId ? "Save Changes" : "Add Deal"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Pipeline by stage */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading pipeline...</div>
          ) : (
            <div className="space-y-4">
              {STAGES.filter((s) => s !== "Passed" && s !== "Closed").map((stage) => {
                const stageDls = byStage(stage);
                const expanded = expandedStages[stage] !== false;
                return (
                  <div key={stage} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedStages({ ...expandedStages, [stage]: !expanded })}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {stageIcon(stage)}
                        <span className="font-semibold text-gray-800">{stage}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STAGE_COLORS[stage]}`}>{stageDls.length}</span>
                      </div>
                      {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>
                    {expanded && (
                      <div className="border-t border-gray-100">
                        {stageDls.length === 0 ? (
                          <p className="px-5 py-4 text-sm text-gray-400 italic">No investors at this stage yet.</p>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {stageDls.map((deal) => (
                              <div key={deal.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-gray-900">{deal.investor_name}</span>
                                      {deal.is_lead && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Lead</span>}
                                      <span className="text-xs text-gray-400">{deal.investor_type}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                                      {deal.contact_name && <span className="text-xs text-gray-500 flex items-center gap-1"><Users size={11} />{deal.contact_name}</span>}
                                      {deal.check_size_cr && <span className="text-xs text-gray-500 flex items-center gap-1"><IndianRupee size={11} />₹{deal.check_size_cr}Cr target</span>}
                                      {deal.intro_source && <span className="text-xs text-gray-400">via {deal.intro_source}</span>}
                                      {deal.contact_linkedin && (
                                        <a href={deal.contact_linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                                          <Linkedin size={11} />LinkedIn
                                        </a>
                                      )}
                                    </div>
                                    {deal.next_action && (
                                      <div className="mt-2 flex items-center gap-2 text-xs">
                                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                                          <Calendar size={10} />Next: {deal.next_action}
                                          {deal.next_action_date && ` · ${deal.next_action_date}`}
                                        </span>
                                      </div>
                                    )}
                                    {deal.notes && <p className="mt-2 text-xs text-gray-500 line-clamp-2 flex items-start gap-1"><StickyNote size={11} className="mt-0.5 shrink-0" />{deal.notes}</p>}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <select
                                      value={deal.stage}
                                      onChange={(e) => updateMut.mutate({ id: deal.id, stage: e.target.value })}
                                      className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-peach-400"
                                    >
                                      {STAGES.map((s) => <option key={s}>{s}</option>)}
                                    </select>
                                    <button onClick={() => startEdit(deal)} className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 border border-blue-100 rounded hover:bg-blue-50">Edit</button>
                                    <button onClick={() => { if (confirm("Remove this deal?")) deleteMut.mutate(deal.id); }} className="text-xs text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Closed + Passed collapsed */}
              {["Closed", "Passed"].map((stage) => {
                const stageDls = byStage(stage);
                if (!stageDls.length) return null;
                const expanded = expandedStages[stage];
                return (
                  <div key={stage} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden opacity-75">
                    <button
                      onClick={() => setExpandedStages({ ...expandedStages, [stage]: !expanded })}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {stageIcon(stage)}
                        <span className="font-medium text-gray-600">{stage}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STAGE_COLORS[stage]}`}>{stageDls.length}</span>
                      </div>
                      {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>
                    {expanded && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {stageDls.map((deal) => (
                          <div key={deal.id} className="px-5 py-3 flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-700">{deal.investor_name}</span>
                              {deal.check_size_cr && <span className="ml-2 text-xs text-gray-400">₹{deal.check_size_cr}Cr</span>}
                            </div>
                            <button onClick={() => { if (confirm("Remove?")) deleteMut.mutate(deal.id); }} className="text-red-400 hover:text-red-600 p-1">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
