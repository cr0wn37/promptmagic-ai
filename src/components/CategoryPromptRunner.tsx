'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type VarsRecord = Record<string, string>; // key: variable name, value: label/placeholder

interface Prompt {
  id: string;
  prompt_text: string;
  category: string;
  sub_category?: string;
  variables: VarsRecord; // ✅ keep as record
  ai_reply?: string;
  loading?: boolean;
}

interface Client {
  id: string;
  client_name: string;
  client_data: Record<string, any>;
}

interface CategoryPromptRunnerProps {
  category: string;
}

export default function CategoryPromptRunner({ category }: CategoryPromptRunnerProps) {
  const [allPromptsForCategory, setAllPromptsForCategory] = useState<Prompt[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [aiResponse, setAiResponse] = useState('');
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [runningPrompt, setRunningPrompt] = useState(false);
  const [savingResponse, setSavingResponse] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const { toast } = useToast();

  const subCategoriesMap: Record<string, string[]> = {
    Fitness: ['All', 'Workout', 'Diet', 'Motivation', 'Coaching'],
    Marketing: ['All', 'Social Media', 'Content Ideas', 'Email Campaigns', 'SEO'],
    HR: ['All', 'Interview Questions', 'Job Descriptions', 'Onboarding/Offboarding', 'Performance Reviews', 'Professional Development'],
    Therapy: ['All', 'Self-Reflection', 'Coping Strategies', 'Journal Prompts', 'Mindfulness'],
    Education: ['All', 'Lesson Plans', 'Study Guides', 'Quiz Questions', 'Summaries'],
    Productivity: ['All', 'Goal Setting', 'Time Management', 'Task Planning', 'Habit Building'],
    Sales: ['All', 'Sales Pitches', 'Follow-up Emails', 'Objection Handling', 'Lead Qualification', 'Closing'],
    'Creative Writing': ['All', 'Story Prompts', 'Poetry Ideas', 'Character Development', 'World Building'],
    Finance: ['All', 'Budgeting', 'Investment Tips', 'Debt Management', 'Financial Planning'],
    General: ['All'],
  };

  const currentSubCategories = subCategoriesMap[category] || ['All'];

  // --- helpers ---------------------------------------------------------------

  // Title-case helper for auto-generated labels
  const humanize = (s: string) =>
    s.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.slice(1));

  // Ensure variables are always a record (convert from string[] if needed)
  const coerceVarsToRecord = (vars: unknown): VarsRecord => {
    if (Array.isArray(vars)) {
      const rec: VarsRecord = {};
      for (const v of vars) {
        const key = String(v).trim();
        rec[key] = humanize(key);
      }
      return rec;
    }
    if (vars && typeof vars === 'object') {
      // already a record
      return vars as VarsRecord;
    }
    return {};
  };

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  // Prefill inputs for given keys using client_data
  const prefillFromClient = (client: Client, variableKeys: string[]) => {
    const updated: Record<string, string> = {};
    for (const key of variableKeys) {
      const v = client?.client_data?.[key];
     if (v !== undefined && v !== null) {
        updated[key] = String(v);
      } else if (key === 'client_name') { // FIX: Handle client_name separately
        updated[key] = client.client_name;
      } else {
        // Keep existing value if any
        updated[key] = inputValues[key] ?? '';
      }
    }
    setInputValues((prev) => ({ ...prev, ...updated }));
  };

  // --- data fetching ---------------------------------------------------------

  useEffect(() => {
    async function fetchData() {
      setLoadingPrompts(true);
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;

      // prompts query
      let promptsQuery = supabase
        .from('prompts')
        .select('id, prompt_text, category, sub_category, variables')
        .eq('category', category);

      if (currentUserId) {
        promptsQuery = promptsQuery.or(`user_id.eq.${currentUserId},user_id.is.null`);
      } else {
        promptsQuery = promptsQuery.is('user_id', null);
      }

      const [{ data: promptsData, error: promptsError }, { data: clientsData, error: clientsError }] =
        await Promise.all([
          promptsQuery,
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
        ]);

      if (promptsError) {
        console.error(`Error fetching prompts for ${category}:`, promptsError);
        toast({
          title: `Error fetching ${category} prompts`,
          description: promptsError.message,
          variant: 'destructive',
        });
      } else {
        const formatted = (promptsData || []).map((p: any) => ({
          ...p,
          variables: coerceVarsToRecord(p.variables),
          sub_category: p.sub_category || 'Uncategorized',
        })) as Prompt[];
        setAllPromptsForCategory(formatted);
      }

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      } else {
        setClients(clientsData || []);
      }

      setLoadingPrompts(false);
    }
    fetchData();
  }, [category, toast]);

  // Filter prompts by selected sub-category
  const filteredPrompts =
    selectedSubCategory === 'All'
      ? allPromptsForCategory
      : allPromptsForCategory.filter((p) => p.sub_category === selectedSubCategory);

  // --- actions ---------------------------------------------------------------

  const handleRunPrompt = async () => {
    if (!selectedPrompt) {
      toast({ title: 'Selection Required', description: 'Please select a prompt first.', variant: 'destructive' });
      return;
    }

    const requiredKeys = Object.keys(selectedPrompt.variables || {});
    const finalVals = { ...inputValues };

    // Validate
    for (const key of requiredKeys) {
      if (!finalVals[key] || finalVals[key].trim() === '') {
        toast({
          title: 'Missing Information',
          description: `Please fill in: ${humanize(key)}.`,
          variant: 'destructive',
        });
        return;
      }
    }

    setRunningPrompt(true);
    setAiResponse('');

    try {
      // Attach client context (also pass separately if your API uses it)
      const clientContext = selectedClient
        ? `Client Profile:\n- Name: ${selectedClient.client_name}\n- Data: ${JSON.stringify(
            selectedClient.client_data
          )}\n\n`
        : '';

      // Replace {var} with user values
      const finalPromptForAI = `${clientContext}${selectedPrompt.prompt_text.replace(
        /{(\w+)}/g,
        (_, key: string) => finalVals[key] ?? `{${key}}`
      )}`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPromptForAI,
          category,
          variables: finalVals,
          client: selectedClient, // optional: for backend routing/context
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown API error');

      setAiResponse(data.reply || 'No response from AI');
      toast({ title: 'AI Response Generated!', description: 'The AI has provided a response.' });
    } catch (err: any) {
      console.error('Run Prompt Error:', err);
      setAiResponse('❌ ' + (err.message || 'Failed to fetch response'));
      toast({ title: 'Error', description: err.message || 'Failed to fetch response', variant: 'destructive' });
    } finally {
      setRunningPrompt(false);
    }
  };

  const handleSaveResponse = async () => {
    if (!selectedPrompt || !aiResponse) {
      toast({ title: 'Action Required', description: 'Please generate an AI response first.', variant: 'destructive' });
      return;
    }
    setSavingResponse(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        toast({ title: 'Authentication Required', description: 'Please log in to save your response.', variant: 'destructive' });
        return;
      }
      const { error: saveError } = await supabase.from('responses').insert({
        prompt_id: selectedPrompt.id,
        input_variables: inputValues,
        ai_reply: aiResponse,
        user_id: userData.user.id,
      });
      if (saveError) throw saveError;

      toast({ title: 'Response Saved!', description: 'Your AI response has been successfully saved.' });
    } catch (err: any) {
      console.error('Save Response Error:', err);
      toast({ title: 'Error Saving Response', description: err.message, variant: 'destructive' });
    } finally {
      setSavingResponse(false);
    }
  };

  // When a client is chosen, prefill any matching fields
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId || !selectedPrompt) return;
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      prefillFromClient(client, Object.keys(selectedPrompt.variables || {}));
    }
  };

  // --- UI --------------------------------------------------------------------

  return (
    <div className="bg-white/50 dark:bg-mint-palette-900/50 backdrop-blur-md rounded-xl shadow-xl p-6 border border-mint-palette-200 dark:border-mint-palette-700">
      {/* Client select (optional) */}
      <div className="flex justify-end">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Client (Optional)</label>
        <select
          value={selectedClientId || ''}
          onChange={(e) => handleSelectClient(e.target.value)}
           className="w-full border border-mint-palette-300 rounded-lg p-2 bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-mint-palette-400 focus:border-transparent"
        >
          <option value="">No Client Selected</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.client_name}
            </option>
          ))}
        </select>
      </div>
      </div>

      {/* Sub-category Tabs */}
