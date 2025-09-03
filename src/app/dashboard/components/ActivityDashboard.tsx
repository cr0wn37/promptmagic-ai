'use client';

import React from 'react';

interface ActivityDashboardProps {
  promptsGenerated: number;
  mostUsedCategory: string;
  totalPromptsSaved: number;
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({
  promptsGenerated,
  mostUsedCategory,
  totalPromptsSaved,
}) => {
  return (
    <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Activity at a Glance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      
        <div className="bg-mint-palette-50 rounded-xl p-6 border border-mint-palette-200 text-center shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-mint-palette-200 text-mint-palette-700 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{promptsGenerated}</p>
          <p className="text-gray-600 text-sm mt-1">Prompts Generated</p>
        </div>

        
        <div className="bg-mint-palette-50 rounded-xl p-6 border border-mint-palette-200 text-center shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-mint-palette-200 text-mint-palette-700 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 9 0 0 0 21 19V5"/><path d="M3 12A9 9 0 0 0 21 12"/><path d="M3 19A9 9 0 0 0 21 19"/></svg>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{mostUsedCategory}</p>
          <p className="text-gray-600 text-sm mt-1">Most Used Category</p>
        </div>

       
        <div className="bg-mint-palette-50 rounded-xl p-6 border border-mint-palette-200 text-center shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-mint-palette-200 text-mint-palette-700 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalPromptsSaved}</p>
          <p className="text-gray-600 text-sm mt-1">Total Prompts Saved</p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInFromBottom {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInFromBottom 1s ease-out forwards; }
      `}</style>
    </section>
  );
};

export default ActivityDashboard;
