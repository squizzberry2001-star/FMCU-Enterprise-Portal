"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { OneGateHub } from "@/components/OneGateHub";
import { LearnerProgress } from "@/components/LearnerProgress";
import { TrainingCalendar } from "@/components/TrainingCalendar";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { Footer } from "@/components/Footer";
import { 
  initialUserProfile, 
  oneGateAppsData, 
  trainingCoursesData, 
  upcomingEventsData, 
  documentItemsData, 
  userNotificationsData 
} from "@/data/portalData";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile] = useState(initialUserProfile);
  const [notifications] = useState(userNotificationsData);

  const handleJumpToMandatory = () => {
    const el = document.getElementById("learner-progress");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60">
      
      {/* 1. Universal Enterprise Navbar */}
      <Header
        user={userProfile}
        notifications={notifications}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 2. Hero Welcome & KPI Metrics Banner */}
        <HeroBanner
          user={userProfile}
          onJumpToMandatory={handleJumpToMandatory}
        />

        {/* 3. One-Gate Application Hub (Primary Feature) */}
        <section aria-label="One-Gate Hub">
          <OneGateHub
            apps={oneGateAppsData}
            searchQuery={searchQuery}
          />
        </section>

        {/* 4. Grid Section: Learning Path & Training Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Progress & Modules */}
          <div className="lg:col-span-8 space-y-8">
            <LearnerProgress courses={trainingCoursesData} />
            <KnowledgeBase documents={documentItemsData} />
          </div>

          {/* Right Column: Calendar & Events */}
          <div className="lg:col-span-4 space-y-8">
            <TrainingCalendar events={upcomingEventsData} />
            
            {/* Quick Contact Widget */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-6 text-white shadow-lg shadow-blue-800/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                Pusat Informasi Pelatihan
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Butuh Rekomendasi Pelatihan?
              </h3>
              <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                Hubungi People Development & Training Center FMCU untuk pengajuan modul khusus divisi atau konsultasi sertifikasi keahlian.
              </p>
              <a
                href="mailto:learning-center@fmcu.co.id"
                className="mt-4 inline-flex items-center justify-center w-full py-2.5 px-4 bg-white hover:bg-blue-50 text-blue-900 text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                Kirim Pengajuan Training
              </a>
            </div>
          </div>

        </div>

      </main>

      {/* 5. Enterprise Standard Footer */}
      <Footer />

    </div>
  );
}
