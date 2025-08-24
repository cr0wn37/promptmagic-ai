// src/app/dashboard/marketing/page.tsx (This is a Server Component)

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Import the generic CategoryPromptRunner
import CategoryPromptRunner from '@/components/CategoryPromptRunner';

export const metadata = {
  title: 'Therapy Prompts | MicroPrompt AI',
  description: 'AI-powered therapy prompt workflows.',
};

export default async function TherapyPage() {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-mint-palette-700 dark:text-mint-palette-200 mb-6">
      🛋️ Therapy Prompt Workspace 
      </h1>
      <p className="text-mint-palette-600 dark:text-mint-palette-300 mb-8">
        Select a pre-defined Therapy prompt and generate tailored AI responses.
      </p>

      {/* Render the generic CategoryPromptRunner and pass the 'Marketing' category */}
      <CategoryPromptRunner category="Therapy" />
    </div>
  );
}
