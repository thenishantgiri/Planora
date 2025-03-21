import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/query-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Planora",
  description:
    "Planora is a project management tool. designed for teams. developed by Shangri-La Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={(cn(inter.className), "antialiased min-h-screen")}>
        <Toaster />
        <QueryProvider>{children}</QueryProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