<div className="flex flex-wrap gap-2 mb-6 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 shadow-inner">
  {currentSubCategories.map((cat) => (
    <button
      key={cat}
      onClick={() => {
        setSelectedSubCategory(cat);
        setSelectedPrompt(null);
        setInputValues({});
        setAiResponse('');
      }}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
        selectedSubCategory === cat
          ? 'bg-emerald-700 text-white shadow-md'
          : 'bg-transparent text-emerald-700 hover:bg-emerald-200 dark:text-emerald-200 dark:hover:bg-emerald-700'
      }`}
    >
      {cat}
    </button>
  ))}
</div>

      {/* Prompt grid */}
      {loadingPrompts ? (
        <p className="text-center text-mint-palette-600 dark:text-mint-palette-400 text-lg py-10">Loading prompts...</p>
      ) : filteredPrompts.length === 0 ? (
        <p className="text-center text-mint-palette-600 dark:text-mint-palette-400 text-lg py-10">
          No {selectedSubCategory !== 'All' ? `${selectedSubCategory.toLowerCase()} ` : ''}prompts available for {category}. Please add some to your Supabase
          &lsquo;prompts&rsquo; table with category &lsquo;{category}&rsquo; and appropriate sub-category.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredPrompts.map((promptItem) => {
            const isOpen = selectedPrompt?.id === promptItem.id;
            return (
              <React.Fragment key={promptItem.id}>
                <div
                  onClick={() => {
                    setSelectedPrompt(promptItem);
                    setAiResponse('');
                    // Prepare inputs on open
                    const keys = Object.keys(promptItem.variables || {});
                    const initial: Record<string, string> = {};
                    for (const k of keys) initial[k] = '';
                    setInputValues(initial);
                    if (selectedClient) prefillFromClient(selectedClient, keys);
                  }}
                  className={`relative bg-mint-palette-100/70 dark:bg-mint-palette-800/70 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-mint-palette-300 dark:border-mint-palette-700 cursor-pointer transition-all duration-300 transform hover:scale-[1.03] group flex flex-col justify-between min-h-[180px] md:min-h-[200px] overflow-hidden ${
                    isOpen ? 'ring-2 ring-mint-palette-500 border-mint-palette-500' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-mint-palette-200/20 to-mint-palette-400/20 dark:from-transparent dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-mint-palette-700 dark:text-mint-palette-200 font-semibold text-base mb-2 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                      {promptItem.prompt_text}
                    </h3>
                    <div className="flex justify-between items-end mt-auto">
                      {promptItem.sub_category && (
                        <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-mint-palette-300 text-mint-palette-800 dark:bg-mint-palette-600 dark:text-mint-palette-100">
                          {promptItem.sub_category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="col-span-full mt-4 p-6 bg-mint-palette-100 dark:bg-mint-palette-800 rounded-xl shadow-xl border border-mint-palette-300 dark:border-mint-palette-700 animate-fade-in-up">
                    <h3 className="text-xl font-bold text-mint-palette-700 dark:text-mint-palette-200 mb-4">Run: {promptItem.prompt_text}</h3>

                    {Object.keys(promptItem.variables || {}).length > 0 && (
                      <div className="space-y-4 mb-6">
                        <p className="text-mint-palette-600 dark:text-mint-palette-300 text-sm font-medium">Fill in the details:</p>
                        {Object.keys(promptItem.variables || {}).map((variable) => (
                          <div key={variable}>
                            <label
                              htmlFor={variable}
                              className="block text-sm font-medium text-mint-palette-600 dark:text-mint-palette-300 mb-1 capitalize"
                            >
                              {promptItem.variables[variable] || humanize(variable)}:
                            </label>
                            <input
                              type="text"
                              id={variable}
                              value={inputValues[variable] || ''}
                              onChange={(e) =>
                                setInputValues((prev) => ({
                                  ...prev,
                                  [variable]: e.target.value,
                                }))
                              }
                              className="w-full p-2.5 border border-mint-palette-300 dark:border-mint-palette-600 rounded-md bg-mint-palette-50 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-mint-palette-400 transition"
                              placeholder={`Enter ${humanize(variable)}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleRunPrompt}
                      disabled={runningPrompt}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transform hover:-translate-y-0.5">
                      {runningPrompt ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        'Run Prompt'
                      )}
                    </button>

                    {aiResponse && (
                      <div className="mt-6 p-4 bg-mint-palette-200/70 dark:bg-mint-palette-700/70 backdrop-blur-sm rounded-lg border border-mint-palette-400 dark:border-mint-palette-600 text-mint-palette-800 dark:text-mint-palette-100 whitespace-pre-wrap shadow-inner animate-fade-in-up">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">🤖 AI Response:</h4>
                        <div className="text-sm prose dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResponse}</ReactMarkdown>
                        </div>
                        <button
                          onClick={handleSaveResponse}
                          disabled={savingResponse}
                          className="mt-4 w-full bg-mint-palette-600 hover:bg-mint-palette-700 text-white font-semibold py-2.5 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transform hover:-translate-y-0.5"
                        >
                          {savingResponse ? 'Saving...' : 'Save Response'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
