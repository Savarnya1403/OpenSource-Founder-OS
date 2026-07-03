"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, GitFork, Target, Lightbulb, Brain, Calculator,
  TrendingUp, TrendingDown, Mail, Wallet, BookOpen, Activity,
  UserSearch, Gauge, IndianRupee, CalendarCheck,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";

const TOOLS = [
  {
    href: "/tools/customer-discovery",
    icon: UserSearch,
    title: "Customer Discovery CRM",
    description: "Log customer interviews, track pain points, buying signals, and ICP patterns. The most important CRM before you've built anything. Aggregates insights across 50+ conversations.",
    cta: "Start logging",
    badge: "New",
    isNew: true,
    highlight: true,
  },
  {
    href: "/tools/pmf-scorecard",
    icon: Gauge,
    title: "PMF Scorecard",
    description: "10-question self-assessment across Retention, Revenue, Referral, Engagement, and Market Pull. Get scored against India sector benchmarks and know exactly what to fix.",
    cta: "Score yourself",
    badge: "New",
    isNew: true,
    highlight: true,
  },
  {
    href: "/tools/salary-benchmarks",
    icon: IndianRupee,
    title: "India Startup Salary Benchmarks",
    description: "Real 2024-25 compensation data for 18 roles × 5 cities × 3 funding stages. Know what to pay your first senior engineer, PM, or BD hire — not what an MNC pays.",
    cta: "View benchmarks",
    badge: "New",
    isNew: true,
    highlight: true,
  },
  {
    href: "/tools/compliance-calendar",
    icon: CalendarCheck,
    title: "Compliance Calendar",
    description: "GST returns, TDS filings, advance tax dates, ROC annual returns, AGM requirements — 40+ India startup compliance deadlines with countdowns and penalty info.",
    cta: "Check deadlines",
    badge: "New",
    isNew: true,
    highlight: true,
  },
  {
    href: "/tools/equity-waterfall",
    icon: TrendingDown,
    title: "Equity Waterfall Simulator",
    description: "Interactive dilution model across Seed → Series A → Series B. Use sliders to model valuations and see exactly what founders retain. YC benchmark included.",
    cta: "Open simulator",
    badge: "Interactive",
    isNew: false,
  },
  {
    href: "/tools/spam-checker",
    icon: Mail,
    title: "Cold Email Spam Checker",
    description: "Paste your investor cold email. Get a 0–100 spam score based on 30+ Gmail & Outlook filter rules. Every trigger word highlighted with better alternatives.",
    cta: "Check email",
    badge: "AI",
    isNew: false,
  },
  {
    href: "/tools/salary-calc",
    icon: Wallet,
    title: "Founder Salary Calculator",
    description: "What should you pay yourself? Based on your city's 2025 COL data (12 Indian cities), stage, MRR, burn rate, and investor expectations.",
    cta: "Calculate",
    badge: "Heuristic",
    isNew: false,
  },
  {
    href: "/tools/cap-table",
    icon: GitFork,
    title: "Cap Table Simulator",
    description: "Model equity dilution across funding rounds. See exactly who owns what after seed, Series A, B. Export-ready cap table with live calculations.",
    cta: "Simulate rounds",
    badge: "Interactive",
    isNew: false,
  },
  {
    href: "/tools/burn-rate",
    icon: Target,
    title: "Burn Rate & Runway",
    description: "Track monthly burn, net burn, and runway. Add revenue with growth projections. Get month-by-month cash flow forecast and fundraising alerts.",
    cta: "Calculate runway",
    badge: "Real-time",
    isNew: false,
  },
  {
    href: "/tools/fundraise",
    icon: Lightbulb,
    title: "Fundraise Tracker (CRM)",
    description: "Your investor pipeline CRM. Track every VC and angel conversation — status, next actions, overdue alerts. Kanban view included.",
    cta: "Track raise",
    badge: "Persisted",
    isNew: false,
  },
  {
    href: "/tools/market-size",
    icon: Brain,
    title: "TAM/SAM/SOM Wizard",
    description: "Calculate your Total, Serviceable, and Obtainable Addressable Market using India-specific baseline population and economic data.",
    cta: "Calculate TAM",
    badge: "India Data",
    isNew: false,
  },
  {
    href: "/tools/gst",
    icon: Calculator,
    title: "GST Impact Modeler",
    description: "Understand GST implications for your business model. Calculate your net GST liability based on revenue mix. SaaS, D2C, Marketplace models included.",
    cta: "Model GST",
    badge: "SaaS · D2C",
    isNew: false,
  },
  {
    href: "/tools/traction",
    icon: TrendingUp,
    title: "Traction Dashboard",
    description: "Log and track your key startup metrics — MRR, DAU, CAC, LTV, NPS. See weekly trends, measure progress, and spot regressions early.",
    cta: "Track metrics",
    badge: "Auth required",
    isNew: false,
  },
];

export default function ToolsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  if (!isAuthenticated()) return null;

  const newTools = TOOLS.filter((t) => t.isNew);
  const existingTools = TOOLS.filter((t) => !t.isNew);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-8 py-3 glass-strong border-b border-peach-200/30 flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-700">Founder Tools</span>
          <span className="badge-peach ml-2">13 Tools</span>
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Founder Toolkit</h1>
            <p className="text-stone-400 text-sm">
              13 tools — calculators, simulators, CRMs and scorecards built for Indian founders. No spreadsheets. No subscriptions.
            </p>
          </div>

          {/* New tools */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-peach-500" />
              <h2 className="font-semibold text-stone-800 text-sm">New This Week</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {newTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="glass rounded-2xl p-5 card-hover group flex flex-col relative border border-peach-300/40 animate-fade-in"
                >
                  <span className="absolute top-4 right-4 badge-peach text-[10px] font-bold">NEW</span>
                  <div className="w-11 h-11 rounded-xl bg-peach-100 flex items-center justify-center mb-4">
                    <tool.icon className="w-5 h-5 text-peach-600" />
                  </div>
                  <h3 className="font-semibold text-stone-900 text-sm mb-2 pr-8">{tool.title}</h3>
                  <p className="text-stone-400 text-xs leading-relaxed mb-5 flex-1">{tool.description}</p>
                  <span className="text-xs font-medium text-peach-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    {tool.cta} <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Existing tools */}
          <div>
            <h2 className="font-semibold text-stone-800 text-sm mb-4">All Tools</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {existingTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="glass rounded-2xl p-5 card-hover group flex flex-col animate-fade-in"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/60 border border-peach-200/40 flex items-center justify-center mb-4">
                    <tool.icon className="w-5 h-5 text-stone-500" />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-semibold text-stone-900 text-sm">{tool.title}</h3>
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] bg-peach-50/80 text-peach-600 border border-peach-200/40 px-2 py-0.5 rounded-full w-fit mb-3">
                      {tool.badge}
                    </span>
                  )}
                  <p className="text-stone-400 text-xs leading-relaxed mb-5 flex-1">{tool.description}</p>
                  <span className="text-xs font-medium text-peach-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                    {tool.cta} <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Intel CTA */}
          <div className="mt-8 glass rounded-2xl p-5 border border-peach-300/30 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-peach-500 shrink-0" />
                <div>
                  <p className="font-semibold text-stone-900 text-sm">Real-time Market Intelligence</p>
                  <p className="text-xs text-stone-400 mt-0.5">Live pain points extracted from HN & Reddit for your sector. Find product ideas before anyone else.</p>
                </div>
              </div>
              <Link href="/intel" className="shrink-0 btn-coral text-xs font-semibold px-4 py-2 rounded-xl ml-4">
                View Feed →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
