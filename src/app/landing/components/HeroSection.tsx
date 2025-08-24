import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-mint-palette-50 dark:from-black dark:to-gray-900">
      {/* Background Image Container */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/prompt-bg.png')" }}
      />

      {/* Darker Overlay for readability */}
      <div className="absolute inset-0 z-0 bg-white/37 dark:bg-black/37" />

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
       

        {/* Hero Section Content */}
        <section className="flex-1 flex flex-col justify-center px-8 py-28 text-center transform translate-y-32">
          <h2 className="text-5xl font-extrabold text-black dark:text-white mb-6 leading-tight">
            AI That Speaks Your Profession’s Language
          </h2>
         <p className="text-lg text-gray-900 dark:text-gray-100 mb-10 max-w-2xl mx-auto rounded-xl bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/30 shadow-md p-4">
        Clean, consistent, and tailored to your clients — every single time. <br />
  Save time, boost productivity, and scale your expertise.
</p>
         <Link
  href="/auth/signup"
  className="inline-flex items-center px-6 py-3 rounded-full bg-mint-palette-200 text-mint-palette-700 font-semibold text-lg hover:bg-mint-palette-300 transition-colors shadow-md transform hover:-translate-y-0.5 mx-auto"
>
  Start Free <ArrowRight className="ml-2 w-5 h-5" />
</Link>
        </section>
      </div>
    </div>
  );
}
