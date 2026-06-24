"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || undefined;

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <h1 className="font-bold text-gray-900">AI Cofounder</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Mentor · Schemes · Researcher · Pitch Coach — all in one conversation
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface initialQuestion={q} />
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
