// src/app/layout.tsx (This is a Server Component)

import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import '../app/globals.css'; // Your global CSS file
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MicroPrompt AI',
  description: 'Your AI-Powered Prompt Workspace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning >
      <body className={`${inter.className} bg-white text-gray-900 dark:bg-black dark:text-gray-100`}>
        {/* ThemeProvider from next-themes for light/dark mode */}
        {/* It must wrap the children to provide context */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
          {children}
           <Toaster />
        </ThemeProvider>
      </body>
      
    </html>
  );
}
