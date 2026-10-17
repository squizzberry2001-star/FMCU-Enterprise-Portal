/**
 * FMCU Enterprise Portal - Google Calendar Integration Utility
 * Mendukung sinkronisasi data jadwal dari Google Calendar, pembuatan tautan 1-click
 * "Tambah ke Google Calendar", serta parsing kalender publik.
 */

import { CalendarEvent } from "@/types";

const CALENDAR_STORAGE_KEYS = {
  CALENDAR_ID: "fmcu_gcal_id_v1",
  ICAL_URL: "fmcu_gcal_ical_url_v1",
  LAST_SYNC: "fmcu_gcal_last_sync_v1",
};

const isBrowser = typeof window !== "undefined";

export function getGoogleCalendarId(): string {
  if (!isBrowser) return "primary";
  return localStorage.getItem(CALENDAR_STORAGE_KEYS.CALENDAR_ID) || "primary";
}

export function saveGoogleCalendarId(calendarId: string): void {
  if (!isBrowser) return;
  localStorage.setItem(CALENDAR_STORAGE_KEYS.CALENDAR_ID, calendarId.trim());
}

export function getGoogleCalendarIcalUrl(): string {
  if (!isBrowser) return "";
  return localStorage.getItem(CALENDAR_STORAGE_KEYS.ICAL_URL) || "";
}

export function saveGoogleCalendarIcalUrl(url: string): void {
  if (!isBrowser) return;
  localStorage.setItem(CALENDAR_STORAGE_KEYS.ICAL_URL, url.trim());
}

export function getLastCalendarSyncTime(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(CALENDAR_STORAGE_KEYS.LAST_SYNC);
}

export function setLastCalendarSyncTime(timeStr: string): void {
  if (!isBrowser) return;
  localStorage.setItem(CALENDAR_STORAGE_KEYS.LAST_SYNC, timeStr);
}

const MONTH_MAP: { [key: string]: number } = {
  jan: 0, januari: 0,
  feb: 1, februari: 1,
  mar: 2, maret: 2,
  apr: 3, april: 3,
  mei: 4, may: 4,
  jun: 5, juni: 5,
  jul: 6, juli: 6,
  agu: 7, agustus: 7, aug: 7,
  sep: 8, september: 8,
  okt: 9, oktober: 9, oct: 9,
  nov: 10, november: 10,
  des: 11, desember: 11, dec: 11
};

/**
 * Generate 1-Click URL to Add Event to User's Google Calendar
 */
