"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Brain, Building2, MessageSquare, ArrowRight, Zap, TrendingUp, Shield, KeyRound } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { getUser, isAuthenticated } from "@/lib/auth";
import { hasLLMConfig } from "@/lib/llm-config";

const QUICK_ACTIONS = [
  {
    href: "/chat",
    icon: MessageSquare,
    title: "Ask your AI cofounder",
    desc: "Get strategic advice, validate ideas, or explore growth strategies.",
    color: "bg-violet-50 text-violet-600 border-violet-100",
    cta: "Start chatting",
  },
  {
    href: "/schemes",
    icon: Building2,
    title: "Find government schemes",
    desc: "Discover grants, soft loans, and incentives matching your startup profile.",
    color: "bg-green-50 text-green-600 border-green-100",
    cta: "Browse schemes",
  },
  {
    href: "/chat?q=help+me+with+my+pitch+deck",
    icon: TrendingUp,
    title: "Refine your pitch",
    desc: "Get investor-ready with pitch structure, valuation, and VC landscape advice.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    cta: "Polish pitch",
  },
  {
    href: "/wizards/dpiit",
    icon: Shield,
    title: "Get DPIIT Recognition",
    desc: "Step-by-step wizard to unlock tax exemptions and scheme access.",
    color: "bg-green-50 text-green-600 border-green-100",
    cta: "Start wizard",
  },
  {
    href: "/vcs",
    icon: TrendingUp,
    title: "Explore VC Directory",
    desc: "150+ Indian VCs with investment thesis, portfolio, and check sizes.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    cta: "Find investors",
  },
  {
    href: "/knowledge/case-studies",
    icon: BookOpen,
    title: "Indian Startup Stories",
    desc: "Real lessons from Razorpay, Zepto, CRED, Mamaearth and more.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    cta: "Read stories",
  },
];

const STARTER_QUESTIONS = [
  "How do I validate my startup idea without spending money?",
  "What government schemes are available for my tech startup?",
  "How do I structure a co-founder equity split?",
  "What's the best way to do customer discovery in India?",
  "Help me build a 10-slide investor pitch deck",
  "What's the market size for EdTech in India?",
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(getUser());
  const [llmConfigured, setLlmConfigured] = useState(true);

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Zap className="w-3.5 h-3.5" />
            OpenFounder OS
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Good day, {user.name.split(" ")[0]} 👋
          </h1>
          {user.startup_name ? (
            <p className="text-gray-500 mt-1">
              Building <span className="font-medium text-gray-700">{user.startup_name}</span>
              {user.startup_stage && <> · {user.startup_stage}</>}
              {user.sector && <> · {user.sector}</>}
            </p>
          ) : (
            <p className="text-gray-500 mt-1">
              Your AI cofounder is ready.{" "}
              <Link href="/profile" className="text-brand-600 hover:underline">
                Complete your profile
              </Link>{" "}
              for better recommendations.
            </p>
          )}
        </div>

        {/* API key banner */}
        {!llmConfigured && (
          <div className="mb-6 flex items-center gap-4 bg-gradient-to-r from-violet-50 to-brand-50 border border-violet-200 rounded-2xl px-5 py-4">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Add your API key to start chatting with our FounderOS Model</p>
              <p className="text-xs text-gray-500 mt-0.5">Supports Anthropic, OpenAI, Gemini, and DeepSeek — your key stays in your browser.</p>
            </div>
            <Link
              href="/settings"
              className="shrink-0 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors whitespace-nowrap"
            >
              Add API key →
            </Link>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow group"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${a.color}`}>
                <a.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{a.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">{a.desc}</p>
              <span className="text-xs font-medium text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                {a.cta} <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>

        {/* Starter questions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-500" />
            Ask your AI cofounder
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {STARTER_QUESTIONS.map((q) => (
              <Link
                key={q}
                href={`/chat?q=${encodeURIComponent(q)}`}
                className="text-sm text-gray-600 bg-gray-50 hover:bg-brand-50 hover:text-brand-700 rounded-xl px-4 py-3 border border-gray-100 hover:border-brand-200 transition-colors cursor-pointer"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        {/* Schemes callout */}
        <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600 shrink-0" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">30+ government schemes waiting for you</div>
              <div className="text-gray-500 text-xs mt-0.5">Grants, loans, and incentives from DPIIT, SIDBI, BIRAC, MeitY, DST and more.</div>
            </div>
          </div>
          <Link
            href="/schemes"
            className="shrink-0 ml-4 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Match me →
          </Link>
        </div>
      </main>
    </div>
  );
}
