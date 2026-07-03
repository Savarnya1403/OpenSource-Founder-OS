"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { api } from "@/lib/api";
import {
  Activity, ExternalLink, Clock, ThumbsUp, MessageSquare, RefreshCw,
  Flame, TrendingUp, AlertCircle, Filter, Zap, Search,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedItem {
  id: string;
  source: "hackernews" | "reddit" | "news";
  title: string;
  url: string;
  score?: number;
  comments?: number;
  timestamp: string;
  pain_points?: string[];
  sentiment?: "positive" | "neutral" | "negative";
  subreddit?: string;
  author?: string;
}

interface FeedResponse {
  items: FeedItem[];
  cached: boolean;
  fetched_at: string;
  pain_points_summary: string[];
}

const SOURCE_CONFIG = {
  hackernews: { label: "Hacker News", color: "text-peach-700 bg-peach-50/60 border-peach-200", dot: "bg-peach-400" },
  reddit:     { label: "Reddit",      color: "text-coral-700 bg-coral-50/60 border-coral-200", dot: "bg-coral-400" },
  news:       { label: "News",        color: "text-stone-700 bg-stone-50 border-stone-200",     dot: "bg-stone-400" },
};

const SENTIMENT_CONFIG = {
  positive: { label: "Positive", color: "text-green-700 bg-green-50", icon: "✨" },
  neutral:  { label: "Neutral",  color: "text-stone-600 bg-stone-50",  icon: "〰" },
  negative: { label: "Pain Point", color: "text-red-700 bg-red-50",   icon: "⚡" },
};

const TOPICS = [
  "SaaS", "FinTech", "EdTech", "HealthTech", "AgriTech", "AI/ML",
  "D2C", "B2B", "DeepTech", "Climate", "Logistics", "Gaming",
];

function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16" />
        <div className="skeleton h-5 w-20" />
      </div>
    </div>
  );
}

