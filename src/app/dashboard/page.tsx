'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from "@/utils/supabase/client";
import UserDropdown from '@/components/UserDropdown';
import TagFilter from '@/components/TagFilter';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DashboardResponseCard from './components/DashboardResponseCard';
import Link from 'next/link';


import TemplateVariablesModal from '@/app/templates/components/TemplateVariablesModal'; 




interface PromptTableData {
  category: string;
  prompt_text?: string;
  sub_category?: string;
  favorite?: boolean;
}

interface FetchedResponseData {
  id: string;
  input_variables: { text?: string; category?: string; sub_category?: string; [key: string]: any };
  ai_reply: string;
  created_at: string;
  prompts: PromptTableData | null;
}

interface DashboardFormattedItem {
  id: string;
  promptInput: string;
  aiResponse: string;
  category: string;
  subCategory?: string;
  timestamp: string;
  prompt_text_template?: string;
  favorite?: boolean;
  loading?: boolean;
}

interface Persona {
  id: string;
  name: string;
  instructions: string;
}

interface Client {
  id: string;
  client_name: string;
  client_data: any;
}


export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<DashboardFormattedItem[]>([]);
  const [loading, setLoading] = useState(false); 
  const [generatingReplyId, setGeneratingReplyId] = useState<string | null>(null); 
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();
  const categoryFromURL = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState(categoryFromURL);
  const [inputCategory, setInputCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [promptToDeleteId, setPromptToDeleteId] = useState<string | null>(null);

 
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
 
  const [showTemplateVariablesModal, setShowTemplateVariablesModal] = useState(false);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({}); 
  const [currentTemplatePromptText, setCurrentTemplatePromptText] = useState<string>(''); 
  const [currentTemplateCategory, setCurrentTemplateCategory] = useState<string>(''); 

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null); 

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);


  
  const extractVariables = useCallback((template: string): string[] => {
    const regex = /{([a-zA-Z0-9_]+)}/g;
    const matches = [...template.matchAll(regex)];
    return Array.from(new Set(matches.map(match => match[1]))); 
  }, []);

  
  const handleSaveAndGenerateForTemplate = useCallback(async (templateText: string, category: string, variables: Record<string, string>,clientId: string | null) => {
    setLoading(true); 
    const { data: { user }, error: authError } = await supabase.auth.getUser(); 
    if (authError || !user) { 
      console.error('User fetch failed:', authError);
      setLoading(false);
      toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
      router.push('/auth');
      return;
    }
   
    const { data: promptData, error: promptError } = await supabase
      .from('prompts')
      .insert([{ prompt_text: templateText, category: category, user_id: user.id }])
      .select('id, created_at, prompt_text, category');
    if (promptError || !promptData || promptData.length === 0) {
      console.error('❌ Error saving template prompt to prompts table:', promptError);
      toast({ title: "Error saving template", description: promptError?.message || "Failed to save template.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const newPromptId = promptData[0].id;
    const newPromptText = promptData[0].prompt_text;
    const newPromptCategory = promptData[0].category;
    const newPromptCreatedAt = promptData[0].created_at;

   
    let promptForAI = templateText;
    let inputVariablesForDB: Record<string, string> = { text: templateText, category: category, ...variables }; 
  
     const selectedClient = clients.find(c => c.id === selectedClientId);
    const clientContext = selectedClient ? `Client Profile: Name - ${selectedClient.client_name}, Details - ${JSON.stringify(selectedClient.client_data)}` : '';

     if (selectedClient) {
      for (const key in selectedClient.client_data) {
        if (Object.prototype.hasOwnProperty.call(variables, key) && variables[key] === '') {
          variables[key] = String(selectedClient.client_data[key]);
        }
      }
      inputVariablesForDB = { ...inputVariablesForDB, clientContext, ...variables };
    }

    for (const key in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, key) && variables[key] !== undefined) {
        const placeholder = `{${key}}`;
        const value = String(variables[key]);
        promptForAI = promptForAI.split(placeholder).join(value);
      }
    }

    for (const key in inputVariablesForDB) {
      if (Object.prototype.hasOwnProperty.call(inputVariablesForDB, key) && key !== 'text' && inputVariablesForDB[key] !== undefined) {
        const placeholder = `{${key}}`;
        const value = String(inputVariablesForDB[key]);
        promptForAI = promptForAI.split(placeholder).join(value);
      }
    }
    
    if (!templateText.includes('{') && !templateText.includes('}')) {
      promptForAI = templateText;
    }

    promptForAI = `${clientContext}\n${promptForAI}`;

    const selectedPersona = personas.find(p => p.id === selectedPersonaId);
    const personaInstructions = selectedPersona ? selectedPersona.instructions : undefined;

    const finalPromptForAI = `${personaInstructions ? personaInstructions + ' ' : ''}${clientContext}\n${promptForAI}`;

    
    setGeneratingReplyId(newPromptId); 
    let aiReply = '';
    try {
     
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt:finalPromptForAI, category: category, variables: inputVariablesForDB , personaInstructions: personaInstructions }), 
      });
      const result = await response.json();
      aiReply = result?.reply || 'No AI reply returned from Groq.';
      
    } catch (err: any) {
      console.error('Error generating reply for template:', err);
      aiReply = 'Error generating reply for template.';
      toast({ title: "AI Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setGeneratingReplyId(null);
    }
    

    const { data: responseData, error: responseError } = await supabase
      .from('responses')
      .insert([{
        prompt_id: newPromptId,
        user_id: user.id,
        input_variables: inputVariablesForDB, 
        ai_reply: aiReply,
        created_at: newPromptCreatedAt
      }])
      .select();

    if (responseError) {
      console.error('❌ Error saving response for template:', responseError);
      toast({ title: "Error saving AI reply", description: responseError.message, variant: "destructive" });
     
      setSavedPrompts((prev) => [{
        id: newPromptId,
        promptInput: promptForAI,
        aiResponse: '',
        category: newPromptCategory,
        timestamp: newPromptCreatedAt,
        prompt_text_template: templateText,
        favorite: false,
        loading: false,
      }, ...prev]);
      setLoading(false);
      return;
    }
    

    
    setSavedPrompts((prev) => [{
      id: responseData[0].id,
      promptInput: promptForAI,
      aiResponse: aiReply,
      category: newPromptCategory,
      timestamp: responseData[0].created_at,
      prompt_text_template: templateText, 
      favorite: false,
      loading: false,
    }, ...prev]);

    setPrompt(''); 
    setInputCategory(''); 
    toast({
      title: "Template Used!",
      description: "AI response generated and saved.",
      variant: "default",
    });

    setLoading(false);
  }, [generatingReplyId, router, toast, extractVariables, supabase, personas, selectedPersonaId, clients]);
  

