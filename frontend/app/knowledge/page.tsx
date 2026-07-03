"use client";
import Link from "next/link";
import { BookOpen, ArrowRight, Lightbulb, Layers, FileText, Calendar, Building } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Zap } from "lucide-react";

const SECTIONS = [
  {
    href: "/knowledge/case-studies",
    icon: Lightbulb,
    title: "Case Studies",
    description:
      "Deep-dives into real Indian startup journeys — Razorpay, Zepto, CRED, Mamaearth, and more. Lessons on GTM, fundraising, and growth.",
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    badge: "25+ stories",
  },
  {
    href: "/knowledge/playbooks",
    icon: Layers,
    title: "Sector Playbooks",
    description:
      "Sector-specific guides for building in FinTech, EdTech, HealthTech, SaaS, and more. Regulatory landscape, distribution strategies, unit economics.",
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    badge: "12 sectors",
  },
  {
    href: "/knowledge/jargon",
    icon: BookOpen,
    title: "Jargon Buster",
    description:
      "A-Z dictionary of startup and VC terminology with India-specific context. TAM, DRHP, term sheets, waterfall structures, and more.",
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    badge: "200+ terms",
  },
  {
    href: "/knowledge/reports",
    icon: FileText,
    title: "Research Reports",
    description:
      "Free VC reports from Blume, Peak XV, Accel, Kalaari and more. Government startup reports, NASSCOM data, and industry deep-dives — all in one place.",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    badge: "28 reports",
  },
];

const QUICK_LINKS = [
  {
    href: "/events",
    icon: Calendar,
    title: "Startup Events & Deadlines",
    description: "SummitUp, TechSparks, Surge, Antler, and 15+ startup events with registration deadlines.",
    color: "bg-rose-50 text-rose-600 border-rose-200",
    badge: "17 events",
  },
  {
    href: "/incubators",
    icon: Building,
    title: "Incubators Directory",
    description: "NSRCEL, CIIE, SINE, T-Hub, Villgro and 15+ top Indian incubators with apply links and funding details.",
    color: "bg-peach-50/60 text-stone-700 border-teal-200",
    badge: "18 incubators",
  },
];

export default function KnowledgePage() {
  const isAuthed = isAuthenticated();

  const content = (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Knowledge Hub</h1>
          <p className="text-stone-500 text-sm">
            Case studies, sector playbooks, VC research reports, and a jargon dictionary — everything you need to learn from India&apos;s best founders.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="glass rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-stone-400 mb-2">{s.badge}</span>
              <h3 className="font-semibold text-stone-900 mb-2">{s.title}</h3>
              <p className="text-stone-400 text-xs leading-relaxed mb-5 flex-1">{s.description}</p>
              <span className="text-xs font-medium text-peach-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mb-3">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Ecosystem Resources</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {QUICK_LINKS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="glass rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-stone-400 mb-1">{s.badge}</span>
                <h3 className="font-semibold text-stone-900 text-sm mb-1">{s.title}</h3>
                <p className="text-stone-400 text-xs leading-relaxed mb-4 flex-1">{s.description}</p>
                <span className="text-xs font-medium text-peach-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  View all <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );

  if (isAuthed) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="glass-strong border-b border-peach-200/30 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-peach-500 to-saffron-500 rounded-md flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-stone-900 text-sm">OpenFounder OS</span>
        </Link>
        <Link href="/login" className="text-sm font-medium text-peach-600 hover:underline">
          Sign in
        </Link>
      </nav>
      {content}
    </div>
  );
}
