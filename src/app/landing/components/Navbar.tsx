"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-lg shadow-lg rounded-full px-8 py-3">
        
        {/* Logo + Brand Name */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-emerald-400">
          <Image 
            src="/logo-icon.png" 
            alt="PromptMagic Logo" 
            width={34} 
            height={34} 
            priority
          />
          <span className="hidden sm:inline">PromptMagic</span>
        </Link>

        {/* Nav Links */}
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

        {/* CTA Buttons */}
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
