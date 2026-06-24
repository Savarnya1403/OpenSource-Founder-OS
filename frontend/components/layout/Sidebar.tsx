"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Building2, Calendar, Compass, LayoutDashboard, LogOut, MessageCircle, MessageSquare, School, TrendingUp, User, Wrench, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuth, getUser } from "@/lib/auth";
import toast from "react-hot-toast";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/chat", icon: MessageSquare, label: "AI Cofounder" },
  { href: "/schemes", icon: Building2, label: "Schemes" },
  { href: "/vcs", icon: TrendingUp, label: "VC Directory" },
  { href: "/incubators", icon: School, label: "Incubators" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/wizards", icon: Compass, label: "Wizards" },
  { href: "/tools", icon: Wrench, label: "Tools" },
  { href: "/knowledge", icon: BookOpen, label: "Knowledge" },
  { href: "/forum", icon: MessageCircle, label: "Forum" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    toast.success("Signed out");
    router.push("/");
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-saffron-500 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">OpenFounder OS</div>
            <div className="text-xs text-gray-400">AI Cofounder</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-saffron-400 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{user.name[0].toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
              {user.startup_name && (
                <div className="text-xs text-gray-400 truncate">{user.startup_name}</div>
              )}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
