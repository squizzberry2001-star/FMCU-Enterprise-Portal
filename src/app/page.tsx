"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { OneGateGrid } from "@/components/OneGateGrid";
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
import { 
  LayoutGrid, 
  BookOpen, 
  Calendar, 
  FileText, 
  Sparkles,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"apps" | "courses" | "calendar" | "docs">("apps");
  const [userProfile] = useState(initialUserProfile);
  const [notifications] = useState(userNotificationsData);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 font-sans text-slate-800">
      
      {/* 1. Clean, Minimalist Header */}
      <Header
        user={userProfile}
        notifications={notifications}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Simple & Welcoming Hero Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>One-Gate Learning Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Halo, {userProfile.name}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Pusat akses satu pintu untuk seluruh aplikasi e-learning, jadwal pelatihan, sertifikasi, dan SOP kerja FMCU.
            </p>
          </div>

          {/* Understated Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 self-stretch md:self-auto border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Kepatuhan Belajar</span>
              <span className="text-xl font-bold text-slate-900">{userProfile.complianceRate}%</span>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Jam Belajar</span>
              <span className="text-xl font-bold text-blue-600">{userProfile.learningHoursThisYear}h</span>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Sertifikat</span>
              <span className="text-xl font-bold text-slate-900">{userProfile.certificatesEarned}</span>
            </div>
          </div>
        </div>

        {/* Minimal Alert if there's a mandatory course pending */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Pengingat: <strong>Pelatihan HSE 2026</strong> wajib diselesaikan sebelum <strong>28 Okt 2026</strong>.
            </span>
          </div>
          <button
            onClick={() => setActiveTab("courses")}
            className="shrink-0 text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1 hover:underline"
          >
            <span>Lihat Modul</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Intuitive Segmented Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: "apps", label: "Aplikasi & Sistem", icon: LayoutGrid, count: oneGateAppsData.length },
            { id: "courses", label: "Pelatihan Saya", icon: BookOpen, count: trainingCoursesData.length },
            { id: "calendar", label: "Jadwal & Webinar", icon: Calendar, count: upcomingEventsData.length },
            { id: "docs", label: "SOP & Panduan", icon: FileText, count: documentItemsData.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab View (Clean, Single Purpose at a Time) */}
        <div className="pt-2">
          {activeTab === "apps" && (
            <OneGateGrid apps={oneGateAppsData} />
          )}

          {activeTab === "courses" && (
            <LearnerProgress courses={trainingCoursesData} />
          )}

          {activeTab === "calendar" && (
            <TrainingCalendar events={upcomingEventsData} />
          )}

          {activeTab === "docs" && (
            <KnowledgeBase documents={documentItemsData} />
          )}
        </div>

      </main>

      {/* Clean & Simple Footer */}
      <Footer />

    </div>
  );
}
