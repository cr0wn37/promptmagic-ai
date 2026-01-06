'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import TemplateVariablesModal from '@/app/templates/components/TemplateVariablesModal';

interface FormattedTemplate {
  id: string;
  templateText: string;
  category: string;
  subCategory?: string;
  favorite?: boolean;
}

interface Client {
  id: string;
  client_name: string;
  client_data: any;
}

interface TemplateCardProps {
  template: FormattedTemplate;
  index: number;
  clients: Client[];
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, index, clients }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);

  const extractVariables = useCallback((template: string): string[] => {
    const regex = /{([a-zA-Z0-9_]+)}/g;
    const matches = [...template.matchAll(regex)];
    return Array.from(new Set(matches.map(match => match[1])));
  }, []);

    const handleUseTemplate = useCallback(() => {
    const extractedVars = extractVariables(template.templateText);
    const encodedTemplate = encodeURIComponent(template.templateText);
    const encodedCategory = encodeURIComponent(template.category || 'All');

    if (extractedVars.length > 0) {
       
      const url = `/dashboard?template=${encodedTemplate}&category=${encodedCategory}`;
      router.push(url);
    } else {
       
      const url = `/dashboard?template=${encodedTemplate}&category=${encodedCategory}&variables=${encodeURIComponent(JSON.stringify({}))}`;
      router.push(url);
    }
  }, [template, extractVariables, router]);

    const handleSaveAndGenerate = useCallback((variables: Record<string, string>, clientId: string | null) => {
    const encodedTemplate = encodeURIComponent(template.templateText);
    const encodedCategory = encodeURIComponent(template.category || 'All');
    const encodedVariables = encodeURIComponent(JSON.stringify(variables));
    const encodedClientId = clientId ? `&clientId=${encodeURIComponent(clientId)}` : '';
    
    const url = `/dashboard?template=${encodedTemplate}&category=${encodedCategory}&variables=${encodedVariables}${encodedClientId}`;
    router.push(url);
    }, [template, router]);

  const hasVariables = extractVariables(template.templateText).length > 0;

  const categoryColors: Record<string, string> = {
    Fitness: 'bg-pink-100 text-pink-800',
    HR: 'bg-yellow-100 text-yellow-800',
    Education: 'bg-green-100 text-green-800',
    Finance: 'bg-indigo-100 text-indigo-800',
    'Creative Writing': 'bg-purple-100 text-purple-800',
    Sales: 'bg-blue-100 text-blue-800',
    Productivity: 'bg-orange-100 text-orange-800',
    Therapy: 'bg-teal-100 text-teal-800',
    General: 'bg-gray-200 text-gray-800',
    'Uncategorized': 'bg-gray-200 text-gray-800',
  };
  const getCategoryClass = (cat: string) => categoryColors[cat] || categoryColors['Uncategorized'];

  return (
    <>
      <div 
        className="bg-mint-palette-100 rounded-3xl p-8 shadow-xl border border-mint-palette-200 flex flex-col justify-between transform hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
        style={{ animationDelay: `${index * 0.2 + 0.5}s` }}
      >
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-900 pr-4">{template.templateText}</h3>
          </div>

          {template.category && (
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-4 ${getCategoryClass(template.category)}`}>
              {template.category}
            </span>
          )}
          {template.subCategory && (
            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2 mb-4 bg-gray-200 text-gray-800">
              {template.subCategory}
            </span>
          )}
          <p className="text-gray-600 text-base leading-relaxed">
            This template is designed to help you quickly generate AI content for your {template.category.toLowerCase()} needs.
          </p>
        </div>
        
        <button
          onClick={handleUseTemplate}
          className="mt-6 w-full bg-mint-palette-500 text-white font-semibold py-2.5 rounded-lg shadow-md hover:bg-mint-palette-600 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
        >
          Use Template
        </button>
      </div>

      {hasVariables && (
        <TemplateVariablesModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          variables={extractVariables(template.templateText).reduce((acc, curr) => ({ ...acc, [curr]: '' }), {})}
          onSaveAndGenerate={handleSaveAndGenerate}
          templateText={template.templateText}
          category={template.category}
          isGenerating={false}
          clients={clients}
        />
      )}
      <style jsx>{`
        @keyframes fadeInFromBottom {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInFromBottom 1s ease-out forwards; }
      `}</style>
    </>
  );
};

export default TemplateCard;
