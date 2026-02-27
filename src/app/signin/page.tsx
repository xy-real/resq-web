"use client";

import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default function SignInPage() {
  return (
    <main
      className="relative min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "rgb(var(--bg-primary))" }}
    >
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-20%,rgba(56,189,248,0.08),transparent)]" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="rounded-xl p-3 ring-1 bg-sky-500/10 ring-sky-500/20">
              <Image
                src="/Logo.svg"
                alt="ResQ Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </div>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-theme-text-primary tracking-tight leading-tight mb-3">
            Welcome Back
          </h1>
          <p className="text-base text-theme-text-secondary max-w-sm mx-auto">
            Sign in to access VSU Typhoon Response System
          </p>
        </div>

        {/* Form Card */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-theme-text-tertiary">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-sky-500 hover:text-sky-400 font-semibold transition-colors"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
