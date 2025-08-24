'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TemplateCard from './components/TemplateCard';

interface FetchedTemplateData {
  id: string;
  prompt_text: string;
  category: string;
  sub_category?: string;
  favorite?: boolean;
  created_at: string;
}

interface FormattedTemplate {
  id: string;
  templateText: string;
  category: string;
  subCategory?: string;
}

interface Client {
  id: string;
  client_name: string;
  client_data: any;
}


const supabase = createClientComponentClient();

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FormattedTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]); // NEW: State to store clients
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const allCategories = [
    'All', 'Fitness', 'Therapy', 'Marketing', 'HR', 'Education',
    'Productivity', 'Sales', 'Creative Writing', 'Finance', 'General'
  ];

  const fetchTemplates = useCallback(async () => {
    const { data, error } = await supabase
      .from('prompts')
      .select(`id, prompt_text, category, sub_category, created_at`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    } else {
      const templates = data.filter(item => 
        item.prompt_text && (item.prompt_text.includes('{') || item.prompt_text.includes('}'))
      );
      
      const formattedTemplates: FormattedTemplate[] = templates.map(item => ({
        id: item.id,
        templateText: item.prompt_text,
        category: item.category || 'Uncategorized',
        subCategory: item.sub_category || undefined,
      }));
      return formattedTemplates;
    }
  }, []);

  // NEW: Fetch clients on component mount
  const fetchClients = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('id, client_name, client_data')
      .eq('user_id', userId)
      .order('client_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
    return data || [];
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const fetchedTemplates = await fetchTemplates();
        const fetchedClients = await fetchClients(user.id);
        
        setTemplates(fetchedTemplates);
        setClients(fetchedClients);
      } else {
        router.push('/auth');
      }

      setLoading(false);
    };
    fetchData();
  }, [fetchTemplates, fetchClients, router]);


  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm.trim() === '' ||
      template.templateText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-palette-50 to-mint-palette-100 text-gray-900 py-16 px-4">
        <p className="text-xl text-mint-palette-700">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-16 px-4">
      {/* New Header Section */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center md:justify-between animate-fade-in-up">
        {/* Back Button */}
        <Link href="/dashboard" passHref>
          <button className="px-6 py-3 rounded-full bg-mint-palette-200 text-mint-palette-700 font-semibold text-lg hover:bg-mint-palette-300 transition-colors shadow-md transform hover:-translate-y-0.5">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Back to Dashboard
            </span>
          </button>
        </Link>

        {/* Heading */}
        <div className="text-center md:text-right mt-8 md:mt-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            <span className="text-gray-900">Discover</span> <span className="bg-clip-text text-transparent bg-gradient-to-r from-mint-palette-600 to-blue-600">AI Templates</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
            Kickstart your content creation with expertly designed prompt templates for every need.
          </p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-palette-400 focus:border-transparent transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
        </div>

        {/* Category Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-mint-palette-500 text-white shadow-md'
                  : 'bg-mint-palette-200 text-mint-palette-700 hover:bg-mint-palette-300'
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filteredTemplates.length === 0 ? (
          <p className="col-span-full text-center text-gray-600 text-lg py-10">No templates found matching your criteria.</p>
        ) : (
          filteredTemplates.map((template, index) => (
            <TemplateCard key={template.id} template={template} index={index} clients={clients} />
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInFromBottom {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInFromBottom 1s ease-out forwards; }
        .animation-delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
