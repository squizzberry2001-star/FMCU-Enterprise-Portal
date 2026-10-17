import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  Firestore,
  Unsubscribe
} from "firebase/firestore";
import { OneGateApp, TrainingCourse, CalendarEvent, DocumentItem } from "@/types";
import { BannerAlertConfig } from "@/lib/storage";
import defaultFirebaseConfig from "@/config/firebaseConfig.json";

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const STORAGE_KEY = "fmcu_firebase_config_v1";
const isBrowser = typeof window !== "undefined";

/**
 * Retrieve current Firebase configuration
 */
export function getFirebaseConfig(): FirebaseConfigParams {
  if (isBrowser) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.projectId && parsed.apiKey) {
          return parsed;
        }
      } catch (e) {}
    }
  }

  // Fallback to environment variables or template
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultFirebaseConfig.appId || "",
  };
}

/**
 * Save Firebase configuration to local browser storage
 */
export function saveFirebaseConfig(config: FirebaseConfigParams): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Check if Firebase configuration is provided
 */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.projectId && config.apiKey && config.projectId.trim() !== "");
}

/**
 * Get or initialize Firebase App instance safely
 */
export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config.projectId || !config.apiKey) return null;

  try {
    if (getApps().length > 0) {
      return getApp();
    }
    return initializeApp(config);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return null;
  }
}

/**
 * Get Firestore instance safely
 */
export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (error) {
    console.error("Firestore instance error:", error);
    return null;
  }
}

// Collection Names in Firestore (Google Console)
export const FIRESTORE_COLLECTIONS = {
  APPS: "tb_apps",
  COURSES: "tb_courses",
  EVENTS: "tb_events",
  DOCUMENTS: "tb_documents",
  SETTINGS: "tb_settings",
};

/**
 * Test connection to Firestore
 */
export async function testFirestoreConnection(customConfig?: FirebaseConfigParams): Promise<{ success: boolean; message: string }> {
  try {
    const config = customConfig || getFirebaseConfig();
    if (!config.projectId || !config.apiKey) {
      return { success: false, message: "Project ID dan API Key Firebase wajib diisi." };
    }

    let app: FirebaseApp;
    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp(config);
    }

    const db = getFirestore(app);
    // Write test document to verify write permission
    const testDocRef = doc(db, FIRESTORE_COLLECTIONS.SETTINGS, "_connection_test");
    await setDoc(testDocRef, {
      status: "connected",
      testedAt: new Date().toISOString(),
      platform: "Google Cloud Console Firebase Firestore"
    });

    return { 
      success: true, 
      message: `Berhasil terhubung ke Google Console Firestore (Project: ${config.projectId})!` 
    };
  } catch (err: any) {
    return { 
      success: false, 
      message: err.message || "Gagal menghubungi Firestore. Pastikan Firestore Database sudah dibuat di Firebase Console." 
    };
  }
}

/**
 * Batch upload / synchronize all master text data to Firestore
 */
