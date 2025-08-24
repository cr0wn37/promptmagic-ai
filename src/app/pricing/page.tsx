'use client';

import React from 'react';
import Link from 'next/link';

const PricingPage: React.FC = () => {
  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      frequency: 'per month',
      description: 'Perfect for individuals getting started with AI prompts.',
      features: [
        '5 AI Prompts per day',
        'Basic AI Personas',
        'Standard Prompt Management',
        'Community Support',
      ],
      buttonText: 'Get Started Free',
      buttonLink: '/auth/signup',
      isPrimary: false,
    },
    {
      name: 'Pro',
      price: '$19',
      frequency: 'per month',
      description: 'Ideal for professionals needing more AI power and flexibility.',
      features: [
        'Unlimited AI Prompts',
        'All AI Personas',
        'Advanced Prompt Management',
        'Priority Email Support',
        'Access to new features (Beta)',
      ],
      buttonText: 'Start Pro Trial',
      buttonLink: '/auth/signup?plan=pro', // Example: pass plan via query param
      isPrimary: true, // Highlight this tier
    },
    {
      name: 'Business',
      price: '$49',
      frequency: 'per month',
      description: 'For teams and agencies requiring comprehensive AI solutions.',
      features: [
        'Everything in Pro',
        'Team Collaboration Features',
        'Dedicated Account Manager',
        'Custom Integrations',
        'API Access',
      ],
      buttonText: 'Contact Sales',
      buttonLink: '/contact', // Example: link to a contact page
      isPrimary: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 py-16 px-4">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-up">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
          Choose the plan that best fits your AI content generation needs. Scale up as you grow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingTiers.map((tier, index) => (
          <div 
            key={tier.name}
            className={`rounded-3xl shadow-xl p-8 space-y-6 flex flex-col justify-between transform transition-all duration-300 animate-fade-in-up ${
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
                  <span className="px-3 py-1 bg-mint-palette-200 text-mint-palette-700 text-sm font-semibold rounded-full">Popular</span>
                )}
              </div>
              <p className="text-gray-600 text-base mb-4">{tier.description}</p>
              <p className="text-5xl font-extrabold text-gray-900">
                {tier.price}
                <span className="text-xl font-medium text-gray-600">/{tier.frequency}</span>
              </p>
              <ul className="list-none space-y-3 text-gray-700 mt-6">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-lg">
                    {/* Replaced checkmark SVG with a cleaner, solid checkmark and adjusted spacing */}
                    <svg className="w-6 h-6 text-mint-palette-500 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Link href={tier.buttonLink} passHref>
              <button
                className={`w-full py-3 rounded-full font-bold text-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${
                  tier.isPrimary
                    ? 'bg-mint-palette-200 text-mint-palette-700 hover:bg-mint-palette-300 focus:ring-mint-palette-400'
                    : 'bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-50 focus:ring-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-opacity-75`}
              >
                {tier.buttonText}
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* Tailwind CSS Animations */}
      <style jsx>{`
        @keyframes fadeInFromBottom {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInFromBottom 1s ease-out forwards; }
        .animation-delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default PricingPage;
