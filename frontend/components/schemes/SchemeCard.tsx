"use client";
import Link from "next/link";
import { ExternalLink, CheckCircle, Tag, Star } from "lucide-react";
import { Scheme } from "@/lib/api";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  grant: "bg-green-100 text-green-700",
  loan: "bg-blue-100 text-blue-700",
  "soft loan": "bg-cyan-100 text-cyan-700",
  equity: "bg-purple-100 text-purple-700",
  "credit guarantee": "bg-amber-100 text-amber-700",
  recognition: "bg-pink-100 text-pink-700",
  incubation: "bg-violet-100 text-violet-700",
  "incubation + equity": "bg-violet-100 text-violet-700",
  "incubation + acceleration": "bg-violet-100 text-violet-700",
  support: "bg-gray-100 text-stone-700",
  "accelerator + grant": "bg-orange-100 text-orange-700",
  "loan + equity": "bg-indigo-100 text-indigo-700",
};

interface Props {
  scheme: Scheme;
  compact?: boolean;
}

export function SchemeCard({ scheme, compact }: Props) {
  const typeColor = TYPE_COLORS[scheme.type.toLowerCase()] || "bg-gray-100 text-stone-700";

  return (
    <div className="glass rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-900 text-sm leading-snug mb-1 line-clamp-2">
            {scheme.name}
          </h3>
          <p className="text-xs text-stone-400">{scheme.ministry}</p>
        </div>
        {scheme.relevance_score !== undefined && scheme.relevance_score > 0 && (
          <div className="shrink-0 flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3" />
            {Math.round(scheme.relevance_score * 100)}%
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", typeColor)}>
          {scheme.type}
        </span>
        {scheme.funding_amount && (
          <span className="text-xs font-medium bg-peach-50/60 text-peach-700 px-2 py-0.5 rounded-full">
            {scheme.funding_amount}
          </span>
        )}
        {scheme.eligibility?.requires_dpiit && (
          <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
            DPIIT required
          </span>
        )}
      </div>

      {!compact && (
        <p className="text-xs text-stone-500 leading-relaxed mb-4 line-clamp-3">
          {scheme.description}
        </p>
      )}

      {/* Benefits */}
      {!compact && scheme.benefits.length > 0 && (
        <div className="space-y-1 mb-4 flex-1">
          {scheme.benefits.slice(0, 3).map((b, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
              <span className="text-xs text-stone-600 leading-snug">{b}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {scheme.tags.slice(0, 4).map((t) => (
          <span key={t} className="inline-flex items-center gap-0.5 text-xs text-stone-400 bg-gray-50 px-1.5 py-0.5 rounded">
            <Tag className="w-2.5 h-2.5" />
            {t}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
        <div className="text-xs text-stone-400">
          {scheme.stages.slice(0, 2).join(", ")}
        </div>
        {scheme.application_url && (
          <a
            href={scheme.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-peach-600 hover:text-peach-700"
          >
            Apply <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
