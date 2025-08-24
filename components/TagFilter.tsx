// src/components/TagFilter.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface TagFilterProps {
  active: string; // The currently active category
  onSelect: (category: string) => void; // Callback when a category is selected
}

const allCategories = [
  'All', 'Fitness', 'Therapy', 'Marketing', 'HR', 'Education',
  'Productivity', 'Sales', 'Creative Writing', 'Finance', 'Wellness'
];

const TagFilter: React.FC<TagFilterProps> = ({ active, onSelect }) => {
  const router = useRouter();

  const handleSelectCategory = (category: string) => {
    onSelect(category);
    // Optionally update URL for persistence/sharing
    if (category === 'All') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard?category=${category}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
      {allCategories.map((category) => (
        <button
          key={category}
          onClick={() => handleSelectCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${active === category
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;
