"use client";

import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CurriculumSelector from "@/components/landing/CurriculumSelector";
import FeatureTabs from "@/components/landing/FeatureTabs";
import TuitionComparison from "@/components/landing/TuitionComparison";
import ToolShowcase from "@/components/landing/ToolShowcase";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="dark bg-[#06080f] text-slate-100 min-h-screen relative font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Dynamic Cyber Grid & Neon Mesh Orbs across entire page */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Subtle high-tech grid background */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
            backgroundSize: "40px 40px, 40px 40px, 40px 40px"
          }} 
        />
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[35%] -right-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[70%] -left-32 w-[600px] h-[600px] bg-pink-600/15 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '9s' }} />
      </div>

      <Navbar />

      <main className="relative z-10">
        <Hero />
        <CurriculumSelector />
        <FeatureTabs />
        <TuitionComparison />
        <ToolShowcase />
        <Testimonials />
        <FAQ />
        <Footer />
      </main>
    </div>
  );
}