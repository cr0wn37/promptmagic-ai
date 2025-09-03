'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
      setMessage(`Error: ${error.message}`);
    } else {
      toast({
        title: "Password Reset Email Sent!",
        description: "Please check your email for instructions to reset your password.",
        variant: "default",
      });
      setMessage("Please check your email for instructions to reset your password.");
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-palette-50 to-mint-palette-100 p-4">
      {/* Central Card Container */}
      <div className="relative w-full max-w-4xl mx-auto flex rounded-3xl shadow-2xl overflow-hidden bg-white my-8">
        {/* Left Section: Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-10 text-gray-900">
          <div className="w-full max-w-xs space-y-6 animate-fade-in-up">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600 text-base">Enter your email to receive a password reset link.</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mint-palette-500 text-white font-semibold py-2.5 rounded-lg shadow-md hover:bg-mint-palette-600 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-base"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>

            {message && (
              <p className="text-center text-sm text-mint-palette-600 mt-4">{message}</p>
            )}

            <div className="text-center text-sm text-gray-600">
              Remembered your password?{' '}
              <Link href="/auth/login" className="text-mint-palette-600 hover:underline font-medium">
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section: Gradient Background with Text */}
        <div className="hidden md:flex w-1/2 items-center justify-center p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-mint-palette-200 to-mint-palette-400 text-mint-palette-800 text-center flex-col">
          <h2 className="text-4xl font-extrabold leading-tight mb-4 drop-shadow-lg">
            PromptMagic AI
          </h2>
          <p className="text-lg leading-relaxed opacity-90 max-w-md">
            Unleash tailored, persona-driven AI content. Get clean, actionable responses for every niche.
          </p>
        </div>
      </div>

      {/* Tailwind CSS Animations */}
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

export default ForgotPasswordPage;
