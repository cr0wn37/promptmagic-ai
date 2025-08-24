'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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

interface SavedPromptsDashboardProps {
  userId: string;
  initialPrompts: FormattedPrompt[];
  onDeletePrompt: (id: string) => Promise<{ success: boolean; message: string }>;
  onUpdatePrompt: (id: string, updates: { prompt_text?: string; category?: string; sub_category?: string | null; ai_reply?: string | null }) => Promise<{ success: boolean; message: string }>;
}

const MAX_AI_RESPONSE_LENGTH = 150;

const SavedPromptsDashboard: React.FC<SavedPromptsDashboardProps> = ({ userId, initialPrompts, onDeletePrompt, onUpdatePrompt }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [savedPrompts, setSavedPrompts] = useState<FormattedPrompt[]>(initialPrompts || []); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDate, setFilterDate] = useState('All');
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);

  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [promptToDeleteId, setPromptToDeleteId] = useState<string | null>(null);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<FormattedPrompt | null>(null);
  const [editPromptText, setEditPromptText] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editAiReply, setEditAiReply] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const categories = ['All', 'Fitness', 'HR', 'Marketing', 'Therapy', 'Education', 'Finance', 'Creative Writing', 'Sales', 'Productivity', 'General'];

  const allSubCategories = [
    'Uncategorized', 'Workout', 'Diet', 'Motivation', 'Coaching',
    'Social Media', 'Content Ideas', 'Email Campaigns', 'SEO',
    'Interview Questions', 'Job Descriptions', 'Onboarding/Offboarding', 'Performance Reviews', 'Professional Development', 
    'Self-Reflection', 'Coping Strategies', 'Journal Prompts', 'Mindfulness',
    'Lesson Plans', 'Study Guides', 'Quiz Questions', 'Summaries',
    'Goal Setting', 'Time Management', 'Task Planning', 'Habit Building',
    'Sales Pitches', 'Follow-up Emails', 'Objection Handling', 'Lead Qualification','Closing',
    'Story Prompts', 'Poetry Ideas', 'Character Development', 'World Building',
    'Budgeting', 'Investment Tips', 'Debt Management', 'Financial Planning',
    'Stress Relief', 'Sleep Improvement', 'Nutrition Tips'
  ];

  const cleanMarkdown = useCallback((text: string): string => {
    if (!text) return '';
    let cleanedText = text.replace(/\*\*(.*?)\*\*/g, '$1');
    cleanedText = cleanedText.replace(/__(.*?)__/g, '$1');
    cleanedText = cleanedText.replace(/\*(.*?)\*/g, '$1');
    cleanedText = cleanedText.replace(/_(.*?)_/g, '$1');
    cleanedText = cleanedText.replace(/^#+\s*(.*)/gm, '$1');
    return cleanedText.trim();
  }, []);

  useEffect(() => {
    if (initialPrompts) {
      setSavedPrompts(initialPrompts);
    } else {
      setSavedPrompts([]);
    }
  }, [initialPrompts]);

  const filteredPrompts = savedPrompts.filter(prompt => {
    const matchesSearch =
      (prompt.input && prompt.input.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prompt.response && prompt.response.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === 'All' || (prompt.category && prompt.category === filterCategory);

    const promptDate = new Date(prompt.timestamp);
    const now = new Date();
    let matchesDate = true;

    if (filterDate === 'Today') {
      matchesDate = promptDate.toDateString() === now.toDateString();
    } else if (filterDate === 'Last 7 Days') {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      matchesDate = promptDate >= sevenDaysAgo;
    } else if (filterDate === 'Last 30 Days') {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      matchesDate = promptDate >= thirtyDaysAgo;
    }
    
    // REMOVED: Bookmark filter logic
    return matchesSearch && matchesCategory && matchesDate;
  });

  const confirmDelete = useCallback((id: string) => {
    setPromptToDeleteId(id);
    setShowConfirmDeleteDialog(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (promptToDeleteId) {
      setSavingEdit(true);
      setShowConfirmDeleteDialog(false);
      setSavedPrompts(prevPrompts => prevPrompts.filter(p => p.id !== promptToDeleteId));

      const result = await onDeletePrompt(promptToDeleteId);

      if (result.success) {
        toast({ title: "Prompt Deleted!", description: "The prompt has been successfully removed.", variant: "default" });
        router.refresh();
      } else {
        console.error('Server reported delete error:', result.message);
        toast({ title: "Error deleting prompt", description: result.message, variant: "destructive" });
        router.refresh();
      }
      setPromptToDeleteId(null);
      setSavingEdit(false);
    }
  }, [promptToDeleteId, onDeletePrompt, router, toast]);

  const handleEdit = useCallback((prompt: FormattedPrompt) => {
    setEditingPrompt(prompt);
    setEditPromptText(prompt.prompt_text || prompt.input || '');
    setEditCategory(prompt.category || '');
    setEditSubCategory(prompt.sub_category || '');
    setEditAiReply(prompt.response || '');
    setShowEditDialog(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingPrompt || !editingPrompt.id || !editCategory.trim()) {
      toast({ title: "Missing Information", description: "Prompt ID and category are required.", variant: "destructive" });
      return;
    }

    setSavingEdit(true);
    const updates: { prompt_text?: string; category?: string; sub_category?: string | null; ai_reply?: string | null } = {
      prompt_text: editingPrompt.prompt_text !== undefined ? editingPrompt.prompt_text : editingPrompt.input, 
      category: editCategory.trim(),
      sub_category: editSubCategory.trim() === '' ? null : editSubCategory.trim(),
      ai_reply: editAiReply.trim() === '' ? null : editAiReply.trim(),
    };

    const result = await onUpdatePrompt(editingPrompt.id, updates);

    if (result.success) {
      toast({ title: "Prompt Updated!", description: "Your prompt has been successfully updated.", variant: "default" });
      setShowEditDialog(false);
      router.refresh();
    } else {
      console.error('Server reported update error:', result.message);
      toast({ title: "Error updating prompt", description: result.message, variant: "destructive" });
    }
    setSavingEdit(false);
  }, [editingPrompt, editCategory, editSubCategory, editAiReply, onUpdatePrompt, router, toast]);

  const handleCopy = useCallback((textToCopy: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => { toast({ title: "Copied!", description: "Content copied to clipboard.", variant: "default" }); })
        .catch(err => { console.error('Failed to copy text using clipboard API: ', err); toast({ title: "Copy Error", description: "Failed to copy text.", variant: "destructive" }); });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast({ title: "Copied!", description: "Content copied to clipboard.", variant: "default" });
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast({ title: "Copy Error", description: "Failed to copy text.", variant: "destructive" });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }, [toast]);

  const toggleExpand = useCallback((promptId: string) => {
    setExpandedPromptId(prevId => (prevId === promptId ? null : promptId));
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-mint-palette-50 to-mint-palette-100 dark:from-mint-palette-950 dark:to-mint-palette-900 min-h-screen font-sans text-gray-800">
      <h1 className="text-4xl font-extrabold text-mint-palette-700 dark:text-mint-palette-200 mb-8 text-center">Your Saved Prompts</h1>

      {/* Filters and Search */}
      <div className="bg-white/50 dark:bg-mint-palette-900/50 backdrop-blur-md rounded-xl shadow-xl p-6 mb-8 border border-mint-palette-200 dark:border-mint-palette-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search prompts..."
              className="w-full p-3 pl-10 border border-mint-palette-300 dark:border-mint-palette-700 rounded-lg bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 placeholder-mint-palette-400 dark:placeholder-mint-palette-300 focus:outline-none focus:ring-2 focus:ring-mint-palette-400 focus:border-transparent transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-mint-palette-500 dark:text-mint-palette-300 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>

          <div className="relative w-full">
            <select
              className="w-full p-3 border border-mint-palette-300 dark:border-mint-palette-700 rounded-lg bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-palette-400 appearance-none pr-8 transition"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 -translate-y-1/2 text-mint-palette-500 dark:text-mint-palette-300 h-5 w-5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </div>

          <div className="relative w-full">
            <select
              className="w-full p-3 border border-mint-palette-300 dark:border-mint-palette-700 rounded-lg bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-palette-400 appearance-none pr-8 transition"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 -translate-y-1/2 text-mint-palette-500 dark:text-mint-palette-300 h-5 w-5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Saved Prompts List */}
      <div className="scroll-container-y grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredPrompts.length === 0 ? (
          <p className="col-span-full text-center text-gray-600 dark:text-gray-400 text-lg py-10">
            No saved prompts found matching your criteria.
          </p>
        ) : (
          filteredPrompts.map((prompt) => {
            const isExpanded = expandedPromptId === prompt.id;
            const shouldTruncate = prompt.response && prompt.response.length > MAX_AI_RESPONSE_LENGTH && !isExpanded;
            const displayedResponse = shouldTruncate
              ? `${cleanMarkdown(prompt.response).substring(0, MAX_AI_RESPONSE_LENGTH)}...`
              : cleanMarkdown(prompt.response);

            return (
              <div key={prompt.id} className="relative bg-mint-palette-100/70 dark:bg-mint-palette-800/70 backdrop-blur-sm rounded-xl shadow-xl p-5 sm:p-6 space-y-4 transition-all duration-300 transform hover:scale-[1.02] animate-fade-in-up border border-mint-palette-300 dark:border-mint-palette-700 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-mint-palette-200/20 to-mint-palette-400/20 dark:from-transparent dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <p 
                      className="text-mint-palette-700 dark:text-mint-palette-200 font-semibold text-base flex-grow pr-2"
                    >
                      📝 {prompt.input}
                    </p>
                   
                  </div>
                  <div className="flex justify-end items-center space-x-2 mt-auto">
                    <button
                      onClick={() => handleEdit(prompt)}
                      className="text-mint-palette-500 hover:text-mint-palette-600 dark:text-mint-palette-300 dark:hover:text-mint-palette-200 text-sm transition-all duration-200 transform hover:scale-110"
                      title="Edit Prompt"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(prompt.id)}
                      className="text-red-500 hover:text-red-700 text-sm transition-all duration-200 transform hover:scale-110"
                      title="Delete Prompt"
                    >
                      Delete
                    </button>
                  </div>

                  {prompt.response && (
                    <div className="mt-4 p-4 bg-mint-palette-200/70 dark:bg-mint-palette-700/70 backdrop-blur-sm rounded-lg border border-mint-palette-400 dark:border-mint-palette-600 text-mint-palette-800 dark:text-mint-palette-100 whitespace-pre-wrap shadow-inner animate-fade-in-up relative">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        🤖 AI Response:
                      </h4>
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(prompt.response)}
                        className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:text-mint-palette-600 dark:text-gray-400 dark:hover:text-mint-palette-300 transition-colors"
                        title="Copy AI Response"
                        aria-label="Copy AI Response"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                      </button>

                      <div className="flex justify-between items-end"> 
                        <p className="text-sm flex-grow pr-2">{displayedResponse}</p>
                        {shouldTruncate || isExpanded ? (
                          <button
                            onClick={() => toggleExpand(prompt.id)}
                            className="ml-4 flex-shrink-0 text-mint-palette-600 hover:text-mint-palette-700 dark:text-mint-palette-300 dark:hover:text-mint-palette-200 text-sm font-semibold transition-colors"
                          >
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">
                    Generated on: {new Date(prompt.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Prompt Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-mint-palette-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl border border-mint-palette-300 dark:border-mint-palette-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-mint-palette-700 dark:text-mint-palette-200">Edit Prompt</DialogTitle>
            <DialogDescription className="text-sm text-mint-palette-600 dark:text-mint-palette-300">
              Make changes to your prompt here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editPromptText" className="text-right text-mint-palette-600 dark:text-mint-palette-300">
                Prompt
              </label>
              <textarea
                id="editPromptText"
                value={editPromptText}
                onChange={(e) => setEditPromptText(e.target.value)}
                className="col-span-3 p-2 border border-mint-palette-300 dark:border-mint-palette-600 rounded-md bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-mint-palette-400"
                rows={4}
                readOnly // Make this field read-only
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editCategory" className="text-right text-mint-palette-600 dark:text-mint-palette-300">
                Category
              </label>
              <select
                id="editCategory"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="col-span-3 p-2 border border-mint-palette-300 dark:border-mint-palette-600 rounded-md bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-mint-palette-400 appearance-none pr-8"
              >
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editSubCategory" className="text-right text-mint-palette-600 dark:text-mint-palette-300">
                Sub-Category
              </label>
              <select
                id="editSubCategory"
                value={editSubCategory}
                onChange={(e) => setEditSubCategory(e.target.value)}
                className="col-span-3 p-2 border border-mint-palette-300 dark:border-mint-palette-600 rounded-md bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-mint-palette-400 appearance-none pr-8"
              >
                <option value="">None</option>
                {allSubCategories.map(subCat => (
                  <option key={subCat} value={subCat}>{subCat}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editAiReply" className="text-right text-mint-palette-600 dark:text-mint-palette-300">
                AI Reply
              </label>
              <textarea
                id="editAiReply"
                value={editAiReply}
                onChange={(e) => setEditAiReply(e.target.value)}
                className="col-span-3 p-2 border border-mint-palette-300 dark:border-mint-palette-600 rounded-md bg-mint-palette-100 dark:bg-mint-palette-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-mint-palette-400"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowEditDialog(false)}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              disabled={savingEdit}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="bg-mint-palette-500 hover:bg-mint-palette-600 text-white font-semibold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={savingEdit}
            >
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    </div>
  );
};

export default SavedPromptsDashboard;
