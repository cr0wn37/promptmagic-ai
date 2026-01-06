'use client';

import React, { useState } from 'react';

const PricingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (planType: "weekly" | "monthly")=> {
    
    try {
      setLoading(true);
      const res = await fetch('/api/generate/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType
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
      name: '7-Days Free Trial',
      price: '$0',
      frequency: 'One-time',
      description: 'Try MicroPrompt AI free for 7 days with full access to basic features.',
      features: [
        'Limited credits per day ',
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
    name: 'Weekly',
    price: '$6',
    frequency: 'Per Week',
    description: 'Flexible access for busy weeks when you need extra AI support.',
    features: [
      '250 AI credits Per Week',
      'Get AI Outputs with Top-notch Quality',
      'Integrate and create multiple client profiles',
      'Provide your own custom Personas (System Instructions)',
      'Access to all categories & prompts',
      'Priority Email Support (24–48h)',
    ],
    buttonText: loading ? 'Redirecting...' : 'Get Weekly Plan',
   buttonAction: () => handleCheckout("weekly"),
    isPrimary: false,
  },
    {
      name: 'Pro',
      price: '$11',
      frequency: 'Per Month',
      description: 'Ideal for professionals needing more AI power and flexibility.',
      features: [
        '1000 AI credits per month',
        'Get AI Outputs with Top-notch Quality',
        'Integrate and create multiple client profiles',
        'Provide your own custom Personas (System Instructions)',
        'Access to all categories & prompts',
        'Priority Email Support (24–48h)',
        'Early access to new features & prompt packs',
      ],
      buttonText: loading ? 'Redirecting...' : 'Upgrade to Pro',
      buttonAction: () => handleCheckout("monthly"),
    isPrimary: true,
  },
];

  return (
   <section id="pricing" className="py-20 scroll-mt-24">
  <div className="min-h-screen bg-white text-gray-900 py-16 px-4">
    {/* Heading */}
    <div className="max-w-6xl mx-auto text-center mb-16">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-up">
        Simple, Transparent Pricing
      </h1>
      <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
        Choose the plan that best fits your AI workflow needs. Scale up as you grow.
      </p>
    </div>

    {/* Pricing Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {pricingTiers.map((tier, index) => (
        <div
          key={tier.name}
          className={`relative rounded-3xl p-10 flex flex-col justify-between transform transition-all duration-500 h-full 
          backdrop-blur-xl border group overflow-hidden
          ${
            tier.isPrimary
              ? 'bg-gradient-to-br from-mint-palette-200 to-mint-palette-100 border-mint-palette-400 shadow-2xl scale-105'
              : 'bg-white/80 border-gray-200 shadow-lg hover:shadow-xl'
          }`}
          style={{ animationDelay: `${index * 0.2 + 0.5}s` }}
        >
          {/* Floating Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-mint-palette-300/20 to-white/10 rounded-3xl blur-xl"></div>

          <div className="flex flex-col flex-grow relative z-10">
            {/* Title + Badge */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900">{tier.name}</h2>
              {tier.isPrimary && (
                <span className="px-3 py-1 bg-mint-palette-300/80 text-mint-palette-800 text-xs font-semibold rounded-full shadow-sm">
                  Recommended
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base mb-4">{tier.description}</p>

            {/* Price */}
            <p className="text-5xl font-extrabold text-gray-900 mb-6">
              {tier.price}
              <span className="text-xl font-medium text-gray-500">/{tier.frequency}</span>
            </p>

            {/* Features */}
            <ul className="list-none space-y-3 text-gray-700 flex-grow">
              {tier.features.map((feature, featureIndex) => (
                <li
                  key={featureIndex}
                  className="flex items-center text-sm sm:text-sm"
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

          {/* Button */}
          {tier.buttonAction ? (
            <button
              onClick={tier.buttonAction}
              disabled={loading}
              className="mt-8 w-full py-3 rounded-full font-bold text-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 
              bg-mint-palette-500 text-white hover:bg-mint-palette-600 focus:ring-2 focus:ring-mint-palette-400 focus:outline-none"
            >
              {tier.buttonText}
            </button>
          ) : (
            <a href={tier.buttonLink} className="mt-8">
              <button className="w-full py-3 rounded-full font-bold text-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 
              bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:outline-none">
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