export async function syncAllToFirestore(data: {
  apps: OneGateApp[];
  courses: TrainingCourse[];
  events: CalendarEvent[];
  docs: DocumentItem[];
  bannerAlert: BannerAlertConfig;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const db = getFirestoreDb();
  if (!db) {
    return { success: false, error: "Firebase Firestore belum dikonfigurasi." };
  }

  try {
    const batch = writeBatch(db);

    // 1. Sync Apps
    data.apps.forEach((app) => {
      const ref = doc(db, FIRESTORE_COLLECTIONS.APPS, app.id);
      batch.set(ref, { ...app, updatedAt: new Date().toISOString() });
    });

    // 2. Sync Courses
    data.courses.forEach((course) => {
      const ref = doc(db, FIRESTORE_COLLECTIONS.COURSES, course.id);
      batch.set(ref, { ...course, updatedAt: new Date().toISOString() });
    });

    // 3. Sync Events
    data.events.forEach((event) => {
      const ref = doc(db, FIRESTORE_COLLECTIONS.EVENTS, event.id);
      batch.set(ref, { ...event, updatedAt: new Date().toISOString() });
    });

    // 4. Sync Documents
    data.docs.forEach((d) => {
      const ref = doc(db, FIRESTORE_COLLECTIONS.DOCUMENTS, d.id);
      batch.set(ref, { ...d, updatedAt: new Date().toISOString() });
    });

    // 5. Sync Settings
    const bannerRef = doc(db, FIRESTORE_COLLECTIONS.SETTINGS, "banner_alert");
    batch.set(bannerRef, { ...data.bannerAlert, updatedAt: new Date().toISOString() });

    await batch.commit();
    return { success: true, message: "Seluruh data text plain berhasil disimpan ke Google Console Firestore!" };
  } catch (err: any) {
    console.error("Firestore sync error:", err);
    return { success: false, error: err.message || "Gagal menyimpan ke Firestore" };
  }
}

/**
 * Fetch all text data from Firestore once
 */
export async function fetchAllFromFirestore(): Promise<{
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
  const db = getFirestoreDb();
  if (!db) {
    return { success: false, error: "Firebase Firestore belum dikonfigurasi." };
  }

  try {
    const [appsSnap, coursesSnap, eventsSnap, docsSnap, bannerSnap] = await Promise.all([
      getDocs(collection(db, FIRESTORE_COLLECTIONS.APPS)),
      getDocs(collection(db, FIRESTORE_COLLECTIONS.COURSES)),
      getDocs(collection(db, FIRESTORE_COLLECTIONS.EVENTS)),
      getDocs(collection(db, FIRESTORE_COLLECTIONS.DOCUMENTS)),
      getDocs(collection(db, FIRESTORE_COLLECTIONS.SETTINGS)),
    ]);

    const apps = appsSnap.docs.map((d) => d.data() as OneGateApp);
    const courses = coursesSnap.docs.map((d) => d.data() as TrainingCourse);
    const events = eventsSnap.docs.map((d) => d.data() as CalendarEvent);
    const docs = docsSnap.docs.map((d) => d.data() as DocumentItem);

    let bannerAlert: BannerAlertConfig = {
      enabled: true,
      title: "Pelatihan wajib: HSE Compliance 2026",
      dueDate: "28 Okt 2026",
      linkText: "Buka Modul"
    };

    const bannerDoc = bannerSnap.docs.find(d => d.id === "banner_alert");
    if (bannerDoc && bannerDoc.exists()) {
      bannerAlert = bannerDoc.data() as BannerAlertConfig;
    }

    return {
      success: true,
      data: { apps, courses, events, docs, bannerAlert }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Real-time listener for all 5 collections (Multi-Device Instant Sync)
 */
export function subscribeToPortalData(callback: (data: {
  apps?: OneGateApp[];
  courses?: TrainingCourse[];
  events?: CalendarEvent[];
  docs?: DocumentItem[];
  bannerAlert?: BannerAlertConfig;
}) => void): Unsubscribe | null {
  const db = getFirestoreDb();
  if (!db) return null;

  try {
    const unsubs: Unsubscribe[] = [];

    // Real-time Apps
    unsubs.push(
      onSnapshot(collection(db, FIRESTORE_COLLECTIONS.APPS), (snap) => {
        const apps = snap.docs.map((d) => d.data() as OneGateApp);
        if (apps.length > 0) callback({ apps });
      }, (e) => console.warn("Firestore apps error:", e))
    );

    // Real-time Courses
    unsubs.push(
      onSnapshot(collection(db, FIRESTORE_COLLECTIONS.COURSES), (snap) => {
        const courses = snap.docs.map((d) => d.data() as TrainingCourse);
        if (courses.length > 0) callback({ courses });
      }, (e) => console.warn("Firestore courses error:", e))
    );

    // Real-time Events
    unsubs.push(
      onSnapshot(collection(db, FIRESTORE_COLLECTIONS.EVENTS), (snap) => {
        const events = snap.docs.map((d) => d.data() as CalendarEvent);
        if (events.length > 0) callback({ events });
      }, (e) => console.warn("Firestore events error:", e))
    );

    // Real-time Documents
    unsubs.push(
      onSnapshot(collection(db, FIRESTORE_COLLECTIONS.DOCUMENTS), (snap) => {
        const docs = snap.docs.map((d) => d.data() as DocumentItem);
        if (docs.length > 0) callback({ docs });
      }, (e) => console.warn("Firestore docs error:", e))
    );

    // Real-time Settings / Banner
    unsubs.push(
      onSnapshot(collection(db, FIRESTORE_COLLECTIONS.SETTINGS), (snap) => {
        const bannerDoc = snap.docs.find(d => d.id === "banner_alert");
        if (bannerDoc && bannerDoc.exists()) {
          callback({ bannerAlert: bannerDoc.data() as BannerAlertConfig });
        }
      }, (e) => console.warn("Firestore settings error:", e))
    );

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  } catch (err) {
    console.error("subscribeToPortalData error:", err);
    return null;
  }
}

/**
 * Individual document writers for fast real-time CRUD
 */
export async function saveAppToFirestore(app: OneGateApp): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await setDoc(doc(db, FIRESTORE_COLLECTIONS.APPS, app.id), { ...app, updatedAt: new Date().toISOString() });
}

export async function deleteAppFromFirestore(id: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.APPS, id));
}

export async function saveCourseToFirestore(course: TrainingCourse): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await setDoc(doc(db, FIRESTORE_COLLECTIONS.COURSES, course.id), { ...course, updatedAt: new Date().toISOString() });
}

export async function deleteCourseFromFirestore(id: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.COURSES, id));
}

export async function saveEventToFirestore(event: CalendarEvent): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await setDoc(doc(db, FIRESTORE_COLLECTIONS.EVENTS, event.id), { ...event, updatedAt: new Date().toISOString() });
}

export async function deleteEventFromFirestore(id: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.EVENTS, id));
}

export async function saveDocToFirestore(document: DocumentItem): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await setDoc(doc(db, FIRESTORE_COLLECTIONS.DOCUMENTS, document.id), { ...document, updatedAt: new Date().toISOString() });
}

export async function deleteDocFromFirestore(id: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.DOCUMENTS, id));
}

export async function saveBannerToFirestore(banner: BannerAlertConfig): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await setDoc(doc(db, FIRESTORE_COLLECTIONS.SETTINGS, "banner_alert"), { ...banner, updatedAt: new Date().toISOString() });
}
