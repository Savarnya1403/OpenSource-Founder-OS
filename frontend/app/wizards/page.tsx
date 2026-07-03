"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building, FileText, Shield, ShoppingCart } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";

const WIZARDS = [
  {
    href: "/wizards/dpiit",
    icon: Shield,
    title: "DPIIT Recognition",
    description:
      "Step-by-step guidance to get your startup recognised by the Department for Promotion of Industry and Internal Trade.",
    unlocks: ["Tax exemptions under 80IAC", "Seed Fund Scheme access", "Self-certification on 9 Labour laws", "Fast-track patent filing"],
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    badge: "Most Important",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    href: "/wizards/udyam",
    icon: Building,
    title: "Udyam Registration",
    description:
      "Register your enterprise under MSME to access priority lending, subsidies, and government procurement advantages.",
    unlocks: ["Priority sector lending", "Credit Guarantee Scheme", "Government tender preference", "MSME subsidies"],
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    badge: "Under 15 Minutes",
    badgeColor: "bg-peach-50/60 text-stone-700",
  },
  {
    href: "/wizards/gem",
    icon: ShoppingCart,
    title: "GeM Onboarding",
    description:
      "Get onboarded to the Government e-Marketplace to sell your products and services directly to government buyers.",
    unlocks: ["₹2L+ Cr government market", "Direct procurement access", "No tender required for small orders", "Seller dashboard"],
    color: "bg-orange-50 text-orange-600 border-orange-200",
    badge: "Govt Revenue",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    href: "/wizards/ip",
    icon: FileText,
    title: "IP Filing Assistant",
    description:
      "Understand patent, trademark, and copyright filing processes in India with fees, timelines, and practical tips.",
    unlocks: ["Patent protection", "Trademark registration", "Copyright notice", "Attorney finder"],
    color: "bg-purple-50 text-purple-600 border-purple-200",
    badge: "Patent · TM · Copyright",
    badgeColor: "bg-purple-100 text-purple-700",
  },
];

export default function WizardsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  if (!isAuthenticated()) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Registration Wizards</h1>
            <p className="text-stone-500 text-sm">
              Step-by-step guides to complete key government registrations and unlock benefits for your startup.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {WIZARDS.map((w) => (
              <Link
                key={w.href}
                href={w.href}
                className="glass rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${w.color}`}>
                    <w.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${w.badgeColor}`}>
                    {w.badge}
                  </span>
                </div>

                <h3 className="font-semibold text-stone-900 mb-2">{w.title}</h3>
                <p className="text-stone-400 text-xs leading-relaxed mb-4 flex-1">{w.description}</p>

                <div className="mb-5">
                  <div className="text-xs font-medium text-stone-500 mb-2">What you unlock:</div>
                  <ul className="space-y-1">
                    {w.unlocks.map((u) => (
                      <li key={u} className="text-xs text-stone-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-peach-400 shrink-0" />
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>

                <span className="text-xs font-medium text-peach-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Start wizard <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
