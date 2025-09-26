// src/app/layout.tsx (This is a Server Component)

import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import '../app/globals.css'; // Your global CSS file
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
   title: "PromptMagic",
 description:
    "Clean, consistent, and tailored to your clients — every single time. Save hours of time, boost productivity, and scale your expertise. Designed for professionals in Fitness, HR, Sales, Marketing, Education and more.",
    icons: {
    icon: "/logo-icon.png",
    shortcut: "/logo-icon.png",
    apple: "/favicon-ico.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning >
       <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PromptMagic",
              url: "https://thepromptmagic.com",
              logo: "https://thepromptmagic.com/logo-icon.png",
            }),
          }}
        />
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
