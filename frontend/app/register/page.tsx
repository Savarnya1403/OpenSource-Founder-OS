"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi, RegisterPayload } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { Zap } from "lucide-react";
import { STAGES, SECTORS } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterPayload>({
    email: "",
    name: "",
    password: "",
    startup_name: "",
    startup_stage: "",
    sector: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);

  function set(key: keyof RegisterPayload, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      saveAuth(data.access_token, data.user);
      toast.success(`Welcome, ${data.user.name}! Let's build.`);
      router.push("/chat");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-peach-500 to-saffron-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-900 text-lg">OpenFounder OS</span>
          </Link>
          <h1 className="text-2xl font-bold text-stone-900">Create your account</h1>
          <p className="text-stone-500 mt-1 text-sm">Free forever · No credit card needed</p>
        </div>

        <div className="glass rounded-2xl border border-peach-200/60 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Full name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                  placeholder="Priya Sharma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                  placeholder="priya@startup.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password *</label>
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                placeholder="Min. 8 characters"
              />
            </div>

            <div className="border-t border-peach-200/40 pt-5">
              <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold mb-4">
                Tell us about your startup (optional)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Startup name</label>
                  <input
                    value={form.startup_name}
                    onChange={(e) => set("startup_name", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                    placeholder="Acme AI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">City</label>
                  <input
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                    placeholder="Bengaluru"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Stage</label>
                  <select
                    value={form.startup_stage}
                    onChange={(e) => set("startup_stage", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400 bg-white"
                  >
                    <option value="">Select stage</option>
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Sector</label>
                  <select
                    value={form.sector}
                    onChange={(e) => set("sector", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400 bg-white"
                  >
                    <option value="">Select sector</option>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-coral py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>
          <p className="text-center text-sm text-stone-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-peach-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
