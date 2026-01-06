'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import ThemeToggle from '@/components/ThemeToggle'; 
import { supabase } from "@/utils/supabase/client";


interface UserDropdownProps {
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
 
  const { toast } = useToast();
  

  useEffect(() => {
   
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      } else {
        setUserEmail(null);
      }
    };
    fetchUser();
        const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

   const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", user.id) // or `.eq("email", user.email)` if your webhook updates by email
          .single();

        if (!error && data) {
          setCredits(data.credits);
        }
      }
    };

    fetchCredits();
  }, []);



  const handleLogout = useCallback(() => {
    onLogout();
    setIsOpen(false);
  }, [onLogout]);

  
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isOpen && event.target && !(event.target as HTMLElement).closest('.user-dropdown-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  if (!userEmail) {
    return (
      <Link href="/auth/login" className="px-4 py-2.5 bg-mint-palette-500 text-white font-semibold rounded-lg shadow-md hover:bg-mint-palette-600 transition">
        Login
      </Link>
    );
  }

  return (
    <div className="relative user-dropdown-container">
      <button 
  onClick={() => setIsOpen(!isOpen)}
  className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 text-white shadow-md hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
  aria-label="User Account"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
</button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-gray-800 border border-gray-700 z-50 animate-scale-in">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-700 text-gray-200 font-semibold text-lg">
              {userEmail || 'User'}
            </div>

             <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
      {credits !== null ? `Credits: ${credits}` : "Loading..."}
    </span>
  );

            
            
            <div className="px-4 py-2">
              <button 
                
                className="w-full text-left px-4 py-2 rounded-lg bg-gray-700 text-gray-200 font-semibold flex items-center gap-2 hover:bg-gray-600 transition"
              >
               
               <ThemeToggle />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.95) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};



export default UserDropdown;
