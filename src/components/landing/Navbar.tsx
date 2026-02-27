"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { NavLink } from "./NavLink";

export function Navbar() {
  const router = useRouter();

  const navLinks = [
    { label: "About us", href: "#about" },
    { label: "FAQ", href: "#faq" },
    { label: "Features", href: "#features" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b border-cyan-500/10 backdrop-blur-md"
      style={{ backgroundColor: "rgb(11, 16, 24)" }}
    >
      <div className="px-6 py-4 flex items-center justify-between gap-8">
        {/* Left - Logo */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-lg border border-cyan-400/50 flex items-center justify-center p-1">
            <Image
              src="/Logo.svg"
              alt="ResQ Logo"
              width={48}
              height={48}
              className="w-full h-full"
            />
          </div>
          <span className="text-4xl font-heading font-bold tracking-tight">
            <span className="text-cyan-400">ResQ</span>
          </span>
        </div>

        {/* Right - Navigation Links and Contact Button */}
        <div className="flex-shrink-0 flex items-center gap-8">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.label} label={link.label} href={link.href} />
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={() => router.push("/signin")}
            className="rounded-full bg-cyan-500/20 border border-cyan-400/60 hover:bg-cyan-500/30 px-6 py-2.5 text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}
