"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { isAuthenticated } from "@/lib/auth";
import { getLLMConfig, saveLLMConfig, clearLLMConfig, type LLMConfig } from "@/lib/llm-config";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Bot,
  Eye,
  EyeOff,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const PROVIDERS = [
  {
    id: "anthropic",
    label: "Anthropic",
    sublabel: "Claude (Sonnet, Haiku, Opus)",
    logo: "🟠",
    models: ["claude-sonnet-4-6", "claude-haiku-4-5-20251001", "claude-opus-4-8"],
    default_model: "claude-sonnet-4-6",
    docs_url: "https://console.anthropic.com/settings/keys",
    placeholder: "sk-ant-api03-...",
  },
  {
    id: "openai",
    label: "OpenAI",
    sublabel: "GPT-4o, GPT-4o mini, GPT-4 Turbo",
    logo: "⚫",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
    default_model: "gpt-4o",
    docs_url: "https://platform.openai.com/api-keys",
    placeholder: "sk-proj-...",
  },
  {
    id: "gemini",
    label: "Google Gemini",
    sublabel: "Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash",
    logo: "🔵",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    default_model: "gemini-2.0-flash",
    docs_url: "https://aistudio.google.com/app/apikey",
    placeholder: "AIza...",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    sublabel: "DeepSeek Chat, DeepSeek Reasoner",
    logo: "🐋",
    models: ["deepseek-chat", "deepseek-reasoner"],
    default_model: "deepseek-chat",
    docs_url: "https://platform.deepseek.com/api_keys",
    placeholder: "sk-...",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<LLMConfig | null>(null);
  const [provider, setProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    const existing = getLLMConfig();
    if (existing) {
      setSaved(existing);
      setProvider(existing.provider);
      setApiKey(existing.api_key);
      setModel(existing.model);
    }
  }, [router]);

  const currentProvider = PROVIDERS.find((p) => p.id === provider) ?? PROVIDERS[0];

  function handleProviderChange(pid: string) {
    setProvider(pid);
    const p = PROVIDERS.find((x) => x.id === pid)!;
    setModel(p.default_model);
    setApiKey("");
    setShowKey(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error("API key cannot be empty");
      return;
    }
    setSaving(true);
    const config: LLMConfig = {
      provider,
      api_key: apiKey.trim(),
      model: model || currentProvider.default_model,
    };
    saveLLMConfig(config);
    setSaved(config);
    setSaving(false);
    toast.success(`${currentProvider.label} key saved locally`);
  }

  function handleRemove() {
    clearLLMConfig();
    setSaved(null);
    setApiKey("");
    setModel("");
    toast.success("API key removed");
  }

  const isSavedProvider = saved?.provider === provider;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">AI Settings</h1>
          <p className="text-stone-500 text-sm mb-8">
            Bring your own API key to power the AI Cofounder. Keys are stored only in your browser
            and sent directly to the AI provider — they are never saved on our servers.
          </p>

          {/* Status banner */}
          {saved ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 mb-6 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>
                Active:{" "}
                <strong>
                  {PROVIDERS.find((p) => p.id === saved.provider)?.label ?? saved.provider}
                </strong>{" "}
                — {saved.model}
              </span>
              <button
                onClick={handleRemove}
                className="ml-auto flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              No API key configured. Add one below to start using AI features.
            </div>
          )}

          {/* Provider cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleProviderChange(p.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                  provider === p.id
                    ? "border-peach-500 bg-peach-50/60 ring-1 ring-peach-400"
                    : "border-peach-200/60 bg-white hover:border-peach-300/60"
                }`}
              >
                <span className="text-2xl leading-none mt-0.5">{p.logo}</span>
                <div>
                  <div className="font-semibold text-sm text-stone-900">{p.label}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{p.sublabel}</div>
                  {saved?.provider === p.id && (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Config form */}
          <div className="glass rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Bot className="w-5 h-5 text-peach-600" />
              <h2 className="font-semibold text-stone-900">
                Configure {currentProvider.label}
              </h2>
              <a
                href={currentProvider.docs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-xs text-peach-600 hover:underline"
              >
                Get API key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Model selector */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Model
                </label>
                <select
                  value={model || currentProvider.default_model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-peach-200/60 rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400 bg-white"
                >
                  {currentProvider.models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key input */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={currentProvider.placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full px-3.5 py-2.5 pr-10 border border-peach-200/60 rounded-lg text-sm font-mono focus:outline-none focus:outline-none focus:border-peach-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-stone-400">
                  Stored in your browser&apos;s localStorage only. Never sent to our servers.
                </p>
              </div>

              {isSavedProvider && saved && (
                <div className="bg-peach-50/50 rounded-lg px-3.5 py-2.5 text-xs text-stone-500">
                  Currently using:{" "}
                  <span className="font-mono text-stone-700">
                    {saved.api_key.slice(0, 8)}••••••••{saved.api_key.slice(-4)}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving || !apiKey.trim()}
                  className="flex items-center gap-2 btn-coral px-5 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save key"}
                </button>
                {saved && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove key
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Privacy note */}
          <div className="mt-6 p-4 bg-peach-50/60 border border-peach-200/40 rounded-xl text-xs text-stone-700 leading-relaxed">
            <strong>Privacy:</strong> Your API key is stored in your browser&apos;s localStorage and sent
            directly with each AI request over HTTPS. It is not stored in our database and is not
            accessible to other users. Clearing browser data will remove your key.
          </div>
        </div>
      </main>
    </div>
  );
}
