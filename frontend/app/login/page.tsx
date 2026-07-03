"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi, LoginPayload } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginPayload>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      saveAuth(data.access_token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
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
          <p className="text-stone-500 mt-1 text-sm">Sign in to your founder dashboard</p>
        </div>

        <div className="glass rounded-2xl border border-peach-200/60 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400 focus:border-transparent"
                placeholder="you@startup.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400 focus:border-transparent pr-10"
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-center text-sm text-stone-500 mt-6">
            No account?{" "}
            <Link href="/register" className="text-peach-600 font-medium hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
