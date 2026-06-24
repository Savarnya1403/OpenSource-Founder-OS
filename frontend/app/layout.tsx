import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "OpenFounder OS — AI Cofounder for Indian Startups",
  description:
    "Democratizing entrepreneurial intelligence. AI-powered startup guidance, government scheme matching, and strategic tools for Indian founders.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
