'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast'; 

interface DashboardResponseCardProps {
  id: string; 
  aiResponse: string; 
  promptInput: string; 
  category?: string; 
  subCategory?: string; 
  timestamp: string; 
  onDelete: (id: string) => void; 
  onGenerateReply: (id: string, promptText: string, category?: string) => void; 
  onToggleBookmark: (id: string, newStatus: boolean) => void; 
  isGenerating: boolean; 
  isBookmarked?: boolean; // Bookmark status
 
}


const MAX_AI_RESPONSE_LENGTH = 150; 

const DashboardResponseCard: React.FC<DashboardResponseCardProps> = ({
  id,
  aiResponse,
  promptInput,
  category,
  subCategory,
  timestamp,
  onDelete,
  onGenerateReply,
  onToggleBookmark,
  isGenerating,
  isBookmarked,
}) => {
  const { toast } = useToast();
 
  const [isExpanded, setIsExpanded] = useState(false);

 
  const cleanMarkdown = useCallback((text: string): string => {
    if (!text) return '';
    
    let cleanedText = text.replace(/\*\*(.*?)\*\*/g, '$1'); 
    cleanedText = cleanedText.replace(/__(.*?)__/g, '$1'); 
    cleanedText = cleanedText.replace(/\*(.*?)\*/g, '$1');   
    cleanedText = cleanedText.replace(/_(.*?)_/g, '$1');  
    cleanedText = cleanedText.replace(/^#+\s*(.*)/gm, '$1');
    return cleanedText.trim();
  }, []);

  
  const cleanedAiResponse = cleanMarkdown(aiResponse);

  
  const shouldTruncate = cleanedAiResponse.length > MAX_AI_RESPONSE_LENGTH && !isExpanded;
  const displayedResponse = shouldTruncate
    ? `${cleanedAiResponse.substring(0, MAX_AI_RESPONSE_LENGTH)}...`
    : cleanedAiResponse;

  
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  
  const handleCopy = useCallback((textToCopy: string) => {
   
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(aiResponse) 
        .then(() => {
          toast({
            title: "Copied!",
            description: "Content copied to clipboard.",
            variant: "default",
          });
        })
        .catch(err => {
          console.error('Failed to copy text using clipboard API: ', err);
          toast({
            title: "Copy Error",
            description: "Failed to copy text.",
            variant: "destructive",
          });
        });
    } else {
      
      const textarea = document.createElement('textarea');
      textarea.value = aiResponse; 
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "Copied!",
          description: "Content copied to clipboard.",
          variant: "default",
        });
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Copy Error",
          description: "Failed to copy text.",
          variant: "destructive",
        });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }, [aiResponse, toast]); 

 


  return (
    <div className="relative bg-mint-palette-100/70 dark:bg-mint-palette-800/70 backdrop-blur-sm rounded-xl shadow-xl p-5 sm:p-6 space-y-4 transition-all duration-300 transform hover:scale-[1.02] animate-fade-in-up border border-mint-palette-300 dark:border-mint-palette-700 overflow-hidden group">

      <div className="absolute inset-0 bg-gradient-to-br from-mint-palette-200/20 to-mint-palette-400/20 dark:from-transparent dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
    
      <div className="relative z-10 flex flex-col h-full">
       
        <p 
          className="text-mint-palette-700 dark:text-mint-palette-200 font-semibold text-base mb-2 flex-grow overflow-y-auto pr-2 custom-scrollbar"
        >
          📝 {promptInput}
          {category && (
            <span
              className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2 mt-1 ${
                ({
                  Fitness: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
                  HR: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                  Education: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                  Finance: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
                  'Creative Writing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                  Sales: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                  Productivity: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
                  Therapy: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
                  Marketing: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                  Wellness: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
                } as Record<string, string>)[category] || 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {category}
            </span>
          )}
          {subCategory && (
            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2 mt-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {subCategory}
            </span>
          )}
        </p>
        
        
        <div className="flex justify-end items-center space-x-2 mt-auto mb-4">
         
          <button
            onClick={() => onToggleBookmark(id, !isBookmarked)}
            className="p-2 rounded-full transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-mint-palette-400"
            title={isBookmarked ? 'Unbookmark' : 'Bookmark'}
          >
            <svg
              className={`w-6 h-6 ${
                isBookmarked ? 'text-mint-palette-500 fill-current' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              ></path>
            </svg>
          </button>

          {/* Generate AI Reply Button */}
          <button
            onClick={() => onGenerateReply(id, promptInput, category)}
            disabled={isGenerating}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transform hover:-translate-y-0.5 text-sm">
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Thinking...
              </span>
            ) : 'Generate AI Reply'}
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(id)}
            className="text-red-500 hover:text-red-700 text-sm transition-all duration-200 transform hover:scale-110"
            title="Delete Prompt"
          >
            Delete
          </button>
        </div>

        {/* AI Reply Display with Expand/Collapse and Copy Button */}
        {aiResponse && (
          <div className="mt-4 p-4 bg-mint-palette-200/70 dark:bg-mint-palette-700/70 backdrop-blur-sm rounded-lg border border-mint-palette-400 dark:border-mint-palette-600 text-mint-palette-800 dark:text-mint-palette-100 whitespace-pre-wrap shadow-inner animate-fade-in-up relative">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              🤖 AI Response:
            </h4>
            {/* Copy Button */}
            <button
              onClick={() => handleCopy(aiResponse)} 
              className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:text-mint-palette-600 dark:text-gray-400 dark:hover:text-mint-palette-300 transition-colors"
              title="Copy AI Response"
              aria-label="Copy AI Response"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </button>

            {/* Flex container for text and expand button */}
            <div className="flex justify-between items-end"> 
              <p className="text-sm flex-grow pr-2">{displayedResponse}</p>
              {shouldTruncate || isExpanded ? (
                <button
                  onClick={toggleExpand}
                  className="ml-4 flex-shrink-0 text-mint-palette-600 hover:text-mint-palette-700 dark:text-mint-palette-300 dark:hover:text-mint-palette-200 text-sm font-semibold transition-colors"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
              ) : null}
            </div>
            <div className="mt-4">
 
</div>
          </div>
        )}
        {/* Display timestamp at the bottom */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">
          Generated on: {new Date(timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default DashboardResponseCard;
