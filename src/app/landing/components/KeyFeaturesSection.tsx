"use client";

import React from "react";
import { motion, Variants  } from "framer-motion";
import {
  Edit3,
  Users,
  Folder,
  ClipboardList,
  Activity,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: <Edit3 className="w-10 h-10 text-mint-palette-500" />,
    title: "Intuitive Prompt Creation",
    description:
      "Craft new prompts or modify existing ones with a user-friendly interface, ensuring precise AI input.",
  },
  {
    icon: <Users className="w-10 h-10 text-mint-palette-500" />,
    title: "Custom AI Personas",
    description:
      "Define and save unique AI personas to tailor tone, style, and expertise for consistent, branded output.",
  },
  {
    icon: <Folder className="w-10 h-10 text-mint-palette-500" />,
    title: "Extensive Template Library",
    description:
      "Access and utilize a rich library of pre-built prompts for various domains, accelerating your content creation.",
  },
  {
    icon: <ClipboardList className="w-10 h-10 text-mint-palette-500" />,
    title: "Effortless Client Integration",
    description:
      "Save client profiles and auto-fill prompt variables. The AI uses this rich context to provide personalized responses, saving you time.",
  },
  {
    icon: <Activity className="w-10 h-10 text-mint-palette-500" />,
    title: "Personalized Dashboard",
    description:
      "Gain insights into your prompt generation habits and most used categories with clear analytics.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-mint-palette-500" />,
    title: "Secure & Reliable",
    description:
      "Built on a robust, secure infrastructure with reliable data handling, ensuring your prompts and data are always safe.",
  },
];

// Animation variants
const cardVariants: Variants = {
  hidden: (direction: "left" | "right") => ({
    opacity: 0,
    x: direction === "left" ? -80 : 80,
  }),
  visible: (direction: "left" | "right") => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  }),
};


export default function KeyFeaturesSection() {
  return (
  <section id="keyfeatures" className="relative py-10 md:py-0 overflow-hidden">
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/problem-bg.png')" }}
      />
      {/* Subtle Overlay */}
      <div className="absolute inset-0 z-0 bg-white/50 dark:bg-black/50" />

      <div className="max-w-6xl mx-auto relative z-10 px-4">
        {/* Section Heading */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold tracking-wide uppercase rounded-full bg-mint-palette-100 text-mint-palette-600 mb-4 shadow-sm">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
            Unlock the Power of Tailored AI
          </h2>
        </div>

        {/* Zig-zag layout */}
        <div className="flex flex-col gap-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index % 2 === 0 ? "left" : "right"}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              className={`flex flex-col md:flex-row items-center gap-10 ${
                index % 2 === 0 ? "" : "md:flex-row-reverse"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 p-6 bg-gradient-to-br from-mint-palette-100 to-blue-100 rounded-2xl shadow-md">
                {feature.icon}
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03]">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </section>
  );
}
