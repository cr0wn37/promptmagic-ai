'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

// Import all existing and new sections
import HeroSection from './landing/components/HeroSection';
import ProblemSolutionSection from './landing/components/ProblemSolutionSection';
import KeyFeaturesSection from './landing/components/KeyFeaturesSection';
import HowItWorksSection from './landing/components/HowItWorksSection';
import FinalCtaSection from './landing/components/FinalCtaSection';
import FooterSection from './landing/components/FooterSection';
import Navbar from './landing/components/Navbar';
import PricingPage from './landing/components/pricing';
import BenefitsSection from './landing/components/BenefitsSection';

// You might also have other sections like Testimonials, FAQ, etc.
// For this rebuild, we'll focus on integrating the new features into existing logical sections.


const LandingPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: fetchedUser } } = await supabase.auth.getUser();
      setUser(fetchedUser);
    };
    fetchUser();
  }, [supabase]);

  return (   <>
      <Navbar />

    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <HeroSection  /> {/* Pass user prop to HeroSection */}

       <BenefitsSection /> 

   
      

      {/* Key Features Section - This will be updated to highlight new features */}
      <KeyFeaturesSection /> 
      
      {/* How It Works Section - Ensure this reflects persona selection */}
      <HowItWorksSection />
    

      <PricingPage />

       <FooterSection />
      {/* Tailwind CSS Animations (if defined globally or within components) */}
      {/* No need for a <style jsx> block here if animations are in individual components */}
    </main>
     </>
  );
};

export default LandingPage;
