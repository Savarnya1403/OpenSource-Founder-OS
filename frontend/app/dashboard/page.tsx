"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare, ArrowRight, Zap, TrendingUp, KeyRound,
  BarChart3, ChevronRight, Activity, FileText, Mail, Wallet, TrendingDown,
  Building2, Shield, Star, BookOpen, UserSearch, Gauge, Gift, Network,
  CalendarCheck, Scale, IndianRupee,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { getUser, isAuthenticated } from "@/lib/auth";
import { hasLLMConfig } from "@/lib/llm-config";
import { CommandTrigger } from "@/components/ui/CommandBar";

const QUICK_ACTIONS = [
  {
    href: "/chat",
    icon: MessageSquare,
    title: "AI Cofounder",
    desc: "Strategy, validation, pitch help, GTM — ask anything.",
    iconBg: "bg-peach-100",
    iconColor: "text-peach-600",
  },
  {
    href: "/intel",
    icon: Activity,
    title: "Market Intelligence Feed",
    desc: "Live pain-point extraction from HN & Reddit for your sector.",
    iconBg: "bg-peach-100",
    iconColor: "text-peach-600",
    liveTag: true,
  },
  {
    href: "/tools/equity-waterfall",
    icon: TrendingDown,
    title: "Equity Waterfall",
    desc: "See dilution across Seed → Series A → B with live sliders.",
    iconBg: "bg-peach-100",
    iconColor: "text-peach-600",
  },
  {
    href: "/tools/customer-discovery",
    icon: UserSearch,
    title: "Customer Discovery CRM",
    desc: "Log interviews, track pain points, buying signals across 50+ customer conversations.",
    iconBg: "bg-peach-100",
    iconColor: "text-peach-600",
  },
  {
    href: "/tools/pmf-scorecard",
    icon: Gauge,
    title: "PMF Scorecard",
    desc: "Know where you stand on product-market fit — 10-question scorecard with India benchmarks.",
    iconBg: "bg-peach-100",
    iconColor: "text-peach-600",
  },
  {
    href: "/schemes",
    icon: Building2,
    title: "Govt Schemes",
    desc: "47+ grants, soft loans & incentives from DPIIT, SIDBI, MeitY.",
    iconBg: "bg-peach-100",
    iconColor: "text-peach-600",
  },
];

const ECOSYSTEM_CARDS = [
  { href: "/vcs", label: "VCs", count: "100+", sub: "Venture firms", color: "text-peach-700", bg: "bg-peach-100" },
  { href: "/angels", label: "Angels", count: "50+", sub: "Angel investors", color: "text-peach-700", bg: "bg-peach-100" },
  { href: "/accelerators", label: "Accelerators", count: "20+", sub: "With capital", color: "text-peach-700", bg: "bg-peach-100" },
  { href: "/incubators", label: "Incubators", count: "18+", sub: "Support programs", color: "text-peach-700", bg: "bg-peach-100" },
  { href: "/mentors", label: "Mentors", count: "35+", sub: "Top operators", color: "text-peach-700", bg: "bg-peach-100" },
  { href: "/funded-startups", label: "Startups", count: "150+", sub: "Funded & tracked", color: "text-peach-700", bg: "bg-peach-100" },
  { href: "/communities", label: "Communities", count: "22", sub: "India networks", color: "text-peach-700", bg: "bg-peach-100" },
  { href: "/schemes/programs", label: "Free Credits", count: "28", sub: "Startup programs", color: "text-green-700", bg: "bg-green-100" },
];

const STARTER_QUESTIONS = [
  "How do I validate my startup idea without spending money?",
  "What government schemes are available for my fintech startup?",
  "How do I structure a co-founder equity split fairly?",
  "What's the right fundraising strategy for a pre-seed startup?",
  "Help me build an investor pitch deck for Series A",
  "What's the market size for HealthTech in India?",
  "How do I build a 0-to-1 GTM strategy for B2B SaaS?",
  "What are the key metrics VCs look for at Seed stage?",
  "What questions should I ask in customer discovery interviews?",
  "What's market-standard for a seed term sheet in India in 2025?",
  "How do I know if I've found product-market fit?",
  "What are the GST compliance deadlines I need to know as a startup?",
];

