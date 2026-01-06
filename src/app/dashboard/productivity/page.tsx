// src/app/dashboard/marketing/page.tsx (This is a Server Component)

import { createSupabaseServerClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


import CategoryPromptRunner from '@/components/CategoryPromptRunner';

export const metadata = {
  title: 'Productivity Prompts | MicroPrompt AI',
  description: 'AI-powered Productivity prompt workflows.',
};

export default async function ProductivityPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-mint-palette-700 dark:text-mint-palette-200 mb-6">
      ⚡ Productivity Prompt Workspace
      </h1>
      <p className="text-mint-palette-600 dark:text-mint-palette-300 mb-8">
        Select a pre-defined Productivity prompt and generate tailored AI responses.
      </p>

     
      <CategoryPromptRunner category="Productivity" />
    </div>
  );
}
