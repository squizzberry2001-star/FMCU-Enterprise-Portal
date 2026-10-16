"use client";

import React, { useState, useEffect } from "react";
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
  getStoredApps, 
  saveStoredApps,
  getStoredCourses, 
  saveStoredCourses,
  getStoredEvents, 
  saveStoredEvents,
  getStoredDocuments, 
  saveStoredDocuments,
  getStoredBannerAlert,
  saveStoredBannerAlert,
  BannerAlertConfig,
  initialBannerAlert
} from "@/lib/storage";
import { fetchPortalDataFromCloud } from "@/lib/cloudSync";
import { 
  LayoutGrid, 
  BookOpen, 
  Calendar, 
  FileText, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"apps" | "courses" | "calendar" | "docs">("apps");
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile] = useState(initialUserProfile);
  const [notifications] = useState(userNotificationsData);

  // Dynamic Data from Storage / Admin updates
  const [apps, setApps] = useState(oneGateAppsData);
  const [courses, setCourses] = useState(trainingCoursesData);
  const [events, setEvents] = useState(upcomingEventsData);
  const [docs, setDocs] = useState(documentItemsData);
  const [bannerAlert, setBannerAlert] = useState<BannerAlertConfig>(initialBannerAlert);

  useEffect(() => {
    // Load persisted state from storage
    setApps(getStoredApps());
    setCourses(getStoredCourses());
    setEvents(getStoredEvents());
    setDocs(getStoredDocuments());
    setBannerAlert(getStoredBannerAlert());

    // Fetch synchronized data from cloud (Google Sheets) if configured
    fetchPortalDataFromCloud().then((res) => {
      if (res.success && res.data) {
        if (res.data.apps && res.data.apps.length > 0) {
          setApps(res.data.apps);
          saveStoredApps(res.data.apps);
        }
        if (res.data.courses && res.data.courses.length > 0) {
          setCourses(res.data.courses);
          saveStoredCourses(res.data.courses);
        }
        if (res.data.events && res.data.events.length > 0) {
          setEvents(res.data.events);
          saveStoredEvents(res.data.events);
        }
        if (res.data.docs && res.data.docs.length > 0) {
          setDocs(res.data.docs);
          saveStoredDocuments(res.data.docs);
        }
        if (res.data.bannerAlert) {
          setBannerAlert(res.data.bannerAlert);
          saveStoredBannerAlert(res.data.bannerAlert);
        }
      }
    }).catch(() => {});

    // Listen for storage changes across tabs
    const handleStorageChange = () => {
      setApps(getStoredApps());
      setCourses(getStoredCourses());
      setEvents(getStoredEvents());
      setDocs(getStoredDocuments());
      setBannerAlert(getStoredBannerAlert());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 font-sans text-slate-800 antialiased">
      
      {/* 1. Minimal Header */}
      <Header
        user={userProfile}
        notifications={notifications}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
        
        {/* Simple & Clean Greeting Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Halo, {userProfile.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pusat akses satu pintu seluruh sistem pelatihan & operasional FMCU.
            </p>
          </div>

          {/* Understated Minimal Metrics */}
          <div className="flex items-center gap-5 text-xs text-slate-500 bg-white border border-slate-200/80 px-4 py-2 rounded-xl self-start sm:self-auto shadow-2xs">
            <div>
              <span className="text-slate-400">Kepatuhan:</span>{" "}
              <strong className="text-slate-800 font-semibold">{userProfile.complianceRate}%</strong>
            </div>
            <span className="text-slate-200">•</span>
            <div>
              <span className="text-slate-400">Jam Belajar:</span>{" "}
              <strong className="text-blue-600 font-semibold">{userProfile.learningHoursThisYear}h</strong>
            </div>
            <span className="text-slate-200">•</span>
            <div>
              <span className="text-slate-400">Sertifikat:</span>{" "}
              <strong className="text-slate-800 font-semibold">{userProfile.certificatesEarned}</strong>
            </div>
          </div>
        </div>

        {/* Minimal Alert (Dynamic from Admin settings) */}
        {bannerAlert.enabled && (
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {bannerAlert.title} {bannerAlert.dueDate && <>jatuh tempo <strong>{bannerAlert.dueDate}</strong>.</>}
              </span>
            </div>
            <button
              onClick={() => setActiveTab("courses")}
              className="shrink-0 text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <span>{bannerAlert.linkText || "Buka Modul"}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Intuitive Segmented Navigation Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: "apps", label: "Gerbang Aplikasi", icon: LayoutGrid, count: apps.length },
            { id: "courses", label: "Modul Saya", icon: BookOpen, count: courses.length },
            { id: "calendar", label: "Jadwal & Kelas", icon: Calendar, count: events.length },
            { id: "docs", label: "SOP & Dokumen", icon: FileText, count: docs.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
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

        {/* Main Content Area: Focused on One Thing at a Time */}
        <div className="pt-1">
          {activeTab === "apps" && (
            <OneGateGrid apps={apps} searchQuery={searchQuery} />
          )}

          {activeTab === "courses" && (
            <LearnerProgress courses={courses} />
          )}

          {activeTab === "calendar" && (
            <TrainingCalendar events={events} />
          )}

          {activeTab === "docs" && (
            <KnowledgeBase documents={docs} />
          )}
        </div>

      </main>

      {/* Minimalist Clean Footer */}
      <Footer />

    </div>
  );
}
