// src/app/dashboard/saved-prompts/page.tsx (This is a Server Component)

import { createSupabaseServerClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { PostgrestError } from '@supabase/supabase-js';

import SavedPromptsDashboard from './components/SavedPromptsDashboard';


interface PromptTable {
  category: string;
  prompt_text?: string;
  sub_category?: string;
  favorite?: boolean;
}

interface FetchedResponse {
  id: string;
  input_variables: { text?: string; category?: string; sub_category?: string; [key: string]: any };
  ai_reply: string;
  created_at: string;
  prompts: PromptTable | null;
}

interface FormattedPrompt {
  id: string;
  input: string; 
  response: string;
  category: string;
  timestamp: string; 
  prompt_text?: string; 
  sub_category?: string;
  favorite?: boolean;
}

export const metadata = {
  title: 'Saved Prompts | MicroPrompt AI',
  description: 'Your saved AI-generated prompts.',
};

export default async function SavedPromptsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } = {} } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const userId = user.id;

  const fetchSavedPrompts = async (): Promise<FormattedPrompt[]> => {
    const { data, error } = await supabase
      .from('responses')
      .select<string, FetchedResponse>(`
        id,
        input_variables,
        ai_reply,
        created_at,
        prompts:prompt_id(id, category, prompt_text, sub_category, favorite)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    } else {
      const formattedData: FormattedPrompt[] = data.map(item => {
        const originalPromptText = item.prompts?.prompt_text;
        const inputVariables = item.input_variables || {};
        const rawUserInputText = inputVariables.text || '';

        let finalDisplayPrompt = '';

        if (originalPromptText && (originalPromptText.includes('{') || originalPromptText.includes('}'))) {
          finalDisplayPrompt = originalPromptText;
          for (const key in inputVariables) {
            if (Object.prototype.hasOwnProperty.call(inputVariables, key) && key !== 'text' && inputVariables[key] !== undefined) {
              const placeholder = `{${key}}`;
              const value = String(inputVariables[key]);
              finalDisplayPrompt = finalDisplayPrompt.split(placeholder).join(value);
            }
          }
          if (finalDisplayPrompt.includes('{') || finalDisplayPrompt.includes('}')) {
              finalDisplayPrompt = rawUserInputText;
          }
        } else {
          finalDisplayPrompt = rawUserInputText;
        }

        return {
          id: item.id,
          input: finalDisplayPrompt,
          response: item.ai_reply || '',
          category: item.prompts?.category || inputVariables.category || 'Uncategorized',
          timestamp: item.created_at || new Date().toISOString(),
          prompt_text: originalPromptText,
          sub_category: item.prompts?.sub_category || inputVariables.sub_category || undefined,
          favorite: item.prompts?.favorite || false,
        };
      });

      
      const filteredForSavedPromptsPage = formattedData.filter(item => 
        item.prompt_text && (item.prompt_text.includes('{') || item.prompt_text.includes('}'))
      );

      return filteredForSavedPromptsPage;
    }
  };

  const initialPrompts = await fetchSavedPrompts();

  const deletePrompt = async (id: string) => {
    'use server';
    const supabase = await createSupabaseServerClient();
    const { data: { user: actionUser } } = await supabase.auth.getUser();

    if (!actionUser || actionUser.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }

    const { data: responseData, error: fetchResponseError } = await supabase
      .from('responses')
      .select('prompt_id')
      .eq('id', id)
      .single();

    if (fetchResponseError || !responseData) {
      return { success: false, message: "Failed to find associated prompt." };
    }

    const promptIdToDelete = responseData.prompt_id;
    const { error: deleteResponseError } = await supabase.from('responses').delete().eq('id', id);
    const { error: deletePromptError } = await supabase.from('prompts').delete().eq('id', promptIdToDelete);

    if (deleteResponseError || deletePromptError) {
      return { success: false, message: (deleteResponseError || deletePromptError)?.message || "Failed to delete prompt." };
    } else {
      revalidatePath('/dashboard/saved-prompts');
      return { success: true, message: "Prompt deleted successfully." };
    }
  };

  const updatePrompt = async (id: string, updates: { prompt_text?: string; category?: string; sub_category?: string | null; ai_reply?: string | null; favorite?: boolean }) => {
    'use server';

    const supabase = await createSupabaseServerClient();
    const { data: { user: actionUser } } = await supabase.auth.getUser();

    if (!actionUser || actionUser.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }

    const promptUpdates: { prompt_text?: string; category?: string; sub_category?: string | null; favorite?: boolean; } = {};
    const responseUpdates: { ai_reply?: string | null; } = {};

    if (updates.prompt_text !== undefined) promptUpdates.prompt_text = updates.prompt_text;
    if (updates.category !== undefined) promptUpdates.category = updates.category;
    if (updates.sub_category !== undefined) promptUpdates.sub_category = updates.sub_category;
    if (updates.favorite !== undefined) promptUpdates.favorite = updates.favorite;
    if (updates.ai_reply !== undefined) responseUpdates.ai_reply = updates.ai_reply;

    let overallUpdateSuccess = true;
    let errorMessage = "";

    const { data: responseData, error: fetchResponseError } = await supabase
      .from('responses')
      .select('prompt_id')
      .eq('id', id)
      .single();

    if (fetchResponseError || !responseData) {
      return { success: false, message: "Failed to find associated prompt for update." };
    }
    const promptId = responseData.prompt_id;

    if (Object.keys(promptUpdates).length > 0) {
      const { error } = await supabase
        .from('prompts')
        .update(promptUpdates)
        .eq('id', promptId)
        .eq('user_id', userId);

      if (error) {
        overallUpdateSuccess = false;
        errorMessage += `Error updating prompt in prompts table: ${error.message}. `;
      }
    }

    if (Object.keys(responseUpdates).length > 0) {
      const { error } = await supabase
        .from('responses')
        .update(responseUpdates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        overallUpdateSuccess = false;
        errorMessage += `Error updating AI reply in responses table: ${error.message}.`;
      }
    }

    if (!overallUpdateSuccess) {
      return { success: false, message: errorMessage || "Failed to update prompt." };
    } else {
      revalidatePath('/dashboard/saved-prompts');
      return { success: true, message: "Prompt updated successfully." };
    }
  };

  return (
    <>
      <SavedPromptsDashboard
        key={initialPrompts.length > 0 ? initialPrompts[0].id + initialPrompts[0].timestamp : 'no-prompts'}
        userId={userId}
        initialPrompts={initialPrompts}
        onDeletePrompt={deletePrompt}
        onUpdatePrompt={updatePrompt}
      />
    </>
  );
}
