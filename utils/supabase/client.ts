// src/utils/supabase/client.ts
'use client'; // This is a client-side utility

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// This initializes the client-side Supabase instance using your public environment variables.
// Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local
export const supabase = createClientComponentClient();
