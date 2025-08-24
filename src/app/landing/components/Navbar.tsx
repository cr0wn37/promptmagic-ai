"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-lg shadow-lg rounded-full px-8 py-3">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-emerald-400">
         PromptMagic
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex space-x-8 font-medium text-gray-700">
          <a href="#benefits" className="hover:text-mint-palette-500 transition">
            Benefits
          </a>
          <a href="#keyfeatures" className="hover:text-mint-palette-500 transition">
            Features
          </a>
          <a href="#howitworks" className="hover:text-mint-palette-500 transition">
            How it Works
          </a>
          <a href="#pricing" className="hover:text-mint-palette-500 transition">
            Pricing
          </a>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center space-x-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-full text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                 bg-mint-palette-400 text-mint-palette-900 font-bold text-lg 
                 shadow-md hover:bg-mint-palette-500 transition-all duration-300"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
