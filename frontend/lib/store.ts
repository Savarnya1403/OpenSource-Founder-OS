import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface IntelFeedItem {
  id: string;
  source: "hackernews" | "reddit" | "news";
  title: string;
  url: string;
  score?: number;
  comments?: number;
  timestamp: string;
  pain_points?: string[];
  sentiment?: "positive" | "neutral" | "negative";
  sector?: string;
}

export interface InvestorPipelineItem {
  id: string;
  name: string;
  firm: string;
  stage: string;
  status: "researching" | "reached_out" | "intro_requested" | "meeting_scheduled" | "term_sheet" | "passed";
  notes?: string;
  contact_email?: string;
  warm_intro?: string;
  last_updated: string;
}

export interface TractionMetric {
  month: string;
  mrr: number;
  dau: number;
  cac: number;
  ltv: number;
  churn_rate: number;
  nps?: number;
}

export interface DataCache {
  hn_feed?: { data: IntelFeedItem[]; fetched_at: number };
  reddit_feed?: { data: IntelFeedItem[]; fetched_at: number };
  news_feed?: { data: IntelFeedItem[]; fetched_at: number };
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface AppStore {
  // Intel feed
  intelFeed: IntelFeedItem[];
  setIntelFeed: (items: IntelFeedItem[]) => void;
  cache: DataCache;
  setCache: (key: keyof DataCache, value: DataCache[keyof DataCache]) => void;
  isCacheStale: (key: keyof DataCache, ttlMs?: number) => boolean;

  // Investor pipeline (local CRM)
  pipeline: InvestorPipelineItem[];
  addPipelineItem: (item: Omit<InvestorPipelineItem, "id" | "last_updated">) => void;
  updatePipelineItem: (id: string, updates: Partial<InvestorPipelineItem>) => void;
  removePipelineItem: (id: string) => void;
  movePipelineItem: (id: string, status: InvestorPipelineItem["status"]) => void;

  // Traction metrics
  tractionMetrics: TractionMetric[];
  addTractionMetric: (metric: TractionMetric) => void;

  // UI state
  commandBarOpen: boolean;
  setCommandBarOpen: (open: boolean) => void;

  // Spam checker history
  spamChecks: Array<{ id: string; subject: string; score: number; checked_at: string }>;
  addSpamCheck: (check: { subject: string; score: number }) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Intel feed
      intelFeed: [],
      setIntelFeed: (items) => set({ intelFeed: items }),
      cache: {},
      setCache: (key, value) => set((s) => ({ cache: { ...s.cache, [key]: value } })),
      isCacheStale: (key, ttlMs = 5 * 60 * 1000) => {
        const entry = get().cache[key];
        if (!entry) return true;
        return Date.now() - (entry as { fetched_at: number }).fetched_at > ttlMs;
      },

      // Investor pipeline
      pipeline: [],
      addPipelineItem: (item) =>
        set((s) => ({
          pipeline: [
            ...s.pipeline,
            { ...item, id: crypto.randomUUID(), last_updated: new Date().toISOString() },
          ],
        })),
      updatePipelineItem: (id, updates) =>
        set((s) => ({
          pipeline: s.pipeline.map((p) =>
            p.id === id ? { ...p, ...updates, last_updated: new Date().toISOString() } : p
          ),
        })),
      removePipelineItem: (id) =>
        set((s) => ({ pipeline: s.pipeline.filter((p) => p.id !== id) })),
      movePipelineItem: (id, status) =>
        set((s) => ({
          pipeline: s.pipeline.map((p) =>
            p.id === id ? { ...p, status, last_updated: new Date().toISOString() } : p
          ),
        })),

      // Traction
      tractionMetrics: [],
      addTractionMetric: (metric) =>
        set((s) => {
          const existing = s.tractionMetrics.findIndex((m) => m.month === metric.month);
          if (existing >= 0) {
            const updated = [...s.tractionMetrics];
            updated[existing] = metric;
            return { tractionMetrics: updated };
          }
          return { tractionMetrics: [...s.tractionMetrics, metric].slice(-24) };
        }),

      // UI
      commandBarOpen: false,
      setCommandBarOpen: (open) => set({ commandBarOpen: open }),

      // Spam checks
      spamChecks: [],
      addSpamCheck: (check) =>
        set((s) => ({
          spamChecks: [
            { ...check, id: crypto.randomUUID(), checked_at: new Date().toISOString() },
            ...s.spamChecks,
          ].slice(0, 20),
        })),
    }),
    {
      name: "openfounder-os-store",
      partialize: (s) => ({
        pipeline: s.pipeline,
        tractionMetrics: s.tractionMetrics,
        spamChecks: s.spamChecks,
      }),
    }
  )
);
