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
  getGasApiUrl, 
  saveGasApiUrl, 
  getGdriveFolderId, 
  saveGdriveFolderId, 
  getLastSyncTime, 
  testGasConnection, 
  fetchPortalDataFromCloud, 
  syncAllToCloud, 
  uploadFileToGoogleDrive,
  syncGoogleCalendarEvents,
  fetchEventsFromIcalUrl
} from "@/lib/cloudSync";
import { 
  getGoogleCalendarId, 
  saveGoogleCalendarId, 
  getGoogleCalendarIcalUrl, 
  saveGoogleCalendarIcalUrl,
  getGoogleCalendarEmbedUrl,
  saveGoogleCalendarEmbedUrl,
  parseGoogleCalendarEmbedUrl,
  generateGoogleCalendarAddUrl
} from "@/lib/calendarUtils";
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  isFirebaseConfigured,
  testFirestoreConnection,
  syncAllToFirestore,
  fetchAllFromFirestore,
  saveAppToFirestore,
  deleteAppFromFirestore,
  saveCourseToFirestore,
  deleteCourseFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  saveDocToFirestore,
  deleteDocFromFirestore,
  saveBannerToFirestore,
  FirebaseConfigParams
} from "@/lib/firebase";
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  LayoutGrid, 
  BookOpen, 
  Calendar, 
  CalendarDays,
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
  Link2,
  Cloud,
  RefreshCw,
  Database,
  Copy,
  ImageIcon,
  Download,
  Flame,
  Presentation,
  Maximize2,
  Minimize2,
  X
} from "lucide-react";
import { parseGoogleSlideEmbedUrl, getGoogleSlideExternalUrl } from "@/lib/slideUtils";

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
  const [customIconPreview, setCustomIconPreview] = useState<string | null>(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);
  const [adminSlidePreviewCourse, setAdminSlidePreviewCourse] = useState<TrainingCourse | null>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);

  // Settings Form States
  const [newPin, setNewPin] = useState("");
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cloud Sync States
  const [gasUrl, setGasUrl] = useState("");
  const [folderId, setFolderId] = useState("");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<"connected" | "disconnected" | "testing" | "idle">("idle");
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);

  // Doc File Upload State
  const [selectedDocFile, setSelectedDocFile] = useState<{ file: File; base64: string } | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // App Icon Upload State
  const [selectedIconFile, setSelectedIconFile] = useState<{ file: File; base64: string } | null>(null);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  // Universal Drive Uploader State (Any photo, file, video, archive)
  const [universalFile, setUniversalFile] = useState<{ file: File; base64: string } | null>(null);
  const [isUniversalUploading, setIsUniversalUploading] = useState(false);
  const [universalUploadResult, setUniversalUploadResult] = useState<{
    fileId: string;
    fileName: string;
    mimeType?: string;
    downloadUrl?: string;
    viewUrl?: string;
    directImageUrl?: string;
  } | null>(null);
  const [copiedUrlType, setCopiedUrlType] = useState<string | null>(null);

  // Firebase Google Console States (Text Plain Database)
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfigParams>({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  });
  const [rawFirebaseJson, setRawFirebaseJson] = useState("");
  const [isTestingFirestore, setIsTestingFirestore] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState<"connected" | "disconnected" | "testing" | "idle">("idle");
  const [firestoreMessage, setFirestoreMessage] = useState<string | null>(null);

  // Google Calendar Integration States
  const [gcalId, setGcalId] = useState<string>("primary");
  const [gcalIcalUrl, setGcalIcalUrl] = useState<string>("");
  const [gcalEmbedUrl, setGcalEmbedUrl] = useState<string>("");
  const [isSyncingGcal, setIsSyncingGcal] = useState(false);
  const [gcalSyncMessage, setGcalSyncMessage] = useState<string | null>(null);

  // Load Data on Mount
  useEffect(() => {
    // Check if session has admin unlocked
    const sessionAuth = sessionStorage.getItem("fmcu_admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
    loadAllData();
    const storedUrl = getGasApiUrl();
    const storedFolder = getGdriveFolderId();
    const storedLastSync = getLastSyncTime();
    setGasUrl(storedUrl);
    setFolderId(storedFolder);
    setLastSync(storedLastSync);
    setGcalId(getGoogleCalendarId());
    setGcalIcalUrl(getGoogleCalendarIcalUrl());
    setGcalEmbedUrl(getGoogleCalendarEmbedUrl());

    // Load Firebase Google Console Config
    const fbConf = getFirebaseConfig();
    setFirebaseConfig(fbConf);
    if (isFirebaseConfigured()) {
      setFirestoreStatus("connected");
      fetchAllFromFirestore().then((res) => {
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
    } else if (storedUrl) {
      setCloudStatus("connected");
      fetchPortalDataFromCloud(storedUrl).then((res) => {
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
          setLastSync(new Date().toLocaleTimeString("id-ID"));
        }
      }).catch(() => {});
    }
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

  // Background Cloud Sync (Google Console Firestore + Google Sheets)
  const triggerBackgroundCloudSync = (
    updatedApps = apps,
    updatedCourses = courses,
    updatedEvents = events,
    updatedDocs = docs,
    updatedBanner = bannerAlert
  ) => {
    // 1. Google Console Firestore (Text Plain Database)
    if (isFirebaseConfigured()) {
      syncAllToFirestore({
        apps: updatedApps,
        courses: updatedCourses,
        events: updatedEvents,
        docs: updatedDocs,
        bannerAlert: updatedBanner
      }).then(() => {
        setFirestoreStatus("connected");
      }).catch((err) => console.warn("Firestore sync warning:", err));
    }

    // 2. Google Sheets fallback
    if (getGasApiUrl()) {
      syncAllToCloud({
        apps: updatedApps,
        courses: updatedCourses,
        events: updatedEvents,
        docs: updatedDocs,
        bannerAlert: updatedBanner
      }).then(() => {
        setLastSync(new Date().toLocaleTimeString("id-ID"));
      }).catch(() => {});
    }
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
  const handleSaveApp = async (appData: Partial<OneGateApp>) => {
    let finalIconUrl: string | null | undefined = customIconPreview;

    // Upload custom icon to Google Drive if selected and cloud is configured
    if (selectedIconFile && getGasApiUrl()) {
      setIsUploadingIcon(true);
      showToast("Mengunggah ikon sistem ke Google Drive...");
      try {
        const uploadRes = await uploadFileToGoogleDrive({
          fileName: `icon_${Date.now()}_${selectedIconFile.file.name}`,
          fileBase64: selectedIconFile.base64,
          mimeType: selectedIconFile.file.type || "image/png"
        });
        if (uploadRes.success && (uploadRes.directImageUrl || uploadRes.downloadUrl)) {
          finalIconUrl = uploadRes.directImageUrl || uploadRes.downloadUrl || null;
          showToast("Ikon berhasil disimpan ke Google Drive!");
        }
      } catch (e) {
        console.error("Icon upload error:", e);
      } finally {
        setIsUploadingIcon(false);
      }
    }

    let updated: OneGateApp[];
    if (editingApp) {
      updated = apps.map((a) => (a.id === editingApp.id ? { 
        ...a, 
        ...appData,
        customIconUrl: finalIconUrl || a.customIconUrl
      } as OneGateApp : a));
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
        customIconUrl: finalIconUrl || undefined,
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
    triggerBackgroundCloudSync(updated, courses, events, docs, bannerAlert);
    setAppModalOpen(false);
    setEditingApp(null);
    setCustomIconPreview(null);
    setSelectedIconFile(null);
  };

  const handleDeleteApp = (id: string) => {
    if (confirm("Yakin ingin menghapus link sistem ini dari portal?")) {
      const updated = apps.filter((a) => a.id !== id);
      setApps(updated);
      saveStoredApps(updated);
      triggerBackgroundCloudSync(updated, courses, events, docs, bannerAlert);
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
        title: courseData.title || "Modul Pelatihan Baru",
        category: courseData.category || "General",
        slideUrl: courseData.slideUrl || "",
        description: courseData.description || "",
        estimatedHours: courseData.estimatedHours || "30 Menit",
        status: "in-progress"
      };
      updated = [newCourse, ...courses];
      showToast("Modul pelatihan baru berhasil ditambahkan!");
    }
    setCourses(updated);
    saveStoredCourses(updated);
    triggerBackgroundCloudSync(apps, updated, events, docs, bannerAlert);
    setCourseModalOpen(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm("Yakin ingin menghapus kursus ini?")) {
      const updated = courses.filter((c) => c.id !== id);
      setCourses(updated);
      saveStoredCourses(updated);
      triggerBackgroundCloudSync(apps, updated, events, docs, bannerAlert);
      showToast("Kursus berhasil dihapus.");
    }
  };

  // ==================== EVENT CRUD & GOOGLE CALENDAR ====================
  const handleSyncByIcal = async () => {
    if (!gcalIcalUrl || !gcalIcalUrl.trim()) {
      showToast("Harap masukkan Tautan iCal publik (.ics) terlebih dahulu.");
      setGcalSyncMessage("✕ Harap masukkan Tautan iCal publik (.ics) terlebih dahulu.");
      return;
    }
    setIsSyncingGcal(true);
    setGcalSyncMessage(null);
    try {
      saveGoogleCalendarIcalUrl(gcalIcalUrl);
      const res = await fetchEventsFromIcalUrl(gcalIcalUrl.trim());
      if (res.success && res.events && res.events.length > 0) {
        setEvents(res.events);
        saveStoredEvents(res.events);
        triggerBackgroundCloudSync(apps, courses, res.events, docs, bannerAlert);
        showToast(`Berhasil menyinkronkan ${res.events.length} jadwal dari iCal!`);
        setGcalSyncMessage(`✓ Berhasil menarik ${res.events.length} jadwal dari iCal.`);
      } else {
        const errMsg = res.error || "Tidak ada jadwal yang ditemukan di tautan iCal ini.";
        showToast(errMsg);
        setGcalSyncMessage(`✕ ${errMsg}`);
      }
    } catch (err: any) {
      showToast("Terjadi kesalahan saat membaca link iCal.");
      setGcalSyncMessage(`✕ Error: ${err.message}`);
    } finally {
      setIsSyncingGcal(false);
    }
  };

  const handleSyncByCalendarId = async () => {
    setIsSyncingGcal(true);
    setGcalSyncMessage(null);
    try {
      saveGoogleCalendarId(gcalId);
      const res = await syncGoogleCalendarEvents(gcalId || "primary");
      if (res.success && res.events && res.events.length > 0) {
        setEvents(res.events);
        saveStoredEvents(res.events);
        triggerBackgroundCloudSync(apps, courses, res.events, docs, bannerAlert);
        showToast(`Berhasil menyinkronkan ${res.events.length} jadwal dari Google Calendar!`);
        setGcalSyncMessage(`✓ Berhasil menarik ${res.events.length} jadwal dari Google Calendar.`);
      } else {
        const errMsg = res.error || (res as any).message || "Tidak ada jadwal ditemukan atau Google Apps Script belum diperbarui.";
        showToast(errMsg);
        setGcalSyncMessage(`✕ ${errMsg}`);
      }
    } catch (err: any) {
      showToast("Terjadi kesalahan saat sinkronisasi Google Calendar.");
      setGcalSyncMessage(`✕ Error: ${err.message}`);
    } finally {
      setIsSyncingGcal(false);
    }
  };

  const handleSyncGoogleCalendar = async () => {
    if (gcalIcalUrl && gcalIcalUrl.trim().length > 0) {
      await handleSyncByIcal();
    } else {
      await handleSyncByCalendarId();
    }
  };

  const handleSaveEmbedUrl = () => {
    const clean = parseGoogleCalendarEmbedUrl(gcalEmbedUrl);
    setGcalEmbedUrl(clean);
    saveGoogleCalendarEmbedUrl(clean);
    const updatedBanner = {
      ...bannerAlert,
      googleCalendarEmbedUrl: clean,
    };
    setBannerAlert(updatedBanner);
    saveStoredBannerAlert(updatedBanner);
    triggerBackgroundCloudSync(apps, courses, events, docs, updatedBanner);
    showToast("Tautan embed Google Calendar Live berhasil disimpan & disinkronkan ke seluruh user!");
  };

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
        location: evtData.location || "Google Meet",
        isOnline: evtData.isOnline ?? true,
        meetingUrl: evtData.meetingUrl || "https://meet.google.com",
        registeredCount: 0,
        maxCapacity: Number(evtData.maxCapacity) || 100,
        description: evtData.description || "",
      };
      updated = [newEvent, ...events];
      showToast("Jadwal pelatihan baru berhasil ditambahkan!");
    }
    setEvents(updated);
    saveStoredEvents(updated);
    triggerBackgroundCloudSync(apps, courses, updated, docs, bannerAlert);
    setEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Yakin ingin menghapus sesi pelatihan ini?")) {
      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      saveStoredEvents(updated);
      triggerBackgroundCloudSync(apps, courses, updated, docs, bannerAlert);
      showToast("Jadwal pelatihan berhasil dihapus.");
    }
  };

  // ==================== DOCUMENT CRUD ====================
  const handleSaveDocument = async (docData: Partial<DocumentItem>) => {
    let finalDocUrl = docData.downloadUrl || "#";
    let gdriveId: string | undefined = undefined;
    let viewUrl: string | undefined = undefined;

    // Upload to Google Drive if file selected and GAS configured
    if (selectedDocFile && getGasApiUrl()) {
      setIsUploadingDoc(true);
      showToast("Mengunggah file ke Google Drive...");
      try {
        const uploadRes = await uploadFileToGoogleDrive({
          fileName: selectedDocFile.file.name,
          fileBase64: selectedDocFile.base64,
          mimeType: selectedDocFile.file.type || "application/octet-stream"
        });
        if (uploadRes.success) {
          finalDocUrl = uploadRes.downloadUrl || uploadRes.directImageUrl || "#";
          gdriveId = uploadRes.fileId;
          viewUrl = uploadRes.viewUrl;
          showToast("File/Foto berhasil disimpan ke Google Drive!");
        }
      } catch (err) {
        console.error("Gdrive upload error:", err);
      } finally {
        setIsUploadingDoc(false);
      }
    }

    let updated: DocumentItem[];
    if (editingDoc) {
      updated = docs.map((d) => (d.id === editingDoc.id ? { 
        ...d, 
        ...docData, 
        downloadUrl: finalDocUrl,
        ...(gdriveId ? { gdriveFileId: gdriveId } : {}),
        ...(viewUrl ? { viewUrl } : {})
      } as DocumentItem : d));
      showToast("Dokumen berhasil diperbarui!");
    } else {
      const newDoc: DocumentItem = {
        id: "doc-" + Date.now(),
        title: docData.title || "File/Dokumen Baru",
        category: docData.category || "SOP",
        format: docData.format || "PDF",
        size: docData.size || "1.0 MB",
        updatedAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        downloadUrl: finalDocUrl,
        ...(gdriveId ? { gdriveFileId: gdriveId } : {}),
        ...(viewUrl ? { viewUrl } : {})
      };
      updated = [newDoc, ...docs];
      showToast("Dokumen baru berhasil disimpan!");
    }
    setDocs(updated);
    saveStoredDocuments(updated);
    triggerBackgroundCloudSync(apps, courses, events, updated, bannerAlert);
    setDocModalOpen(false);
    setEditingDoc(null);
    setSelectedDocFile(null);
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm("Yakin ingin menghapus dokumen ini?")) {
      const updated = docs.filter((d) => d.id !== id);
      setDocs(updated);
      saveStoredDocuments(updated);
      triggerBackgroundCloudSync(apps, courses, events, updated, bannerAlert);
      showToast("Dokumen berhasil dihapus.");
    }
  };

  // ==================== SETTINGS & RESET ====================
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredBannerAlert(bannerAlert);
    triggerBackgroundCloudSync(apps, courses, events, docs, bannerAlert);
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
                  setCustomIconPreview(null);
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
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 p-1 overflow-hidden shadow-inner">
                            {app.customIconUrl ? (
                              <img src={app.customIconUrl} alt={app.name} className="w-full h-full object-contain" />
                            ) : (
                              <LayoutGrid className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{app.name}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">{app.shortDesc}</div>
                          </div>
                        </div>
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
                              setCustomIconPreview(app.customIconUrl || null);
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
              {courses.map((c) => {
                const hasSlide = Boolean(c.slideUrl && c.slideUrl.trim().length > 0);
                return (
                  <div key={c.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                            {c.category}
                          </span>
                          {hasSlide ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 flex items-center gap-1">
                              <Presentation className="w-3 h-3 text-amber-400" /> Slide Google
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Tanpa slide</span>
                          )}
                        </div>
                        {c.estimatedHours && (
                          <span className="text-xs text-slate-400">Durasi: {c.estimatedHours}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-white text-sm">{c.title}</h3>
                      {c.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {c.description}
                        </p>
                      )}
                      {hasSlide && (
                        <div className="mt-2 text-[11px] font-mono text-slate-400 truncate bg-slate-900/60 px-2 py-1 rounded border border-slate-800 flex items-center gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">Slide:</span>
                          <span className="truncate">{c.slideUrl}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">ID: {c.id}</span>
                      <div className="flex items-center gap-1.5">
                        {hasSlide && (
                          <button
                            type="button"
                            onClick={() => setAdminSlidePreviewCourse(c)}
                            className="px-2.5 py-1 text-xs bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center gap-1 font-semibold"
                            title="Tes presentasi slide show"
                          >
                            <Presentation className="w-3 h-3" /> Tes Slide
                          </button>
                        )}
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
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: EVENTS CRUD & GOOGLE CALENDAR ==================== */}
        {activeTab === "events" && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Google Calendar Ready
                  </span>
                  <span className="text-xs text-slate-400">Total: {events.length} Jadwal</span>
                </div>
                <h2 className="text-base font-bold text-white">Jadwal Sesi & Integrasi Google Calendar</h2>
                <p className="text-xs text-slate-400">Tarik event langsung dari Google Calendar atau kelola sesi pelatihan internal secara manual.</p>
              </div>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all self-start sm:self-auto shrink-0 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Sesi Manual</span>
              </button>
            </div>

            {/* Google Calendar Direct Sync Card */}
            <div className="bg-slate-900/80 border border-blue-900/40 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-sm">Integrasi & Sinkronisasi Google Calendar</h3>
                    <p className="text-[11px] text-slate-400">Pilih salah satu metode di bawah untuk menarik jadwal otomatis ke portal.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSyncGoogleCalendar}
                  disabled={isSyncingGcal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all self-start sm:self-auto shrink-0 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGcal ? "animate-spin" : ""}`} />
                  <span>{isSyncingGcal ? "Menyinkronkan..." : "Sinkronkan Sekarang"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Method 1: Calendar ID via Google Apps Script */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Metode 1: Google Calendar ID</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-medium">Google Apps Script</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Menggunakan CalendarApp internal. Kalender <strong className="text-slate-300">tidak perlu publik</strong> jika Apps Script dibuat di akun yang sama.
                    </p>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Calendar ID / Email:</label>
                      <input
                        type="text"
                        value={gcalId}
                        onChange={(e) => setGcalId(e.target.value)}
                        placeholder="regional.bestie@familymartindonesia.com"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-[11px] placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncByCalendarId}
                    disabled={isSyncingGcal}
                    className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingGcal ? "animate-spin" : ""}`} />
                    <span>Tarik via Calendar ID (Apps Script)</span>
                  </button>
                </div>

                {/* Method 2: Public iCal Feed (.ics) */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Metode 2: Tautan iCal Publik (.ics)</span>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-medium">iCal URL</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Langsung dibaca server. Syarat: kalender harus dicentang <strong className="text-amber-300 font-semibold">&quot;Make available to public&quot;</strong> di Google Calendar.
                    </p>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Alamat iCal (.ics):</label>
                      <input
                        type="text"
                        value={gcalIcalUrl}
                        onChange={(e) => setGcalIcalUrl(e.target.value)}
                        placeholder="https://calendar.google.com/calendar/ical/.../public/basic.ics"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-[11px] placeholder:text-slate-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncByIcal}
                    disabled={isSyncingGcal}
                    className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingGcal ? "animate-spin" : ""}`} />
                    <span>Tarik via Tautan iCal (.ics)</span>
                  </button>
                </div>
              </div>

              {/* Method 3: Google Calendar Live (Embed / Iframe Link) */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Tautan Embed / Iframe Google Calendar Live</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">Tampilan Web Langsung</span>
                  </div>
                  {gcalEmbedUrl && (
                    <a
                      href={parseGoogleCalendarEmbedUrl(gcalEmbedUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Tes Buka Embed</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Menampilkan kalender resmi Google Calendar di portal web. Anda bisa memasukkan URL embed atau kode tag <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">&lt;iframe src=&quot;...&quot;&gt;&lt;/iframe&gt;</code> langsung.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <input
                    type="text"
                    value={gcalEmbedUrl}
                    onChange={(e) => setGcalEmbedUrl(e.target.value)}
                    placeholder="https://calendar.google.com/calendar/embed?src=... atau <iframe src='...'></iframe>"
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-[11px] placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveEmbedUrl}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Embed Kalender</span>
                  </button>
                </div>
              </div>

              {gcalSyncMessage && (
                <div className={`text-xs px-3.5 py-2.5 rounded-lg flex items-start gap-2 ${
                  gcalSyncMessage.startsWith("✕") 
                    ? "text-rose-300 bg-rose-950/50 border border-rose-800" 
                    : "text-emerald-300 bg-emerald-950/50 border border-emerald-800"
                }`}>
                  <span className={`w-2 h-2 rounded-full mt-1 ${gcalSyncMessage.startsWith("✕") ? "bg-rose-400" : "bg-emerald-400"} shrink-0`} />
                  <span className="leading-snug">{gcalSyncMessage}</span>
                </div>
              )}
            </div>

            {/* List of Events */}
            <div className="space-y-3">
              {events.map((e) => {
                const isFromGcal = Boolean(e.googleEventId);
                const gcalAddLink = generateGoogleCalendarAddUrl(e);

                return (
                  <div key={e.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                          {e.type}
                        </span>
                        {isFromGcal && (
                          <span className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Google Calendar
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{e.date} • {e.time}</span>
                      </div>

                      <h3 className="font-semibold text-white text-sm truncate">{e.title}</h3>
                      <p className="text-xs text-slate-400">
                        Fasilitator: <strong className="text-slate-300">{e.trainer}</strong> | Lokasi: <strong className="text-slate-300">{e.location}</strong>
                      </p>

                      {e.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 italic">
                          {e.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <a
                        href={gcalAddLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1"
                        title="Tes link tambah ke Google Calendar"
                      >
                        <ExternalLink className="w-3 h-3 text-blue-400" /> Cal Link
                      </a>
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
                );
              })}
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
                  setSelectedDocFile(null);
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
                        setSelectedDocFile(null);
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
            
            {/* 1. GOOGLE CONSOLE FIRESTORE (TEXT PLAIN & REALTIME SYNC) */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-amber-950/20 border border-amber-900/40 rounded-xl p-5 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>1. Google Console Firestore (Database Text Plain & Real-Time Sync)</span>
                      {firestoreStatus === "connected" ? (
                        <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Terhubung Real-Time
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full">
                          ● Belum Terkonfigurasi
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Seluruh data teks (link sistem, modul pelatihan, jadwal, metadata SOP, dan banner) disimpan di Google Cloud / Firebase Console. Perubahan otomatis sinkron ke HP & laptop karyawan secara instan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Paste Snippet */}
              <div className="p-3 bg-slate-900/80 border border-slate-700/80 rounded-xl space-y-2">
                <label className="block text-slate-300 text-xs font-semibold">
                  Tempel Konfigurasi Firebase dari Google Console (Auto-Detect)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Tempelkan potongan kode dari Firebase Console di sini, contoh:
const firebaseConfig = {
  apiKey: "AIzaSy...",
  projectId: "fmcu-portal",
  ...
};`}
                  value={rawFirebaseJson}
                  onChange={(e) => {
                    const text = e.target.value;
                    setRawFirebaseJson(text);
                    // Extract config values using regex
                    const extract = (key: string) => {
                      const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`);
                      const match = text.match(regex);
                      return match ? match[1] : "";
                    };
                    const apiKey = extract("apiKey");
                    const projectId = extract("projectId");
                    const authDomain = extract("authDomain");
                    const storageBucket = extract("storageBucket");
                    const messagingSenderId = extract("messagingSenderId");
                    const appId = extract("appId");

                    if (projectId || apiKey) {
                      const updated: FirebaseConfigParams = {
                        apiKey: apiKey || firebaseConfig.apiKey,
                        authDomain: authDomain || firebaseConfig.authDomain,
                        projectId: projectId || firebaseConfig.projectId,
                        storageBucket: storageBucket || firebaseConfig.storageBucket,
                        messagingSenderId: messagingSenderId || firebaseConfig.messagingSenderId,
                        appId: appId || firebaseConfig.appId,
                      };
                      setFirebaseConfig(updated);
                      saveFirebaseConfig(updated);
                      showToast("Konfigurasi Firebase berhasil diekstrak dan disimpan!");
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px] placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-slate-400">
                  Cukup salin dan tempel blok <code>const firebaseConfig = &#123; ... &#125;;</code> dari Firebase Console, sistem akan otomatis membaca kuncinya.
                </p>
              </div>

              {/* Manual Config Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Project ID</label>
                  <input
                    type="text"
                    placeholder="fmcu-enterprise-portal"
                    value={firebaseConfig.projectId}
                    onChange={(e) => {
                      const updated = { ...firebaseConfig, projectId: e.target.value };
                      setFirebaseConfig(updated);
                      saveFirebaseConfig(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">API Key</label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={firebaseConfig.apiKey}
                    onChange={(e) => {
                      const updated = { ...firebaseConfig, apiKey: e.target.value };
                      setFirebaseConfig(updated);
                      saveFirebaseConfig(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Auth Domain (Opsional)</label>
                  <input
                    type="text"
                    placeholder="fmcu-portal.firebaseapp.com"
                    value={firebaseConfig.authDomain}
                    onChange={(e) => {
                      const updated = { ...firebaseConfig, authDomain: e.target.value };
                      setFirebaseConfig(updated);
                      saveFirebaseConfig(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">App ID (Opsional)</label>
                  <input
                    type="text"
                    placeholder="1:123456789:web:abcdef..."
                    value={firebaseConfig.appId}
                    onChange={(e) => {
                      const updated = { ...firebaseConfig, appId: e.target.value };
                      setFirebaseConfig(updated);
                      saveFirebaseConfig(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              {firestoreMessage && (
                <div className={`p-2.5 rounded-lg text-xs font-medium ${
                  firestoreStatus === "connected" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-rose-950/80 text-rose-300 border border-rose-800"
                }`}>
                  {firestoreMessage}
                </div>
              )}

              {/* Action Buttons for Firestore */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
                      alert("Harap masukkan Project ID dan API Key Firebase terlebih dahulu!");
                      return;
                    }
                    saveFirebaseConfig(firebaseConfig);
                    setIsTestingFirestore(true);
                    setFirestoreMessage(null);
                    const res = await testFirestoreConnection(firebaseConfig);
                    setIsTestingFirestore(false);
                    if (res.success) {
                      setFirestoreStatus("connected");
                      setFirestoreMessage("✓ " + res.message);
                      showToast("Koneksi Google Console Firestore berhasil!");
                    } else {
                      setFirestoreStatus("disconnected");
                      setFirestoreMessage("✕ " + res.message);
                    }
                  }}
                  disabled={isTestingFirestore}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingFirestore ? "animate-spin" : ""}`} />
                  <span>{isTestingFirestore ? "Menghubungi Firestore..." : "Tes Koneksi Google Console"}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
                      alert("Masukkan konfigurasi Firebase terlebih dahulu!");
                      return;
                    }
                    saveFirebaseConfig(firebaseConfig);
                    setIsSyncingFirestore(true);
                    const res = await syncAllToFirestore({
                      apps,
                      courses,
                      events,
                      docs,
                      bannerAlert
                    });
                    setIsSyncingFirestore(false);
                    if (res.success) {
                      setFirestoreStatus("connected");
                      showToast("Semua data teks berhasil diunggah ke Google Console Firestore!");
                    } else {
                      alert("Gagal sinkronisasi: " + res.error);
                    }
                  }}
                  disabled={isSyncingFirestore}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Database className={`w-3.5 h-3.5 ${isSyncingFirestore ? "animate-spin" : ""}`} />
                  <span>{isSyncingFirestore ? "Mengirim ke Firestore..." : "Kirim Semua Data Teks ke Google Console"}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsSyncingFirestore(true);
                    const res = await fetchAllFromFirestore();
                    setIsSyncingFirestore(false);
                    if (res.success && res.data) {
                      if (res.data.apps) { setApps(res.data.apps); saveStoredApps(res.data.apps); }
                      if (res.data.courses) { setCourses(res.data.courses); saveStoredCourses(res.data.courses); }
                      if (res.data.events) { setEvents(res.data.events); saveStoredEvents(res.data.events); }
                      if (res.data.docs) { setDocs(res.data.docs); saveStoredDocuments(res.data.docs); }
                      if (res.data.bannerAlert) { setBannerAlert(res.data.bannerAlert); saveStoredBannerAlert(res.data.bannerAlert); }
                      showToast("Data terbaru berhasil dimuat dari Google Console Firestore!");
                    } else {
                      alert("Gagal mengambil data dari Firestore: " + res.error);
                    }
                  }}
                  disabled={isSyncingFirestore}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <span>Tarik Data dari Google Console</span>
                </button>
              </div>
            </div>

            {/* 2. GOOGLE DRIVE STORAGE (HEAVY FILES: PDF, DOKUMEN, FOTO, VIDEO) */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-800/90 to-blue-950/40 border border-blue-900/40 rounded-xl p-5 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>2. Google Drive Storage (Penyimpanan File Berat & Foto via Apps Script)</span>
                      {cloudStatus === "connected" ? (
                        <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Terhubung
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full">
                          ● Mode Lokal
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Hubungkan ke Google Apps Script agar perubahan data & link otomatis tersimpan di Google Sheets dan tampil di seluruh perangkat karyawan.
                    </p>
                  </div>
                </div>

                {lastSync && (
                  <span className="text-[11px] text-slate-400">
                    Sinkron terakhir: <strong className="text-blue-300">{lastSync}</strong>
                  </span>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    URL Web App Google Apps Script
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Salin URL dari deployment Google Apps Script (lihat panduan di folder <code>google-apps-script/README.md</code>).
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    ID Folder Google Drive untuk Upload Dokumen (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1a2B3c4D5e... (Kosongkan untuk simpan di root Drive)"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>

                {cloudMessage && (
                  <div className={`p-2.5 rounded-lg text-xs font-medium ${
                    cloudStatus === "connected" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-rose-950/80 text-rose-300 border border-rose-800"
                  }`}>
                    {cloudMessage}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!gasUrl) {
                        alert("Harap masukkan URL Google Apps Script terlebih dahulu!");
                        return;
                      }
                      saveGasApiUrl(gasUrl);
                      saveGdriveFolderId(folderId);
                      setIsTestingConnection(true);
                      setCloudMessage(null);
                      const res = await testGasConnection(gasUrl);
                      setIsTestingConnection(false);
                      if (res.success) {
                        setCloudStatus("connected");
                        setCloudMessage("✓ " + res.message);
                        showToast("Koneksi cloud berhasil!");
                      } else {
                        setCloudStatus("disconnected");
                        setCloudMessage("✕ " + res.message);
                      }
                    }}
                    disabled={isTestingConnection}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? "animate-spin" : ""}`} />
                    <span>{isTestingConnection ? "Menghubungi..." : "Tes Koneksi Cloud"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!gasUrl) {
                        alert("Masukkan dan simpan URL Web App Google Apps Script terlebih dahulu!");
                        return;
                      }
                      saveGasApiUrl(gasUrl);
                      saveGdriveFolderId(folderId);
                      setIsSyncingCloud(true);
                      const res = await syncAllToCloud({
                        apps,
                        courses,
                        events,
                        docs,
                        bannerAlert
                      });
                      setIsSyncingCloud(false);
                      if (res.success) {
                        setCloudStatus("connected");
                        setLastSync(new Date().toLocaleTimeString("id-ID"));
                        showToast("Semua data berhasil disimpan ke Google Sheets!");
                      } else {
                        alert("Gagal sinkronisasi: " + res.error);
                      }
                    }}
                    disabled={isSyncingCloud}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Database className={`w-3.5 h-3.5 ${isSyncingCloud ? "animate-spin" : ""}`} />
                    <span>{isSyncingCloud ? "Menyimpan ke Sheets..." : "Kirim / Sinkron Data ke Google Sheets"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!gasUrl) {
                        alert("Masukkan URL Google Apps Script!");
                        return;
                      }
                      setIsSyncingCloud(true);
                      const res = await fetchPortalDataFromCloud(gasUrl);
                      setIsSyncingCloud(false);
                      if (res.success && res.data) {
                        if (res.data.apps) { setApps(res.data.apps); saveStoredApps(res.data.apps); }
                        if (res.data.courses) { setCourses(res.data.courses); saveStoredCourses(res.data.courses); }
                        if (res.data.events) { setEvents(res.data.events); saveStoredEvents(res.data.events); }
                        if (res.data.docs) { setDocs(res.data.docs); saveStoredDocuments(res.data.docs); }
                        if (res.data.bannerAlert) { setBannerAlert(res.data.bannerAlert); saveStoredBannerAlert(res.data.bannerAlert); }
                        setLastSync(new Date().toLocaleTimeString("id-ID"));
                        showToast("Data terbaru berhasil ditarik dari Google Sheets!");
                      } else {
                        alert("Gagal mengambil data: " + res.error);
                      }
                    }}
                    disabled={isSyncingCloud}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <span>Tarik Data Terbaru dari Sheets</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Universal Google Drive File & Photo Uploader */}
            <div className="md:col-span-2 bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Drive Uploader: Foto, Video, Dokumen, atau Format Apapun</span>
                      <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Google Apps Script Drive API
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Simpan file langsung ke Google Drive. Dapatkan link CDN foto langsung untuk logo/web, link unduh, atau arsipkan ke dokumen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploader Input Box */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div className="space-y-3">
                  <div className="p-4 border-2 border-dashed border-slate-700 hover:border-blue-500/60 transition-colors rounded-xl text-center bg-slate-900/60">
                    <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-200 font-semibold">Pilih Foto, Video, Dokumen, atau Arsip</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Menerima PNG, JPG, SVG, WebP, PDF, DOCX, XLSX, PPTX, MP4, ZIP, dsb.</p>
                    
                    <input
                      type="file"
                      accept="*/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const base64 = evt.target?.result as string;
                            setUniversalFile({ file, base64 });
                            setUniversalUploadResult(null);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="mt-3 text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                    />

                    {universalFile && (
                      <div className="mt-3 p-2 bg-slate-800/80 border border-slate-700 rounded-lg text-left flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <p className="font-semibold text-white truncate">{universalFile.file.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {(universalFile.file.size / (1024 * 1024)).toFixed(2)} MB • {universalFile.file.type || "Format file"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUniversalFile(null);
                            setUniversalUploadResult(null);
                          }}
                          className="text-slate-400 hover:text-rose-400 text-xs px-2 py-0.5 shrink-0"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!universalFile || isUniversalUploading}
                    onClick={async () => {
                      if (!universalFile) return;
                      if (!gasUrl) {
                        alert("Harap masukkan dan tes koneksi URL Google Apps Script terlebih dahulu!");
                        return;
                      }
                      setIsUniversalUploading(true);
                      try {
                        const res = await uploadFileToGoogleDrive({
                          fileName: universalFile.file.name,
                          fileBase64: universalFile.base64,
                          mimeType: universalFile.file.type || "application/octet-stream"
                        });
                        if (res.success && res.fileId) {
                          setUniversalUploadResult({
                            fileId: res.fileId,
                            fileName: universalFile.file.name,
                            mimeType: res.mimeType,
                            downloadUrl: res.downloadUrl,
                            viewUrl: res.viewUrl,
                            directImageUrl: res.directImageUrl
                          });
                          showToast("File/Foto berhasil disimpan ke Google Drive!");
                        } else {
                          alert("Gagal mengunggah ke Google Drive: " + res.error);
                        }
                      } catch (err: any) {
                        alert("Error saat mengunggah: " + err.message);
                      } finally {
                        setIsUniversalUploading(false);
                      }
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {isUniversalUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengunggah ke Google Drive...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload File ke Google Drive</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Upload Result / Actions Card */}
                <div className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-4 min-h-[170px] flex flex-col justify-between">
                  {universalUploadResult ? (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{universalUploadResult.fileName}</p>
                            <p className="text-[10px] text-emerald-400 font-medium">Tersimpan di Google Drive • Siap digunakan</p>
                          </div>
                        </div>
                        {universalUploadResult.directImageUrl && (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                            <img
                              src={universalUploadResult.directImageUrl}
                              alt="Uploaded Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* URL Options */}
                      <div className="space-y-2 text-xs pt-1">
                        {universalUploadResult.directImageUrl && (
                          <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between gap-2">
                            <div className="truncate">
                              <span className="text-[10px] text-slate-400 block font-semibold">Link Foto / Direct CDN URL (untuk logo & gambar web):</span>
                              <span className="text-[11px] text-blue-400 font-mono truncate block">{universalUploadResult.directImageUrl}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(universalUploadResult.directImageUrl || "");
                                setCopiedUrlType("image");
                                showToast("Link foto berhasil disalin!");
                                setTimeout(() => setCopiedUrlType(null), 2000);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] flex items-center gap-1 shrink-0 font-medium"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedUrlType === "image" ? "Disalin!" : "Salin"}</span>
                            </button>
                          </div>
                        )}

                        {universalUploadResult.downloadUrl && (
                          <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between gap-2">
                            <div className="truncate">
                              <span className="text-[10px] text-slate-400 block font-semibold">Link Unduh Langsung (Direct Download):</span>
                              <span className="text-[11px] text-emerald-400 font-mono truncate block">{universalUploadResult.downloadUrl}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(universalUploadResult.downloadUrl || "");
                                setCopiedUrlType("download");
                                showToast("Link unduh berhasil disalin!");
                                setTimeout(() => setCopiedUrlType(null), 2000);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] flex items-center gap-1 shrink-0 font-medium"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedUrlType === "download" ? "Disalin!" : "Salin"}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                        {universalUploadResult.viewUrl && (
                          <a
                            href={universalUploadResult.viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka di Google Drive</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const isImg = universalUploadResult.mimeType?.startsWith("image/");
                            const ext = universalUploadResult.fileName.split('.').pop()?.toUpperCase() || "PDF";
                            const newDoc: DocumentItem = {
                              id: "doc-" + Date.now(),
                              title: universalUploadResult.fileName.replace(/\.[^/.]+$/, ""),
                              category: isImg ? "Foto / Dokumentasi" : "SOP",
                              format: ext,
                              size: universalFile ? `${(universalFile.file.size / (1024 * 1024)).toFixed(1)} MB` : "1.0 MB",
                              updatedAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
                              downloadUrl: universalUploadResult.downloadUrl || "#",
                              viewUrl: universalUploadResult.viewUrl,
                              gdriveFileId: universalUploadResult.fileId
                            };
                            const updated = [newDoc, ...docs];
                            setDocs(updated);
                            saveStoredDocuments(updated);
                            triggerBackgroundCloudSync(apps, courses, events, updated, bannerAlert);
                            showToast("File berhasil dimasukkan ke daftar SOP / Dokumen!");
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Jadikan Dokumen SOP Portal</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-1">
                      <Upload className="w-6 h-6 opacity-40 mb-1" />
                      <p className="text-xs font-medium text-slate-400">Belum ada file yang di-upload</p>
                      <p className="text-[11px] text-slate-500 max-w-xs">
                        Pilih file di sebelah kiri dan klik tombol upload untuk menyimpan ke Google Drive dan mendapatkan link CDN langsung.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
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
                  iconName: (form.elements.namedItem("iconName") as HTMLSelectElement)?.value || editingApp?.iconName || "GraduationCap",
                  customIconUrl: customIconPreview || undefined,
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

              {/* Upload Ikon Manual (PNG, ICO, SVG) */}
              <div className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 font-semibold text-xs">
                    Ikon Tampilan Aplikasi (Upload PNG, ICO, SVG)
                  </label>
                  <span className="text-[10px] text-blue-400 font-medium">PNG, ICO, SVG, WebP (Maks 2MB)</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0 p-1.5 overflow-hidden shadow-inner">
                    {customIconPreview ? (
                      <img
                        src={customIconPreview}
                        alt="Preview Ikon"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept=".png,.ico,.svg,.jpg,.jpeg,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert("Ukuran gambar maksimal 5MB!");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (uploadEvt) => {
                            const base64 = uploadEvt.target?.result as string;
                            setCustomIconPreview(base64);
                            setSelectedIconFile({ file, base64 });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Upload logo asli aplikasi. Logo akan otomatis diunggah ke Google Drive dan langsung tampil di kartu sistem.
                    </p>
                    {selectedIconFile && (
                      <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {gasUrl ? "Ikon/Logo akan disimpan ke Google Drive" : "Ikon siap disimpan"}
                      </p>
                    )}
                  </div>

                  {customIconPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomIconPreview(null);
                        setSelectedIconFile(null);
                      }}
                      className="px-2.5 py-1 text-[11px] bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 rounded-lg transition-colors shrink-0 font-medium"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {/* Alternatif: Dropdown Ikon Bawaan jika tidak upload gambar */}
                {!customIconPreview && (
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Atau pilih ikon bawaan sistem (Default Icon)
                    </label>
                    <select
                      name="iconName"
                      defaultValue={editingApp?.iconName || "GraduationCap"}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
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
                )}
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
                  onClick={() => {
                    setAppModalOpen(false);
                    setSelectedIconFile(null);
                  }}
                  disabled={isUploadingIcon}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingIcon}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  {isUploadingIcon && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploadingIcon ? "Menyimpan ke Drive..." : "Simpan Link"}</span>
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
                  slideUrl: (form.elements.namedItem("slideUrl") as HTMLInputElement)?.value.trim() || "",
                  category: (form.elements.namedItem("category") as HTMLInputElement).value,
                  estimatedHours: (form.elements.namedItem("estimatedHours") as HTMLInputElement).value,
                  description: (form.elements.namedItem("description") as HTMLTextAreaElement)?.value || "",
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-slate-400 mb-1">Judul Modul Pelatihan</label>
                <input
                  name="title"
                  defaultValue={editingCourse?.title || ""}
                  placeholder="Contoh: Modul Cashier New Hire"
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400">Tautan Google Slide (Slideshow PPT)</label>
                  <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                    <Presentation className="w-3 h-3" /> Link Edit / Present / Iframe Embed
                  </span>
                </div>
                <input
                  name="slideUrl"
                  type="text"
                  defaultValue={editingCourse?.slideUrl || ""}
                  placeholder="https://docs.google.com/presentation/d/.../edit atau /pub"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px] placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 Modul ini akan dapat dipresentasikan langsung di portal seperti slide show PowerPoint interaktif.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kategori Modul</label>
                  <input
                    name="category"
                    defaultValue={editingCourse?.category || "Cashier"}
                    placeholder="Contoh: Cashier, Operasional"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Estimasi Durasi (Opsional)</label>
                  <input
                    name="estimatedHours"
                    defaultValue={editingCourse?.estimatedHours || "30 Menit"}
                    placeholder="Contoh: 30 Menit, 1 Jam"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Deskripsi / Ringkasan Modul (Opsional)</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingCourse?.description || ""}
                  placeholder="Ringkasan materi atau tujuan modul ini..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder:text-slate-500 resize-none"
                />
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

      {/* ==================== ADMIN SLIDE SHOW PREVIEW MODAL ==================== */}
      {adminSlidePreviewCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl w-full max-w-5xl h-[88vh] max-h-[780px]">
            {/* Header */}
            <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Presentation className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Pratinjau Presentasi Admin
                    </span>
                    <span className="text-xs text-slate-400 truncate hidden sm:inline">
                      {adminSlidePreviewCourse.category}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">
                    {adminSlidePreviewCourse.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={getGoogleSlideExternalUrl(adminSlidePreviewCourse.slideUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                  title="Buka langsung di Google Slides"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden md:inline">Buka Tab Baru</span>
                </a>

                <button
                  type="button"
                  onClick={() => setAdminSlidePreviewCourse(null)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Tutup (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Presentation Viewport */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              <iframe
                src={parseGoogleSlideEmbedUrl(adminSlidePreviewCourse.slideUrl)}
                title={adminSlidePreviewCourse.title}
                className="w-full h-full border-0"
                allowFullScreen={true}
              />
            </div>

            {/* Footer */}
            <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between gap-2 shrink-0">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Tautan embed valid & siap disajikan kepada pengguna di portal.
              </span>
              <button
                type="button"
                onClick={() => setAdminSlidePreviewCourse(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Tutup Pratinjau
              </button>
            </div>
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
                  description: (form.elements.namedItem("description") as HTMLTextAreaElement)?.value || "",
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

              <div>
                <label className="block text-slate-400 mb-1">Deskripsi / Agenda Pelatihan (Opsional)</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingEvent?.description || ""}
                  placeholder="Ringkasan materi, agenda bahasan, atau instruksi peserta..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder:text-slate-500 resize-none"
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
                <p className="text-xs text-slate-300 font-medium">Pilih file / foto dari komputer Anda</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Mendukung Foto (PNG, JPG, SVG), Dokumen (PDF, DOCX, XLSX, PPTX), Video (MP4), ZIP, dll</p>
                <input
                  type="file"
                  accept="*/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
                      const sizeInput = document.querySelector('input[name="size"]') as HTMLInputElement;
                      const formatSelect = document.querySelector('select[name="format"]') as HTMLSelectElement;
                      const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
                      if (titleInput && !titleInput.value) {
                        titleInput.value = file.name.replace(/\.[^/.]+$/, "");
                      }
                      if (sizeInput) {
                        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                        sizeInput.value = `${sizeMB} MB`;
                      }
                      const ext = file.name.split(".").pop()?.toUpperCase() || "";
                      if (formatSelect) {
                        if (["PDF", "DOCX", "PPTX", "XLSX", "PNG", "JPG", "JPEG", "SVG", "ZIP", "MP4"].includes(ext)) {
                          formatSelect.value = ext === "JPEG" ? "JPG" : ext;
                        } else {
                          formatSelect.value = "LAINNYA";
                        }
                      }
                      if (categorySelect && (ext === "PNG" || ext === "JPG" || ext === "JPEG" || ext === "SVG")) {
                        categorySelect.value = "Foto / Dokumentasi";
                      }
                      // Read file as Base64 for Google Drive cloud storage
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = (event.target?.result as string) || "";
                        setSelectedDocFile({ file, base64 });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="mt-2 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />

                {selectedDocFile && (
                  <div className="mt-3 p-2.5 bg-blue-950/40 border border-blue-800/60 rounded-lg flex items-center justify-between text-left">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white truncate">{selectedDocFile.file.name}</p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {gasUrl ? "Akan otomatis diunggah ke Google Drive saat disimpan" : "File siap disimpan"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDocFile(null)}
                      className="text-slate-400 hover:text-rose-400 text-xs shrink-0 px-2 py-0.5"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Judul Dokumen / Nama File</label>
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
                  <label className="block text-slate-400 mb-1">Kategori Dokumen / File</label>
                  <select
                    name="category"
                    defaultValue={editingDoc?.category || "SOP"}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="SOP">SOP Keselamatan / Operasional</option>
                    <option value="Manual Guide">Panduan Sistem (Manual)</option>
                    <option value="Modul Pelatihan">Slide Materi Pelatihan</option>
                    <option value="Kebijakan Perusahaan">Kebijakan Perusahaan</option>
                    <option value="Foto / Dokumentasi">Foto / Dokumentasi Kegiatan</option>
                    <option value="Template Dokumen">Template Dokumen & Form</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Format File</label>
                  <select
                    name="format"
                    defaultValue={editingDoc?.format || "PDF"}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="PDF">PDF (Dokumen)</option>
                    <option value="DOCX">DOCX (Word)</option>
                    <option value="PPTX">PPTX (Presentasi)</option>
                    <option value="XLSX">XLSX (Excel)</option>
                    <option value="PNG">PNG (Gambar / Logo)</option>
                    <option value="JPG">JPG / JPEG (Foto)</option>
                    <option value="SVG">SVG (Grafis Vektor)</option>
                    <option value="ZIP">ZIP / RAR (Arsip)</option>
                    <option value="MP4">MP4 (Video)</option>
                    <option value="LAINNYA">Format Lainnya</option>
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
                  disabled={isUploadingDoc}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDoc}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-2"
                >
                  {isUploadingDoc && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploadingDoc ? "Mengunggah ke Drive..." : "Simpan Dokumen"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
