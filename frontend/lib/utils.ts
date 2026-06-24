import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AGENT_META: Record<string, { label: string; color: string; emoji: string }> = {
  mentor: { label: "AI Cofounder", color: "bg-violet-100 text-violet-800", emoji: "🧠" },
  schemes: { label: "Schemes Expert", color: "bg-green-100 text-green-800", emoji: "🏛️" },
  researcher: { label: "Market Researcher", color: "bg-blue-100 text-blue-800", emoji: "🔍" },
  pitch: { label: "Pitch Coach", color: "bg-orange-100 text-orange-800", emoji: "🎯" },
};

export const STAGES = ["Idea", "Pre-Revenue", "Early Revenue", "Growth", "Scale"];

export const SECTORS = [
  "Technology", "Healthcare", "Agriculture", "Agri-tech", "FinTech", "EdTech",
  "Manufacturing", "Biotechnology", "Energy", "Social Impact", "Deep Tech",
  "AI/ML", "IoT", "Cybersecurity", "E-Commerce", "Logistics", "Other",
];
