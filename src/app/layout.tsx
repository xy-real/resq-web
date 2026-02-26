import type { Metadata } from "next";
import { Inter, Krub, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const krub = Krub({
  subsets: ["latin", "latin-ext"],
  variable: "--font-krub",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
    <html
      lang="en"
      className={`${inter.variable} ${krub.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="antialiased"
        style={{
          backgroundColor: "rgb(var(--bg-primary))",
          color: "rgb(var(--text-primary))",
        }}
      >
        <Providers>
          {children}
          <Toaster
            theme="light"
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  "bg-theme-bg-secondary border border-theme-border-primary text-theme-text-primary",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
