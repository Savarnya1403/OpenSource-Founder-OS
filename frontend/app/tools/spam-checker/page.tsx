"use client";
import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Mail, AlertTriangle, CheckCircle2, XCircle, Copy, RefreshCw, Zap, Info } from "lucide-react";
import { useAppStore } from "@/lib/store";
import toast from "react-hot-toast";

// ─── Spam analysis engine (client-side NLP) ──────────────────────────────────

const SPAM_TRIGGERS: Array<{ word: string | RegExp; severity: "high" | "medium" | "low"; suggestion: string }> = [
  // High severity
  { word: /\bfree\b/i,         severity: "high",   suggestion: "complimentary" },
  { word: /\bguaranteed?\b/i,  severity: "high",   suggestion: "proven to" },
  { word: /\bcash\b/i,         severity: "high",   suggestion: "funds / payment" },
  { word: /\bwinner\b/i,       severity: "high",   suggestion: "selected participant" },
  { word: /\bcongratulations?\b/i, severity: "high", suggestion: "great news" },
  { word: /\bact now\b/i,      severity: "high",   suggestion: "let's connect this week" },
  { word: /\blimited time\b/i, severity: "high",   suggestion: "this month only" },
  { word: /\bno risk\b/i,      severity: "high",   suggestion: "low-risk" },
  { word: /\b100%\b/i,         severity: "high",   suggestion: "significantly" },
  { word: /\bunsubscribe\b/i,  severity: "high",   suggestion: "(remove from footer, use personal style)" },
  { word: /\bclick here\b/i,   severity: "high",   suggestion: "visit [specific page]" },
  { word: /\bsale\b/i,         severity: "high",   suggestion: "offering / pilot" },
  { word: /\bdeal\b/i,         severity: "medium", suggestion: "partnership" },
  { word: /\bspecial offer\b/i, severity: "high",  suggestion: "exclusive opportunity" },
  { word: /\bmaking money\b/i, severity: "high",   suggestion: "growing revenue" },
  { word: /\b\$\$\$/i,         severity: "high",   suggestion: "remove all $$$ references" },
  { word: /\brich\b/i,         severity: "high",   suggestion: "high-growth / profitable" },
  // Medium severity
  { word: /\bimportant\b/i,    severity: "medium", suggestion: "relevant / critical" },
  { word: /\burgent\b/i,       severity: "medium", suggestion: "time-sensitive" },
  { word: /\bopportunity\b/i,  severity: "medium", suggestion: "chance to / fit for" },
  { word: /\bexclusiv\b/i,     severity: "medium", suggestion: "invite-only / early access" },
  { word: /\binvitation\b/i,   severity: "medium", suggestion: "request for a quick call" },
  { word: /\bpromotion\b/i,    severity: "medium", suggestion: "pilot offer" },
  { word: /\bimmediate\b/i,    severity: "medium", suggestion: "quick" },
  { word: /\bneed help\b/i,    severity: "medium", suggestion: "looking for advice on" },
  { word: /\bbest regards\b/i, severity: "low",    suggestion: "Talk soon / Cheers / [Your first name]" },
  { word: /\bdear\b/i,         severity: "low",    suggestion: "Hi [First Name]" },
  // Low severity
  { word: /\bprize\b/i,        severity: "medium", suggestion: "reward" },
  { word: /\bbonus\b/i,        severity: "low",    suggestion: "extra value" },
  { word: /\baffordable\b/i,   severity: "low",    suggestion: "efficient" },
  { word: /\bsatisfied?\b/i,   severity: "low",    suggestion: "successful" },
];

