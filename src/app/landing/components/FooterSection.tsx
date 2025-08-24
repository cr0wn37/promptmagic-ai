'use client';

import React from 'react';

const FooterSection: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 bg-gray-100 text-gray-700 border-t border-gray-200"> {/* Light background, subtle border */}
      <div className="max-w-6xl mx-auto text-center">
        {/* Logo/Brand Name */}
        <div className="mb-6">
          <span className="text-3xl font-extrabold text-gray-900">
            MicroPrompt AI
          </span>
        </div>

        {/* Navigation Links (Optional - uncomment and add as needed) */}
        {/*
        <nav className="mb-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-lg">
          <a href="#" className="hover:text-mint-palette-600 transition-colors">Features</a>
          <a href="#" className="hover:text-mint-palette-600 transition-colors">Pricing</a>
          <a href="#" className="hover:text-mint-palette-600 transition-colors">About Us</a>
          <a href="#" className="hover:text-mint-palette-600 transition-colors">Contact</a>
        </nav>
        */}

        {/* Copyright Information */}
        <p className="text-sm">
          &copy; {currentYear} MicroPrompt AI. All rights reserved.
        </p>
        {/* Optional: Privacy Policy, Terms of Service links */}
        {/*
        <div className="mt-4 text-sm">
          <a href="#" className="text-gray-600 hover:text-mint-palette-600 transition-colors mx-2">Privacy Policy</a>
          <span className="text-gray-400">|</span>
          <a href="#" className="text-gray-600 hover:text-mint-palette-600 transition-colors mx-2">Terms of Service</a>
        </div>
        */}
      </div>
    </footer>
  );
};

export default FooterSection;
