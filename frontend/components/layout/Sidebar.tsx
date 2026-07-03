"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, Building2, Calendar, Compass, KeyRound, LayoutDashboard,
  LogOut, MessageCircle, MessageSquare, School, TrendingUp, User, Wrench,
  Zap, Users, Rocket, BarChart3, Target, DollarSign, ChevronDown, ChevronRight,
  Lightbulb, Globe, GitFork, Activity, FileText, Mail, Wallet, TrendingDown,
  Shield, Star, ClipboardList, CalendarCheck, Gauge, IndianRupee, Scale,
  Gift, Network, UserSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuth, getUser } from "@/lib/auth";
import toast from "react-hot-toast";
import { useState } from "react";
import { CommandTrigger } from "@/components/ui/CommandBar";

const NAV_GROUPS = [
  {
    label: "Home",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/chat", icon: MessageSquare, label: "AI Cofounder" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/intel", icon: Activity, label: "Market Feed", badge: "Live" },
      { href: "/intel/sec-benchmarks", icon: FileText, label: "SEC Benchmarks" },
      { href: "/market-intel", icon: Globe, label: "Market Intel" },
      { href: "/funded-startups", icon: BarChart3, label: "Funded Startups" },
    ],
  },
  {
    label: "Investor Network",
    items: [
      { href: "/vcs", icon: TrendingUp, label: "VC Directory" },
      { href: "/angels", icon: DollarSign, label: "Angel Networks" },
      { href: "/accelerators", icon: Rocket, label: "Accelerators" },
    ],
  },
  {
    label: "Ecosystem",
    items: [
      { href: "/schemes", icon: Building2, label: "Govt Schemes" },
      { href: "/schemes/programs", icon: Gift, label: "Free Credits", badge: "New" },
      { href: "/communities", icon: Network, label: "Communities", badge: "New" },
      { href: "/incubators", icon: School, label: "Incubators" },
      { href: "/mentors", icon: Users, label: "Mentor Network" },
      { href: "/events", icon: Calendar, label: "Events" },
    ],
  },
  {
    label: "Founder Tools",
    items: [
      { href: "/tools/customer-discovery", icon: UserSearch, label: "Customer CRM", badge: "New" },
      { href: "/tools/pmf-scorecard", icon: Gauge, label: "PMF Scorecard", badge: "New" },
      { href: "/tools/cap-table", icon: GitFork, label: "Cap Table" },
      { href: "/tools/burn-rate", icon: Target, label: "Burn & Runway" },
      { href: "/tools/fundraise", icon: Lightbulb, label: "Raise Tracker" },
      { href: "/tools/equity-waterfall", icon: TrendingDown, label: "Equity Waterfall" },
      { href: "/tools/salary-benchmarks", icon: IndianRupee, label: "Salary Benchmarks", badge: "New" },
      { href: "/tools/salary-calc", icon: Wallet, label: "Salary Calc" },
      { href: "/tools/traction", icon: Star, label: "Traction" },
      { href: "/tools/market-size", icon: Globe, label: "TAM/SAM/SOM" },
      { href: "/tools/spam-checker", icon: Mail, label: "Email Spam Check" },
    ],
  },
  {
    label: "Compliance",
    items: [
      { href: "/tools/compliance-calendar", icon: CalendarCheck, label: "Compliance Calendar", badge: "New" },
      { href: "/wizards/dpiit", icon: Shield, label: "DPIIT Wizard" },
      { href: "/wizards", icon: Compass, label: "All Wizards" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { href: "/knowledge", icon: BookOpen, label: "Knowledge Base" },
      { href: "/knowledge/deal-terms", icon: Scale, label: "Deal Terms", badge: "New" },
      { href: "/forum", icon: MessageCircle, label: "Forum" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", icon: User, label: "Profile" },
      { href: "/settings", icon: KeyRound, label: "AI Settings" },
    ],
  },
];

const BADGE_STYLE: Record<string, string> = {
  Live: "bg-green-100 text-green-700 border border-green-200",
  New:  "bg-peach-100 text-peach-700 border border-peach-200",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ Knowledge: true });

  function handleLogout() {
    clearAuth();
    toast.success("Signed out");
    router.push("/");
  }

  function toggleGroup(label: string) {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside className="w-56 min-h-screen glass-sidebar flex flex-col shrink-0 sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-peach-200/30">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-coral-gradient rounded-lg flex items-center justify-center shrink-0 shadow-peach group-hover:shadow-peach-lg transition-shadow">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="font-bold text-stone-900 text-xs leading-tight">OpenFounder OS</div>
            <div className="text-[10px] text-peach-500 font-medium">AI Cofounder</div>
          </div>
        </Link>
      </div>

      {/* Command search */}
      <div className="px-3 py-2.5 border-b border-peach-200/20">
        <CommandTrigger className="w-full bg-peach-50/60 border border-peach-200/40 rounded-lg px-3 py-2 hover:bg-peach-100/60 transition-colors" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-2 overflow-y-auto scrollbar-thin space-y-0.5">
        {NAV_GROUPS.map(({ label, items }) => {
          const isGroupCollapsed = collapsed[label];
          return (
            <div key={label} className="mb-1">
              <button
                onClick={() => toggleGroup(label)}
                className="w-full flex items-center justify-between px-2 py-1.5 section-label hover:opacity-100 transition-opacity"
              >
                {label}
                {isGroupCollapsed
                  ? <ChevronRight className="w-3 h-3" />
                  : <ChevronDown className="w-3 h-3" />}
              </button>
              {!isGroupCollapsed && (
                <div className="space-y-0.5 mt-0.5">
                  {items.map(({ href, icon: Icon, label: itemLabel, badge }: { href: string; icon: React.ElementType; label: string; badge?: string }) => {
                    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all",
                          active
                            ? "bg-peach-200/60 text-peach-800 shadow-sm"
                            : "text-stone-600 hover:bg-peach-100/50 hover:text-peach-800"
                        )}
                      >
                        <Icon className={cn("w-3.5 h-3.5 shrink-0", active ? "text-peach-600" : "text-stone-400")} />
                        <span className="flex-1 truncate">{itemLabel}</span>
                        {badge && (
                          <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0", BADGE_STYLE[badge] || "bg-peach-100 text-peach-700")}>
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-peach-200/30">
        {user && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-7 h-7 bg-coral-gradient rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-[10px] font-bold">{user.name[0].toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-stone-800 truncate">{user.name}</div>
              {user.startup_name && (
                <div className="text-[10px] text-peach-500 truncate">{user.startup_name}</div>
              )}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-stone-400 hover:text-red-600 hover:bg-red-50/60 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
