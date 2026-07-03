"use client";
import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Plus, X, Trash2, ChevronDown, ChevronUp, Search, Download,
  UserSearch, MessageSquare, TrendingUp, AlertCircle, Users, Filter,
} from "lucide-react";
import toast from "react-hot-toast";

interface Interview {
  id: string;
  interviewee_name: string;
  role: string;
  company_size: string;
  segment: string;
  interview_date: string;
  medium: string;
  pain_points: string;
  key_quotes: string;
  buying_signal: "Strong Buy" | "Interested" | "Neutral" | "Not a Fit";
  follow_up_action: string;
  notes: string;
  created_at: string;
}

const BUYING_SIGNAL_CONFIG = {
  "Strong Buy": { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  "Interested": { color: "bg-peach-100/60 text-peach-700 border-peach-200/60", dot: "bg-peach-400" },
  "Neutral": { color: "bg-stone-100 text-stone-600 border-stone-200", dot: "bg-stone-400" },
  "Not a Fit": { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-400" },
};

const STORAGE_KEY = "openfounder_customer_interviews";

function parsePainPoints(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((p) => p.trim().toLowerCase())
    .filter((p) => p.length > 2);
}

function exportToCSV(interviews: Interview[]) {
  const headers = ["Name", "Role", "Company Size", "Segment", "Date", "Medium", "Buying Signal", "Pain Points", "Key Quotes", "Follow-up", "Notes"];
  const rows = interviews.map((i) => [
    i.interviewee_name, i.role, i.company_size, i.segment, i.interview_date, i.medium,
    i.buying_signal, i.pain_points.replace(/\n/g, "; "), i.key_quotes.replace(/\n/g, "; "),
    i.follow_up_action, i.notes,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customer-discovery-interviews.csv";
  a.click();
}

const emptyForm = (): Partial<Interview> => ({
  interviewee_name: "", role: "", company_size: "11-50", segment: "",
  interview_date: new Date().toISOString().split("T")[0], medium: "Video Call",
  pain_points: "", key_quotes: "", buying_signal: "Neutral", follow_up_action: "", notes: "",
});

export default function CustomerDiscoveryPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Interview>>(emptyForm());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [filterSignal, setFilterSignal] = useState("");
  const [filterSegment, setFilterSegment] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInterviews(JSON.parse(raw));
    } catch {}
  }, []);

  function save(updated: Interview[]) {
    setInterviews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function addInterview() {
    if (!form.interviewee_name?.trim()) { toast.error("Name required"); return; }
    const entry: Interview = {
      ...(form as Interview),
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    save([entry, ...interviews]);
    setShowModal(false);
    setForm(emptyForm());
    toast.success("Interview logged");
  }

  function deleteInterview(id: string) {
    save(interviews.filter((i) => i.id !== id));
    toast.success("Deleted");
  }

  const topPainPoints = useMemo(() => {
    const freq: Record<string, number> = {};
    interviews.forEach((i) => {
      const pts = parsePainPoints(i.pain_points);
      const seen = new Set<string>();
      pts.forEach((p) => {
        if (!seen.has(p)) { freq[p] = (freq[p] || 0) + 1; seen.add(p); }
      });
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [interviews]);

  const segments = useMemo(() => [...new Set(interviews.map((i) => i.segment).filter(Boolean))], [interviews]);

  const filtered = useMemo(() => interviews.filter((i) => {
    if (filterSignal && i.buying_signal !== filterSignal) return false;
    if (filterSegment && i.segment !== filterSegment) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.interviewee_name.toLowerCase().includes(q) || i.segment.toLowerCase().includes(q) || i.role.toLowerCase().includes(q);
    }
    return true;
  }), [interviews, filterSignal, filterSegment, search]);

  const signalCounts = useMemo(() => {
    const c: Record<string, number> = { "Strong Buy": 0, "Interested": 0, "Neutral": 0, "Not a Fit": 0 };
    interviews.forEach((i) => { c[i.buying_signal] = (c[i.buying_signal] || 0) + 1; });
    return c;
  }, [interviews]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 glass-strong border-b border-peach-200/30 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserSearch className="w-4 h-4 text-peach-500" />
            <span className="text-sm font-semibold text-stone-700">Customer Discovery CRM</span>
            <span className="badge-peach ml-1">{interviews.length} interviews</span>
          </div>
          <div className="flex gap-2">
            {interviews.length > 0 && (
              <button onClick={() => exportToCSV(interviews)} className="btn-ghost-peach text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            )}
            <button onClick={() => setShowModal(true)} className="btn-coral text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Log Interview
            </button>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Customer Discovery CRM</h1>
            <p className="text-stone-400 text-sm">Log every customer conversation. Spot patterns in pain points and buying signals across 50+ interviews.</p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Interviews", value: interviews.length, icon: Users, color: "text-peach-600 bg-peach-100" },
              { label: "Strong Buy / Interested", value: signalCounts["Strong Buy"] + signalCounts["Interested"], icon: TrendingUp, color: "text-green-700 bg-green-100" },
              { label: "Unique Segments", value: segments.length, icon: Filter, color: "text-peach-600 bg-peach-50/60" },
              { label: "Unique Pain Points", value: topPainPoints.length, icon: AlertCircle, color: "text-amber-700 bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 shadow-sm">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold text-stone-900">{s.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left: filters + pain points */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-4">
                <p className="section-label mb-3">Filters</p>
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, segment..." className="w-full pl-8 pr-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-xs text-stone-700 focus:outline-none focus:border-peach-400" />
                </div>
                <p className="text-[10px] font-semibold text-stone-400 uppercase mb-2">Buying Signal</p>
                <div className="space-y-1 mb-3">
                  {["", "Strong Buy", "Interested", "Neutral", "Not a Fit"].map((s) => (
                    <button key={s} onClick={() => setFilterSignal(s)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${filterSignal === s ? "bg-peach-100 text-peach-800 font-semibold" : "text-stone-500 hover:bg-peach-50"}`}>
                      {s || "All Signals"}
                    </button>
                  ))}
                </div>
                {segments.length > 0 && (
                  <>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase mb-2">Segment / ICP</p>
                    <div className="space-y-1">
                      {["", ...segments].map((s) => (
                        <button key={s} onClick={() => setFilterSegment(s)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${filterSegment === s ? "bg-peach-100 text-peach-800 font-semibold" : "text-stone-500 hover:bg-peach-50"}`}>
                          {s || "All Segments"}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Pain points frequency */}
              {topPainPoints.length > 0 && (
                <div className="glass rounded-2xl p-4">
                  <p className="section-label mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-red-500" /> Top Pain Points
                  </p>
                  <div className="space-y-2">
                    {topPainPoints.map(([point, count]) => (
                      <div key={point}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-stone-600 capitalize truncate flex-1 mr-2">{point}</span>
                          <span className="font-bold text-stone-800 shrink-0">{count}</span>
                        </div>
                        <div className="h-1 bg-peach-100 rounded-full">
                          <div className="h-1 bg-coral rounded-full" style={{ width: `${(count / interviews.length) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-300 mt-3">Count = interviews mentioning this pain point</p>
                </div>
              )}

              {/* Signal distribution */}
              {interviews.length > 0 && (
                <div className="glass rounded-2xl p-4">
                  <p className="section-label mb-3">Buying Signal Mix</p>
                  {Object.entries(signalCounts).filter(([, c]) => c > 0).map(([s, c]) => {
                    const cfg = BUYING_SIGNAL_CONFIG[s as keyof typeof BUYING_SIGNAL_CONFIG];
                    return (
                      <div key={s} className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="text-stone-600">{s}</span>
                        </div>
                        <span className="font-bold text-stone-800">{c} ({Math.round(c / interviews.length * 100)}%)</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: interview cards */}
            <div className="lg:col-span-3">
              {interviews.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <UserSearch className="w-10 h-10 text-peach-200 mx-auto mb-4" />
                  <p className="font-semibold text-stone-700 mb-2">No interviews logged yet</p>
                  <p className="text-stone-400 text-xs mb-4 max-w-xs mx-auto">Start logging customer conversations. 50+ interviews is the minimum for reliable PMF signals.</p>
                  <button onClick={() => setShowModal(true)} className="btn-coral text-sm px-4 py-2 rounded-xl">
                    Log your first interview →
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center text-stone-400">
                  <p>No interviews match your filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((interview) => {
                    const isExpanded = expanded[interview.id];
                    const cfg = BUYING_SIGNAL_CONFIG[interview.buying_signal];
                    const pts = parsePainPoints(interview.pain_points).slice(0, 3);
                    return (
                      <div key={interview.id} className="glass rounded-2xl shadow-sm">
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold text-stone-900 text-sm">{interview.interviewee_name}</h3>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>{interview.buying_signal}</span>
                              </div>
                              <p className="text-xs text-stone-500">
                                {interview.role}{interview.role && interview.segment ? " · " : ""}{interview.segment}
                                {interview.company_size ? ` · ${interview.company_size} employees` : ""}
                              </p>
                              <p className="text-[11px] text-stone-400 mt-1">
                                {new Date(interview.interview_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {interview.medium}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => setExpanded((p) => ({ ...p, [interview.id]: !isExpanded }))}
                                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-peach-50 rounded-lg transition-colors">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <button onClick={() => deleteInterview(interview.id)}
                                className="p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {pts.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {pts.map((p) => (
                                <span key={p} className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full capitalize">{p}</span>
                              ))}
                              {parsePainPoints(interview.pain_points).length > 3 && (
                                <span className="text-[10px] text-stone-400">+{parsePainPoints(interview.pain_points).length - 3} more</span>
                              )}
                            </div>
                          )}

                          {isExpanded && (
                            <div className="border-t border-peach-100/40 pt-4 mt-2 space-y-3">
                              {interview.key_quotes && (
                                <div className="bg-amber-50/60 rounded-xl p-3">
                                  <p className="text-[10px] font-semibold text-amber-700 uppercase mb-1 flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" /> Key Quotes
                                  </p>
                                  <p className="text-xs text-stone-700 leading-relaxed italic">"{interview.key_quotes}"</p>
                                </div>
                              )}
                              {interview.pain_points && (
                                <div className="bg-red-50/40 rounded-xl p-3">
                                  <p className="text-[10px] font-semibold text-red-700 uppercase mb-1">All Pain Points</p>
                                  <p className="text-xs text-stone-600 leading-relaxed">{interview.pain_points}</p>
                                </div>
                              )}
                              {interview.follow_up_action && (
                                <div className="bg-peach-50/60 rounded-xl p-3">
                                  <p className="text-[10px] font-semibold text-stone-500 uppercase mb-1">Follow-up</p>
                                  <p className="text-xs text-stone-600">{interview.follow_up_action}</p>
                                </div>
                              )}
                              {interview.notes && (
                                <div className="bg-peach-50/40 rounded-xl p-3">
                                  <p className="text-[10px] font-semibold text-stone-500 uppercase mb-1">Notes</p>
                                  <p className="text-xs text-stone-600 leading-relaxed">{interview.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add interview modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="glass rounded-2xl w-full max-w-xl my-8 shadow-xl border border-peach-200/40">
            <div className="flex items-center justify-between p-5 border-b border-peach-100/40">
              <h2 className="font-bold text-stone-900 text-sm">Log Customer Interview</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-peach-50">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label mb-1">Name *</label>
                  <input value={form.interviewee_name || ""} onChange={(e) => setForm((f) => ({ ...f, interviewee_name: e.target.value }))}
                    className="w-full border border-peach-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" placeholder="Rahul Kumar" />
                </div>
                <div>
                  <label className="section-label mb-1">Role / Title</label>
                  <input value={form.role || ""} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full border border-peach-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" placeholder="Head of Finance" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label mb-1">ICP Segment</label>
                  <input value={form.segment || ""} onChange={(e) => setForm((f) => ({ ...f, segment: e.target.value }))}
                    className="w-full border border-peach-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" placeholder="D2C brand founder" />
                </div>
                <div>
                  <label className="section-label mb-1">Company Size</label>
                  <select value={form.company_size || "11-50"} onChange={(e) => setForm((f) => ({ ...f, company_size: e.target.value }))}
                    className="w-full border border-peach-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white text-stone-700">
                    {["1-10", "11-50", "51-200", "200+"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label mb-1">Date</label>
                  <input type="date" value={form.interview_date || ""} onChange={(e) => setForm((f) => ({ ...f, interview_date: e.target.value }))}
                    className="w-full border border-peach-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
                </div>
                <div>
                  <label className="section-label mb-1">Medium</label>
                  <select value={form.medium || "Video Call"} onChange={(e) => setForm((f) => ({ ...f, medium: e.target.value }))}
                    className="w-full border border-peach-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white text-stone-700">
                    {["Video Call", "In-person", "Phone", "Async/Written"].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="section-label mb-1">Pain Points (comma or newline separated)</label>
                <textarea value={form.pain_points || ""} onChange={(e) => setForm((f) => ({ ...f, pain_points: e.target.value }))}
                  rows={3} className="w-full border border-peach-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none"
                  placeholder="e.g. manual reconciliation, no real-time reporting, integration with Tally is painful" />
              </div>
              <div>
                <label className="section-label mb-1">Key Verbatim Quotes</label>
                <textarea value={form.key_quotes || ""} onChange={(e) => setForm((f) => ({ ...f, key_quotes: e.target.value }))}
                  rows={2} className="w-full border border-peach-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none"
                  placeholder='"I spend 3 hours every Monday just reconciling bank statements"' />
              </div>
              <div>
                <label className="section-label mb-1">Buying Signal</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Strong Buy", "Interested", "Neutral", "Not a Fit"] as const).map((s) => {
                    const cfg = BUYING_SIGNAL_CONFIG[s];
                    return (
                      <button key={s} onClick={() => setForm((f) => ({ ...f, buying_signal: s }))}
                        className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${form.buying_signal === s ? cfg.color : "border-peach-200/40 text-stone-500 hover:bg-peach-50"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="section-label mb-1">Follow-up Action</label>
                <input value={form.follow_up_action || ""} onChange={(e) => setForm((f) => ({ ...f, follow_up_action: e.target.value }))}
                  className="w-full border border-peach-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400"
                  placeholder="Send demo, schedule product walk-through, share prototype" />
              </div>
              <div>
                <label className="section-label mb-1">Additional Notes</label>
                <textarea value={form.notes || ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2} className="w-full border border-peach-200/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none"
                  placeholder="Context, background, anything else worth capturing..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-peach-100/40">
              <button onClick={() => setShowModal(false)} className="btn-ghost-peach text-sm px-4 py-2 rounded-xl">Cancel</button>
              <button onClick={addInterview} className="btn-coral text-sm font-semibold px-5 py-2 rounded-xl">Save Interview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
