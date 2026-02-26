'use client';

import { useState } from 'react';

export function Navbar() {
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-cyan-500/10 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 backdrop-blur-md">
      <div className="px-6 py-4 flex items-center justify-between gap-8">
        
        {/* Left - Logo */}
        <div className="flex-shrink-0">
          <span className="text-4xl font-heading font-bold tracking-tight">
            <span className="text-cyan-400">ResQ</span>
          </span>
        </div>

        {/* Center - Navigation Links */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onMouseEnter={() => setIsHovering(link.label)}
              onMouseLeave={() => setIsHovering(null)}
              className={`text-sm font-medium transition-colors duration-200 ${
                isHovering === link.label
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right - Button and Logo Box */}
        <div className="flex-shrink-0 flex items-center gap-4">
          <button className="rounded-full border border-cyan-400/60 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border-gradient transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-cyan-500/20">
            Log in
          </button>
          <div className="w-8 h-8 bg-cyan-400 rounded"></div>
        </div>
      </div>
    </nav>
  );
}