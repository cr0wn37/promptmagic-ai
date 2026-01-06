'use client';

import React from 'react';
import Link from 'next/link';

interface FinalCtaSectionProps {
  user: any;  
}

const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ user }) => {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-br from-mint-palette-500 via-blue-600 to-indigo-700 text-white overflow-hidden rounded-t-[3rem]">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />

      <div className="relative max-w-6xl mx-auto text-center animate-fade-in-up">
      
        <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          Ready to Transform Your AI Workflow?
        </h2>
        <p className="text-lg sm:text-xl mb-12 opacity-90 leading-relaxed max-w-3xl mx-auto">
          Experience the power of precision-guided AI. Get started today and unlock a new level of productivity.
        </p>

       
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300">
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <p className="text-4xl font-extrabold mb-4">$0</p>
            <p className="mb-6 opacity-80">Perfect for individuals exploring AI-driven workflows.</p>
            <Link href="/auth/signup" passHref>
              <button className="w-full py-3 bg-white text-mint-palette-700 font-bold rounded-xl shadow hover:bg-gray-100 transition-all">
                Get Started
              </button>
            </Link>
          </div>

          <div className="bg-gradient-to-tr from-indigo-600 to-blue-500 p-8 rounded-2xl shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-4xl font-extrabold mb-4">$29<span className="text-lg font-medium opacity-80">/mo</span></p>
            <p className="mb-6 opacity-90">For professionals and teams who want full AI power.</p>
            <Link href="/pricing" passHref>
              <button className="w-full py-3 bg-white text-indigo-700 font-bold rounded-xl shadow hover:bg-gray-100 transition-all">
                Upgrade Now
              </button>
            </Link>
          </div>
        </div>

        {/* Final CTA buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          {user ? (
            <Link href="/dashboard" passHref>
              <button className="px-10 py-4 bg-white text-mint-palette-700 font-bold text-xl rounded-xl shadow-lg hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300">
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <Link href="/auth/signup" passHref>
              <button className="px-10 py-4 bg-white text-mint-palette-700 font-bold text-xl rounded-xl shadow-lg hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300">
                Start Your Free Trial
              </button>
            </Link>
          )}

          <Link href="/pricing" passHref>
            <button className="px-10 py-4 bg-transparent border-2 border-white text-white font-semibold text-xl rounded-xl hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300">
              View Full Pricing
            </button>
          </Link>
        </div>
      </div>

      {/* Fade-in animation */}
      <style jsx>{`
        @keyframes fadeInFromBottom {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInFromBottom 1s ease-out forwards; }
      `}</style>
    </section>
  );
};

export default FinalCtaSection;
