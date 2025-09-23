import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-mint-palette-50 dark:from-black dark:to-gray-900">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/prompts-bg.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-white/37 dark:bg-black/37" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <section className="flex-1 flex flex-col justify-center px-8 py-28 text-center transform translate-y-20">
          {/* Logo */}
          <div className="mx-auto mb-6">
            <Image
              src="/logo-full.png"
              alt="PromptMagic Logo"
              width={240}
              height={80}
              priority
              className="mx-auto"
            />
          </div>

          {/* Headline */}
          <h1
            className="relative text-black dark:text-white font-extrabold tracking-tight 
                       text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6"
          >
            AI That Speaks Your Profession’s Language
          </h1>

          {/* Subtext */}
          <p className="text-lg text-gray-900 dark:text-gray-100 mb-10 max-w-2xl mx-auto 
                       rounded-xl bg-white/20 dark:bg-black/30 backdrop-blur-md 
                       border border-white/30 shadow-md p-4">
            Clean, consistent, and tailored to your clients — every single time. <br />
            Save time, boost productivity, and scale your expertise.
          </p>

          {/* CTA */}
          <Link
            href="/auth/signup"
            className="inline-flex items-center px-6 py-3 rounded-full 
                       bg-mint-palette-200 text-mint-palette-700 font-semibold text-lg 
                       hover:bg-mint-palette-300 transition-colors shadow-md 
                       transform hover:-translate-y-0.5 mx-auto"
          >
            Start Free <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </section>

        {/* Dashboard Image Section */}
        <div className="w-full mt-10 px-4 md:px-8 lg:px-16">
          <Image
            src="/dashboard-preview.png" // Update this path to your image
            alt="Dashboard Preview"
            width={1200}
            height={800}
             className="rounded-lg shadow-xl mx-auto w-full max-w-6xl border-2 border-black"
          />
        </div>
      </div>
    </div>
  );
}