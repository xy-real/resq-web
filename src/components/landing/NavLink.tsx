'use client';

import { useState } from 'react';

interface NavLinkProps {
  label: string;
  href: string;
}

export function NavLink({ label, href }: NavLinkProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors duration-200"
    >
      {label}
      <span
        className={`absolute bottom-0 -left-2 w-[calc(100%+16px)] h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 transition-opacity duration-300 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </a>
  );
}
