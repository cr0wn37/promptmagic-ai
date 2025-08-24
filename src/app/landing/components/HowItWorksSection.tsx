"use client";

import React from "react";
import { motion, Variants, easeOut, easeInOut } from "framer-motion";
import { Edit3, Users, Wand, Save } from "lucide-react";

const steps = [
  {
    icon: <Edit3 className="w-10 h-10 text-mint-palette-500" />,
    number: "01",
    title: "Select a Prompt",
    description:
      "Choose from our extensive library of pre-built templates or a custom prompt you've saved.",
  },
  {
    icon: <Users className="w-10 h-10 text-mint-palette-500" />,
    number: "02",
    title: "Integrate Client Info",
    description:
      "Select a client profile to auto-fill variables, providing the AI with crucial context for a truly personalized response.",
  },
  {
    icon: <Wand className="w-10 h-10 text-mint-palette-500" />,
    number: "03",
    title: "Choose Your Persona",
    description:
      "Select a predefined category persona or your own custom AI persona to guide the AI's expertise and tone.",
  },
  {
    icon: <Save className="w-10 h-10 text-mint-palette-500" />,
    number: "04",
    title: "Generate & Use",
    description:
      "Instantly receive a clean, tailored AI response that you can save and use for your projects.",
  },
];

const howItWorksVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.08 },
  },
};

const howItWorksCard: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
  hover: {
    y: -6,
    scale: 1.03,
    boxShadow: "0px 12px 25px rgba(0,0,0,0.08)",
    transition: { duration: 0.25, ease: easeInOut },
  },
};

export default function HowItWorksSection() {
  return (
     <section id="howitworks" className="relative py-10 md:py-0 overflow-hidden">
    <section className="relative py-20 px-4 bg-gray-50 text-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Mint Badge */}
        <div className="flex justify-center mb-6">
          <span className="px-4 py-1 rounded-full text-sm font-semibold bg-mint-palette-100 text-mint-palette-600">
            How it Works
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold">
            Simple Steps to AI Excellence
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Follow these streamlined steps to unlock the full potential of
            tailored AI in your workflow.
          </p>
        </div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
          variants={howItWorksVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.title}
              variants={howItWorksCard}
              whileHover="hover"
              className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 flex flex-col items-center text-center transition-all duration-300"
            >
              {/* Icon + Number */}
              <div className="relative mb-6 flex items-center justify-center w-20 h-20 bg-mint-palette-100 rounded-full">
                {step.icon}
                <span className="absolute -bottom-4 text-mint-palette-600 font-semibold text-lg">
                  {step.number}
                </span>
              </div>

              {/* Title + Description */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
   </section> 
  );
}
