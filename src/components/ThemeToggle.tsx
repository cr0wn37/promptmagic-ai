// src/components/ThemeToggle.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
    console.log('ThemeToggle: Component mounted on client.'); // <--- ADD THIS LOG
  }, []);

  if (!mounted) {
    console.log('ThemeToggle: Not mounted yet, rendering null.'); // <--- ADD THIS LOG
    return null; // Render nothing on the server
  }

  console.log('ThemeToggle: Rendering with theme:', theme); // <--- ADD THIS LOG

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
      title="Toggle theme"
    >
      {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
