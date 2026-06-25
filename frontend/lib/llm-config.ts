export interface LLMConfig {
  provider: string;
  api_key: string;
  model: string;
}

const KEY = "llm_config";

export function getLLMConfig(): LLMConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LLMConfig) : null;
  } catch {
    return null;
  }
}

export function saveLLMConfig(config: LLMConfig): void {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function clearLLMConfig(): void {
  localStorage.removeItem(KEY);
}

export function hasLLMConfig(): boolean {
  const c = getLLMConfig();
  return Boolean(c?.provider && c?.api_key);
}