const NEW_FEATURES = [
  {
    href: "/tools/customer-discovery",
    icon: UserSearch,
    title: "Customer Discovery CRM",
    desc: "Log interviews, track pain points, measure buying signals — before you build the wrong thing.",
    badge: "New",
    badgeColor: "badge-peach",
  },
  {
    href: "/tools/pmf-scorecard",
    icon: Gauge,
    title: "PMF Scorecard",
    desc: "10-question self-assessment: retention, revenue, referral, engagement & market pull. Know where you stand.",
    badge: "New",
    badgeColor: "badge-peach",
  },
  {
    href: "/schemes/programs",
    icon: Gift,
    title: "Free Credits & Programs",
    desc: "AWS $100K, Google $200K, Microsoft $150K — 28 programs worth ₹3+ crore in free cloud & SaaS credits.",
    badge: "New",
    badgeColor: "badge-green",
  },
  {
    href: "/communities",
    icon: Network,
    title: "Startup Community Map",
    desc: "iSPIRT, SaaSBOOMi, TiE, Headstart — 22 communities where India's best founders share deals, hires & intros.",
    badge: "New",
    badgeColor: "badge-peach",
  },
  {
    href: "/tools/compliance-calendar",
    icon: CalendarCheck,
    title: "Compliance Calendar",
    desc: "GST, TDS, ROC, Income Tax deadlines with countdowns. Never miss a filing date again.",
    badge: "New",
    badgeColor: "badge-blue",
  },
  {
    href: "/knowledge/deal-terms",
    icon: Scale,
    title: "India Deal Terms Benchmarks",
    desc: "What's market-standard in India 2025? Dilution, CCD vs SAFE, pro-rata, liquidation preference by stage.",
    badge: "New",
    badgeColor: "badge-peach",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(getUser());
  const [llmConfigured, setLlmConfigured] = useState(true);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      setUser(getUser());
      setLlmConfigured(hasLLMConfig());
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 px-8 py-3 flex items-center justify-between glass-strong border-b border-peach-200/30">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Zap className="w-3.5 h-3.5 text-peach-400" />
            <span>OpenFounder OS</span>
            <span className="text-peach-200">/</span>
            <span className="text-stone-600 font-medium">Dashboard</span>
          </div>
          <CommandTrigger />
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
              {greeting}, {user.name.split(" ")[0]} 👋
            </h1>
            {user.startup_name ? (
              <p className="text-stone-500 mt-1.5 text-sm leading-relaxed">
                Building{" "}
                <span className="font-semibold text-stone-800">{user.startup_name}</span>
                {user.startup_stage && <span className="text-stone-400"> · {user.startup_stage}</span>}
                {user.sector && <span className="text-stone-400"> · {user.sector}</span>}
              </p>
            ) : (
              <p className="text-stone-500 mt-1.5 text-sm">
                Your AI cofounder is ready.{" "}
                <Link href="/profile" className="text-peach-600 hover:underline font-medium">
                  Complete your profile
                </Link>{" "}
                for personalized insights.
              </p>
            )}
          </div>

          {/* API key banner */}
          {!llmConfigured && (
            <div className="mb-6 glass rounded-2xl px-5 py-4 flex items-center gap-4 border-peach-300/40 animate-slide-up">
              <div className="w-10 h-10 bg-peach-100 rounded-xl flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-peach-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900">Add your AI API key to start chatting</p>
                <p className="text-xs text-stone-400 mt-0.5">Supports Anthropic Claude, OpenAI, Gemini — your key stays in your browser.</p>
              </div>
              <Link
                href="/settings"
                className="shrink-0 btn-coral text-sm font-medium px-4 py-2 rounded-xl whitespace-nowrap"
              >
                Add key →
              </Link>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="glass rounded-2xl p-5 card-hover group animate-fade-in"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.iconBg}`}>
                    <a.icon className={`w-5 h-5 ${a.iconColor}`} />
                  </div>
                  {a.liveTag && (
                    <div className="flex items-center gap-1.5">
                      <span className="live-dot" />
                      <span className="text-[10px] font-semibold text-green-600">LIVE</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-stone-900 text-sm mb-1">{a.title}</h3>
                <p className="text-stone-400 text-xs leading-relaxed mb-4">{a.desc}</p>
                <span className="text-xs font-medium text-peach-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>

          {/* New features callout */}
          <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
            <h2 className="font-semibold text-stone-900 mb-1 flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-peach-500" />
              8 new features added
            </h2>
            <p className="text-xs text-stone-400 mb-4">Customer CRM, PMF Scorecard, Compliance Calendar, Deal Terms, Free Credits, Communities, Salary Benchmarks & more.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {NEW_FEATURES.map((f) => (
                <Link
                  key={f.href}
                  href={f.href}
                  className="group bg-peach-50/60 border border-peach-200/40 rounded-xl p-4 hover:bg-peach-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <f.icon className="w-4 h-4 text-peach-600" />
                    <span className={`${f.badgeColor} text-[9px] font-bold uppercase tracking-wide`}>
                      {f.badge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-stone-800 mb-1">{f.title}</p>
                  <p className="text-[11px] text-stone-400 leading-relaxed">{f.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Ecosystem at a glance */}
          <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-peach-500" />
              Indian Startup Ecosystem
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {ECOSYSTEM_CARDS.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="text-center p-3 rounded-xl bg-white/50 border border-peach-100/60 hover:border-peach-300/60 hover:shadow-sm transition-all group"
                >
                  <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <span className={`text-sm font-bold ${c.color}`}>{c.count}</span>
                  </div>
                  <p className="text-xs font-semibold text-stone-800">{c.label}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{c.sub}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Ask AI */}
          <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-peach-500" />
              Ask your AI cofounder
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <Link
                  key={q}
                  href={`/chat?q=${encodeURIComponent(q)}`}
                  className="text-xs text-stone-600 bg-white/50 hover:bg-peach-50 hover:text-peach-700 rounded-xl px-4 py-3 border border-peach-100/60 hover:border-peach-300/60 transition-all flex items-center justify-between group"
                >
                  <span className="leading-relaxed">{q}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-peach-400 shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom CTAs */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5 flex items-center gap-4">
              <Shield className="w-8 h-8 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-stone-900 text-sm">47+ govt schemes</div>
                <div className="text-stone-400 text-xs mt-0.5">DPIIT, SIDBI, BIRAC grants.</div>
              </div>
              <Link href="/schemes" className="shrink-0 btn-ghost-peach text-xs font-medium px-3 py-1.5 rounded-lg">
                Explore →
              </Link>
            </div>
            <div className="glass rounded-2xl p-5 flex items-center gap-4">
              <Gift className="w-8 h-8 text-peach-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-stone-900 text-sm">₹3Cr+ free credits</div>
                <div className="text-stone-400 text-xs mt-0.5">AWS, Google, Microsoft & 25 more programs.</div>
              </div>
              <Link href="/schemes/programs" className="shrink-0 btn-ghost-peach text-xs font-medium px-3 py-1.5 rounded-lg">
                Claim →
              </Link>
            </div>
            <div className="glass rounded-2xl p-5 flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-peach-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-stone-900 text-sm">Unicorn Playbooks</div>
                <div className="text-stone-400 text-xs mt-0.5">How Razorpay, CRED & Zepto built category cos.</div>
              </div>
              <Link href="/knowledge/case-studies" className="shrink-0 btn-ghost-peach text-xs font-medium px-3 py-1.5 rounded-lg">
                Read →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
