// src/app/dashboard/components/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Dumbbell,
  Users,
  Megaphone,
  Heart,
  GraduationCap,
  Clock,
  ShoppingCart,
  PenTool,
  DollarSign,
  FileText,
  Bookmark,
} from "lucide-react";

const categories = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Fitness", path: "/dashboard/fitness", icon: Dumbbell },
  { label: "HR", path: "/dashboard/hr", icon: Users },
  { label: "Marketing", path: "/dashboard/marketing", icon: Megaphone },
  { label: "Therapy", path: "/dashboard/therapy", icon: Heart },
  { label: "Education", path: "/dashboard/education", icon: GraduationCap },
  { label: "Productivity", path: "/dashboard/productivity", icon: Clock },
  { label: "Sales", path: "/dashboard/sales", icon: ShoppingCart },
  { label: "Creative Writing", path: "/dashboard/creative-writing", icon: PenTool },
  { label: "Finance", path: "/dashboard/finance", icon: DollarSign },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-emerald-900 to-emerald-700 text-white shadow-lg flex flex-col">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 p-4 text-2xl font-bold">
         <Image
    src="/logo-icon.png"   // <-- place your kingfisher icon in /public
    alt="PromptMagic Logo"
    width={28}             // tweak size to match text
    height={28}
    className="drop-shadow-sm"
  />
        PromptMagic
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {categories.map(({ label, path, icon: Icon }) => (
          <Link
            key={path}
            href={path}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
              pathname === path
                ? "bg-emerald-600 text-white"
                : "text-gray-200 hover:bg-emerald-800"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}

        {/* Templates */}
        <Link
          href="/templates"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
            pathname === "/templates"
              ? "bg-emerald-600 text-white"
              : "text-gray-200 hover:bg-emerald-800"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Templates</span>
        </Link>

        {/* Saved Prompts */}
        <Link
          href="/dashboard/saved-prompts"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
            pathname === "/dashboard/saved-prompts"
              ? "bg-emerald-600 text-white"
              : "text-gray-200 hover:bg-emerald-800"
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved Prompts</span>
        </Link>
      </nav>
    </aside>
  );
}
