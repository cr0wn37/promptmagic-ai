'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/utils/supabase/client";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
export const runtime = "nodejs";

const UpdatePasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Session Expired or Invalid",
          description: "Please request a new password reset link.",
          variant: "destructive",
        });
        router.push('/auth/forgot-password');
      }
    };
    checkSession();
  }, [router, supabase, toast]);


  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) { 
        toast({
            title: "Password Too Short",
            description: "Password must be at least 6 characters.",
            variant: "destructive",
        });
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Password update error:', error);
      toast({
        title: "Password Update Failed",
        description: error.message,
        variant: "destructive",
      });
      setMessage(`Error: ${error.message}`);
    } else {
      toast({
        title: "Password Updated!",
        description: "Your password has been successfully updated. You can now log in.",
        variant: "default",
      });
      setMessage("Your password has been successfully updated. You can now log in.");
      setPassword('');
      setConfirmPassword('');
      router.push('/auth/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-palette-50 to-mint-palette-100 p-4">
      
      <div className="relative w-full max-w-4xl mx-auto flex rounded-3xl shadow-2xl overflow-hidden bg-white my-8">
      
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-10 text-gray-900">
          <div className="w-full max-w-xs space-y-6 animate-fade-in-up">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Set New Password</h1>
              <p className="text-gray-600 text-base">Enter your new password below.</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
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
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            {message && (
              <p className="text-center text-sm text-mint-palette-600 mt-4">{message}</p>
            )}

            <div className="text-center text-sm text-gray-600">
              <Link href="/auth/login" className="text-mint-palette-600 hover:underline font-medium">
                Back to Login
              </Link>
            </div>
          </div>
        </div>

     
        <div className="hidden md:flex w-1/2 items-center justify-center p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-mint-palette-200 to-mint-palette-400 text-mint-palette-800 text-center flex-col">
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
        .animate-fade-in-up { animation: fadeInFromBottom 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default UpdatePasswordPage;
