"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { getUser, isAuthenticated, saveAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Save, User } from "lucide-react";
import { STAGES, SECTORS } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(getUser());
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    startup_name: user?.startup_name || "",
    startup_stage: user?.startup_stage || "",
    sector: user?.sector || "",
    city: user?.city || "",
  });

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile(form);
      const token = localStorage.getItem("token") || "";
      saveAuth(token, data);
      setUser(data);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Founder Profile</h1>
          <p className="text-stone-500 text-sm mb-8">
            Your profile helps the AI cofounder give more personalised advice and scheme matches.
          </p>

          <div className="glass rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-peach-200/40">
              <div className="w-14 h-14 bg-gradient-to-br from-peach-400 to-saffron-400 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">{user.name[0].toUpperCase()}</span>
              </div>
              <div>
                <div className="font-bold text-stone-900">{user.name}</div>
                <div className="text-sm text-stone-400">{user.email}</div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Full name</label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                />
              </div>

              <div className="border-t border-peach-200/40 pt-5">
                <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold mb-4">Startup details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Startup name</label>
                    <input
                      value={form.startup_name}
                      onChange={(e) => set("startup_name", e.target.value)}
                      placeholder="Acme Technologies"
                      className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Stage</label>
                    <select
                      value={form.startup_stage}
                      onChange={(e) => set("startup_stage", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400 bg-white/80"
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
                      className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400 bg-white/80"
                    >
                      <option value="">Select sector</option>
                      {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">City</label>
                    <input
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="Bengaluru, Mumbai, Hyderabad..."
                      className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 btn-coral px-5 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
