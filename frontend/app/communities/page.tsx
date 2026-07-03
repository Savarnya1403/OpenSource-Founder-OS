"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Network, Search, ExternalLink, Users, Pin } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

interface Community {
  id: string;
  name: string;
  full_name: string;
  logo_emoji: string;
  type: string;
  focus_areas: string[];
  geography: string;
  cities: string[];
  member_count: string;
  activity_level: string;
  founded: number;
  description: string;
  value_for_founders: string;
  how_to_join: string;
  join_url: string;
  is_free: boolean;
  cost: string;
  key_programs: string[];
  notable_alumni: string[];
  annual_events: string[];
  tags: string[];
}

interface CommunitiesData {
  communities: Community[];
  total: number;
}

const ACTIVITY_COLORS: Record<string, string> = {
  "Very High": "bg-green-100 text-green-700",
  High: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-stone-100 text-stone-500",
};

const TYPE_EMOJIS: Record<string, string> = {
  "Product Community": "🛠️",
  "Industry Association": "🏢",
  "Accelerator": "🚀",
  "Government Initiative": "🏛️",
  "VC Community": "💰",
  "Media / Events": "📰",
  "Women in Tech": "👩‍💻",
  "Deep Tech": "🔬",
  "FinTech Association": "💳",
};

const PINNED_IDS = ["ispirt", "saasboomi", "nasscom_10k"];

