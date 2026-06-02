import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Universal Inventory Management System",
  description: "Enterprise grade stock-in and ledger tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <div className="min-h-screen flex flex-col md:flex-row">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 min-h-screen md:pl-64 transition-all duration-300">
            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full pt-16 md:pt-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
