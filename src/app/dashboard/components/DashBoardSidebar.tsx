// src/app/dashboard/components/DashboardSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle'; // adjust path if needed
const categories = [
{ label: 'Dashboard', path: '/dashboard' },
  { label: 'Fitness', path: '/dashboard/fitness' },
  { label: 'HR', path: '/dashboard/hr' },
  { label: 'Marketing', path: '/dashboard/marketing' },
  { label: 'Therapy', path: '/dashboard/therapy' },
  { label: 'Education', path: '/dashboard/education' },
  { label: 'Productivity', path: '/dashboard/productivity' },
  { label: 'Sales', path: '/dashboard/sales' },
  { label: 'Creative Writing', path: '/dashboard/creative-writing' },
  { label: 'Finance', path: '/dashboard/finance' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-emerald-900 to-emerald-700 text-white shadow-lg flex flex-col">
         <div className="p-4 text-2xl font-bold">PromptMagic</div>
        <nav className="flex-1 space-y-2 p-4">
          {categories.map((cat) => (
            <Link
              key={cat.path}
              href={cat.path}
              className={`block rounded-lg px-3 py-2 transition ${
                pathname === cat.path
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-200 hover:bg-emerald-800'
              }`}
            >
              {cat.label}
            </Link>
            
          ))}
          <Link
           href="/templates" 
            className={`block rounded-lg px-3 py-2 transition
              ${pathname === '/templates'
                ?  'bg-emerald-600 text-white'
                  : 'text-gray-200 hover:bg-emerald-800'
              }`}
          >
            Templates
          </Link>
         
          <Link
            href="/dashboard/saved-prompts"
            className={`block rounded-lg px-3 py-2 transition
              ${pathname === '/dashboard/saved-prompts'
                ?  'bg-emerald-600 text-white'
                  : 'text-gray-200 hover:bg-emerald-800'
              }`}
          >
            Saved Prompts
          </Link>
        </nav>
        
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-1 overflow-y-auto">{children}</main>
    </div>
  );
}
