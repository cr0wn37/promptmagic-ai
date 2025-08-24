// src/app/dashboard/clients/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import ClientManagement from '../components/ClientManagement'; // FIX: This path is correct
import Link from 'next/link';
import { PostgrestError } from '@supabase/supabase-js';

interface Client {
  id: string;
  user_id: string;
  client_name: string;
  client_data: any;
  created_at: string;
}

export const metadata = {
  title: 'Client Profiles | MicroPrompt AI',
  description: 'Manage your client profiles for personalized AI prompts.',
};

export default async function ClientsPage() {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const userId = user.id;

  const addClient = async (client_name: string, client_data: any) => {
    'use server';
    const supabaseServer = createServerComponentClient({ cookies: () => cookies() });
    const { data: { user: actionUser } } = await supabaseServer.auth.getUser();

    if (!actionUser || actionUser.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }
    const { error } = await supabaseServer
      .from('clients')
      .insert([{ user_id: userId, client_name, client_data }]);

    if (error) {
      return { success: false, message: error.message || "Failed to add client." };
    } else {
      revalidatePath('/dashboard/clients');
      return { success: true, message: "Client added successfully." };
    }
  };

  const updateClient = async (id: string, client_name: string, client_data: any) => {
    'use server';
    const supabaseServer = createServerComponentClient({ cookies: () => cookies() });
    const { data: { user: actionUser } } = await supabaseServer.auth.getUser();

    if (!actionUser || actionUser.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }
    const { error } = await supabaseServer
      .from('clients')
      .update({ client_name, client_data })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return { success: false, message: error.message || "Failed to update client." };
    } else {
      revalidatePath('/dashboard/clients');
      return { success: true, message: "Client updated successfully." };
    }
  };

  const deleteClient = async (id: string) => {
    'use server';
    const supabaseServer = createServerComponentClient({ cookies: () => cookies() });
    const { data: { user: actionUser } } = await supabaseServer.auth.getUser();

    if (!actionUser || actionUser.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }
    const { error } = await supabaseServer
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return { success: false, message: error.message || "Failed to delete client." };
    } else {
      revalidatePath('/dashboard/clients');
      return { success: true, message: "Client deleted successfully." };
    }
  };

  const { data: initialClients, error: fetchError } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('Error fetching clients:', fetchError);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Client Profiles</h1>
          <Link href="/dashboard" passHref>
            <button className="px-6 py-3 rounded-full bg-gray-200 text-gray-700 font-semibold text-lg hover:bg-gray-300 transition-colors shadow-md transform hover:-translate-y-0.5">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Back to Dashboard
              </span>
            </button>
          </Link>
        </header>

        <ClientManagement
          initialClients={initialClients || []}
          onAddClient={addClient}
          onUpdateClient={updateClient}
          onDeleteClient={deleteClient}
        />
      </div>
    </div>
  );
}