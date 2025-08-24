"use client";

import React from "react";
import { motion, Variants, easeOut, easeInOut } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";

const problems = [
  {
    icon: <AlertCircle className="w-8 h-8 text-indigo-400" />,
    title: "Messy, Unusable Output",
    desc: "AI responses are often cluttered with asterisks, conversational filler, and jargon, forcing you into a tedious editing process just to make them usable.",
  },
  {
    icon: <AlertCircle className="w-8 h-8 text-indigo-400" />,
    title: "Inaccurate and Inconsistent Tone",
    desc: "Without a specific persona, the AI struggles to deliver the nuanced, expert voice required for your professional niche.",
  },
  {
    icon: <AlertCircle className="w-8 h-8 text-indigo-400" />,
    title: "Repetitive Data Entry",
    desc: "You waste time re-entering the same client details, goals, and project information every time you run a new prompt.",
  },
  {
    icon: <AlertCircle className="w-8 h-8 text-indigo-400" />,
    title: "A Cluttered Workflow",
    desc: "There's no centralized hub to manage, organize, and reuse your most effective AI prompts, leading to a fragmented and inefficient workflow.",
  },
];

const solutions = [
  {
    icon: <Sparkles className="w-8 h-8 text-emerald-400" />,
    title: "Clean, Ready-to-Use Output",
    desc: "We automatically post-process the AI's response to remove unwanted formatting, delivering clean, professional content that's ready for immediate use.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-emerald-400" />,
    title: "Dynamic AI Personas",
    desc: "Our AI adapts its tone and expertise to your specific domain. You can create custom personas to ensure every response has a consistent, professional, and branded voice.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-emerald-400" />,
    title: "Effortless Client Integration",
    desc: "Store client profiles and auto-fill prompt variables. The AI uses this rich context to provide highly personalized, deep, and accurate responses, saving you time and effort.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-emerald-400" />,
    title: "Smart Prompt Management",
    desc: "Easily browse our library of pre-built templates, manage your custom ones, and track your usage with a dedicated dashboard, all in one central hub.",
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.2, ease: easeInOut },
  },
};

export default function ProblemSection() {
  return (
    <section id="problems" className="py-20">
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/problem-bg.png')" }}
      />
      {/* Subtle Overlay */}
      <div className="absolute inset-0 z-0 bg-white/50 dark:bg-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-slate-800 dark:text-slate-200">
        
        {/* Intro Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="pt-16 text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">
            From Chaos → To Clarity
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Why generic AI fails — and how MicroPrompt transforms your workflow.
          </p>
        </motion.div>

        {/* Problem + Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center md:gap-16">
          {/* Problems Heading */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left mb-10 md:mb-0 flex items-center justify-center md:justify-start"
          >
           <div className="inline-block px-6 py-3 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-md">
  <h2 className="text-4xl sm:text-7xl font-extrabold text-indigo-500">
    Problems
  </h2>
</div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="30"
                viewBox="0 0 60 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right text-indigo-500"
              >
                <path d="M5 15h50M45 5l10 10-10 10" />
              </svg>
            </div>
          </motion.div>

          {/* Problems Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {problems.map((item, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 shadow-xl border border-indigo-200 dark:border-indigo-700 backdrop-blur-md transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-3">
                  {item.icon}
                  <h4 className="text-xl font-semibold text-indigo-500">
                    {item.title}
                  </h4>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Solutions Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:order-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {solutions.map((item, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 shadow-xl border border-emerald-200 dark:border-emerald-700 backdrop-blur-md transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-3">
                  {item.icon}
                  <h4 className="text-xl font-semibold text-emerald-500">
                    {item.title}
                  </h4>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Solutions Heading */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-right mb-10 md:mb-0 md:order-2 flex items-center justify-center md:justify-end"
          >
            <div className="inline-block px-6 py-3 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-md">
            <h2 className="text-4xl sm:text-7xl font-extrabold text-emerald-500 mr-4">
              Solutions
            </h2>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="30"
                viewBox="0 0 60 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-left text-emerald-500"
              >
                <path d="M55 15H5M15 5l-10 10 10 10" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
    </section>
  );
}
