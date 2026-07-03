"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, ExternalLink, Linkedin, MapPin, Twitter, Star, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";

const DOMAINS = [
  "FinTech", "SaaS", "B2B SaaS", "D2C", "Consumer", "EdTech", "HealthTech",
  "Deep Tech", "AI", "AgriTech", "CleanTech", "Marketplace", "WealthTech",
];
const STAGES = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B", "Growth"];

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  formerly?: string[];
  domain: string[];
  expertise: string[];
  stage_preference: string[];
  sector_focus: string[];
  location: string;
  linkedin?: string;
  twitter?: string;
  availability: string;
  mentoring_style: string;
  known_for: string;
  notable_mentees?: string[];
  bio: string;
  tags: string[];
}

const AVAILABILITY_COLORS: Record<string, string> = {
  "Open": "bg-green-100 text-green-700",
  "Moderate": "bg-peach-50/60 text-stone-700",
  "Selective": "bg-yellow-100 text-yellow-700",
  "Limited": "bg-orange-100 text-orange-700",
  "Very limited": "bg-red-100 text-red-700",
};

function getAvailColor(availability: string): string {
  for (const key of Object.keys(AVAILABILITY_COLORS)) {
    if (availability.startsWith(key)) return AVAILABILITY_COLORS[key];
  }
  return "bg-peach-100/60 text-stone-600";
}

function MentorCard({ mentor }: { mentor: Mentor }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-peach-400 to-coral flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-base">{mentor.name[0]}</span>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-sm leading-tight">{mentor.name}</h3>
            <p className="text-xs text-stone-500">{mentor.title}</p>
            <p className="text-xs font-medium text-peach-600">{mentor.company}</p>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0 ml-2">
          {mentor.linkedin && (
            <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer"
              className="w-7 h-7 bg-peach-50/60 rounded-lg flex items-center justify-center hover:bg-peach-100/60 transition-colors">
              <Linkedin className="w-3.5 h-3.5 text-peach-600" />
            </a>
          )}
          {mentor.twitter && (
            <a href={mentor.twitter} target="_blank" rel="noopener noreferrer"
              className="w-7 h-7 bg-sky-50 rounded-lg flex items-center justify-center hover:bg-sky-100 transition-colors">
              <Twitter className="w-3.5 h-3.5 text-sky-500" />
            </a>
          )}
        </div>
      </div>

      <p className="text-xs text-stone-500 mb-3 line-clamp-2">{mentor.bio}</p>

      {/* Availability */}
      <div className="mb-3">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getAvailColor(mentor.availability)}`}>
          {mentor.availability.split(" — ")[0]}
        </span>
      </div>

      {/* Domain tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {mentor.domain.slice(0, 4).map((d) => (
          <span key={d} className="text-[10px] bg-peach-50/60 text-stone-700 border border-peach-200/40 px-2 py-0.5 rounded-full font-medium">
            {d}
          </span>
        ))}
      </div>

      {/* Location */}
      <div className="flex items-center gap-1 text-xs text-stone-400 mb-3">
        <MapPin className="w-3 h-3" />
        {mentor.location}
      </div>

      {/* Known for */}
      <div className="flex items-start gap-1.5 mb-3 bg-amber-50 rounded-lg px-3 py-2">
        <Star className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[10px] text-amber-800 leading-relaxed">{mentor.known_for}</p>
      </div>

      {/* Expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 mb-2"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? "Less" : "More"} about mentoring style
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-peach-100/40 pt-3">
          <div>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Mentoring Style</p>
            <p className="text-xs text-stone-600">{mentor.mentoring_style}</p>
          </div>
          {mentor.expertise.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Expertise</p>
              <div className="flex flex-wrap gap-1">
                {mentor.expertise.map((e) => (
                  <span key={e} className="text-[10px] bg-peach-50/40 text-stone-600 border border-peach-200/40 px-2 py-0.5 rounded-full">{e}</span>
                ))}
              </div>
            </div>
          )}
          {mentor.stage_preference.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Best for Stage</p>
              <p className="text-xs text-stone-600">{mentor.stage_preference.join(", ")}</p>
            </div>
          )}
          {mentor.notable_mentees && mentor.notable_mentees.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Known Mentees / Portfolio</p>
              <p className="text-xs text-stone-600">{mentor.notable_mentees.join(", ")}</p>
            </div>
          )}
          {mentor.formerly && mentor.formerly.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Formerly At</p>
              <p className="text-xs text-stone-600">{mentor.formerly.join(", ")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MentorsPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [stage, setStage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["mentors", search, domain, stage],
    queryFn: () =>
      api.get("/api/mentors", { params: { search: search || undefined, domain: domain || undefined, stage: stage || undefined, limit: 50 } })
        .then((r) => r.data),
    staleTime: 60_000,
  });

  const mentors: Mentor[] = data?.mentors || [];
  const total: number = data?.total || mentors.length;
  const hasFilters = !!(search || domain || stage);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Mentor Network</h1>
            <p className="text-stone-500 text-sm">
              {total} Indian startup ecosystem mentors — founders, operators, and investors who&apos;ve built category-defining companies.
            </p>
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-5 mb-6">
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search mentors by name, company, or expertise..."
                  className="w-full pl-9 pr-4 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                />
              </div>
              {hasFilters && (
                <button
                  onClick={() => { setSearch(""); setDomain(""); setStage(""); }}
                  className="flex items-center gap-1.5 text-sm text-stone-500 border border-peach-200/60 rounded-lg px-3 hover:bg-peach-50/60"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
              >
                <option value="">All Domains</option>
                {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
              >
                <option value="">All Stages</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <span className="text-xs text-stone-400 font-medium">Availability:</span>
            {Object.entries(AVAILABILITY_COLORS).map(([k, v]) => (
              <span key={k} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${v}`}>{k}</span>
            ))}
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-peach-500" />
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p>No mentors match your filters. Try broadening your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
