import { OneGateApp, TrainingCourse, CalendarEvent, DocumentItem, UserNotification, UserProfile } from "@/types";
import { 
  oneGateAppsData, 
  trainingCoursesData, 
  upcomingEventsData, 
  documentItemsData, 
  initialUserProfile, 
  userNotificationsData 
} from "@/data/portalData";

export interface BannerAlertConfig {
  enabled: boolean;
  title: string;
  dueDate: string;
  linkText: string;
  googleCalendarEmbedUrl?: string;
}

const STORAGE_KEYS = {
  APPS: "fmcu_onegate_apps_v1",
  COURSES: "fmcu_training_courses_v1",
  EVENTS: "fmcu_calendar_events_v1",
  DOCS: "fmcu_document_items_v1",
  ALERT: "fmcu_banner_alert_v1",
  ADMIN_PIN: "fmcu_admin_pin_v1",
};

export const DEFAULT_ADMIN_PIN = "FMCU2026";

export const initialBannerAlert: BannerAlertConfig = {
  enabled: true,
  title: "Pelatihan wajib: HSE Compliance 2026",
  dueDate: "28 Okt 2026",
  linkText: "Buka Modul",
  googleCalendarEmbedUrl: "https://calendar.google.com/calendar/embed?src=c_87fe13aa09c40ea6e5aadebdd8ac49b1ca6104d17441a62b1705bf1ba12b1ffb%40group.calendar.google.com&ctz=Asia%2FJakarta",
};

// Helper safe localStorage access
const isBrowser = typeof window !== "undefined";

export const getStoredApps = (): OneGateApp[] => {
  if (!isBrowser) return oneGateAppsData;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.APPS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(oneGateAppsData));
      return oneGateAppsData;
    }
    return JSON.parse(data);
  } catch (e) {
    return oneGateAppsData;
  }
};

export const saveStoredApps = (apps: OneGateApp[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
};

export const getStoredCourses = (): TrainingCourse[] => {
  if (!isBrowser) return trainingCoursesData;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(trainingCoursesData));
      return trainingCoursesData;
    }
    return JSON.parse(data);
  } catch (e) {
    return trainingCoursesData;
  }
};

export const saveStoredCourses = (courses: TrainingCourse[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
};

export const getStoredEvents = (): CalendarEvent[] => {
  if (!isBrowser) return upcomingEventsData;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(upcomingEventsData));
      return upcomingEventsData;
    }
    return JSON.parse(data);
  } catch (e) {
    return upcomingEventsData;
  }
};

export const saveStoredEvents = (events: CalendarEvent[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

export const getStoredDocuments = (): DocumentItem[] => {
  if (!isBrowser) return documentItemsData;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DOCS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(documentItemsData));
      return documentItemsData;
    }
    return JSON.parse(data);
  } catch (e) {
    return documentItemsData;
  }
};

export const saveStoredDocuments = (docs: DocumentItem[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
};

export const getStoredBannerAlert = (): BannerAlertConfig => {
  if (!isBrowser) return initialBannerAlert;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ALERT);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ALERT, JSON.stringify(initialBannerAlert));
      return initialBannerAlert;
    }
    return JSON.parse(data);
  } catch (e) {
    return initialBannerAlert;
  }
};

export const saveStoredBannerAlert = (alert: BannerAlertConfig): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.ALERT, JSON.stringify(alert));
};

export const getAdminPIN = (): string => {
  if (!isBrowser) return DEFAULT_ADMIN_PIN;
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || DEFAULT_ADMIN_PIN;
};

export const saveAdminPIN = (pin: string): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, pin);
};

export const resetAllToDefaults = (): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(oneGateAppsData));
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(trainingCoursesData));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(upcomingEventsData));
  localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(documentItemsData));
  localStorage.setItem(STORAGE_KEYS.ALERT, JSON.stringify(initialBannerAlert));
  localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, DEFAULT_ADMIN_PIN);
};
