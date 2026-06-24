"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Calculator, TrendingUp, ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";

const TOOLS = [
  {
    href: "/tools/market-size",
    icon: Brain,
    title: "TAM/SAM/SOM Wizard",
    description:
      "Calculate your Total Addressable Market, Serviceable Addressable Market, and Serviceable Obtainable Market using India-specific baseline data. Get AI-powered analysis of your market sizing.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    cta: "Open tool",
    badge: "India Data",
  },
  {
    href: "/tools/gst",
    icon: Calculator,
    title: "GST Impact Modeler",
    description:
      "Understand GST implications for your business model. Get rates, input tax credit rules, and calculate your net GST liability based on revenue mix.",
    color: "bg-green-50 text-green-600 border-green-100",
    cta: "Open tool",
    badge: "SaaS · D2C · Marketplace",
  },
  {
    href: "/tools/traction",
    icon: TrendingUp,
    title: "Traction Dashboard",
    description:
      "Log and track your key startup metrics — MRR, DAU, CAC, LTV, NPS. See weekly trends and measure progress at a glance.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    cta: "Open tool",
    badge: "Auth required",
  },
];

export default function ToolsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  if (!isAuthenticated()) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Founder Tools</h1>
            <p className="text-gray-500 text-sm">
              Calculators, wizards, and dashboards built for Indian startup founders.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${tool.color}`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{tool.title}</h3>
                </div>
                {tool.badge && (
                  <span className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full w-fit mb-3">
                    {tool.badge}
                  </span>
                )}
                <p className="text-gray-400 text-xs leading-relaxed mb-5 flex-1">{tool.description}</p>
                <span className="text-xs font-medium text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  {tool.cta} <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
