// src/app/dashboard/personas/page.tsx (This is a Server Component)

import { createSupabaseServerClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { PostgrestError } from '@supabase/supabase-js'; 

import PersonaManagement from '../components/PersonaManagement'; 
import Link from 'next/link';


interface Persona {
  id: string;
  user_id: string;
  name: string;
  instructions: string;
  created_at: string;
}

export const metadata = {
  title: 'AI Personas | MicroPrompt AI',
  description: 'Manage your custom AI personas.',
};

export default async function PersonasPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const userId = user.id;

  
  const addPersona = async (name: string, instructions: string) => {
    'use server';
    const supabase = await createSupabaseServerClient();
    const { data: { user: actionUser } } = await supabase.auth.getUser();

    if (!actionUser || actionUser.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from('personas')
      .insert([{ user_id: userId, name, instructions }])
      .select()
      .single();

    if (error) {
      console.error('Error adding persona:', error);
      return { success: false, message: error.message || "Failed to add persona." };
    } else {
      revalidatePath('/dashboard/personas');
      return { success: true, message: "Persona added successfully." };
    }
  };

 
  const updatePersona = async (id: string, name: string, instructions: string) => {
    'use server';
    const supabase = await createSupabaseServerClient();
    const { data: { user: actionUser } } = await supabase.auth.getUser();

    if (!actionUser || actionUser.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from('personas')
      .update({ name, instructions })
      .eq('id', id)
      .eq('user_id', userId) 
      .select()
      .single();

    if (error) {
      console.error('Error updating persona:', error);
      return { success: false, message: error.message || "Failed to update persona." };
    } else {
      revalidatePath('/dashboard/personas'); 
      return { success: true, message: "Persona updated successfully." };
    }
  };

  const deletePersona = async (id: string) => {
    'use server';
    const supabase = await createSupabaseServerClient();
    const { data: { user: actionUser } } = await supabase.auth.getUser();

    if (!actionUser || actionUser.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }

    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting persona:', error);
      return { success: false, message: error.message || "Failed to delete persona." };
    } else {
      revalidatePath('/dashboard/personas'); 
      return { success: true, message: "Persona deleted successfully." };
    }
  };

  
  const { data: initialPersonas, error: fetchError } = await supabase
    .from('personas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('Error fetching initial personas:', fetchError);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your AI Personas</h1>
          <Link href="/dashboard" passHref>
          <button className="px-6 py-3 rounded-full bg-mint-palette-200 text-mint-palette-700 font-semibold text-lg hover:bg-mint-palette-300 transition-colors shadow-md transform hover:-translate-y-0.5">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Back to Dashboard
            </span>
          </button>
        </Link>
        </header>

        <PersonaManagement
          initialPersonas={initialPersonas || []}
          onAddPersona={addPersona}
          onUpdatePersona={updatePersona}
          onDeletePersona={deletePersona}
        />
      </div>
    </div>
  );
}
