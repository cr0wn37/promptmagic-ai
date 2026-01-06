// src/app/dashboard/layout.tsx (This is a Server Component)

import { createSupabaseServerClient } from "@/utils/supabase/server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import DashboardSidebar from './components/DashBoardSidebar'; 

export const metadata = {
   title: "PromptMagic",
 description:
    "Organize, run, and save AI prompts with ease. Designed for professionals in fitness, HR, education, marketing, and more.",
};
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } = {} } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-mint-palette-50 to-mint-palette-100 dark:from-mint-palette-950 dark:to-mint-palette-900">
    
      <DashboardSidebar />

    
      <main className="flex-1 ml-64 px-4 md:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
