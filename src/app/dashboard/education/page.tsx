// src/app/dashboard/hr/page.tsx (Example for HR)
// This is a Server Component

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import CategoryPromptRunner from '@/components/CategoryPromptRunner';

export const metadata = {
  title: 'Education Prompts | MicroPrompt AI', // Update title
  description: 'AI-powered Education prompt workflows.', // Update description
};

export default async function EducationPage() { // Update function name
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="p-6">
      {/* Update emoji and text for the heading */}
      <h1 className="text-2xl font-bold text-mint-palette-700 dark:text-mint-palette-200 mb-6">
        🎓 Education Prompt Workspace
      </h1>
      <p className="text-mint-palette-600 dark:text-mint-palette-300 mb-8">
        Select a pre-defined Education prompt and generate tailored AI responses.
      </p>

      {/* Pass the correct category prop */}
      <CategoryPromptRunner category="Education" />
    </div>
  );
}
