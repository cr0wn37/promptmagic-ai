'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/utils/supabase/server';

async function getUserId() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id;
}

export async function deletePrompt(id: string) {
  const supabase = await createSupabaseServerClient();

  const userId = await getUserId();
  if (!userId) {
    console.error('Unauthorized delete attempt: No user ID found.');
    return { success: false, message: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('responses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting prompt from Supabase:', error);
    return { success: false, message: error.message || 'Failed to delete prompt.' };
  }

  revalidatePath('/dashboard/saved-prompts');
  return { success: true, message: 'Prompt deleted successfully.' };
}

 
export async function updatePrompt(id: string, updates: { prompt_text?: string; category?: string; sub_category?: string | null; ai_reply?: string | null }) {
  const userId = await getUserId();
  if (!userId) {
    console.error("Unauthorized update attempt: No user ID found.");
    return { success: false, message: "Unauthorized" };
  }

  const supabase = await createSupabaseServerClient();


  const promptUpdates: { prompt_text?: string; category?: string; sub_category?: string | null; } = {};
  const responseUpdates: { ai_reply?: string | null; } = {};

  if (updates.prompt_text !== undefined) promptUpdates.prompt_text = updates.prompt_text;
  if (updates.category !== undefined) promptUpdates.category = updates.category;
  if (updates.sub_category !== undefined) promptUpdates.sub_category = updates.sub_category;
  if (updates.ai_reply !== undefined) responseUpdates.ai_reply = updates.ai_reply;

  let updateError: any = null;

  if (Object.keys(promptUpdates).length > 0) {
    const { data: responseData, error: fetchResponseError } = await supabase
      .from('responses')
      .select('prompt_id')
      .eq('id', id)
      .single();

    if (fetchResponseError || !responseData) {
      console.error('Error fetching prompt_id for response:', fetchResponseError);
      return { success: false, message: "Failed to find associated prompt." };
    }
    const promptId = responseData.prompt_id;

    const { error } = await supabase
      .from('prompts')
      .update(promptUpdates)
      .eq('id', promptId)
      .eq('user_id', userId);

    if (error) {
      updateError = error;
      console.error('Error updating prompt in prompts table:', error);
    }
  }

  if (Object.keys(responseUpdates).length > 0 && !updateError) {
    const { error } = await supabase
      .from('responses')
      .update(responseUpdates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      updateError = error;
      console.error('Error updating ai_reply in responses table:', error);
    }
  }

  if (updateError) {
    return { success: false, message: updateError.message || "Failed to update prompt." };
  } else {
    revalidatePath('/dashboard/saved-prompts');
    return { success: true, message: "Prompt updated successfully." };
  }
}