export default function IntelPage() {
  const [topic, setTopic]         = useState("SaaS");
  const [source, setSource]       = useState<"all" | "hackernews" | "reddit" | "news">("all");
  const [sentiment, setSentiment] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const [search, setSearch]       = useState("");

  const { data, isLoading, error, refetch, dataUpdatedAt, isFetching } = useQuery<FeedResponse>({
    queryKey: ["intel-feed", topic],
    queryFn: () =>
      api.get("/api/intel/feed", { params: { topic, limit: 50 } }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const items = data?.items ?? [];
  const painPoints = data?.pain_points_summary ?? [];
  const isStale = dataUpdatedAt ? Date.now() - dataUpdatedAt > 5 * 60 * 1000 : false;

  const filtered = items.filter((item) => {
    if (source !== "all" && item.source !== source) return false;
    if (sentiment !== "all" && item.sentiment !== sentiment) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-strong border-b border-peach-200/30 px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-peach-500" />
              <span className="text-sm font-semibold text-stone-700">Live Market Intelligence Feed</span>
              <div className="flex items-center gap-1.5 ml-2">
                {isFetching ? (
                  <RefreshCw className="w-3.5 h-3.5 text-peach-400 animate-spin" />
                ) : isStale ? (
                  <><span className="stale-dot" /><span className="text-[10px] text-amber-600 font-semibold">STALE</span></>
                ) : (
                  <><span className="live-dot" /><span className="text-[10px] text-green-600 font-semibold">LIVE</span></>
                )}
              </div>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn-ghost-peach text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Market Intelligence Feed</h1>
            <p className="text-stone-400 text-sm leading-relaxed">
              Real-time pain points, discussions, and signals from Hacker News, Reddit, and startup news —
              filtered for your sector. Use this to find product ideas, sharpen sales copy, and understand customers.
            </p>
          </div>

          {/* Topic selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  topic === t ? "btn-coral shadow-peach" : "btn-ghost-peach"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Pain points summary */}
          {painPoints.length > 0 && (
            <div className="glass rounded-2xl p-5 mb-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-peach-500" />
                <h3 className="font-semibold text-stone-900 text-sm">Top Pain Points in {topic} — Right Now</h3>
                <span className="badge-peach">AI Extracted</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {painPoints.map((p) => (
                  <span key={p} className="flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {p}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-stone-400 mt-3">
                Use these in your landing page, cold emails, and pitch deck to show you understand the market.
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filters */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass rounded-2xl p-4">
                <p className="section-label mb-3">Filters</p>

                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search discussions..."
                    className="w-full bg-white/60 border border-peach-200/60 rounded-lg pl-8 pr-3 py-2 text-xs text-stone-700 placeholder-stone-300 focus:outline-none focus:border-peach-400"
                  />
                </div>

                <p className="text-[10px] text-stone-400 font-semibold uppercase mb-2">Source</p>
                <div className="space-y-1 mb-4">
                  {(["all", "hackernews", "reddit", "news"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSource(s)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                        source === s ? "bg-peach-100 text-peach-800 font-semibold" : "text-stone-500 hover:bg-peach-50"
                      }`}
                    >
                      {s === "all" ? "All Sources" : SOURCE_CONFIG[s].label}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-stone-400 font-semibold uppercase mb-2">Signal Type</p>
                <div className="space-y-1">
                  {(["all", "positive", "neutral", "negative"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSentiment(s)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                        sentiment === s ? "bg-peach-100 text-peach-800 font-semibold" : "text-stone-500 hover:bg-peach-50"
                      }`}
                    >
                      {s === "all" ? "All Signals" : SENTIMENT_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              {data && (
                <div className="glass rounded-2xl p-4 space-y-3">
                  <p className="section-label">Feed Stats</p>
                  <div className="space-y-2">
                    {[
                      { label: "HN Posts", count: items.filter((i) => i.source === "hackernews").length, color: "text-orange-600" },
                      { label: "Reddit Posts", count: items.filter((i) => i.source === "reddit").length, color: "text-red-600" },
                      { label: "News Articles", count: items.filter((i) => i.source === "news").length, color: "text-peach-600" },
                      { label: "Pain Points", count: items.filter((i) => i.sentiment === "negative").length, color: "text-peach-600" },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="text-stone-400">{label}</span>
                        <span className={`font-bold ${color}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                  {data.fetched_at && (
                    <p className="text-[10px] text-stone-300">
                      Updated {formatDistanceToNow(new Date(data.fetched_at))} ago
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Feed */}
            <div className="lg:col-span-3 space-y-3">
              {error && (
                <div className="glass rounded-2xl p-6 text-center border-red-200/40 bg-red-50/30">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600 font-medium">Could not load live feed</p>
                  <p className="text-xs text-stone-400 mt-1">The scraper may be rate-limited. Showing stale data if available.</p>
                  <button onClick={() => refetch()} className="mt-3 btn-ghost-peach text-xs px-4 py-2 rounded-lg">
                    Try again
                  </button>
                </div>
              )}

              {isLoading && !data && (
                <>
                  {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                </>
              )}

              {filtered.length === 0 && !isLoading && (
                <div className="glass rounded-2xl p-8 text-center">
                  <Filter className="w-8 h-8 text-peach-200 mx-auto mb-2" />
                  <p className="text-sm text-stone-400">No posts match your current filters.</p>
                </div>
              )}

              {filtered.map((item) => {
                const srcCfg = SOURCE_CONFIG[item.source];
                const sentCfg = item.sentiment ? SENTIMENT_CONFIG[item.sentiment] : null;
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-xl p-4 card-hover flex gap-3 group block"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`badge text-[10px] font-semibold px-2 py-0.5 rounded-full border ${srcCfg.color} shrink-0`}>
                          {srcCfg.label}
                        </span>
                        {item.subreddit && (
                          <span className="text-[10px] text-stone-400">r/{item.subreddit}</span>
                        )}
                        {sentCfg && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sentCfg.color} shrink-0`}>
                            {sentCfg.icon} {sentCfg.label}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-medium text-stone-800 leading-snug mb-2 group-hover:text-peach-700 transition-colors">
                        {item.title}
                      </h3>

                      {item.pain_points && item.pain_points.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {item.pain_points.slice(0, 3).map((p) => (
                            <span key={p} className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-stone-300">
                        {item.score !== undefined && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {item.score}
                          </span>
                        )}
                        {item.comments !== undefined && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {item.comments}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(item.timestamp))} ago
                        </span>
                        {item.author && <span>by {item.author}</span>}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-stone-300 group-hover:text-peach-400 transition-colors shrink-0 mt-1" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