const fetchPersonas = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('personas')
      .select('id, name, instructions')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching personas:', error);
    } else {
      setPersonas(data || []);
    }
  }, []);

    const fetchClients = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('id, client_name, client_data')
      .eq('user_id', userId)
      .order('client_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      setClients(data || []);
      
    }
  }, []);


  useEffect(() => {
    const templateFromUrl = searchParams.get('template');
    const categoryFromTemplateUrl = searchParams.get('category');
    
    
     const clientIdFromUrl = searchParams.get('clientId'); 
    const variablesFromUrl = searchParams.get('variables');

    if (templateFromUrl) {
      const decodedTemplate = decodeURIComponent(templateFromUrl);
      const decodedCategory = categoryFromTemplateUrl ? decodeURIComponent(categoryFromTemplateUrl) : '';
      const decodedClientId = clientIdFromUrl ? decodeURIComponent(clientIdFromUrl) : null;
      const decodedVariables = variablesFromUrl ? JSON.parse(decodeURIComponent(variablesFromUrl)) : {};
  
      
      setCurrentTemplatePromptText(decodedTemplate);
      setCurrentTemplateCategory(decodedCategory);
      setSelectedCategory(decodedCategory);
      setSelectedClientId(decodedClientId);


      if (clientIdFromUrl) {
        setSelectedClientId(clientIdFromUrl);
      } else {
        setSelectedClientId(null);
      }

    
      let extractedVars: string[] = [];
      let initialVars: Record<string, string> = {};

      if (variablesFromUrl) {
        initialVars = JSON.parse(decodeURIComponent(variablesFromUrl));
        extractedVars = Object.keys(initialVars);
      } else {
        extractedVars = extractVariables(decodedTemplate);
      }

      if (extractedVars.length > 0) {
      if (!variablesFromUrl) {
          extractedVars.forEach(v => { initialVars[v] = ''; });
        }
        setTemplateVariables(initialVars);
        setShowTemplateVariablesModal(true); 
       
      } else {
        
        setPrompt(decodedTemplate);
        setInputCategory(decodedCategory);
        setSelectedCategory(decodedCategory);
       handleSaveAndGenerateForTemplate(decodedTemplate, decodedCategory, decodedVariables, decodedClientId);
      
      }
      router.replace(pathname);
    }
  }, [searchParams, router, pathname, extractVariables,  handleSaveAndGenerateForTemplate, clients, personas, selectedPersonaId]);


  useEffect(() => {
    setSelectedCategory(categoryFromURL);
  }, [categoryFromURL]);

  // Fetch prompts on component mount
  useEffect(() => {
    const fetchUserPrompts = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser(); 
      if (user) {
        fetchPrompts(user);
       fetchPersonas(user.id);
       fetchClients(user.id); 
      
        const hasSeenWelcome = localStorage.getItem(`welcomeModalSeen_${user.id}`);
        if (!hasSeenWelcome) {
          setShowWelcomeModal(true);
        }
      } else {
        console.warn("User not found in client-side Dashboard page. Layout should have redirected.");
        router.push('/auth');
      }
    };
    fetchUserPrompts();
  }, [router, toast, fetchPersonas , fetchClients]);
  


  const handleDismissWelcome = useCallback(() => {
    setShowWelcomeModal(false);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        localStorage.setItem(`welcomeModalSeen_${user.id}`, 'true');
      }
    });
  }, [supabase]);

  const fetchPrompts = useCallback(async (user: any) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('responses')
      .select<string, FetchedResponseData>(`
        id,
        input_variables,
        ai_reply,
        created_at,
        prompts:prompt_id(category, prompt_text, sub_category, favorite)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: "Error fetching prompts",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

 
      const enhanced: DashboardFormattedItem[] = data.map(item => {
      const originalTemplate = item.prompts?.prompt_text;
      const inputVariables = item.input_variables || {};
      const rawUserInputText = inputVariables.text || '';
      let finalDisplayPrompt = '';

      if (originalTemplate && originalTemplate.includes('{') && originalTemplate.includes('}')) {
        finalDisplayPrompt = originalTemplate;
        for (const key in inputVariables) {
          if (Object.prototype.hasOwnProperty.call(inputVariables, key) && key !== 'text' && inputVariables[key] !== undefined) {
            const placeholder = `{${key}}`;
            const value = String(inputVariables[key]);
            finalDisplayPrompt = finalDisplayPrompt.split(placeholder).join(value);
          }
        }
        if (finalDisplayPrompt.includes('{') && finalDisplayPrompt.includes('}')) {
            finalDisplayPrompt = rawUserInputText;
        }
      } else {
        finalDisplayPrompt = rawUserInputText;
      }

      return {
        id: item.id,
        promptInput: finalDisplayPrompt,
        aiResponse: item.ai_reply || '',
        category: item.prompts?.category || inputVariables.category || 'Uncategorized',
        subCategory: item.prompts?.sub_category || inputVariables.sub_category || undefined,
        timestamp: item.created_at || new Date().toISOString(),
        prompt_text_template: originalTemplate,
        favorite: item.prompts?.favorite || false,
        loading: false,
      };
    });

    setSavedPrompts(enhanced);
    setLoading(false);
  }, [toast]);

  const handleSavePrompt = useCallback(async () => {
    if (!prompt.trim() || !inputCategory.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter prompt text and select a category.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('User fetch failed:', authError);
      setLoading(false);
      router.push('/auth');
      toast({
        title: "Authentication Error",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

    const { data: promptData, error: promptError } = await supabase
      .from('prompts')
      .insert([{ prompt_text: prompt.trim(), category: inputCategory, user_id: user.id }])
      .select('id, created_at, prompt_text, category');

    if (promptError || !promptData || promptData.length === 0) {
      console.error('❌ Error saving prompt to prompts table:', promptError);
      toast({
        title: "Error saving prompt",
        description: promptError?.message || "Failed to save prompt.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    const newPromptId = promptData[0].id;
    const newPromptText = promptData[0].prompt_text;
    const newPromptCategory = promptData[0].category;
    const newPromptCreatedAt = promptData[0].created_at;

    const selectedPersona = personas.find(p => p.id === selectedPersonaId);
    const personaInstructions = selectedPersona ? selectedPersona.instructions : undefined;
    
    
    const selectedClient = clients.find(c => c.id === selectedClientId);
    const clientContext = selectedClient ? `Client Profile: Name - ${selectedClient.client_name}, Details - ${JSON.stringify(selectedClient.client_data)}` : '';

    const finalPromptForAI = `${clientContext}\n${newPromptText}`;


   
    const { data: responseData, error: responseError } = await supabase
      .from('responses')
      .insert([{
        prompt_id: newPromptId,
        user_id: user.id,
        input_variables: { text: newPromptText, category: newPromptCategory },
        ai_reply: '',
        created_at: newPromptCreatedAt
      }])
      .select();


    if (responseError) {
      console.error('❌ Error saving response to responses table:', responseError);
      await supabase.from('prompts').delete().eq('id', newPromptId);
      toast({
        title: "Error saving response",
        description: responseError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

  

    setSavedPrompts((prev) => [{
      id: responseData[0].id,
      promptInput: newPromptText,
      aiResponse: '',
      category: newPromptCategory,
      timestamp: responseData[0].created_at,
      prompt_text_template: newPromptText,
      favorite: false,
      loading: false,
    }, ...prev]);

    setPrompt('');
    setInputCategory('');
    toast({
      title: "Prompt Saved!",
      description: "Your new prompt has been successfully saved.",
      variant: "default",
    });
    setLoading(false);
  }, [prompt, inputCategory, router, toast, supabase , personas, selectedPersonaId, clients, selectedClientId]);

  const confirmDelete = useCallback((id: string) => {
    setPromptToDeleteId(id);
    setShowConfirmDeleteDialog(true);

  }, []);
const executeDelete = useCallback(async () => {
    if (promptToDeleteId) {
    
      setSavedPrompts(prevPrompts => prevPrompts.filter(p => p.id !== promptToDeleteId));
      setShowConfirmDeleteDialog(false); 

  
      const { data: responseData, error: fetchResponseError } = await supabase
        .from('responses')
        .select('prompt_id')
        .eq('id', promptToDeleteId)
        .single();

      if (fetchResponseError || !responseData) {
        console.error('Error fetching prompt_id for response during delete:', fetchResponseError);
        toast({ title: "Delete Error", description: "Could not find prompt to delete.", variant: "destructive" });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) fetchPrompts(user); 
        return;
      }

      const promptIdToDelete = responseData.prompt_id;

     
      const { error: deleteResponseError } = await supabase
        .from('responses')
        .delete()
        .eq('id', promptToDeleteId);

      
      const { error: deletePromptError } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptIdToDelete);

      if (deleteResponseError || deletePromptError) {
        console.error('Error deleting from responses:', deleteResponseError);
        console.error('Error deleting from prompts:', deletePromptError);
        toast({
          title: "Error deleting prompt",
          description: (deleteResponseError || deletePromptError)?.message || "Failed to delete prompt.",
          variant: "destructive",
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) fetchPrompts(user); 
      } else {
        toast({
          title: "Prompt Deleted!",
          description: "The prompt has been successfully removed.",
          variant: "default",
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        
      }
      setPromptToDeleteId(null);
    }
  }, [promptToDeleteId, fetchPrompts, toast, supabase ]);

  
  const handleToggleBookmark = useCallback(async (id: string, newStatus: boolean) => {
    const responseItem = savedPrompts.find(p => p.id === id);
    if (!responseItem) {
      console.error("Could not find response item for bookmark toggle.");
      toast({ title: "Bookmark Error", description: "Could not find prompt data.", variant: "destructive" });
      return;
    }
    const { data: responseData, error: fetchResponseError } = await supabase
      .from('responses')
      .select('prompt_id')
      .eq('id', id)
      .single();
    if (fetchResponseError || !responseData) {
      console.error('Error fetching prompt_id for bookmark toggle:', fetchResponseError);
      toast({ title: "Bookmark Error", description: "Failed to locate prompt for bookmark.", variant: "destructive" });
      return;
    }
    const promptIdToUpdate = responseData.prompt_id;
    const { error } = await supabase.from('prompts').update({ favorite: newStatus }).eq('id', promptIdToUpdate);
    if (error) {
      console.error('Error updating bookmark status:', error);
      toast({
        title: "Error updating bookmark",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSavedPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, favorite: newStatus } : p))
      );
      toast({
        title: "Bookmark Updated",
        description: `Prompt ${newStatus ? 'bookmarked' : 'unbookmarked'}.`,
        variant: "default",
      });
    }
  }, [savedPrompts, toast, supabase]);

  const handleGenerateReply = useCallback(async (responseId: string, promptText: string, category?: string) => {
    if (generatingReplyId === responseId) return;
    setGeneratingReplyId(responseId);
    setSavedPrompts((prev) =>
      prev.map((p) => (p.id === responseId ? { ...p, loading: true, aiResponse: '' } : p))
    );

    let aiReply = '';
    try {
      const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
        toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
        router.push('/auth');
        return;
      }

      const selectedPersona = personas.find(p => p.id === selectedPersonaId);
      const personaInstructions = selectedPersona ? selectedPersona.instructions : undefined;

      const selectedClient = clients.find(c => c.id === selectedClientId);
      const clientContext = selectedClient ? `Client Profile: Name: ${selectedClient.client_name}, Age: ${selectedClient.client_data.age}, Goal: ${selectedClient.client_data.goal}, Notes: ${selectedClient.client_data.notes}` : '';

     
      const finalPromptForAI = `${personaInstructions ? personaInstructions + ' ' : ''}${clientContext}\n${promptText}`;

     
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  prompt: finalPromptForAI,
          category: category,
          personaInstructions: personaInstructions }),
      });

      if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 403) {
      
      toast({
        title: "No credits left!",
        description: "Upgrade to Pro for more credits!",
        variant: "destructive",
      });
    } else {
      
      toast({
        title: "Error generating reply",
        description: errorData.error || "An unexpected error occurred.",
        variant: "destructive",
      });
    }

    // Set loading to false and return early to stop further execution
    setSavedPrompts((prev) =>
      prev.map((p) => (p.id === responseId ? { ...p, loading: false, aiResponse: 'Failed to generate reply.' } : p))
    );
    setGeneratingReplyId(null);
    return; // Exit the function here
}

      const result = await response.json();
      const reply = result?.reply || 'No AI reply returned from Groq';
      

      const { error: updateError } = await supabase
        .from('responses')
        .update({ ai_reply: reply })
        .eq('id', responseId);
      if (updateError) {
        console.error('Error updating AI reply in DB:', updateError);
        toast({
          title: "Error saving AI reply",
          description: updateError.message,
          variant: "destructive",
        });
      }
      setSavedPrompts((prev) =>
        prev.map((p) => (p.id === responseId ? { ...p, aiResponse: reply, loading: false } : p))
      );
      toast({
        title: "AI Reply Generated!",
        description: "The AI has provided a response.",
        variant: "default",
      });
    } catch (err: any) {
      console.error('Error generating reply:', err);
      toast({
        title: "Error generating AI reply",
        description: err.message,
        variant: "destructive",
      });
      setSavedPrompts((prev) =>
        prev.map((p) => (p.id === responseId ? { ...p, loading: false, aiResponse: 'Error generating reply.' } : p))
      );
    } finally {
      setGeneratingReplyId(null);
    }
  }, [generatingReplyId, toast, supabase, personas, selectedPersonaId, clients, selectedClientId]);

  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      router.push('/');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
    }
  }, [router, toast, supabase]);
  const allCategories = [
    'All', 'Fitness', 'Therapy', 'Marketing', 'HR', 'Education',
    'Productivity', 'Sales', 'Creative Writing', 'Finance', 'General'
  ];

  const filteredPrompts = savedPrompts
    .filter((p) => {
      const isUserCreatedPrompt = !p.prompt_text_template || (!p.prompt_text_template.includes('{') && !p.prompt_text_template.includes('}'));
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesBookmarked = !showBookmarkedOnly || p.favorite;
      const matchesSearch = searchTerm.trim() === '' ||
        p.promptInput.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.aiResponse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase());    
      return isUserCreatedPrompt && matchesCategory && matchesBookmarked && matchesSearch;
    });

 return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Prompts</h1>
            <div className="flex items-center space-x-4">
       
        <Link href="/dashboard/activity" passHref>
          <button
            className="px-4 py-2.5 bg-mint-palette-200 text-mint-palette-700 font-semibold rounded-full shadow-md hover:bg-mint-palette-300 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Your Activity
            </span>
          </button>
        </Link>
                <Link href="/dashboard/personas" passHref>
          <button
            className="px-4 py-2.5 bg-mint-palette-200 text-mint-palette-700 font-semibold rounded-full shadow-md hover:bg-mint-palette-300 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Manage Personas
            </span>
          </button>
        </Link>
        <Link href="/dashboard/clients" passHref>
  <button
    className="px-4 py-2.5 bg-mint-palette-200 text-mint-palette-700 font-semibold rounded-full shadow-md hover:bg-mint-palette-300 transition-all duration-300 transform hover:-translate-y-0.5"
  >
    <span className="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-circle">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="10" r="3"/>
        <path d="M6 20c1.5-3 4.5-5 6-5s4.5 2 6 5"/>
      </svg>
      Manage Clients
    </span>
  </button>
</Link>
        
        <UserDropdown onLogout={handleLogout} />
      </div>
      </header>

      

      <section className="bg-mint-palette-50 dark:bg-mint-palette-800 rounded-2xl shadow-xl p-6 mb-8 border border-mint-palette-200 dark:border-mint-palette-700 transition-all duration-300 transform hover:scale-[1.005]">
        <h2 className="text-xl font-semibold text-mint-palette-700 dark:text-mint-palette-200 mb-4 flex items-center gap-2">
          📝 Create New Prompt
        </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt text here..."
              className="w-full rounded-lg border border-mint-palette-300 dark:border-mint-palette-700 bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 placeholder-mint-palette-400 dark:placeholder-mint-palette-300 focus:outline-none focus:ring-2 focus:ring-mint-palette-400 focus:border-transparent transition"
              rows={4}
            />
          </div>
          
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-full"> 
           
            <div>
              <label htmlFor="persona-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select AI Persona (Optional)
              </label>
              <select
                id="persona-select"
                value={selectedPersonaId || ''}
                onChange={(e) => setSelectedPersonaId(e.target.value)}
                className="w-full border border-mint-palette-300 dark:border-mint-palette-700 rounded-lg bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-palette-400 appearance-none pr-8 transition"
              >
                <option value="">Default Persona</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
              </select>
            </div>

         
            <div>
              <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Client Profile (Optional)
              </label>
              <select
                id="client-select"
                value={selectedClientId || ''}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full border border-mint-palette-300 dark:border-mint-palette-700 rounded-lg bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-palette-400 appearance-none pr-8 transition"
              >
                <option value="">No Client Selected</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.client_name}
                  </option>
                ))}
              </select>
            </div>

         
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
               Category
              </label>
              <select
                id="category-select"
                value={inputCategory}
                onChange={(e) => setInputCategory(e.target.value)}
                className="w-full border border-mint-palette-300 dark:border-mint-palette-700 rounded-lg bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-palette-400 appearance-none pr-8 transition"
              >
                <option value="">Select Category</option>
                {allCategories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
        </div> 

       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
         
          <div>
            <button
              onClick={handleSavePrompt}
              disabled={loading}
             className="w-full bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? 'Saving...' : 'Save Prompt'}
            </button>
          </div>
          
         
          <div className="flex flex-col sm:flex-row gap-4 items-center md:justify-end">
            <div className="relative flex-1 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search saved prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border border-mint-palette-300 dark:border-mint-palette-700 rounded-lg bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 placeholder-mint-palette-400 dark:placeholder-mint-palette-300 focus:outline-none focus:ring-2 focus:ring-mint-palette-400 focus:border-transparent transition"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-mint-palette-500 dark:text-mint-palette-300 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 flex-shrink-0">
              <input
                type="checkbox"
                checked={showBookmarkedOnly}
                onChange={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              />
              🔖 Show Bookmarked Only
            </label>
          </div>
          </div> 
      </section>

   
     <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 shadow-sm">
  {allCategories.map((cat) => (
    <button
      key={cat}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        selectedCategory === cat
          ? 'bg-emerald-700 text-white shadow-md'
          : 'bg-emerald-200 text-emerald-700 hover:bg-emerald-300 dark:bg-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-600'
      }`}
      onClick={() => setSelectedCategory(cat)}
    >
      {cat}
    </button>
  ))}