export default function CommunitiesPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterFree, setFilterFree] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["communities", filterType, filterFree, filterCity, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (filterFree) params.set("is_free", "true");
      if (filterCity) params.set("city", filterCity);
      if (search) params.set("search", search);
      const res = await fetch(`${API}/api/tools/communities?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<CommunitiesData>;
    },
    placeholderData: (prev) => prev,
  });

  const communities = data?.communities ?? [];
  const pinned = communities.filter((c) => PINNED_IDS.includes(c.id));
  const rest = communities.filter((c) => !PINNED_IDS.includes(c.id));
  const types = [...new Set(communities.map((c) => c.type))];
  const cities = [...new Set(communities.flatMap((c) => c.cities))].sort();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 glass-strong border-b border-peach-200/30 px-8 py-3 flex items-center gap-2">
          <Network className="w-4 h-4 text-peach-500" />
          <span className="text-sm font-semibold text-stone-700">India Startup Communities</span>
          {data && <span className="badge-peach">{data.total} communities</span>}
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">India Startup Community Directory</h1>
            <p className="text-stone-400 text-sm">22 communities — iSPIRT, SaaSBOOMi, TiE, NASSCOM, accelerators, and more. With join instructions.</p>
          </div>

          {/* Search & Filters */}
          <div className="glass rounded-2xl p-4 mb-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search iSPIRT, SaaS, FinTech, Bengaluru..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-peach-50/40 border border-peach-100/60 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-peach-300"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilterType("")}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${!filterType ? "btn-coral" : "btn-ghost-peach"}`}>All Types</button>
              {types.map((t) => (
                <button key={t} onClick={() => setFilterType(t === filterType ? "" : t)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${filterType === t ? "btn-coral" : "btn-ghost-peach"}`}>
                  {TYPE_EMOJIS[t] || ""} {t}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <label className="flex items-center gap-2 cursor-pointer mr-2">
                <div
                  onClick={() => setFilterFree((p) => !p)}
                  className={`w-10 h-5 rounded-full transition-all relative ${filterFree ? "bg-peach-400" : "bg-stone-200"}`}>
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all" style={{ left: filterFree ? "1.375rem" : "0.125rem" }} />
                </div>
                <span className="text-xs text-stone-600 font-medium">Free communities only</span>
              </label>
              {cities.slice(0, 6).map((city) => (
                <button key={city} onClick={() => setFilterCity(city === filterCity ? "" : city)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${filterCity === city ? "btn-coral" : "btn-ghost-peach"}`}>
                  📍 {city}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-peach-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-stone-400">Loading communities...</p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 rounded-2xl p-6 text-center">
              <p className="text-sm text-red-600 font-medium">Could not load data. Ensure the backend is running at {API}.</p>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {/* Pinned featured */}
              {pinned.length > 0 && !search && !filterType && !filterCity && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="w-4 h-4 text-peach-500" />
                    <h2 className="text-sm font-bold text-stone-700">Must-Join India Communities</h2>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {pinned.map((c) => (
                      <div key={c.id} className="glass rounded-2xl p-5 shadow-sm border border-peach-200/40 card-hover">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{c.logo_emoji}</span>
                          <div className="flex flex-col gap-1 items-end">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ACTIVITY_COLORS[c.activity_level] ?? "bg-stone-100 text-stone-500"}`}>{c.activity_level} Activity</span>
                            {c.is_free && <span className="text-[10px] badge-green">Free</span>}
                          </div>
                        </div>
                        <h3 className="font-bold text-stone-900 text-sm mb-0.5">{c.name}</h3>
                        <p className="text-[10px] text-stone-400 mb-2">{c.type} · {c.member_count} members</p>
                        <p className="text-[11px] text-stone-500 leading-relaxed mb-3 line-clamp-2">{c.value_for_founders}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {c.focus_areas.slice(0, 3).map((area) => (
                            <span key={area} className="text-[10px] badge-peach">{area}</span>
                          ))}
                        </div>
                        <a href={c.join_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs btn-coral px-4 py-2 rounded-xl w-full justify-center font-semibold">
                          Join Community <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All communities */}
              <div className="space-y-3">
                {(search || filterType || filterCity || filterFree ? communities : rest).map((community) => {
                  const isExpanded = expandedId === community.id;
                  return (
                    <div key={community.id} className="glass rounded-2xl shadow-sm overflow-hidden card-hover">
                      <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : community.id)}>
                        <div className="flex items-start gap-4">
                          <span className="text-2xl shrink-0">{community.logo_emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <h3 className="font-bold text-stone-900 text-sm">{community.name}</h3>
                                  {community.is_free && <span className="text-[10px] badge-green">Free</span>}
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ACTIVITY_COLORS[community.activity_level] ?? "bg-stone-100 text-stone-500"}`}>{community.activity_level}</span>
                                </div>
                                <p className="text-[11px] text-stone-400 mb-1">{community.type} · est. {community.founded}</p>
                                <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">{community.description}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="flex items-center gap-1 text-xs text-stone-500">
                                  <Users className="w-3 h-3" />
                                  <span>{community.member_count}</span>
                                </div>
                                <p className="text-[10px] text-stone-400 mt-1">{community.geography}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {community.focus_areas.slice(0, 4).map((area) => (
                                <span key={area} className="text-[10px] badge-peach">{area}</span>
                              ))}
                              {community.cities.slice(0, 2).map((city) => (
                                <span key={city} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">📍 {city}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-peach-100/40 px-5 pb-5 pt-4 space-y-4">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="bg-peach-50/60 rounded-xl p-3 border border-peach-100/40">
                              <p className="text-[10px] font-bold text-peach-700 uppercase mb-2">Value for Founders</p>
                              <p className="text-xs text-stone-700 leading-relaxed">{community.value_for_founders}</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                              <p className="text-[10px] font-bold text-green-700 uppercase mb-2">How to Join</p>
                              <p className="text-xs text-stone-700 leading-relaxed">{community.how_to_join}</p>
                              {!community.is_free && <p className="text-[10px] text-amber-700 mt-1 font-medium">Cost: {community.cost}</p>}
                            </div>
                          </div>

                          {community.key_programs.length > 0 && (
                            <div className="bg-stone-50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Key Programs</p>
                              <div className="flex flex-wrap gap-1.5">
                                {community.key_programs.map((prog) => (
                                  <span key={prog} className="text-[11px] bg-peach-50 text-peach-700 px-2.5 py-1 rounded-full border border-peach-100">{prog}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {community.annual_events.length > 0 && (
                            <div className="bg-stone-50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Annual Events</p>
                              <div className="flex flex-wrap gap-1.5">
                                {community.annual_events.map((evt) => (
                                  <span key={evt} className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{evt}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {community.notable_alumni.length > 0 && (
                            <div className="bg-amber-50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-amber-700 uppercase mb-2">Notable Alumni / Members</p>
                              <div className="flex flex-wrap gap-1.5">
                                {community.notable_alumni.map((a) => (
                                  <span key={a} className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{a}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <a href={community.join_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs btn-coral px-5 py-2.5 rounded-xl font-bold w-fit">
                            Join / Learn More <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {communities.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center">
                  <p className="text-stone-400 text-sm">No communities match your filters. Try removing some filters.</p>
                </div>
              )}
            </>
          )}

          <div className="mt-8 glass rounded-2xl p-5 text-center">
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Community data collected from official websites, founder surveys, and community leads. Member counts are approximate and may include social media followers. Some communities have selective admission — joining requires application review or existing member referral.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
