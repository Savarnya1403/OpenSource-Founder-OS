"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Search,
  Users,
  Zap,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { api } from "@/lib/api";

const CATEGORIES = ["All", "Conference", "Summit", "Accelerator", "Demo Day", "Competition", "Hackathon", "Grant"];
const MODES = ["All", "In-person", "Online", "Hybrid"];

const CATEGORY_COLORS: Record<string, string> = {
  Conference: "bg-blue-100 text-blue-700",
  Summit: "bg-purple-100 text-purple-700",
  Accelerator: "bg-green-100 text-green-700",
  "Demo Day": "bg-amber-100 text-amber-700",
  Competition: "bg-rose-100 text-rose-700",
  Hackathon: "bg-orange-100 text-orange-700",
  Grant: "bg-teal-100 text-teal-700",
};

interface Event {
  id: string;
  name: string;
  organizer: string;
  organizer_type: string;
  category: string;
  description: string;
  location: string;
  city: string;
  state: string;
  mode: string;
  event_date: string;
  registration_deadline: string;
  registration_url: string;
  website: string;
  tags: string[];
  audience: string[];
  free: boolean;
  ticket_range: string;
  highlights: string[];
}

export default function EventsPage() {
  const isAuthed = isAuthenticated();
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("All");
  const [search, setSearch] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["events", category, mode, search, freeOnly],
    queryFn: async () => {
      const params: Record<string, string | boolean> = {};
      if (category !== "All") params.category = category;
      if (mode !== "All") params.mode = mode;
      if (search) params.search = search;
      if (freeOnly) params.free_only = true;
      const res = await api.get("/api/events", { params });
      return res.data;
    },
  });

  const content = (
    <main className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Startup Events & Deadlines</h1>
          <p className="text-gray-500 text-sm">
            Conferences, accelerator applications, pitch competitions, and grants — with registration deadlines.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events, organizers, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    category === c
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 ml-auto items-center">
              {MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    mode === m
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {m}
                </button>
              ))}
              <label className="flex items-center gap-1.5 cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={freeOnly}
                  onChange={(e) => setFreeOnly(e.target.checked)}
                  className="rounded border-gray-300 text-brand-600"
                />
                <span className="text-xs text-gray-600">Free only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-40" />
            ))}
          </div>
        )}

        {/* Events list */}
        {!isLoading && (
          <>
            <p className="text-xs text-gray-400 mb-4">{events.length} events found</p>
            <div className="space-y-4">
              {events.map((event) => {
                const catColor = CATEGORY_COLORS[event.category] || "bg-gray-100 text-gray-700";
                const isRolling = event.registration_deadline === "Rolling";
                return (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Left */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${catColor}`}>
                            {event.category}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            event.free ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"
                          }`}>
                            {event.free ? "Free" : event.ticket_range}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                              event.mode.includes("Online") ? "bg-blue-400" :
                              event.mode.includes("Hybrid") ? "bg-amber-400" : "bg-green-400"
                            }`} />
                            {event.mode}
                          </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1">{event.name}</h3>
                        <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {event.organizer}
                        </p>
                        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </p>

                        <p className="text-xs text-gray-500 leading-relaxed mb-3">{event.description}</p>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {event.highlights.map((h) => (
                            <span key={h} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100">
                              {h}
                            </span>
                          ))}
                        </div>

                        {/* Audience */}
                        <div className="flex flex-wrap gap-1">
                          {event.audience.map((a) => (
                            <span key={a} className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right — Dates & CTA */}
                      <div className="sm:w-52 shrink-0 flex flex-col gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] text-gray-400">Event Date</p>
                              <p className="text-xs font-medium text-gray-700">{event.event_date}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isRolling ? "text-green-500" : "text-rose-400"}`} />
                            <div>
                              <p className="text-[10px] text-gray-400">Deadline</p>
                              <p className={`text-xs font-medium ${isRolling ? "text-green-600" : "text-rose-600"}`}>
                                {event.registration_deadline}
                              </p>
                            </div>
                          </div>
                        </div>

                        <a
                          href={event.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-medium hover:bg-brand-700 transition-colors"
                        >
                          Register <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={event.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                        >
                          Visit website <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {events.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No events found. Try adjusting your filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );

  if (isAuthed) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-saffron-500 rounded-md flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">OpenFounder OS</span>
        </Link>
        <Link href="/login" className="text-sm font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </nav>
      {content}
    </div>
  );
}
