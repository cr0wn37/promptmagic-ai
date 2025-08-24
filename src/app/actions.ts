'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Get the user ID from the cookies
async function getUserId() {
  const supabaseServer = createServerComponentClient({ cookies: () => cookies() });
  const { data: { user } } = await supabaseServer.auth.getUser();
  return user?.id;
}

// Server Action for deleting a prompt
export async function deletePrompt(id: string) {
  const userId = await getUserId();
  if (!userId) {
    console.error("Unauthorized delete attempt: No user ID found.");
    return { success: false, message: "Unauthorized" };
  }

  const supabaseServer = createServerComponentClient({ cookies: () => cookies() });
  const { error } = await supabaseServer
    .from('responses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting prompt from Supabase:', error);
    return { success: false, message: error.message || "Failed to delete prompt." };
  } else {
    console.log('Server Action: Prompt deleted successfully in DB. Calling revalidatePath.');
    revalidatePath('/dashboard/saved-prompts');
    return { success: true, message: "Prompt deleted successfully." };
  }
}

// Server Action for updating a prompt
export async function updatePrompt(id: string, updates: { prompt_text?: string; category?: string; sub_category?: string | null; ai_reply?: string | null }) {
  const userId = await getUserId();
  if (!userId) {
    console.error("Unauthorized update attempt: No user ID found.");
    return { success: false, message: "Unauthorized" };
  }

  const supabaseServer = createServerComponentClient({ cookies: () => cookies() });

  const promptUpdates: { prompt_text?: string; category?: string; sub_category?: string | null; } = {};
  const responseUpdates: { ai_reply?: string | null; } = {};

  if (updates.prompt_text !== undefined) promptUpdates.prompt_text = updates.prompt_text;
  if (updates.category !== undefined) promptUpdates.category = updates.category;
  if (updates.sub_category !== undefined) promptUpdates.sub_category = updates.sub_category;
  if (updates.ai_reply !== undefined) responseUpdates.ai_reply = updates.ai_reply;

  let updateError: any = null;

  if (Object.keys(promptUpdates).length > 0) {
    const { data: responseData, error: fetchResponseError } = await supabaseServer
      .from('responses')
      .select('prompt_id')
      .eq('id', id)
      .single();

    if (fetchResponseError || !responseData) {
      console.error('Error fetching prompt_id for response:', fetchResponseError);
      return { success: false, message: "Failed to find associated prompt." };
    }
    const promptId = responseData.prompt_id;

    const { error } = await supabaseServer
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
    const { error } = await supabaseServer
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