</div>

     
      <div className="scroll-container-y grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {loading && savedPrompts.length === 0 ? (
          <p className="col-span-full text-center text-gray-600 dark:text-gray-400 text-lg py-10">Loading prompts...</p>
        ) : filteredPrompts.length === 0 ? (
          <p className="col-span-full text-center text-gray-600 dark:text-gray-400 text-lg py-10">No prompts found matching your criteria.</p>
        ) : (
          filteredPrompts.map((p) => (
            <DashboardResponseCard
              key={p.id}
              id={p.id}
              promptInput={p.promptInput} 
              aiResponse={p.aiResponse}
              category={p.category}
              subCategory={p.subCategory}
              timestamp={p.timestamp}
              onDelete={confirmDelete} 
              onGenerateReply={(id, promptText) => handleGenerateReply(id, promptText, p.category)} 
              onToggleBookmark={handleToggleBookmark} 
              isGenerating={generatingReplyId === p.id} 
              isBookmarked={p.favorite} 
            />
          ))
        )}
      </div>
      <AlertDialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your prompt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPromptToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TemplateVariablesModal
        isOpen={showTemplateVariablesModal}
        onClose={() => setShowTemplateVariablesModal(false)}
        variables={templateVariables}
        onSaveAndGenerate={(vars, clientId) => handleSaveAndGenerateForTemplate(currentTemplatePromptText, currentTemplateCategory, vars, clientId)}
        templateText={currentTemplatePromptText}
        category={currentTemplateCategory}
        isGenerating={!!generatingReplyId}
        clients={clients}
      />
    </div>
  );
}