export function generateGoogleCalendarAddUrl(event: CalendarEvent): string {
  const title = encodeURIComponent(event.title || "Sesi Pelatihan FMCU");
  const details = encodeURIComponent(
    (event.description || `Sesi pelatihan ${event.type} FMCU dengan trainer ${event.trainer}`) +
    (event.meetingUrl ? `\n\nLink Pertemuan: ${event.meetingUrl}` : "")
  );
  const location = encodeURIComponent(event.location || (event.isOnline ? "Google Meet" : "Kantor FMCU"));

  let datesParam = "";
  try {
    // If startDateTime is provided (ISO format)
    if (event.startDateTime && event.endDateTime) {
      const s = new Date(event.startDateTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
      const e = new Date(event.endDateTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
      datesParam = `${s}/${e}`;
    } else {
      // Parse from date string (e.g. "25 Okt 2026") and time ("09:00 - 12:00 WIB")
      const parts = event.date.trim().split(/\s+/);
      if (parts.length >= 3) {
        const day = parseInt(parts[0], 10);
        const monthKey = parts[1].toLowerCase();
        const month = MONTH_MAP[monthKey] ?? 9;
        const year = parseInt(parts[2], 10);

        let startHour = 9, startMin = 0;
        let endHour = 11, endMin = 0;

        const timeParts = event.time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
        if (timeParts) {
          startHour = parseInt(timeParts[1], 10);
          startMin = parseInt(timeParts[2], 10);
          endHour = parseInt(timeParts[3], 10);
          endMin = parseInt(timeParts[4], 10);
        }

        // Jakarta is UTC+7, adjust to UTC
        const startDate = new Date(Date.UTC(year, month, day, startHour - 7, startMin));
        const endDate = new Date(Date.UTC(year, month, day, endHour - 7, endMin));

        const s = startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const e = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
        datesParam = `${s}/${e}`;
      }
    }
  } catch (err) {
    // Fallback date
    datesParam = "";
  }

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  if (datesParam) {
    url += `&dates=${datesParam}`;
  }
  return url;
}

/**
 * Client parser for Google Calendar iCal (.ics) format
 */
export function parseIcsCalendarData(icsString: string): CalendarEvent[] {
  if (!icsString) return [];
  const events: CalendarEvent[] = [];

  const vevents = icsString.split(/BEGIN:VEVENT/i).slice(1);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  for (let idx = 0; idx < vevents.length; idx++) {
    const block = vevents[idx].split(/END:VEVENT/i)[0];

    const getField = (field: string) => {
      const regex = new RegExp(`^${field}[^:]*:(.*)$`, "m");
      const match = block.match(regex);
      return match ? match[1].trim() : "";
    };

    const summary = getField("SUMMARY").replace(/\\,/g, ",").replace(/\\n/g, " ");
    const description = getField("DESCRIPTION").replace(/\\,/g, ",").replace(/\\n/g, "\n");
    const location = getField("LOCATION").replace(/\\,/g, ",").replace(/\\n/g, " ");
    const dtstart = getField("DTSTART");
    const dtend = getField("DTEND");
    const uid = getField("UID") || `gcal-ics-${idx}`;

    if (!summary) continue;

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (dtstart) {
      if (dtstart.length === 8) {
        // YYYYMMDD
        const y = parseInt(dtstart.substring(0, 4), 10);
        const m = parseInt(dtstart.substring(4, 6), 10) - 1;
        const d = parseInt(dtstart.substring(6, 8), 10);
        startDate = new Date(y, m, d, 9, 0);
      } else {
        // YYYYMMDDTHHMMSSZ
        const clean = dtstart.replace(/[^0-9T]/g, "");
        const y = parseInt(clean.substring(0, 4), 10);
        const m = parseInt(clean.substring(4, 6), 10) - 1;
        const d = parseInt(clean.substring(6, 8), 10);
        const h = parseInt(clean.substring(9, 11) || "9", 10);
        const min = parseInt(clean.substring(11, 13) || "0", 10);
        startDate = new Date(Date.UTC(y, m, d, h, min));
      }
    }

    if (dtend && dtend.length >= 8) {
      const clean = dtend.replace(/[^0-9T]/g, "");
      const y = parseInt(clean.substring(0, 4), 10);
      const m = parseInt(clean.substring(4, 6), 10) - 1;
      const d = parseInt(clean.substring(6, 8), 10);
      const h = parseInt(clean.substring(9, 11) || "11", 10);
      const min = parseInt(clean.substring(11, 13) || "0", 10);
      endDate = new Date(Date.UTC(y, m, d, h, min));
    }

    const start = startDate || new Date();
    const end = endDate || new Date(start.getTime() + 2 * 3600 * 1000);

    const day = start.getDate();
    const month = MONTHS[start.getMonth()];
    const year = start.getFullYear();
    const dateStr = `${day} ${month} ${year}`;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const timeStr = `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())} WIB`;

    const locText = location || "Online via Google Meet";
    const isOnline = /meet|zoom|teams|online|webinar/i.test(`${locText} ${description}`);

    let meetingUrl = "";
    const urlMatch = `${locText} ${description}`.match(/https:\/\/(meet\.google\.com|teams\.microsoft\.com|zoom\.us\/j)\/[^\s"']+/i);
    if (urlMatch) {
      meetingUrl = urlMatch[0];
    }

    let type = "Webinar";
    const combined = `${summary} ${description}`.toLowerCase();
    if (combined.includes("workshop")) type = "Workshop Offline";
    else if (combined.includes("sertifikasi") || combined.includes("exam") || combined.includes("ujian")) type = "Certification Exam";
    else if (combined.includes("sharing") || combined.includes("talk")) type = "Sharing Session";

    events.push({
      id: `gcal-${uid}`,
      title: summary,
      type: type,
      trainer: "Google Calendar Event",
      date: dateStr,
      time: timeStr,
      location: locText,
      isOnline: isOnline,
      meetingUrl: meetingUrl || (isOnline ? "https://meet.google.com" : ""),
      registeredCount: 0,
      maxCapacity: 100,
      description: description,
      googleEventId: uid,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString()
    });
  }

  return events;
}
