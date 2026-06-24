"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { isAuthenticated } from "@/lib/auth";
import { Loader2, ArrowLeft, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";

const CATEGORY_COLORS: Record<string, string> = {
  "General": "bg-gray-100 text-gray-600",
  "Fundraising": "bg-green-100 text-green-700",
  "GTM": "bg-blue-100 text-blue-700",
  "Product": "bg-violet-100 text-violet-700",
  "Legal & Compliance": "bg-orange-100 text-orange-700",
  "Mental Health": "bg-pink-100 text-pink-700",
};

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
  const h = ((id * 2654435761) >>> 0) % 9999;
  return `Founder #${String(h).padStart(4, "0")}`;
}

interface Reply {
  id: string;
  body: string;
  author_id: number;
  author_display?: string;
  created_at: string;
}

interface ForumPost {
  id: string;
  title: string;
  category: string;
  body: string;
  author_id: number;
  author_display?: string;
  replies: Reply[];
  reply_count: number;
  created_at: string;
}

export default function ForumPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { data: post, isLoading } = useQuery<ForumPost>({
    queryKey: ["forum-post", id],
    queryFn: () => api.get(`/api/forum/posts/${id}`).then((r) => r.data),
    enabled: !!id && isAuthenticated(),
  });

  async function submitReply() {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/api/forum/posts/${id}/replies`, { body: replyBody.trim() });
      toast.success("Reply posted!");
      queryClient.invalidateQueries({ queryKey: ["forum-post", id] });
      setReplyBody("");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated()) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/forum" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Forum
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
            </div>
          ) : !post ? (
            <div className="text-center py-20 text-gray-400">Post not found.</div>
          ) : (
            <div className="space-y-6">
              {/* Main post */}
              <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"}`}>
                    {post.category}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-4">{post.title}</h1>

                <div className="prose prose-sm max-w-none text-gray-700 mb-5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 border-t border-gray-50 pt-4">
                  <span>{post.author_display || anonymizeId(post.author_id)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(post.created_at)}
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <MessageCircle className="w-3 h-3" />
                    {post.reply_count || post.replies?.length || 0} replies
                  </span>
                </div>
              </div>

              {/* Replies */}
              {post.replies && post.replies.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-semibold text-gray-700 text-sm px-1">Replies</h2>
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <div className="prose prose-sm max-w-none text-gray-700 mb-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{reply.body}</ReactMarkdown>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{reply.author_display || anonymizeId(reply.author_id)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(reply.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply form */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-3">Add a reply</h2>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Share your thoughts or experience (Markdown supported)..."
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none mb-3"
                />
                <p className="text-xs text-gray-400 mb-3">Your reply will appear anonymously.</p>
                <button
                  onClick={submitReply}
                  disabled={submitting || !replyBody.trim()}
                  className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Post reply
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
