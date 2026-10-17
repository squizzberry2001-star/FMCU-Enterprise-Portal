import { OneGateApp, TrainingCourse, CalendarEvent, DocumentItem } from "@/types";
import { BannerAlertConfig } from "@/lib/storage";
import defaultCloudConfig from "@/config/cloudConfig.json";
import { parseIcsCalendarData } from "@/lib/calendarUtils";

const CLOUD_KEYS = {
  GAS_URL: "fmcu_gas_api_url_v1",
  FOLDER_ID: "fmcu_gdrive_folder_id_v1",
  LAST_SYNC: "fmcu_last_cloud_sync_v1",
};

const isBrowser = typeof window !== "undefined";

export const getGasApiUrl = (): string => {
  const defaultUrl = defaultCloudConfig.gasApiUrl || "";
  if (!isBrowser) return process.env.NEXT_PUBLIC_GAS_API_URL || defaultUrl;
  return localStorage.getItem(CLOUD_KEYS.GAS_URL) || process.env.NEXT_PUBLIC_GAS_API_URL || defaultUrl;
};

export const saveGasApiUrl = (url: string): void => {
  if (!isBrowser) return;
  localStorage.setItem(CLOUD_KEYS.GAS_URL, url.trim());
};

export const getGdriveFolderId = (): string => {
  if (!isBrowser) return "";
  return localStorage.getItem(CLOUD_KEYS.FOLDER_ID) || "";
};

export const saveGdriveFolderId = (folderId: string): void => {
  if (!isBrowser) return;
  localStorage.setItem(CLOUD_KEYS.FOLDER_ID, folderId.trim());
};

export const getLastSyncTime = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(CLOUD_KEYS.LAST_SYNC);
};

export const setLastSyncTime = (time: string): void => {
  if (!isBrowser) return;
  localStorage.setItem(CLOUD_KEYS.LAST_SYNC, time);
};

/**
 * Test connection to Google Apps Script
 */
