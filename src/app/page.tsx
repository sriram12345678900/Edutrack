"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeatureTabs from "@/components/landing/FeatureTabs";
import ToolShowcase from "@/components/landing/ToolShowcase";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen relative font-sans">
      {/* Ambient Background — reuses existing CSS mesh blobs */}
      <div className="premium-mesh-bg" aria-hidden="true">
        <div className="premium-mesh-blob-1" />
        <div className="premium-mesh-blob-2" />
        <div className="premium-mesh-blob-3" />
      </div>

      <Navbar />

      <main className="relative z-10">
        <Hero />
        <FeatureTabs />
        <ToolShowcase />
        <FAQ />
        <Footer />
      </main>
    </div>
  );
}