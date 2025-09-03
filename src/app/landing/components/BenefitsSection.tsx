"use client";

import {
  Clock,
  Users,
  Layers,
  Workflow,
  Sparkles,
  ShieldCheck,
  BarChart,
  FolderKanban,
} from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-emerald-400" />,
      title: "Save Time Instantly",
      desc: "Get high-quality AI responses in seconds instead of hours of manual work.",
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-400" />,
      title: "Handle Multiple Clients",
      desc: "Easily manage prompts for multiple clients with organized categories.",
    },
    {
      icon: <Layers className="w-8 h-8 text-emerald-400" />,
      title: "Personas & Customization",
      desc: "Build unique AI personas tailored to your client’s voice and tone.",
    },
    {
      icon: <Workflow className="w-8 h-8 text-emerald-400" />,
      title: "Streamline Workflows",
      desc: "Integrate AI into daily workflows for smooth and efficient execution.",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-emerald-400" />,
      title: "Consistent Branding",
      desc: "Ensure every AI output aligns with your brand or client’s brand voice.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      title: "Reliable & Secure",
      desc: "Keep your prompts and client data safe with enterprise-level security.",
    },
    {
      icon: <BarChart className="w-8 h-8 text-emerald-400" />,
      title: "Boost Productivity",
      desc: "Focus on strategy and client growth while AI handles repetitive tasks.",
    },
    {
      icon: <FolderKanban className="w-8 h-8 text-emerald-400" />,
      title: "Organized Prompt Library",
      desc: "Save, tag, and reuse prompts with a clean and structured dashboard.",
    },
  ];

  return (
  <section
    id="benefits"
    className="relative py-20 bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: "url('/benefitss-bg.png')", 
    }}
  >
     
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/70 via-white/70 to-slate-50/70 backdrop-blur-[2px]"></div>

    <div className="relative max-w-6xl mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-12">
        Why Choose <span className="text-emerald-400">PromptMagic?</span>
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((item, index) => (
          <div
            key={index}
            className="group p-6 rounded-2xl shadow-md bg-white/90 hover:bg-white hover:shadow-xl transition-all duration-300 border border-white"  
          >
            <div className="flex justify-center mb-4">
               
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {item.title}
            </h3>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">  
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
}