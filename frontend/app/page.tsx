"use client";
import Link from "next/link";
import { ArrowRight, Brain, Building2, Search, TrendingUp, Zap, Globe, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Cofounder",
    desc: "Strategic advice from an AI that's studied 10,000+ Indian startups — from validation to scale.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: Building2,
    title: "Scheme Matcher",
    desc: "Instantly discover relevant central & state government grants, soft loans, and incentives for your startup.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Search,
    title: "Market Intelligence",
    desc: "Market sizing, competitor maps, and industry trends curated for India-first founders.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Pitch Coach",
    desc: "Investor-ready pitch decks, valuation frameworks, and VC landscape guidance for Indian fundraising.",
    color: "bg-orange-100 text-orange-600",
  },
];

const STATS = [
  { label: "Government Schemes", value: "30+" },
  { label: "Ministries Covered", value: "12" },
  { label: "Startup Stages", value: "5" },
  { label: "AI Agents", value: "4" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-saffron-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">OpenFounder OS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-brand-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-brand-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Globe className="w-3.5 h-3.5" />
            Open source · India-first · Powered by Claude AI
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Your AI Cofounder
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-saffron-500 bg-clip-text text-transparent">
              Built for Bharat
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Democratizing world-class entrepreneurial knowledge for every Indian founder. Discover government
            schemes, get strategic guidance, and build with confidence.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-brand-600 text-white rounded-xl px-6 py-3.5 font-semibold text-base hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
            >
              Start Building Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/schemes"
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl px-6 py-3.5 font-semibold text-base hover:border-gray-300 transition-colors"
            >
              Browse Schemes
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-brand-600">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Everything a founder needs
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Four specialized AI agents working together as your startup team.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schemes banner */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-10 h-10 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Never miss a government scheme again
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            30+ central and state schemes across DPIIT, SIDBI, BIRAC, MeitY, DST, NABARD and more —
            matched to your startup profile in seconds.
          </p>
          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 bg-green-600 text-white rounded-xl px-6 py-3 font-semibold hover:bg-green-700 transition-colors"
          >
            Explore Schemes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-100 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-saffron-500 rounded-md flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-gray-600">OpenFounder OS</span>
        </div>
        <p>Open source · Built with Claude AI · Made for India 🇮🇳</p>
      </footer>
    </div>
  );
}
