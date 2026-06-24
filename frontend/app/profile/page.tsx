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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Founder Profile</h1>
          <p className="text-gray-500 text-sm mb-8">
            Your profile helps the AI cofounder give more personalised advice and scheme matches.
          </p>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-saffron-400 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">{user.name[0].toUpperCase()}</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-4">Startup details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Startup name</label>
                    <input
                      value={form.startup_name}
                      onChange={(e) => set("startup_name", e.target.value)}
                      placeholder="Acme Technologies"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Stage</label>
                    <select
                      value={form.startup_stage}
                      onChange={(e) => set("startup_stage", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="">Select stage</option>
                      {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sector</label>
                    <select
                      value={form.sector}
                      onChange={(e) => set("sector", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="">Select sector</option>
                      {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="Bengaluru, Mumbai, Hyderabad..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
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
