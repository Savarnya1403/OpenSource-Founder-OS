"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, Brain, Building2, Search, TrendingUp, Sparkles, KeyRound } from "lucide-react";
import { cn, AGENT_META } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import { getLLMConfig } from "@/lib/llm-config";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  agent?: string;
}

const AGENT_ICONS: Record<string, React.ElementType> = {
  mentor: Brain,
  schemes: Building2,
  researcher: Search,
  pitch: TrendingUp,
};

interface Props {
  initialQuestion?: string;
}

export function ChatInterface({ initialQuestion }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string>("mentor");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [llmReady, setLlmReady] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const user = getUser();

  useEffect(() => {
    const config = getLLMConfig();
    setLlmReady(Boolean(config?.provider && config?.api_key));
  }, []);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamBuffer]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      const userMsg: Message = { role: "user", content: text };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setStreaming(true);
      setStreamBuffer("");

      const startup_context: Record<string, string> = {};
      if (user?.startup_name) startup_context.startup_name = user.startup_name;
      if (user?.startup_stage) startup_context.startup_stage = user.startup_stage;
      if (user?.sector) startup_context.sector = user.sector;
      if (user?.city) startup_context.city = user.city;

      try {
        const llmConfig = getLLMConfig();
        const resp = await fetch(
          `/api/chat/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({
              message: text,
              session_id: sessionId,
              startup_context,
              ...(llmConfig && {
                llm_provider: llmConfig.provider,
                llm_api_key: llmConfig.api_key,
                llm_model: llmConfig.model,
              }),
            }),
          }
        );

        if (!resp.ok) {
          const err = await resp.json();
          throw new Error(err.detail || "API error");
        }

        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accum = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "agent_switch") {
                setCurrentAgent(data.agent);
              } else if (data.type === "token") {
                accum += data.content;
                setStreamBuffer(accum);
              } else if (data.type === "done") {
                if (data.session_id) setSessionId(data.session_id);
                setMessages((m) => [
                  ...m,
                  { role: "assistant", content: accum, agent: currentAgent },
                ]);
                setStreamBuffer("");
              } else if (data.type === "error") {
                throw new Error(data.content);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `**Error:** ${msg}\n\nMake sure the backend is running and your ANTHROPIC_API_KEY is set in \`backend/.env\`.`,
            agent: "mentor",
          },
        ]);
        setStreamBuffer("");
      } finally {
        setStreaming(false);
      }
    },
    [streaming, sessionId, currentAgent, user]
  );

  // Send initial question from URL
  useEffect(() => {
    if (initialQuestion && messages.length === 0) {
      sendMessage(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const agentInfo = AGENT_META[currentAgent] || AGENT_META.mentor;
  const AgentIcon = AGENT_ICONS[currentAgent] || Brain;

  return (
    <div className="flex flex-col h-full">
      {/* Agent indicator */}
      <div className="px-4 py-2 border-b border-gray-100 bg-white">
        <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", agentInfo.color)}>
          <AgentIcon className="w-3 h-3" />
          {agentInfo.emoji} {agentInfo.label}
        </div>
      </div>

      {/* No-key warning */}
      {!llmReady && (
        <div className="mx-4 mt-3 flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-sm">
          <KeyRound className="w-4 h-4 shrink-0 text-amber-600" />
          <span>No AI key configured.</span>
          <Link href="/settings" className="ml-auto font-semibold text-amber-700 hover:underline whitespace-nowrap">
            Add key →
          </Link>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 space-y-6">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-saffron-500 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your AI Cofounder</h2>
            <p className="text-gray-400 text-sm max-w-sm">
              Ask me anything — startup strategy, government schemes, pitch coaching, or market research.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-saffron-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                {msg.agent ? (
                  <span className="text-sm">{AGENT_META[msg.agent]?.emoji || "🧠"}</span>
                ) : (
                  <Brain className="w-4 h-4 text-white" />
                )}
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-brand-600 text-white rounded-tr-sm"
                  : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
              )}
            >
              {msg.role === "assistant" ? (
                <div className="chat-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
              {msg.role === "assistant" && msg.agent && (
                <div className={cn("mt-2 pt-2 border-t border-gray-100 text-xs font-medium flex items-center gap-1", AGENT_META[msg.agent]?.color || "text-gray-400")}>
                  <span>{AGENT_META[msg.agent]?.emoji}</span>
                  {AGENT_META[msg.agent]?.label}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streaming && streamBuffer && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-saffron-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-sm">{agentInfo.emoji}</span>
            </div>
            <div className="max-w-[80%] bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="chat-prose text-sm text-gray-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamBuffer}</ReactMarkdown>
              </div>
              <span className="inline-block w-1.5 h-4 bg-brand-500 rounded-sm animate-pulse ml-0.5" />
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {streaming && !streamBuffer && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-saffron-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-sm">{agentInfo.emoji}</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex gap-3 items-end bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-brand-400 focus-within:bg-white transition-colors">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI cofounder anything..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none min-h-[24px] max-h-[120px] leading-relaxed"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="shrink-0 w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {streaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
