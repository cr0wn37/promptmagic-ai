'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from "@/utils/supabase/client";
import Link from 'next/link';

 
import HeroSection from './landing/components/HeroSection';
import ProblemSolutionSection from './landing/components/ProblemSolutionSection';
import KeyFeaturesSection from './landing/components/KeyFeaturesSection';
import HowItWorksSection from './landing/components/HowItWorksSection';
import FinalCtaSection from './landing/components/FinalCtaSection';
import FooterSection from './landing/components/FooterSection';
import Navbar from './landing/components/Navbar';
import PricingPage from './landing/components/pricing';
import BenefitsSection from './landing/components/BenefitsSection';

 


const LandingPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);


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
       
      <HeroSection  />  

       <BenefitsSection /> 
 
      <KeyFeaturesSection /> 
      
      <HowItWorksSection />
    
      <PricingPage />

       <FooterSection />
   
    </main>
     </>
  );
};

export default LandingPage;
