'use client';

import React, { useState } from 'react';

const PricingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/generate/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: process.env.LEMONSQUEEZY_VARIANT_ID, // 👈 your Pro subscription product variant ID
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // redirect to Lemon Squeezy checkout
      } else {
        console.error('Checkout creation failed:', data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      frequency: 'per month',
      description: 'Perfect for individuals getting started with AI prompts.',
      features: [
        '4 AI credits per day ',
        'Limited client profiles',
        'Limited personas/templates',
        'Access to basic categories & prompts',
        'Community Support',
      ],
      buttonText: 'Get Started Free',
      buttonLink: '/auth/signup',
      isPrimary: false,
    },
    {
      name: 'Pro',
      price: '$9',
      frequency: 'per month',
      description: 'Ideal for professionals needing more AI power and flexibility.',
      features: [
        '1000 AI credits per month',
        'More client profiles (than Free)',
        'More personas/templates (than Free)',
        'Access to all categories & prompts',
        'Priority Email Support (24–48h)',
        'Early access to new features & prompt packs',
      ],
      buttonText: loading ? 'Redirecting...' : 'Upgrade to Pro',
      isPrimary: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 scroll-mt-24">
      <div className="min-h-screen bg-white text-gray-900 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-up">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
            Choose the plan that best fits your AI workflow needs. Scale up as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`rounded-3xl shadow-xl p-16 space-y-2 flex flex-col justify-between transform transition-all duration-300 animate-fade-in-up ${
                tier.isPrimary
                  ? 'bg-mint-palette-100 border-2 border-mint-palette-400 scale-105 hover:shadow-2xl'
                  : 'bg-mint-palette-100 border border-mint-palette-200 hover:shadow-lg'
              }`}
              style={{ animationDelay: `${index * 0.2 + 0.5}s` }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {tier.name}
                  </h2>
                  {tier.isPrimary && (
                    <span className="px-3 py-1 bg-mint-palette-200 text-mint-palette-700 text-sm font-semibold rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-base mb-4">
                  {tier.description}
                </p>
                <p className="text-5xl font-extrabold text-gray-900">
                  {tier.price}
                  <span className="text-xl font-medium text-gray-600">
                    /{tier.frequency}
                  </span>
                </p>
                <ul className="list-none space-y-3 text-gray-700 mt-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-lg"
                    >
                      <svg
                        className="w-6 h-6 text-mint-palette-500 mr-3 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buttons */}
              {tier.isPrimary ? (
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-3 rounded-full font-bold text-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 bg-mint-palette-200 text-mint-palette-700 hover:bg-mint-palette-300 focus:ring-mint-palette-400 focus:outline-none focus:ring-2 focus:ring-opacity-75"
                >
                  {tier.buttonText}
                </button>
              ) : (
                <a href={tier.buttonLink}>
                  <button className="w-full py-3 rounded-full font-bold text-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-50 focus:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-opacity-75">
                    {tier.buttonText}
                  </button>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPage;