const STRUCTURAL_CHECKS = [
  { id: "caps", label: "Excessive ALL CAPS", test: (t: string) => (t.match(/[A-Z]{4,}/g) || []).length > 1, penalty: 8 },
  { id: "exclaim", label: "Too many exclamation marks (!!! or multiple)", test: (t: string) => (t.match(/!/g) || []).length > 2, penalty: 10 },
  { id: "links", label: "Multiple URLs / links (looks automated)", test: (t: string) => (t.match(/https?:\/\//g) || []).length > 2, penalty: 12 },
  { id: "long", label: "Email too long (>350 words)", test: (t: string) => t.split(/\s+/).length > 350, penalty: 8 },
  { id: "short", label: "Email too short (<30 words)", test: (t: string) => t.split(/\s+/).length < 30, penalty: 5 },
  { id: "noname", label: "No personalization (no [Name] placeholder)", test: (t: string) => !/\b(hi|hello|hey)\s+\[?[a-z]/i.test(t), penalty: 7 },
  { id: "noquestion", label: "No question asked (questions increase reply rate)", test: (t: string) => (t.match(/\?/g) || []).length === 0, penalty: 6 },
  { id: "subject_len", label: "Subject line empty or too long (>60 chars)", test: (t: string) => t.length === 0 || t.length > 60, penalty: 9 },
];

interface FindingItem {
  word: string;
  severity: "high" | "medium" | "low";
  suggestion: string;
  count: number;
}

interface SpamResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  label: string;
  findings: FindingItem[];
  structural: Array<{ id: string; label: string; failed: boolean; penalty: number }>;
  highlighted: string;
}

function analyzeEmail(subject: string, body: string): SpamResult {
  const fullText = `${subject}\n\n${body}`;
  const findings: FindingItem[] = [];
  let penalty = 0;

  // Word-level analysis
  for (const trigger of SPAM_TRIGGERS) {
    const regex = trigger.word instanceof RegExp ? trigger.word : new RegExp(`\\b${trigger.word}\\b`, "gi");
    const matches = fullText.match(regex);
    if (matches && matches.length > 0) {
      const word = matches[0];
      const sev = trigger.severity;
      const pts = sev === "high" ? 12 : sev === "medium" ? 6 : 3;
      penalty += pts * Math.min(matches.length, 2);
      findings.push({ word, severity: sev, suggestion: trigger.suggestion, count: matches.length });
    }
  }

  // Structural checks (subject check uses subject only)
  const structuralResults = STRUCTURAL_CHECKS.map((check) => {
    const text = check.id === "subject_len" ? subject : fullText;
    const failed = check.test(text);
    if (failed) penalty += check.penalty;
    return { ...check, failed };
  });

  // Score: 100 - penalty, clamp 0-100
  const raw = Math.max(0, Math.min(100, 100 - penalty));
  const score = Math.round(raw);

  const grade: SpamResult["grade"] =
    score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";
  const label =
    score >= 85 ? "Excellent — likely to land in inbox" :
    score >= 70 ? "Good — minor tweaks recommended" :
    score >= 55 ? "Risky — likely filtered by some providers" :
    score >= 40 ? "Spam-like — significant rework needed" :
    "High-risk — will be blocked by most filters";

  // Highlight triggers in body
  let highlighted = body;
  findings.forEach(({ word }) => {
    const re = new RegExp(`(${word})`, "gi");
    highlighted = highlighted.replace(re, `<mark class="bg-red-100 text-red-800 rounded px-0.5">$1</mark>`);
  });

  return { score, grade, label, findings, structural: structuralResults, highlighted };
}

const GRADE_COLOR = {
  A: "text-green-700 bg-green-100 border-green-200",
  B: "text-stone-700 bg-peach-50/60 border-peach-200/60",
  C: "text-amber-700 bg-amber-100 border-amber-200",
  D: "text-orange-700 bg-orange-100 border-orange-200",
  F: "text-red-700 bg-red-100 border-red-200",
};

const SEV_COLOR = {
  high: "text-red-700 bg-red-50 border-red-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  low: "text-green-700 bg-green-50 border-green-200",
};

const SAMPLE_EMAIL = {
  subject: "Free opportunity — act now!",
  body: `Dear Sir/Madam,

Congratulations! You have been selected for our exclusive guaranteed opportunity.

We are offering you a FREE consultation worth $500. This is a limited time deal you cannot miss!

Click here to claim your cash reward immediately. 100% no risk guaranteed.

Best regards,
John`,
};

export default function SpamCheckerPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<SpamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const addSpamCheck = useAppStore((s) => s.addSpamCheck);

  const analyze = useCallback(() => {
    if (!body.trim()) { toast.error("Paste your email body first"); return; }
    setLoading(true);
    setTimeout(() => {
      const r = analyzeEmail(subject, body);
      setResult(r);
      addSpamCheck({ subject: subject || "Untitled", score: r.score });
      setLoading(false);
    }, 600);
  }, [subject, body, addSpamCheck]);

  function loadSample() {
    setSubject(SAMPLE_EMAIL.subject);
    setBody(SAMPLE_EMAIL.body);
    setResult(null);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-8 py-3 glass-strong border-b border-peach-200/30 flex items-center gap-2">
          <Mail className="w-4 h-4 text-peach-500" />
          <span className="text-sm font-semibold text-stone-700">Cold Email Spam Checker</span>
          <span className="badge-peach ml-2">Free Tool</span>
        </div>

        <div className="p-8 max-w-4xl mx-auto">
          <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Cold Email Spam Checker</h1>
            <p className="text-stone-400 text-sm leading-relaxed">
              Paste your cold email. We run it through 30+ spam filter rules used by Gmail, Outlook & Apple Mail
              and highlight every word that triggers a spam flag — with better alternatives.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <label className="section-label block mb-2">Subject Line</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Quick question about your pipeline"
                  className="w-full bg-white/60 border border-peach-200/60 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-peach-400 transition-colors"
                />
              </div>

              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="section-label">Email Body</label>
                  <button onClick={loadSample} className="text-[11px] text-peach-500 hover:text-peach-700 flex items-center gap-1 transition-colors">
                    <Info className="w-3 h-3" /> Load bad example
                  </button>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Paste your cold email body here..."
                  rows={14}
                  className="w-full bg-white/60 border border-peach-200/60 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-peach-400 transition-colors resize-none font-mono"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-stone-300">{body.split(/\s+/).filter(Boolean).length} words</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setBody(""); setSubject(""); setResult(null); }}
                      className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Clear
                    </button>
                    <button
                      onClick={analyze}
                      disabled={loading}
                      className="btn-coral text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-60"
                    >
                      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      {loading ? "Analyzing..." : "Check Spam Score"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {!result && !loading && (
                <div className="glass rounded-2xl p-8 text-center">
                  <Mail className="w-10 h-10 text-peach-200 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">Your spam score will appear here.</p>
                  <p className="text-stone-300 text-xs mt-1">We check 30+ spam trigger patterns used by Gmail & Outlook.</p>
                </div>
              )}

              {loading && (
                <div className="glass rounded-2xl p-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton h-6 w-full" style={{ width: `${75 + Math.random() * 25}%` }} />
                  ))}
                </div>
              )}

              {result && !loading && (
                <div className="space-y-4 animate-slide-up">
                  {/* Score */}
                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="section-label mb-1">Inbox Score</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-extrabold text-stone-900">{result.score}</span>
                          <span className="text-stone-400">/100</span>
                        </div>
                      </div>
                      <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-extrabold text-3xl ${GRADE_COLOR[result.grade]}`}>
                        {result.grade}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-peach-100 rounded-full h-2 mb-3">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${result.score}%`,
                          background: result.score >= 70 ? "#22c55e" : result.score >= 50 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <p className="text-sm text-stone-600">{result.label}</p>
                  </div>

                  {/* Structural checks */}
                  <div className="glass rounded-2xl p-5">
                    <p className="section-label mb-3">Structural Checks</p>
                    <div className="space-y-2">
                      {result.structural.map((check) => (
                        <div key={check.id} className="flex items-center gap-2.5">
                          {check.failed
                            ? <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            : <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                          <span className={`text-xs ${check.failed ? "text-stone-700" : "text-stone-400"}`}>
                            {check.label}
                          </span>
                          {check.failed && (
                            <span className="ml-auto text-[10px] text-red-500 font-medium">-{check.penalty}pts</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trigger words */}
                  {result.findings.length > 0 && (
                    <div className="glass rounded-2xl p-5">
                      <p className="section-label mb-3">Spam Trigger Words ({result.findings.length})</p>
                      <div className="space-y-2">
                        {result.findings.map((f) => (
                          <div key={f.word} className={`flex items-start gap-2.5 text-xs rounded-lg px-3 py-2 border ${SEV_COLOR[f.severity]}`}>
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <span className="font-semibold capitalize">&ldquo;{f.word}&rdquo;</span>
                              {f.count > 1 && <span className="opacity-60 ml-1">×{f.count}</span>}
                              <span className="text-stone-400 mx-1.5">→</span>
                              <span className="italic">try: {f.suggestion}</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase opacity-60 shrink-0">{f.severity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlighted preview */}
                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="section-label">Highlighted Preview</p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(body); toast.success("Copied!"); }}
                        className="text-[11px] text-stone-400 hover:text-stone-600 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy original
                      </button>
                    </div>
                    <div
                      className="text-xs text-stone-600 leading-relaxed font-mono whitespace-pre-wrap bg-white/50 rounded-xl p-3 border border-peach-100"
                      dangerouslySetInnerHTML={{ __html: result.highlighted }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 glass rounded-2xl p-6 animate-fade-in">
            <h3 className="font-semibold text-stone-900 text-sm mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Cold Email Best Practices (YC-backed founder edition)
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { tip: "Keep subject lines under 7 words", icon: "✂️" },
                { tip: "Open with a specific insight about their company", icon: "🎯" },
                { tip: "One clear ask — never multiple CTAs", icon: "🎤" },
                { tip: "Max 5 sentences in the body for cold email", icon: "📏" },
                { tip: "Avoid 'I' as the first word — lead with them", icon: "🔄" },
                { tip: "End with a soft yes/no question, not a calendar link", icon: "❓" },
              ].map(({ tip, icon }) => (
                <div key={tip} className="flex items-start gap-2 bg-white/40 rounded-xl p-3 border border-peach-100/60">
                  <span className="text-base">{icon}</span>
                  <p className="text-xs text-stone-600 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
