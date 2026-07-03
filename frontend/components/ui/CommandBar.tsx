"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search, LayoutDashboard, MessageSquare, TrendingUp, Building2, DollarSign,
  Rocket, School, Users, Calendar, BarChart3, BookOpen, Globe, Wrench,
  GitFork, Target, Lightbulb, Compass, Brain, Calculator, Zap, ArrowUpRight,
  FileText, Activity, Shield, Mail, Wallet, TrendingDown, Star,
} from "lucide-react";

const COMMANDS = [
  {
    group: "Navigation",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", keywords: ["home", "overview"] },
      { id: "chat", label: "AI Cofounder Chat", icon: MessageSquare, href: "/chat", keywords: ["ai", "cofounder", "ask", "advice"] },
      { id: "profile", label: "My Profile & Startup", icon: Users, href: "/profile", keywords: ["profile", "startup", "edit"] },
    ],
  },
  {
    group: "Investor Network",
    items: [
      { id: "vcs", label: "VC Directory (100+ Firms)", icon: TrendingUp, href: "/vcs", keywords: ["vc", "venture", "capital", "investor"] },
      { id: "angels", label: "Angel Networks", icon: DollarSign, href: "/angels", keywords: ["angel", "investor", "network"] },
      { id: "accelerators", label: "Accelerators & Cohorts", icon: Rocket, href: "/accelerators", keywords: ["accelerator", "yc", "cohort", "program"] },
      { id: "funded", label: "Funded Startups Database", icon: BarChart3, href: "/funded-startups", keywords: ["funded", "raised", "startups"] },
    ],
  },
  {
    group: "Government & Ecosystem",
    items: [
      { id: "schemes", label: "Govt Schemes (47+ Schemes)", icon: Building2, href: "/schemes", keywords: ["scheme", "grant", "government", "dpiit", "sidbi"] },
      { id: "incubators", label: "Incubators", icon: School, href: "/incubators", keywords: ["incubator", "iit", "iim"] },
      { id: "mentors", label: "Mentor Network", icon: Users, href: "/mentors", keywords: ["mentor", "expert", "advisor"] },
      { id: "events", label: "Events & Conferences", icon: Calendar, href: "/events", keywords: ["event", "conference", "meetup"] },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { id: "intel", label: "Market Intelligence Feed", icon: Activity, href: "/intel", keywords: ["reddit", "hackernews", "hn", "pain points", "market"] },
      { id: "sec", label: "SEC Benchmarks (Rule of 40)", icon: FileText, href: "/intel/sec-benchmarks", keywords: ["sec", "edgar", "rule of 40", "gross margin", "benchmark"] },
      { id: "market-intel", label: "Market Sizing (TAM/SAM/SOM)", icon: Globe, href: "/market-intel", keywords: ["tam", "sam", "som", "market size"] },
      { id: "knowledge", label: "Knowledge Base", icon: BookOpen, href: "/knowledge", keywords: ["knowledge", "playbook", "case study"] },
    ],
  },
  {
    group: "Founder Tools",
    items: [
      { id: "cap-table", label: "Cap Table Simulator", icon: GitFork, href: "/tools/cap-table", keywords: ["cap table", "equity", "dilution", "shares"] },
      { id: "burn-rate", label: "Burn Rate & Runway", icon: Target, href: "/tools/burn-rate", keywords: ["burn", "runway", "cash", "money"] },
      { id: "fundraise", label: "Fundraise Tracker (CRM)", icon: Lightbulb, href: "/tools/fundraise", keywords: ["fundraise", "crm", "investor", "pipeline"] },
      { id: "equity-waterfall", label: "Equity Waterfall Simulator", icon: TrendingDown, href: "/tools/equity-waterfall", keywords: ["equity", "waterfall", "dilution", "seed", "series a"] },
      { id: "spam-checker", label: "Cold Email Spam Checker", icon: Mail, href: "/tools/spam-checker", keywords: ["email", "spam", "cold", "outreach"] },
      { id: "salary-calc", label: "Founder Salary Calculator", icon: Wallet, href: "/tools/salary-calc", keywords: ["salary", "pay", "compensation", "founder"] },
      { id: "market-size", label: "TAM/SAM/SOM Wizard", icon: Brain, href: "/tools/market-size", keywords: ["tam", "sam", "som", "market"] },
      { id: "gst", label: "GST Impact Modeler", icon: Calculator, href: "/tools/gst", keywords: ["gst", "tax", "india"] },
      { id: "traction", label: "Traction Dashboard", icon: Star, href: "/tools/traction", keywords: ["traction", "metrics", "mrr", "arr", "kpi"] },
    ],
  },
  {
    group: "Compliance Wizards",
    items: [
      { id: "dpiit", label: "DPIIT Recognition Wizard", icon: Shield, href: "/wizards/dpiit", keywords: ["dpiit", "recognition", "startup india"] },
      { id: "udyam", label: "Udyam Registration", icon: Compass, href: "/wizards/udyam", keywords: ["udyam", "msme"] },
      { id: "gem", label: "GeM Onboarding", icon: Compass, href: "/wizards/gem", keywords: ["gem", "government", "marketplace"] },
      { id: "ip", label: "IP & Patent Guide", icon: Shield, href: "/wizards/ip", keywords: ["ip", "patent", "trademark"] },
    ],
  },
];

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1a1009]/30 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl mx-4 glass-strong rounded-2xl overflow-hidden shadow-peach-lg animate-slide-up"
        style={{ boxShadow: "0 25px 80px rgba(255,140,66,0.20), 0 4px 16px rgba(0,0,0,0.10)" }}
      >
        <Command className="w-full" shouldFilter={true}>
          {/* Search row */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-peach-200/50">
            <Search className="w-4 h-4 text-peach-500 shrink-0" />
            <Command.Input
              placeholder="Search tools, pages, investor lists…"
              value={query}
              onValueChange={setQuery}
              autoFocus
            />
            <kbd className="shrink-0 hidden sm:flex items-center gap-1 text-[10px] font-medium text-stone-400 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin py-1.5">
            <Command.Empty>
              <div className="py-8 text-center">
                <Zap className="w-6 h-6 text-peach-300 mx-auto mb-2" />
                <p className="text-sm text-stone-400">No results for &ldquo;{query}&rdquo;</p>
              </div>
            </Command.Empty>

            {COMMANDS.map(({ group, items }) => (
              <Command.Group key={group} heading={group}>
                {items.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={[item.label, ...item.keywords].join(" ")}
                    onSelect={() => navigate(item.href)}
                  >
                    <div className="w-6 h-6 rounded-md bg-peach-100 flex items-center justify-center shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-peach-600" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-30 shrink-0" />
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-peach-200/40 bg-peach-50/40">
            <div className="flex items-center gap-3 text-[10px] text-stone-400">
              <span className="flex items-center gap-1">
                <kbd className="bg-stone-100 border border-stone-200 rounded px-1 py-0.5 font-mono">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-stone-100 border border-stone-200 rounded px-1 py-0.5 font-mono">↵</kbd> open
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-peach-500 font-medium">
              <Zap className="w-3 h-3" />
              OpenFounder OS
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}

// Trigger button for sidebar/header
export function CommandTrigger({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => {
        const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
        window.dispatchEvent(event);
      }}
      className={`flex items-center gap-2 text-xs text-stone-500 hover:text-peach-600 transition-colors group ${className}`}
    >
      <Search className="w-3.5 h-3.5" />
      <span>Search</span>
      <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] bg-peach-100/60 border border-peach-200/60 text-stone-400 rounded px-1.5 py-0.5 font-mono group-hover:bg-peach-100 group-hover:text-peach-600 transition-colors">
        ⌘K
      </kbd>
    </button>
  );
}
