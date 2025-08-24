// src/components/UserDropdown.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client'; // Your client-side Supabase
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for the login button

// Correct import for AuthChangeEvent and Session types
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js'; // Import User type as well

export default function UserDropdown() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null); // user.email can also be null
      } else {
        setUserEmail(null);
      }
    };
    fetchUser();

    // The callback for onAuthStateChange provides AuthChangeEvent and Session
    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      // TODO: Add toast notification
    } else {
      router.push('/auth'); // Redirect to auth page after logout
    }
  };

  if (!userEmail) {
    return (
      <Link href="/auth" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-md">
        Login
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <span>{userEmail}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Logout
          </button>
          {/* Add other user options here */}
        </div>
      )}
    </div>
  );
}
