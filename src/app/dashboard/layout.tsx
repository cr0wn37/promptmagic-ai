// src/app/dashboard/layout.tsx (This is a Server Component)

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import DashboardSidebar from './components/DashBoardSidebar'; // Path: src/app/dashboard/components/DashboardSidebar.tsx

export const metadata = {
  title: 'Dashboard | MicroPrompt AI',
  description: 'Your AI-Powered Prompt Workspace Dashboard',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const { data: { user } = {} } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth'); // Redirect to your auth page if not logged in
  }

  return (
    // Main wrapper div with overall background gradient using new colors
    <div className="min-h-screen flex bg-gradient-to-br from-mint-palette-50 to-mint-palette-100 dark:from-mint-palette-950 dark:to-mint-palette-900">
      {/* Render the DashboardSidebar client component */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
