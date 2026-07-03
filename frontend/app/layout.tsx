import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { CommandBar } from "@/components/ui/CommandBar";

export const metadata: Metadata = {
  title: "OpenFounder OS — AI Cofounder for Indian Startups",
  description:
    "Democratizing entrepreneurial intelligence. AI-powered startup guidance, government scheme matching, real-time market intel and strategic tools for Indian founders.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <CommandBar />
        </Providers>
      </body>
    </html>
  );
}
