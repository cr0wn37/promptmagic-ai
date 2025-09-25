'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from "next/image";
export const runtime = "nodejs";

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

 
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router, supabase]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Signup Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
  console.error('Signup error:', error);
  toast({
    title: "Signup Failed",
    description: error.message,
    variant: "destructive",
  });
} else {
  // 👇 Insert profile with 7-day trial
   if (data?.user) {
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        email: data.user.email,
        plan: "trial",
        credits: 4, // daily reset handled by SQL or cron
        trial_start: new Date().toISOString(),
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Error inserting trial profile:", insertError);
    }
  }

  toast({
    title: "Account Created!",
    description: "Please check your email to confirm your account.",
    variant: "default",
  });
}

    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google signup error:', error);
      toast({
        title: "Google Signup Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-palette-50 to-mint-palette-100 p-4">
     
      <div className="relative w-full max-w-4xl mx-auto flex rounded-3xl shadow-2xl overflow-hidden bg-white my-8">
        
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-10 text-gray-900">
          <div className="w-full max-w-xs space-y-6 animate-fade-in-up">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Join MicroPrompt AI</h1>
              <p className="text-gray-600 text-base">Create your account to get started.</p>
            </div>

            
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-semibold text-base hover:bg-gray-50 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0003 4.75C14.0503 4.75 15.8353 5.443 17.2433 6.726L20.0483 3.921C18.0693 2.091 15.2673 1 12.0003 1C7.79133 1 4.16333 3.429 2.38633 7.02L5.87733 9.77C6.88333 7.22 9.27833 5.499 12.0003 5.499C12.0003 5.499 12.0003 4.75 12.0003 4.75Z" fill="#EA4335"/><path d="M23.0003 12.0003C23.0003 11.3433 22.9463 10.6973 22.8423 10.0643H12.0003V13.9373H18.5953C18.3323 15.2593 17.5213 16.3763 16.3493 17.1993L19.0623 19.32C20.7573 17.7553 22.0003 14.9543 22.0003 12.0003Z" fill="#4285F4"/><path d="M5.87729 14.2293C5.62929 13.5943 5.48529 12.8173 5.48529 12.0003C5.48529 11.1833 5.62929 10.4063 5.87729 9.77133L2.38629 7.02033C1.43229 8.94433 1 10.9793 1 12.0003C1 13.0213 1.43229 15.0563 2.38629 16.9803L5.87729 14.2293Z" fill="#FBBC04"/><path d="M12.0003 22.9993C15.2673 22.9993 18.0693 21.9083 20.0483 20.0783L17.2433 17.2733C15.8353 18.5563 14.0503 19.2493 12.0003 19.2493C9.27833 19.2493 6.88333 17.5283 5.87733 14.9783L2.38633 17.7293C4.16333 21.3203 7.79133 22.9993 12.0003 22.9993Z" fill="#34A853"/></svg>
              Continue with Google
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-palette-400 focus:border-transparent transition-all duration-200 text-base"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-palette-400 focus:border-transparent transition-all duration-200 text-base"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-palette-400 focus:border-transparent transition-all duration-200 text-base"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mint-palette-500 text-white font-semibold py-2.5 rounded-lg shadow-md hover:bg-mint-palette-600 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-base"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-mint-palette-600 hover:underline font-medium">
                Login
              </Link>
            </div>
          </div>
        </div>

        
        <div className="hidden md:flex w-1/2 items-center justify-center p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-mint-palette-200 to-mint-palette-400 text-mint-palette-800 text-center flex-col rounded-r-2xl shadow-lg">

                   <div className="mb-6 drop-shadow-lg">
    <Image 
      src="/logo-icon.png" 
      alt="PromptMagic Logo" 
      width={80} 
      height={80} 
      priority 
    />
  </div>

          <h2 className="text-4xl font-extrabold leading-tight mb-4 drop-shadow-lg">
            PromptMagic AI
          </h2>
          <p className="text-lg leading-relaxed opacity-90 max-w-md">
            Unleash tailored, persona-driven AI content. Get clean, actionable responses for every niche.
          </p>
        </div>
      </div>

     
      <style jsx>{`
        @keyframes fadeInFromBottom {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.1); }
          66% { transform: translate(-10px, 10px) scale(0.9); }
        }
        @keyframes blob-fast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-15px, 25px) scale(1.05); }
          66% { transform: translate(10px, -10px) scale(0.95); }
        }
        .animate-fade-in-up { animation: fadeInFromBottom 0.6s ease-out forwards; }
        .animate-blob-slow { animation: blob-slow 12s infinite ease-in-out; }
        .animate-blob-fast { animation: blob-fast 10s infinite ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

export default SignupPage;
