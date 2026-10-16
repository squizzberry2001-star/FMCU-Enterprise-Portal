"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  OneGateApp, 
  TrainingCourse, 
  CalendarEvent, 
  DocumentItem 
} from "@/types";
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
  getAdminPIN, 
  saveAdminPIN, 
  resetAllToDefaults,
  BannerAlertConfig,
  DEFAULT_ADMIN_PIN
} from "@/lib/storage";
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  LayoutGrid, 
  BookOpen, 
  Calendar, 
  FileText, 
  Settings, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Upload, 
  Check, 
  AlertTriangle, 
  ArrowLeft, 
  RotateCcw,
  Eye,
  LogOut,
  Sparkles,
  Link2
} from "lucide-react";

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<"apps" | "courses" | "events" | "docs" | "settings">("apps");

  // Data States
  const [apps, setApps] = useState<OneGateApp[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [bannerAlert, setBannerAlert] = useState<BannerAlertConfig>({
    enabled: true,
    title: "",
    dueDate: "",
    linkText: ""
  });

  // Modal & Form States
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<OneGateApp | null>(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);

  // Settings Form States
  const [newPin, setNewPin] = useState("");
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Data on Mount
  useEffect(() => {
    // Check if session has admin unlocked
    const sessionAuth = sessionStorage.getItem("fmcu_admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
    loadAllData();
  }, []);

  const loadAllData = () => {
    setApps(getStoredApps());
    setCourses(getStoredCourses());
    setEvents(getStoredEvents());
    setDocs(getStoredDocuments());
    setBannerAlert(getStoredBannerAlert());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getAdminPIN();
    if (pinInput.trim() === correctPin || pinInput.trim() === DEFAULT_ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
      sessionStorage.setItem("fmcu_admin_auth", "true");
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("fmcu_admin_auth");
    setIsAuthenticated(false);
    setPinInput("");
  };

  // ==================== APP CRUD ====================
  const handleSaveApp = (appData: Partial<OneGateApp>) => {
    let updated: OneGateApp[];
    if (editingApp) {
      updated = apps.map((a) => (a.id === editingApp.id ? { ...a, ...appData } as OneGateApp : a));
      showToast("Link sistem berhasil diperbarui!");
    } else {
      const newApp: OneGateApp = {
        id: "app-" + Date.now(),
        name: appData.name || "Nama Aplikasi",
        shortDesc: appData.shortDesc || "Deskripsi sistem",
        category: appData.category || "lms",
        categoryLabel: appData.categoryLabel || "Sistem",
        url: appData.url || "https://",
        iconName: appData.iconName || "GraduationCap",
        ssoSupported: appData.ssoSupported ?? true,
        status: appData.status || "online",
        tags: appData.tags || ["internal"],
        isFavorite: false
      };
      updated = [newApp, ...apps];
      showToast("Link sistem baru berhasil ditambahkan!");
    }
    setApps(updated);
    saveStoredApps(updated);
    setAppModalOpen(false);
    setEditingApp(null);
  };

  const handleDeleteApp = (id: string) => {
    if (confirm("Yakin ingin menghapus link sistem ini dari portal?")) {
      const updated = apps.filter((a) => a.id !== id);
      setApps(updated);
      saveStoredApps(updated);
      showToast("Link sistem telah dihapus.");
    }
  };

  // ==================== COURSE CRUD ====================
  const handleSaveCourse = (courseData: Partial<TrainingCourse>) => {
    let updated: TrainingCourse[];
    if (editingCourse) {
      updated = courses.map((c) => (c.id === editingCourse.id ? { ...c, ...courseData } as TrainingCourse : c));
      showToast("Data modul pelatihan berhasil diperbarui!");
    } else {
      const newCourse: TrainingCourse = {
        id: "crs-" + Date.now(),
        title: courseData.title || "Judul Pelatihan Baru",
        category: courseData.category || "General",
        progress: Number(courseData.progress) || 0,
        dueDate: courseData.dueDate || "30 Des 2026",
        isMandatory: courseData.isMandatory ?? false,
        totalModules: Number(courseData.totalModules) || 5,
        completedModules: Number(courseData.completedModules) || 0,
        estimatedHours: courseData.estimatedHours || "3 Jam",
        status: courseData.progress === 100 ? "completed" : (courseData.progress || 0) > 0 ? "in-progress" : "not-started"
      };
      updated = [newCourse, ...courses];
      showToast("Modul pelatihan baru berhasil ditambahkan!");
    }
    setCourses(updated);
    saveStoredCourses(updated);
    setCourseModalOpen(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm("Yakin ingin menghapus kursus ini?")) {
      const updated = courses.filter((c) => c.id !== id);
      setCourses(updated);
      saveStoredCourses(updated);
      showToast("Kursus berhasil dihapus.");
    }
  };

  // ==================== EVENT CRUD ====================
  const handleSaveEvent = (evtData: Partial<CalendarEvent>) => {
    let updated: CalendarEvent[];
    if (editingEvent) {
      updated = events.map((e) => (e.id === editingEvent.id ? { ...e, ...evtData } as CalendarEvent : e));
      showToast("Jadwal pelatihan berhasil diperbarui!");
    } else {
      const newEvent: CalendarEvent = {
        id: "evt-" + Date.now(),
        title: evtData.title || "Sesi Webinar Baru",
        type: evtData.type || "Webinar",
        trainer: evtData.trainer || "Trainer Internal FMCU",
        date: evtData.date || "25 Okt 2026",
        time: evtData.time || "09:00 - 12:00 WIB",
        location: evtData.location || "MS Teams Live Room",
        isOnline: evtData.isOnline ?? true,
        meetingUrl: evtData.meetingUrl || "https://teams.microsoft.com",
        registeredCount: 0,
        maxCapacity: Number(evtData.maxCapacity) || 100
      };
      updated = [newEvent, ...events];
      showToast("Jadwal pelatihan baru berhasil ditambahkan!");
    }
    setEvents(updated);
    saveStoredEvents(updated);
    setEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Yakin ingin menghapus sesi pelatihan ini?")) {
      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      saveStoredEvents(updated);
      showToast("Jadwal pelatihan berhasil dihapus.");
    }
  };

  // ==================== DOCUMENT CRUD ====================
  const handleSaveDocument = (docData: Partial<DocumentItem>) => {
    let updated: DocumentItem[];
    if (editingDoc) {
      updated = docs.map((d) => (d.id === editingDoc.id ? { ...d, ...docData } as DocumentItem : d));
      showToast("Dokumen berhasil diperbarui!");
    } else {
      const newDoc: DocumentItem = {
        id: "doc-" + Date.now(),
        title: docData.title || "Dokumen SOP Baru",
        category: docData.category || "SOP",
        format: docData.format || "PDF",
        size: docData.size || "1.5 MB",
        updatedAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        downloadUrl: docData.downloadUrl || "#"
      };
      updated = [newDoc, ...docs];
      showToast("Dokumen baru berhasil diunggah!");
    }
    setDocs(updated);
    saveStoredDocuments(updated);
    setDocModalOpen(false);
    setEditingDoc(null);
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm("Yakin ingin menghapus dokumen ini?")) {
      const updated = docs.filter((d) => d.id !== id);
      setDocs(updated);
      saveStoredDocuments(updated);
      showToast("Dokumen berhasil dihapus.");
    }
  };

  // ==================== SETTINGS & RESET ====================
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredBannerAlert(bannerAlert);
    showToast("Pengaturan banner peringatan berhasil disimpan!");
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      alert("PIN minimal 4 karakter!");
      return;
    }
    saveAdminPIN(newPin);
    setNewPin("");
    setPinChangeSuccess(true);
    setTimeout(() => setPinChangeSuccess(false), 3000);
    showToast("PIN Admin baru berhasil disimpan!");
  };

  const handleResetData = () => {
    if (confirm("PERINGATAN: Semua perubahan data akan dikembalikan ke data awal default pabrik. Lanjutkan?")) {
      resetAllToDefaults();
      loadAllData();
      showToast("Data telah di-reset ke default pabrik.");
    }
  };

  // ==================== RENDER LOCK SCREEN IF NOT AUTHENTICATED ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <div className="text-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2.5 py-0.5 rounded-full">
              Area Terproteksi
            </span>
            <h1 className="text-xl font-bold text-white mt-2">
              Konsol Rahasia Admin FMCU
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Masukkan PIN Admin untuk mengelola master data sistem, link portal, modul, dan dokumen.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                PIN Akses Administrator
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Masukkan PIN (Default: FMCU2026)"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              {pinError && (
                <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> PIN salah. Silakan coba lagi.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30"
            >
              Buka Konsol Admin
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Portal Publik</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ==================== AUTHENTICATED ADMIN DASHBOARD ====================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <header className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
              FM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">
                  FMCU Admin Console
                </span>
                <span className="text-[10px] font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full">
                  Master CRUD Mode
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Web Publik</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Keluar dari Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: "apps", label: "Master Link Connection (One-Gate)", icon: Link2, count: apps.length },
            { id: "courses", label: "Kelola Modul Pelatihan", icon: BookOpen, count: courses.length },
            { id: "events", label: "Jadwal & Webinar", icon: Calendar, count: events.length },
            { id: "docs", label: "Upload & Arsip SOP", icon: FileText, count: docs.length },
            { id: "settings", label: "Pengaturan & Backup", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ==================== TAB 1: MASTER APPS CRUD ==================== */}
        {activeTab === "apps" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-white">Master Data Link Connection (One-Gate Apps)</h2>
                <p className="text-xs text-slate-400">Kelola daftar sistem, aplikasi internal, LMS, dan link yang tampil di halaman depan.</p>
              </div>
              <button
                onClick={() => {
                  setEditingApp(null);
                  setAppModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Link Sistem Baru</span>
              </button>
            </div>

            {/* Apps Table */}
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Aplikasi</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">URL Connection</th>
                    <th className="py-3 px-4">SSO Ready</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {apps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{app.name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{app.shortDesc}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-blue-300">
                        {app.category}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 truncate max-w-[200px]">
                        <a href={app.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 hover:underline flex items-center gap-1">
                          <span className="truncate">{app.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        {app.ssoSupported ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> SSO Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Manual</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          app.status === "online"
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800"
                            : "bg-amber-950/60 text-amber-300 border border-amber-800"
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingApp(app);
                              setAppModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: COURSES CRUD ==================== */}
        {activeTab === "courses" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-white">Kelola Modul Pelatihan & Compliance</h2>
                <p className="text-xs text-slate-400">Atur kursus aktif, modul kepatuhan wajib, batas waktu, dan perkiraan jam belajar.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setCourseModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Modul Pelatihan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {courses.map((c) => (
                <div key={c.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.isMandatory ? "bg-red-950 text-red-300 border border-red-800" : "bg-slate-700 text-slate-300"
                      }`}>
                        {c.isMandatory ? "Wajib" : c.category}
                      </span>
                      <span className="text-xs text-slate-400">Tenggat: {c.dueDate}</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Progres: {c.completedModules}/{c.totalModules} modul ({c.progress}%) • {c.estimatedHours}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">ID: {c.id}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCourse(c);
                          setCourseModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: EVENTS CRUD ==================== */}
        {activeTab === "events" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-white">Jadwal Sesi & Webinar Training Center</h2>
                <p className="text-xs text-slate-400">Jadwalkan sesi pelatihan daring (Teams/Zoom) atau workshop luring di kantor.</p>
              </div>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Jadwalkan Sesi Baru</span>
              </button>
            </div>

            <div className="space-y-3">
              {events.map((e) => (
                <div key={e.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                        {e.type}
                      </span>
                      <span className="text-xs text-slate-400">{e.date} • {e.time}</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm">{e.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fasilitator: <strong className="text-slate-300">{e.trainer}</strong> | Lokasi: {e.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setEditingEvent(e);
                        setEventModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: DOCUMENTS CRUD ==================== */}
        {activeTab === "docs" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-white">Upload & Kelola Arsip SOP / Dokumen</h2>
                <p className="text-xs text-slate-400">Tambahkan file PDF SOP kerja, pedoman kepatuhan, slide pelatihan, atau handbook.</p>
              </div>
              <button
                onClick={() => {
                  setEditingDoc(null);
                  setDocModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all self-start sm:self-auto"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Dokumen Baru</span>
              </button>
            </div>

            <div className="bg-slate-800/50 border border-slate-800 rounded-xl divide-y divide-slate-800">
              {docs.map((d) => (
                <div key={d.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{d.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Format: <span className="text-blue-400 font-semibold">{d.format}</span> • Ukuran: {d.size} • Kategori: {d.category} • Diperbarui {d.updatedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingDoc(d);
                        setDocModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(d.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: SETTINGS & BACKUP ==================== */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Banner Reminder Settings */}
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <span>Pengaturan Banner Peringatan Kepatuhan</span>
              </h3>
              <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Judul Peringatan</label>
                  <input
                    type="text"
                    value={bannerAlert.title}
                    onChange={(e) => setBannerAlert({ ...bannerAlert, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Batas Waktu Jatuh Tempo</label>
                  <input
                    type="text"
                    value={bannerAlert.dueDate}
                    onChange={(e) => setBannerAlert({ ...bannerAlert, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs"
                >
                  Simpan Banner
                </button>
              </form>
            </div>

            {/* Change Admin PIN */}
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Ubah PIN Rahasia Admin</span>
              </h3>
              <form onSubmit={handleChangePin} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">PIN Rahasia Baru (Min. 4 karakter)</label>
                  <input
                    type="password"
                    placeholder="Ketik PIN baru..."
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                {pinChangeSuccess && (
                  <p className="text-emerald-400 text-xs">✓ PIN admin berhasil diganti.</p>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs"
                >
                  Perbarui PIN
                </button>
              </form>
            </div>

            {/* Factory Reset */}
            <div className="md:col-span-2 bg-rose-950/20 border border-rose-900/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-rose-300">Reset Data Master ke Default Pabrik</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Kembalikan seluruh daftar link, kursus, jadwal, dan SOP ke data bawaan awal sistem.
                </p>
              </div>
              <button
                onClick={handleResetData}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Default</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ==================== MODAL: ADD/EDIT APP LINK ==================== */}
      {appModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-300 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">
              {editingApp ? "Edit Link Sistem" : "Tambah Link Sistem Baru"}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                handleSaveApp({
                  name: (form.elements.namedItem("name") as HTMLInputElement).value,
                  shortDesc: (form.elements.namedItem("shortDesc") as HTMLInputElement).value,
                  category: (form.elements.namedItem("category") as HTMLSelectElement).value as any,
                  categoryLabel: (form.elements.namedItem("categoryLabel") as HTMLInputElement).value,
                  url: (form.elements.namedItem("url") as HTMLInputElement).value,
                  iconName: (form.elements.namedItem("iconName") as HTMLSelectElement).value,
                  ssoSupported: (form.elements.namedItem("ssoSupported") as HTMLInputElement).checked,
                  status: (form.elements.namedItem("status") as HTMLSelectElement).value as any,
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-slate-400 mb-1">Nama Aplikasi / Sistem</label>
                <input
                  name="name"
                  defaultValue={editingApp?.name || ""}
                  required
                  placeholder="Contoh: FMCU Core LMS"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">URL / Link Tujuan</label>
                <input
                  name="url"
                  defaultValue={editingApp?.url || "https://"}
                  required
                  placeholder="https://lms.fmcu.co.id"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Deskripsi Singkat</label>
                <input
                  name="shortDesc"
                  defaultValue={editingApp?.shortDesc || ""}
                  required
                  placeholder="Contoh: Platform materi e-learning dan kuis"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kategori Internal</label>
                  <select
                    name="category"
                    defaultValue={editingApp?.category || "lms"}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="lms">LMS & Kursus</option>
                    <option value="classroom">Kelas Virtual</option>
                    <option value="assessment">Ujian & Kuis</option>
                    <option value="certification">Sertifikat</option>
                    <option value="repository">SOP & Buku</option>
                    <option value="tools">Tools & Lab</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Label Kategori</label>
                  <input
                    name="categoryLabel"
                    defaultValue={editingApp?.categoryLabel || "Core LMS"}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Ikon Tampilan</label>
                  <select
                    name="iconName"
                    defaultValue={editingApp?.iconName || "GraduationCap"}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="GraduationCap">Topi Wisuda (LMS)</option>
                    <option value="Video">Kamera Video (Teams/Zoom)</option>
                    <option value="FileSpreadsheet">Lembar Ujian (Assessment)</option>
                    <option value="Award">Piala / Medali (Sertifikat)</option>
                    <option value="BookOpen">Buku Terbuka (Library)</option>
                    <option value="Target">Target Panah (Skill Matrix)</option>
                    <option value="FolderGit2">Folder Dokumen (SOP)</option>
                    <option value="Cpu">Chip / Simulasi (VR Lab)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status Sistem</label>
                  <select
                    name="status"
                    defaultValue={editingApp?.status || "online"}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="online">Online (Siap Akses)</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="restricted">Khusus Jaringan Kantor</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="ssoSupported"
                    defaultChecked={editingApp?.ssoSupported ?? true}
                    className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span>Dukung Single Sign-On (SSO Otomatis)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setAppModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Simpan Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD/EDIT COURSE ==================== */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-300 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingCourse ? "Edit Modul Pelatihan" : "Tambah Modul Pelatihan Baru"}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                handleSaveCourse({
                  title: (form.elements.namedItem("title") as HTMLInputElement).value,
                  category: (form.elements.namedItem("category") as HTMLInputElement).value,
                  dueDate: (form.elements.namedItem("dueDate") as HTMLInputElement).value,
                  progress: Number((form.elements.namedItem("progress") as HTMLInputElement).value),
                  totalModules: Number((form.elements.namedItem("totalModules") as HTMLInputElement).value),
                  completedModules: Number((form.elements.namedItem("completedModules") as HTMLInputElement).value),
                  estimatedHours: (form.elements.namedItem("estimatedHours") as HTMLInputElement).value,
                  isMandatory: (form.elements.namedItem("isMandatory") as HTMLInputElement).checked,
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-slate-400 mb-1">Judul Pelatihan</label>
                <input
                  name="title"
                  defaultValue={editingCourse?.title || ""}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kategori Pelatihan</label>
                  <input
                    name="category"
                    defaultValue={editingCourse?.category || "Compliance"}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Batas Waktu (Due Date)</label>
                  <input
                    name="dueDate"
                    defaultValue={editingCourse?.dueDate || "28 Okt 2026"}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Progres (%)</label>
                  <input
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingCourse?.progress ?? 0}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Total Modul</label>
                  <input
                    name="totalModules"
                    type="number"
                    defaultValue={editingCourse?.totalModules || 8}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Modul Selesai</label>
                  <input
                    name="completedModules"
                    type="number"
                    defaultValue={editingCourse?.completedModules || 0}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimasi Durasi (contoh: 4 Jam)</label>
                <input
                  name="estimatedHours"
                  defaultValue={editingCourse?.estimatedHours || "4 Jam"}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isMandatory"
                    defaultChecked={editingCourse?.isMandatory ?? true}
                    className="rounded text-red-600 bg-slate-900 border-slate-700"
                  />
                  <span className="text-red-400 font-semibold">Tandai sebagai Pelatihan Wajib Kepatuhan (Mandatory HSE/HR)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Simpan Modul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD/EDIT EVENT ==================== */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-300 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingEvent ? "Edit Jadwal Pelatihan" : "Jadwalkan Sesi Baru"}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                handleSaveEvent({
                  title: (form.elements.namedItem("title") as HTMLInputElement).value,
                  type: (form.elements.namedItem("type") as HTMLSelectElement).value as any,
                  trainer: (form.elements.namedItem("trainer") as HTMLInputElement).value,
                  date: (form.elements.namedItem("date") as HTMLInputElement).value,
                  time: (form.elements.namedItem("time") as HTMLInputElement).value,
                  location: (form.elements.namedItem("location") as HTMLInputElement).value,
                  meetingUrl: (form.elements.namedItem("meetingUrl") as HTMLInputElement).value,
                  isOnline: (form.elements.namedItem("isOnline") as HTMLInputElement).checked,
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-slate-400 mb-1">Judul Sesi</label>
                <input
                  name="title"
                  defaultValue={editingEvent?.title || ""}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tipe Acara</label>
                  <select
                    name="type"
                    defaultValue={editingEvent?.type || "Webinar"}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Webinar">Webinar Online</option>
                    <option value="Workshop Offline">Workshop Offline</option>
                    <option value="Certification Exam">Ujian Sertifikasi</option>
                    <option value="Sharing Session">Sharing Session</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nama Fasilitator / Trainer</label>
                  <input
                    name="trainer"
                    defaultValue={editingEvent?.trainer || ""}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tanggal (contoh: 24 Okt 2026)</label>
                  <input
                    name="date"
                    defaultValue={editingEvent?.date || "24 Okt 2026"}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Waktu (contoh: 09:00 - 11:30 WIB)</label>
                  <input
                    name="time"
                    defaultValue={editingEvent?.time || "09:00 - 11:30 WIB"}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Lokasi / Ruang Meeting</label>
                <input
                  name="location"
                  defaultValue={editingEvent?.location || "MS Teams Live Room 1"}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tautan Meeting (Jika Online)</label>
                <input
                  name="meetingUrl"
                  defaultValue={editingEvent?.meetingUrl || "https://teams.microsoft.com"}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isOnline"
                    defaultChecked={editingEvent?.isOnline ?? true}
                    className="rounded text-blue-600 bg-slate-900 border-slate-700"
                  />
                  <span>Acara diselenggarakan secara daring (Online)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: UPLOAD/EDIT DOCUMENT ==================== */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-300 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingDoc ? "Edit Dokumen SOP" : "Upload Dokumen Baru"}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                handleSaveDocument({
                  title: (form.elements.namedItem("title") as HTMLInputElement).value,
                  category: (form.elements.namedItem("category") as HTMLSelectElement).value as any,
                  format: (form.elements.namedItem("format") as HTMLSelectElement).value as any,
                  size: (form.elements.namedItem("size") as HTMLInputElement).value,
                  downloadUrl: (form.elements.namedItem("downloadUrl") as HTMLInputElement).value,
                });
              }}
              className="space-y-3"
            >
              {/* File picker that automatically extracts file details */}
              <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-900/50">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">Pilih file dari komputer Anda</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Mendukung PDF, PPTX, DOCX, XLSX</p>
                <input
                  type="file"
                  accept=".pdf,.docx,.pptx,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
                      const sizeInput = document.querySelector('input[name="size"]') as HTMLInputElement;
                      const formatSelect = document.querySelector('select[name="format"]') as HTMLSelectElement;
                      if (titleInput && !titleInput.value) {
                        titleInput.value = file.name.replace(/\.[^/.]+$/, "");
                      }
                      if (sizeInput) {
                        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                        sizeInput.value = `${sizeMB} MB`;
                      }
                      if (formatSelect) {
                        const ext = file.name.split(".").pop()?.toUpperCase();
                        if (ext === "PDF" || ext === "PPTX" || ext === "DOCX" || ext === "XLSX") {
                          formatSelect.value = ext;
                        }
                      }
                    }
                  }}
                  className="mt-2 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Judul Dokumen</label>
                <input
                  name="title"
                  defaultValue={editingDoc?.title || ""}
                  required
                  placeholder="SOP Keselamatan Kerja & Prosedur 2026"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kategori Dokumen</label>
                  <select
                    name="category"
                    defaultValue={editingDoc?.category || "SOP"}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="SOP">SOP Keselamatan / Operasional</option>
                    <option value="Manual Guide">Panduan Sistem (Manual)</option>
                    <option value="Modul Pelatihan">Slide Materi Pelatihan</option>
                    <option value="Kebijakan Perusahaan">Kebijakan Perusahaan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Format File</label>
                  <select
                    name="format"
                    defaultValue={editingDoc?.format || "PDF"}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="PPTX">PPTX</option>
                    <option value="XLSX">XLSX</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Ukuran File</label>
                  <input
                    name="size"
                    defaultValue={editingDoc?.size || "2.5 MB"}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">URL Unduhan (Opsional)</label>
                  <input
                    name="downloadUrl"
                    defaultValue={editingDoc?.downloadUrl || "#"}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