export async function testGasConnection(customUrl?: string): Promise<{ success: boolean; message: string }> {
  const url = customUrl || getGasApiUrl();
  if (!url) {
    return { success: false, message: "URL Google Apps Script belum diisi." };
  }

  try {
    // Call via Next.js proxy route to ensure 0 CORS issues
    const res = await fetch(`/api/portal-data?action=ping&gasUrl=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data.success) {
      return { success: true, message: data.message || "Koneksi berhasil ke Google Apps Script!" };
    }
    return { success: false, message: data.error || data.message || "Gagal merespon dari server." };
  } catch (err: any) {
    // Direct fallback if proxy is unavailable
    try {
      const directRes = await fetch(`${url}?action=ping`);
      const directData = await directRes.json();
      if (directData.success) {
        return { success: true, message: "Koneksi langsung berhasil!" };
      }
    } catch (e) {}
    return { success: false, message: err.message || "Gagal menghubungi Google Apps Script." };
  }
}

/**
 * Broadcast update event across open browser tabs for 0ms realtime sync
 */
export function broadcastPortalUpdate() {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel("fmcu_portal_realtime");
      channel.postMessage({ type: "PORTAL_DATA_UPDATED", timestamp: Date.now() });
      channel.close();
    } catch (e) {}
  }
}

/**
 * Fetch latest portal data from Google Sheets (Real-time with Cache-Busting)
 */
export async function fetchPortalDataFromCloud(customUrl?: string): Promise<{
  success: boolean;
  data?: {
    apps: OneGateApp[];
    courses: TrainingCourse[];
    events: CalendarEvent[];
    docs: DocumentItem[];
    bannerAlert: BannerAlertConfig;
  };
  error?: string;
}> {
  const url = customUrl || getGasApiUrl();
  if (!url) {
    return { success: false, error: "Cloud URL not configured" };
  }

  try {
    const cacheBuster = Date.now();
    const res = await fetch(`/api/portal-data?action=getAll&gasUrl=${encodeURIComponent(url)}&_t=${cacheBuster}`, {
      cache: "no-store",
      headers: {
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
      }
    });
    const result = await res.json();
    if (result.success && result.data) {
      // Re-hydrate any slideUrl & description from _coursesData if tb_courses didn't return them
      const extraCourses = (result.data.bannerAlert as any)?._coursesData || [];
      const extraMap = new Map<string, any>(extraCourses.map((ec: any) => [ec.id, ec]));

      if (result.data.courses && Array.isArray(result.data.courses)) {
        result.data.courses = result.data.courses.map((c: TrainingCourse) => {
          const extra = extraMap.get(c.id);
          return {
            ...c,
            slideUrl: c.slideUrl || extra?.slideUrl || "",
            description: c.description || extra?.description || "",
            estimatedHours: c.estimatedHours || extra?.estimatedHours || ""
          };
        });
      }

      setLastSyncTime(new Date().toLocaleTimeString("id-ID"));
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error || "Gagal mengambil data dari Google Sheets." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Sync entire dataset to Google Sheets (Pushes immediately and broadcasts)
 */
export async function syncAllToCloud(payload: {
  apps: OneGateApp[];
  courses: TrainingCourse[];
  events: CalendarEvent[];
  docs: DocumentItem[];
  bannerAlert: BannerAlertConfig;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const url = getGasApiUrl();
  if (!url) {
    return { success: false, error: "URL Google Apps Script belum dikonfigurasi." };
  }

  try {
    // Pack courses metadata into bannerAlert as a fail-safe backup for Google Sheets
    const bannerWithMeta = {
      ...payload.bannerAlert,
      _coursesData: payload.courses.map((c) => ({
        id: c.id,
        slideUrl: c.slideUrl || "",
        description: c.description || "",
        title: c.title,
        category: c.category,
        estimatedHours: c.estimatedHours || ""
      }))
    };

    const body = {
      action: "syncAll",
      apps: payload.apps,
      courses: payload.courses,
      events: payload.events,
      docs: payload.docs,
      bannerAlert: bannerWithMeta,
    };

    const res = await fetch(`/api/portal-data?gasUrl=${encodeURIComponent(url)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (result.success) {
      setLastSyncTime(new Date().toLocaleTimeString("id-ID"));
      broadcastPortalUpdate();
      return { success: true, message: result.message || "Data berhasil disinkronkan ke Google Sheets!" };
    }
    return { success: false, error: result.error || "Gagal menyimpan ke Google Sheets." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Upload file directly to Google Drive via Apps Script
 */
export async function uploadFileToGoogleDrive(params: {
  fileName: string;
  fileBase64: string;
  mimeType: string;
}): Promise<{ 
  success: boolean; 
  downloadUrl?: string; 
  viewUrl?: string; 
  directImageUrl?: string; 
  thumbnailUrl?: string; 
  fileId?: string; 
  fileSize?: number; 
  mimeType?: string; 
  error?: string 
}> {
  const url = getGasApiUrl();
  if (!url) {
    return { success: false, error: "URL Google Apps Script belum dikonfigurasi." };
  }

  const folderId = getGdriveFolderId();

  try {
    const body = {
      action: "uploadFile",
      fileName: params.fileName,
      fileBase64: params.fileBase64,
      mimeType: params.mimeType,
      folderId: folderId || undefined,
    };

    const res = await fetch(`/api/portal-data?gasUrl=${encodeURIComponent(url)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (result.success) {
      return {
        success: true,
        downloadUrl: result.downloadUrl,
        viewUrl: result.viewUrl,
        directImageUrl: result.directImageUrl,
        thumbnailUrl: result.thumbnailUrl,
        fileId: result.fileId,
        fileSize: result.fileSize,
        mimeType: result.mimeType,
      };
    }
    return { success: false, error: result.error || "Gagal mengunggah file ke Google Drive." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch events directly from Google Calendar via Apps Script
 */
export async function syncGoogleCalendarEvents(calendarId: string = "primary"): Promise<{
  success: boolean;
  events?: CalendarEvent[];
  calendarName?: string;
  error?: string;
}> {
  const url = getGasApiUrl();
  if (!url) {
    return { success: false, error: "URL Google Apps Script belum dikonfigurasi." };
  }

  try {
    const res = await fetch(`/api/portal-data?action=getGoogleCalendar&calendarId=${encodeURIComponent(calendarId)}&gasUrl=${encodeURIComponent(url)}`, {
      cache: "no-store",
      headers: {
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
      }
    });
    const result = await res.json();
    return result;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch and parse events from public Google Calendar iCal (.ics) URL (supports single or multiple URLs)
 */
export async function fetchEventsFromIcalUrl(icalUrl: string): Promise<{
  success: boolean;
  events?: CalendarEvent[];
  error?: string;
}> {
  if (!icalUrl || !icalUrl.trim()) return { success: false, error: "URL iCal belum diisi." };

  const urls = icalUrl
    .split(/[\n,]+/)
    .map((u) => u.trim())
    .filter((u) => u.startsWith("http"));

  if (urls.length === 0) {
    return { success: false, error: "Format URL iCal tidak valid (harus dimulai dengan https://)." };
  }

  try {
    const allEvents: CalendarEvent[] = [];
    const errors: string[] = [];

    for (const singleUrl of urls) {
      try {
        const res = await fetch(`/api/portal-data?action=fetchIcal&url=${encodeURIComponent(singleUrl)}`, {
          cache: "no-store",
        });
        const result = await res.json();
        if (result.success && result.icsContent) {
          const parsed = parseIcsCalendarData(result.icsContent);
          allEvents.push(...parsed);
        } else if (result.error) {
          errors.push(result.error);
        }
      } catch (err: any) {
        errors.push(err.message);
      }
    }

    if (allEvents.length > 0) {
      // Deduplicate by googleEventId or title+date+time
      const seen = new Set<string>();
      const uniqueEvents = allEvents.filter((ev) => {
        const key = ev.googleEventId || `${ev.title}-${ev.date}-${ev.time}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return { success: true, events: uniqueEvents };
    }

    return {
      success: false,
      error: errors[0] || "Tidak ada agenda jadwal yang ditemukan pada tautan iCal tersebut.",
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Auto-classify files from Google Drive:
 * - PPTX / Google Slides -> Section Modul Pelatihan (tb_courses), Kategori = Nama Folder
 * - PDF dan EXCEL        -> Section SOP & Dokumen (tb_documents), Kategori = Nama Folder
 */
export async function autoClassifyGoogleDrive(targetFolderId?: string): Promise<{
  success: boolean;
  folderId?: string;
  folderName?: string;
  scannedCoursesCount?: number;
  scannedDocsCount?: number;
  totalCoursesCount?: number;
  totalDocsCount?: number;
  courses?: TrainingCourse[];
  docs?: DocumentItem[];
  allCourses?: TrainingCourse[];
  allDocs?: DocumentItem[];
  error?: string;
}> {
  const url = getGasApiUrl();
  if (!url) {
    return { success: false, error: "URL Google Apps Script belum dikonfigurasi." };
  }

  const folderId = (targetFolderId && targetFolderId.trim()) || getGdriveFolderId() || "1N_zsTNDywwqscmYMXmgwuR3SFHTHsbxx";

  try {
    const res = await fetch(`/api/portal-data?action=autoClassifyGdrive&folderId=${encodeURIComponent(folderId)}&gasUrl=${encodeURIComponent(url)}`, {
      cache: "no-store",
      headers: {
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
      }
    });
    const result = await res.json();
    if (result.success) {
      setLastSyncTime(new Date().toLocaleTimeString("id-ID"));
      broadcastPortalUpdate();
    }
    return result;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

