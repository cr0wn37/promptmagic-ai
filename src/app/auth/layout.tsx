// src/app/auth/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const { data: { user } = {} } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard'); // logged-in users go to dashboard
  }

  return <>{children}</>;
}
