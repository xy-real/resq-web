import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VSU Disaster Response Admin",
  description:
    "Typhoon response and student safety dashboard for Visayas State University",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#0b1018] text-slate-200 antialiased">
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: "bg-[#161e2e] border border-white/10 text-slate-200",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
