"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2, MessageCircle, Plus, X, Clock } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const CATEGORIES = ["General", "Fundraising", "GTM", "Product", "Legal & Compliance", "Mental Health"];

const CATEGORY_COLORS: Record<string, string> = {
  "General": "bg-peach-100/60 text-stone-600",
  "Fundraising": "bg-green-100 text-green-700",
  "GTM": "bg-peach-50/60 text-stone-700",
  "Product": "bg-peach-100/60 text-stone-700",
  "Legal & Compliance": "bg-orange-100 text-orange-700",
  "Mental Health": "bg-peach-100/60 text-peach-700",
};

interface ForumPost {
  id: string;
  title: string;
  category: string;
  author_id: number;
  author_display?: string;
  reply_count: number;
  created_at: string;
  body?: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function anonymizeId(id: number): string {
  // Consistent but pseudonymous display
  const h = ((id * 2654435761) >>> 0) % 9999;
  return `Founder #${String(h).padStart(4, "0")}`;
}

export default function ForumPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: ["forum-posts", activeCategory],
    queryFn: () =>
      api.get("/api/forum/posts", { params: { category: activeCategory || undefined, limit: 50 } }).then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const posts: ForumPost[] = data?.posts || data || [];

  async function createPost() {
    if (!newTitle.trim() || !newBody.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/api/forum/posts", { title: newTitle.trim(), body: newBody.trim(), category: newCategory });
      toast.success("Post created!");
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setShowModal(false);
      setNewTitle("");
      setNewBody("");
      setNewCategory("General");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated()) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 mb-1">Founder Forum</h1>
              <p className="text-stone-500 text-sm">Anonymous discussions for Indian startup founders.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 btn-coral px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === "" ? "btn-coral" : "bg-white border border-peach-200/60 text-stone-600 hover:bg-peach-50/60"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "btn-coral"
                    : "bg-white border border-peach-200/60 text-stone-600 hover:bg-peach-50/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts list */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-peach-500" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No posts yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/${post.id}`}
                  className="block glass rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category] || "bg-peach-100/60 text-stone-600"}`}>
                          {post.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-stone-900 group-hover:text-peach-700 transition-colors truncate">{post.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                        <span>{post.author_display || anonymizeId(post.author_id)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(post.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 text-xs text-stone-400">
                      <MessageCircle className="w-4 h-4" />
                      {post.reply_count || 0}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New post modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-stone-900">New Post</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-peach-200/60 rounded-lg text-sm bg-white/60 focus:outline-none focus:outline-none focus:border-peach-400"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What's your question or topic?"
                  className="w-full px-3 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Body</label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Share your thoughts, questions, or experience..."
                  rows={5}
                  className="w-full px-3 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400 resize-none"
                />
              </div>

              <p className="text-xs text-stone-400">Your post will appear anonymously as a random Founder ID.</p>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-peach-200/60 rounded-lg text-sm font-medium text-stone-600 hover:bg-peach-50/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createPost}
                  disabled={submitting || !newTitle.trim() || !newBody.trim()}
                  className="flex-1 btn-coral py-2.5 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
