"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Zap, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"founder" | "admin">("founder");
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "admin") {
        const { data } = await axios.post(`${API_BASE}/api/admin/login`, {
          username: form.username,
          password: form.password,
        });
        localStorage.setItem("admin_token", data.access_token);
        localStorage.setItem("user_role", "admin");
        toast.success(`Welcome Admin ${data.username}!`);
        router.push("/admin/dashboard");
      } else {
        const { data } = await axios.post(`${API_BASE}/api/auth/login`, {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_role", "founder");
        toast.success(`Welcome back, ${data.user.name}!`);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-peach-500 to-saffron-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-900 text-lg">OpenFounder OS</span>
          </Link>
          <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
          <p className="text-stone-500 mt-1 text-sm">
            {mode === "admin" ? "Admin Portal" : "Sign in to your founder dashboard"}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-stone-100 rounded-lg p-1">
          <button
            onClick={() => {
              setMode("founder");
              setForm({ email: "", password: "", username: "" });
            }}
            className={`flex-1 py-2 rounded font-medium transition-colors ${
              mode === "founder"
                ? "bg-white text-peach-600 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Founder
          </button>
          <button
            onClick={() => {
              setMode("admin");
              setForm({ email: "", password: "", username: "" });
            }}
            className={`flex-1 py-2 rounded font-medium transition-colors ${
              mode === "admin"
                ? "bg-white text-peach-600 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Admin
          </button>
        </div>

        <div className="glass rounded-2xl border border-peach-200/60 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "admin" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:border-peach-400 focus:border-transparent"
                    placeholder="admin"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:border-peach-400 focus:border-transparent"
                    placeholder="you@startup.com"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:border-peach-400 focus:border-transparent pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-coral py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : mode === "admin" ? "Admin Login" : "Sign in"}
            </button>
          </form>
          {mode === "founder" && (
            <p className="text-center text-sm text-stone-500 mt-6">
              No account?{" "}
              <Link href="/register" className="text-peach-600 font-medium hover:underline">
                Create one free
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
