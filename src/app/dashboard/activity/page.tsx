// src/app/dashboard/activity/page.tsx (This is a Server Component)

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ActivityDashboard from '../components/ActivityDashboard'; // Client component for UI
import Link from 'next/link';
import { PostgrestError } from '@supabase/supabase-js'; // Import the error type

// Define the shape of the data returned by the Supabase RPC function
interface MostUsedCategory {
  category: string;
  count: number;
}

export const metadata = {
  title: 'Your Activity | MicroPrompt AI',
  description: 'View your prompt generation and usage statistics.',
};

export default async function ActivityPage() {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch total prompts count
  const { count: totalPromptsCount, error: countError } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // FIX: Removed the explicit type argument from the rpc call to avoid the TypeScript error
  const { data: mostUsedCategoryData, error: categoryError } = await supabase
    .rpc('get_most_used_category_by_user', { user_id_param: user.id });

  const activityData = {
    promptsGenerated: totalPromptsCount || 0,
    totalPromptsSaved: totalPromptsCount || 0,
    mostUsedCategory: (mostUsedCategoryData?.[0] as MostUsedCategory)?.category || 'N/A',
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Activity</h1>
          <Link href="/dashboard" passHref>
          <button className="px-6 py-3 rounded-full bg-mint-palette-200 text-mint-palette-700 font-semibold text-lg hover:bg-mint-palette-300 transition-colors shadow-md transform hover:-translate-y-0.5">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Back to Dashboard
            </span>
          </button>
        </Link>
        </header>

        <ActivityDashboard {...activityData} />
      </div>
    </div>
  );
}
