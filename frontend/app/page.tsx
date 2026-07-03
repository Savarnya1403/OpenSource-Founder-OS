"use client";
import Link from "next/link";
import { ArrowRight, Brain, Building2, Search, TrendingUp, Zap, Globe, Shield,
  Activity, FileText, Mail, Wallet, TrendingDown, Star, CheckCircle2, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Cofounder",
    desc: "Strategic advice from an AI that's studied 10,000+ Indian startups — from idea validation to Series A.",
    color: "bg-peach-100/60 text-peach-600",
  },
  {
    icon: Building2,
    title: "Scheme Matcher",
    desc: "47+ central & state government grants, soft loans, and incentives matched to your startup in seconds.",
    color: "bg-green-100 text-green-700",
  },
  {
    icon: Activity,
    title: "Live Market Intelligence",
    desc: "Pain points extracted from HN, Reddit & news in real-time. Know what customers are complaining about before you build.",
    color: "bg-peach-100 text-peach-700",
    badge: "Live Feed",
  },
  {
    icon: TrendingUp,
    title: "Investor Network",
    desc: "100+ VCs, 50+ angels, 20+ accelerators with check sizes, sectors, portfolio and direct pitch emails.",
    color: "bg-peach-50/60 text-stone-700",
  },
  {
    icon: FileText,
    title: "SEC Benchmarks",
    desc: "Rule of 40 scores and gross margin benchmarks from public markets. Know where you stand vs. Freshworks, Delhivery.",
    color: "bg-amber-100 text-amber-700",
    badge: "Real Data",
  },
  {
    icon: Search,
    title: "Pitch Coach",
    desc: "Investor-ready pitch decks, valuation frameworks, and Indian VC landscape guidance to close your round.",
    color: "bg-rose-100 text-rose-700",
  },
];

const NEW_TOOLS = [
  { icon: Mail, label: "Cold Email Spam Checker", desc: "Score your cold email before sending" },
  { icon: TrendingDown, label: "Equity Waterfall Simulator", desc: "See dilution across 3 rounds visually" },
  { icon: Wallet, label: "Founder Salary Calculator", desc: "What to pay yourself based on traction" },
  { icon: Activity, label: "Market Pain Point Feed", desc: "Live Reddit & HN insights for your niche" },
];

const STATS = [
  { label: "Govt Schemes", value: "47+" },
  { label: "VC Firms", value: "100+" },
  { label: "Funded Startups", value: "150+" },
  { label: "Free Tools", value: "12+" },
];

const SOCIAL_PROOF = [
  "Razorpay built at NSRCEL IIMB",
  "CRED raised from Peak XV at $80M valuation",
  "Zepto achieved $100M ARR in 18 months",
  "Mamaearth IPO'd at ₹10,500 Cr valuation",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-peach-200/30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-coral-gradient rounded-lg flex items-center justify-center shadow-peach">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-900 text-lg">OpenFounder OS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-stone-500 hover:text-stone-900 font-medium px-3 py-2 transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="text-sm btn-coral px-4 py-2 rounded-xl font-semibold">
              Get started free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 glass border border-peach-300/40 rounded-full px-4 py-2 text-sm font-medium text-peach-700 mb-8 shadow-glass">
            <span className="live-dot" />
            <span>Live market intelligence · India-first · Powered by Claude AI</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-stone-900 leading-[1.1] tracking-tight mb-6">
            Your AI Cofounder.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #FF8C42 0%, #FF5C3E 60%, #C8561E 100%)" }}
            >
              Built for Bharat.
            </span>
          </h1>

          <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Real market intelligence, 47+ government schemes, 100+ investor profiles,
            and free founder tools — all in one OS built for the Indian startup ecosystem.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-12">
            <Link href="/register" className="btn-coral flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base">
              Start Building Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/intel"
              className="btn-ghost-peach flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base"
            >
              <Activity className="w-4 h-4" />
              Live Market Feed
            </Link>
          </div>

          {/* Social proof ticker */}
          <div className="flex flex-wrap justify-center gap-2">
            {SOCIAL_PROOF.map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-stone-500 bg-white/50 border border-peach-200/40 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-peach-200/30">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-extrabold text-peach-600">{s.value}</div>
              <div className="text-sm text-stone-400 mt-1 font-light">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* New Tools highlight */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-8 border-peach-300/30">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-peach-500" />
              <span className="text-sm font-bold text-peach-600 uppercase tracking-wide">New Free Tools</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-6">
              Built for what founders actually need daily
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {NEW_TOOLS.map((t) => (
                <div key={t.label} className="bg-white/50 border border-peach-200/40 rounded-xl p-4">
                  <div className="w-8 h-8 bg-peach-100 rounded-lg flex items-center justify-center mb-3">
                    <t.icon className="w-4 h-4 text-peach-600" />
                  </div>
                  <p className="text-sm font-semibold text-stone-800 mb-1">{t.label}</p>
                  <p className="text-xs text-stone-400">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-stone-900 mb-3 tracking-tight">
            Everything a founder needs
          </h2>
          <p className="text-center text-stone-400 mb-12 font-light">
            Six specialized AI agents working as your startup team.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.color}`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  {f.badge && <span className="badge-peach">{f.badge}</span>}
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">{f.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schemes banner */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-10 text-center border-peach-300/30" style={{ background: "linear-gradient(135deg, rgba(255,240,229,0.8) 0%, rgba(255,214,194,0.6) 100%)" }}>
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-stone-900 mb-3 tracking-tight">
              Never miss a government scheme again
            </h2>
            <p className="text-stone-500 mb-8 max-w-xl mx-auto font-light leading-relaxed">
              47+ central and state schemes across DPIIT, SIDBI, BIRAC, MeitY, DST, NABARD and more —
              matched to your startup profile in seconds.
            </p>
            <Link href="/schemes" className="btn-coral inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold">
              Explore Schemes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-900 mb-4 tracking-tight">
            Ready to build smarter?
          </h2>
          <p className="text-stone-400 mb-8 font-light">
            Join thousands of Indian founders using OpenFounder OS to raise faster, build smarter, and waste less time.
          </p>
          <Link href="/register" className="btn-coral inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base">
            Start for free — no credit card
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-peach-200/30 text-center text-stone-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-coral-gradient rounded-md flex items-center justify-center shadow-sm">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-stone-600">OpenFounder OS</span>
        </div>
        <p className="font-light">Open source · Built with Claude AI · Made for India 🇮🇳</p>
      </footer>
    </div>
  );
}
