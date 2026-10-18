"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CalendarEvent } from "@/types";
import { 
  Video, 
  MapPin, 
  ArrowUpRight, 
  Check, 
  Calendar, 
  CalendarDays, 
  List, 
  Clock, 
  User, 
  ExternalLink, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles,
  Info,
  X,
  Award,
  Users,
  CheckCircle2,
  Bookmark,
  Share2,
  CalendarCheck,
  Flame,
  Filter,
  Eye,
  Layers,
  GraduationCap,
  RefreshCw
} from "lucide-react";
import { generateGoogleCalendarAddUrl } from "@/lib/calendarUtils";

interface TrainingCalendarProps {
  events: CalendarEvent[];
  embedUrl?: string;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const STORAGE_KEY_REG = "fmcu_registered_events_v2";

/**
 * Universal Event Date Parser: handles ISO, DD/MM/YYYY, Indonesian "18 Okt 2026", English "18 Oct 2026", etc.
 */
export const parseAnyEventDate = (dateStr: string): { year: number; month: number; day: number; dateObj: Date; label: string } => {
  const fallbackDate = new Date();
  const fallback = { 
    year: fallbackDate.getFullYear(), 
    month: fallbackDate.getMonth(), 
    day: fallbackDate.getDate(), 
    dateObj: fallbackDate,
    label: `${fallbackDate.getDate()} ${MONTH_SHORT[fallbackDate.getMonth()]}`
  };

  if (!dateStr || typeof dateStr !== "string") return fallback;
  const s = dateStr.trim();

  // 1. ISO string with T (e.g. "2026-09-08T17:00:00.000Z")
  if (s.includes("T")) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return { 
        year: d.getFullYear(), 
        month: d.getMonth(), 
        day: d.getDate(), 
        dateObj: d,
        label: `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
      };
    }
  }

  // 2. YYYY-MM-DD
  const ymd = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10) - 1;
    const d = parseInt(ymd[3], 10);
    const dateObj = new Date(y, m, d);
    return { year: y, month: m, day: d, dateObj, label: `${d} ${MONTH_SHORT[m]}` };
  }

  // 3. DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) {
    const d = parseInt(dmy[1], 10);
    const m = parseInt(dmy[2], 10) - 1;
    const y = parseInt(dmy[3], 10);
    const dateObj = new Date(y, m, d);
    return { year: y, month: m, day: d, dateObj, label: `${d} ${MONTH_SHORT[m]}` };
  }

  // 4. Word-based date: "18 Okt 2026", "24 Oktober 2026", "18 Oct 2026", "Sunday, 18 Oct 2026"
  const clean = s.replace(/^[a-zA-Z]+,\s*/, "");
  const tokens = clean.split(/[\s,]+/);

  const monthMap: Record<string, number> = {
    jan: 0, januari: 0, january: 0,
    feb: 1, februari: 1, february: 1,
    mar: 2, maret: 2, march: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5, june: 5,
    jul: 6, juli: 6, july: 6,
    agu: 7, agustus: 7, aug: 7, august: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9, oct: 9, october: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11, december: 11
  };

  let dayNum: number | null = null;
  let monthIdx: number | null = null;
  let yearNum: number | null = null;

  for (const token of tokens) {
    const lower = token.toLowerCase();
    for (const prefix in monthMap) {
      if (lower.startsWith(prefix) && monthIdx === null) {
        monthIdx = monthMap[prefix];
        break;
      }
    }
    const num = parseInt(token, 10);
    if (!isNaN(num)) {
      if (num > 1900 && num < 2100 && yearNum === null) {
        yearNum = num;
      } else if (num >= 1 && num <= 31 && dayNum === null) {
        dayNum = num;
      }
    }
  }

  if (dayNum !== null && monthIdx !== null) {
    const y = yearNum || new Date().getFullYear();
    const dateObj = new Date(y, monthIdx, dayNum);
    return { year: y, month: monthIdx, day: dayNum, dateObj, label: `${dayNum} ${MONTH_SHORT[monthIdx]}` };
  }

  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return { 
      year: d.getFullYear(), 
      month: d.getMonth(), 
      day: d.getDate(), 
      dateObj: d,
      label: `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
    };
  }

  return fallback;
};

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({ events, embedUrl }) => {
  // Default to interactive bespoke calendar view!
  const [viewMode, setViewMode] = useState<"calendar" | "agenda" | "my-classes">("calendar");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEventDetail, setActiveEventDetail] = useState<CalendarEvent | null>(null);

  // Month navigation state: Initialize to current month, or nearest month that has events
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    // Check if there are events in current month
    const hasInCurrent = events.some((e) => {
      const p = parseAnyEventDate(e.date);
      return p.year === now.getFullYear() && p.month === now.getMonth();
    });
    if (!hasInCurrent && events.length > 0) {
      // Pick the first event's month
      const firstParsed = parseAnyEventDate(events[0].date);
      return new Date(firstParsed.year, firstParsed.month, 1);
    }
    return now;
  });

  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // User registered events stored in local state & localStorage
  const [registered, setRegistered] = useState<string[]>(["evt-201"]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REG);
      if (saved) {
        setRegistered(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const toggleReg = (id: string) => {
    setRegistered((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY_REG, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Find all distinct months that have events so user can jump to them in 1 click!
  const monthsWithEvents = useMemo(() => {
    const map = new Map<string, { year: number; month: number; label: string; count: number }>();
    events.forEach((e) => {
      const p = parseAnyEventDate(e.date);
      const key = `${p.year}-${p.month}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          year: p.year,
          month: p.month,
          label: `${MONTH_NAMES[p.month]} ${p.year}`,
          count: 1
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));
  }, [events]);

  // Relative status helper (Hari ini, Besok, Selesai, X hari lagi)
  const getRelativeDayText = (dateStr: string) => {
    const { dateObj } = parseAnyEventDate(dateStr);
    const now = new Date();
    
    // Normalize to date-only comparison
    const dTarget = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffMs = dTarget.getTime() - dNow.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { label: "HARI INI", color: "bg-rose-500 text-white animate-pulse" };
    }
    if (diffDays === 1) {
      return { label: "BESOK", color: "bg-amber-500 text-slate-950 font-bold" };
    }
    if (diffDays > 1 && diffDays <= 7) {
      return { label: `${diffDays} HARI LAGI`, color: "bg-blue-600 text-white" };
    }
    if (diffDays > 7) {
      return { label: "MENDATANG", color: "bg-slate-800 text-slate-200" };
    }
    return { label: "SELESAI", color: "bg-slate-200 text-slate-600" };
  };

  // Extract unique types
  const eventTypes = useMemo(() => {
    const types = Array.from(new Set(events.map((e) => e.type).filter(Boolean)));
    return ["all", ...types];
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchType = selectedType === "all" || evt.type === selectedType;
      const matchSearch =
        !searchQuery.trim() ||
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (evt.description && evt.description.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchDate = true;
      if (selectedDateFilter) {
        const p = parseAnyEventDate(evt.date);
        const filterKey = `${p.year}-${p.month}-${p.day}`;
        matchDate = filterKey === selectedDateFilter;
      }

      const matchMyClasses = viewMode !== "my-classes" || registered.includes(evt.id);

      return matchType && matchSearch && matchDate && matchMyClasses;
    });
  }, [events, selectedType, searchQuery, selectedDateFilter, viewMode, registered]);

  // Statistics counters
  const onlineCount = useMemo(() => events.filter(e => e.isOnline).length, [events]);
  const offlineCount = useMemo(() => events.filter(e => !e.isOnline).length, [events]);

  // Calendar Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Create grid cells with exact year-month-day matching
  const calendarDays = useMemo(() => {
    const days: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      dateStr: string;
      filterKey: string;
      eventsCount: number;
      matchedEvents: CalendarEvent[];
      isToday: boolean;
      year: number;
      month: number;
    }> = [];

    const today = new Date();

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${dayNum} ${MONTH_SHORT[prevMonthIdx]} ${prevYear}`;
      const filterKey = `${prevYear}-${prevMonthIdx}-${dayNum}`;

      const matchedEvents = events.filter((e) => {
        const p = parseAnyEventDate(e.date);
        return p.year === prevYear && p.month === prevMonthIdx && p.day === dayNum;
      });

      days.push({
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateStr,
        filterKey,
        eventsCount: matchedEvents.length,
        matchedEvents,
        isToday: false,
        year: prevYear,
        month: prevMonthIdx
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${d} ${MONTH_SHORT[month]} ${year}`;
      const filterKey = `${year}-${month}-${d}`;

      const matchedEvents = events.filter((e) => {
        const p = parseAnyEventDate(e.date);
        return p.year === year && p.month === month && p.day === d;
      });

      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr,
        filterKey,
        eventsCount: matchedEvents.length,
        matchedEvents,
        isToday,
        year,
        month
      });
    }

    // Next month padding to fill grid (35 or 42 cells)
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let n = 1; n <= remaining; n++) {
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${n} ${MONTH_SHORT[nextMonthIdx]} ${nextYear}`;
      const filterKey = `${nextYear}-${nextMonthIdx}-${n}`;

      const matchedEvents = events.filter((e) => {
        const p = parseAnyEventDate(e.date);
        return p.year === nextYear && p.month === nextMonthIdx && p.day === n;
      });

      days.push({
        dayNumber: n,
        isCurrentMonth: false,
        dateStr,
        filterKey,
        eventsCount: matchedEvents.length,
        matchedEvents,
        isToday: false,
        year: nextYear,
        month: nextMonthIdx
      });
    }

    return days;
  }, [events, year, month, daysInMonth, firstDayIndex, prevMonthDays]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateFilter(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateFilter(null);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateFilter(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`);
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Webinar":
        return {
          pill: "bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold",
          dot: "bg-blue-500 ring-2 ring-blue-300",
          gradient: "from-blue-600 to-indigo-700",
          accentBorder: "hover:border-blue-500",
          badgeBg: "bg-blue-600 text-white"
        };
      case "Workshop Offline":
        return {
          pill: "bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold",
          dot: "bg-amber-500 ring-2 ring-amber-300",
          gradient: "from-amber-500 to-orange-600",
          accentBorder: "hover:border-amber-500",
          badgeBg: "bg-amber-500 text-slate-950 font-bold"
        };
      case "Certification Exam":
        return {
          pill: "bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold",
          dot: "bg-purple-500 ring-2 ring-purple-300",
          gradient: "from-purple-600 to-pink-600",
          accentBorder: "hover:border-purple-500",
          badgeBg: "bg-purple-600 text-white"
        };
      case "Sharing Session":
        return {
          pill: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold",
          dot: "bg-emerald-500 ring-2 ring-emerald-300",
          gradient: "from-emerald-500 to-teal-600",
          accentBorder: "hover:border-emerald-500",
          badgeBg: "bg-emerald-600 text-white"
        };
      default:
        return {
          pill: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-bold",
          dot: "bg-indigo-500 ring-2 ring-indigo-300",
          gradient: "from-indigo-600 to-blue-600",
          accentBorder: "hover:border-indigo-500",
          badgeBg: "bg-indigo-600 text-white"
        };
    }
  };

  // Selected date human text
  const selectedDateText = useMemo(() => {
    if (!selectedDateFilter) return null;
    const parts = selectedDateFilter.split("-");
    if (parts.length === 3) {
      const y = parts[0];
      const m = parseInt(parts[1], 10);
      const d = parts[2];
      return `${d} ${MONTH_NAMES[m]} ${y}`;
    }
    return selectedDateFilter;
  }, [selectedDateFilter]);

  return (
    <div className="space-y-6">
      
      {/* ==================== 1. HERO STATS & LIVE COUNTERS ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Classes */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-700/60 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Agenda</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight">{events.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Sesi Pelatihan Aktif</span>
          </div>
        </div>

        {/* Card 2: Webinar Online */}
        <div className="bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-blue-800/40 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Webinar Virtual</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-blue-400">{onlineCount}</div>
          <div className="text-[11px] text-blue-300/80 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Zoom / Meet / Teams</span>
          </div>
        </div>

        {/* Card 3: Workshop Tatap Muka */}
        <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-amber-800/40 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Workshop Offline</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-400">{offlineCount}</div>
          <div className="text-[11px] text-amber-300/80 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Tatap Muka &amp; Praktik</span>
          </div>
        </div>

        {/* Card 4: My Booked Classes */}
        <div 
          onClick={() => setViewMode(viewMode === "my-classes" ? "calendar" : "my-classes")}
          className={`p-4 sm:p-5 rounded-2xl shadow-sm border cursor-pointer transition-all relative overflow-hidden group ${
            viewMode === "my-classes"
              ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400 ring-2 ring-emerald-400/50"
              : "bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 text-white border-emerald-800/40 hover:border-emerald-500/60"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Kelas Terdaftar</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
            {registered.length}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1.5">
            <span>{viewMode === "my-classes" ? "Sedang Ditampilkan" : "Klik untuk memfilter"}</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* ==================== 2. CONTROL BAR & BESPOKE SWITCHER ==================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Interactive View Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => { setViewMode("calendar"); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              viewMode === "calendar"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Kalender Interaktif</span>
          </button>

          <button
            type="button"
            onClick={() => { setViewMode("agenda"); setSelectedDateFilter(null); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              viewMode === "agenda"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <List className="w-4 h-4" />
            <span>Daftar Seluruh Kelas ({events.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setViewMode("my-classes"); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              viewMode === "my-classes"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Kelas Saya ({registered.length})</span>
          </button>
        </div>

        {/* Right: Quick Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi, trainer, atau ruangan..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ==================== 3. MONTH JUMPER PILLS (ACTIVE MONTHS) ==================== */}
      {monthsWithEvents.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 shrink-0 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Bulan dengan Jadwal:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {monthsWithEvents.map((m) => {
              const isCurrent = year === m.year && month === m.month;
              return (
                <button
                  key={`${m.year}-${m.month}`}
                  type="button"
                  onClick={() => {
                    setCurrentDate(new Date(m.year, m.month, 1));
                    setSelectedDateFilter(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs border ${
                    isCurrent
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isCurrent ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                  }`}>
                    {m.count} sesi
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== 4. CATEGORY PILL FILTERS ==================== */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Filter:
        </span>
        {eventTypes.map((t) => {
          const isSelected = selectedType === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => { setSelectedType(t); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200/80"
              }`}
            >
              {t === "all" ? "Semua Format Kelas" : t}
            </button>
          );
        })}
      </div>

      {/* Date Filter Active Pill notification */}
      {selectedDateFilter && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-blue-900 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Memfilter jadwal khusus pada tanggal:</span>
              <strong className="text-blue-950 font-bold text-sm">{selectedDateText}</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDateFilter(null)}
            className="px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-300 transition-colors shadow-2xs text-xs flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Lihat Semua Tanggal</span>
          </button>
        </div>
      )}

      {/* ==================== 5. VIEW: BESPOKE INTERACTIVE CALENDAR ==================== */}
      {viewMode === "calendar" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
            
            {/* Calendar Hero Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {MONTH_NAMES[month]} <span className="text-blue-600 font-extrabold">{year}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik pada tanggal yang memiliki penanda untuk melihat rincian sesi kelas hari tersebut.
                  </p>
                </div>
              </div>

              {/* Month Navigation & Today Shortcut */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-2xs"
                >
                  Hari Ini
                </button>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                    title="Bulan sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                    title="Bulan berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Type Color Indicators Legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200" />
                <span className="font-medium">Webinar Virtual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                <span className="font-medium">Workshop Offline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-200" />
                <span className="font-medium">Sertifikasi &amp; Ujian</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                <span className="font-medium">Sharing Session</span>
              </div>
            </div>

            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-black text-slate-400 uppercase tracking-wider py-1 border-t border-slate-100">
              {DAY_NAMES.map((d, i) => (
                <div key={d} className={`py-1.5 ${i === 0 || i === 6 ? "text-rose-400" : ""}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* The Interactive 7-Columns Date Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {calendarDays.map((cell, idx) => {
                const hasEvents = cell.eventsCount > 0;
                const isSelected = selectedDateFilter === cell.filterKey;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (hasEvents) {
                        setSelectedDateFilter(isSelected ? null : cell.filterKey);
                      }
                    }}
                    className={`min-h-[84px] sm:min-h-[110px] p-2 sm:p-2.5 rounded-2xl border flex flex-col justify-between transition-all duration-200 select-none ${
                      !cell.isCurrentMonth
                        ? hasEvents 
                          ? "bg-slate-50/80 border-slate-200 text-slate-500 hover:border-blue-400 cursor-pointer"
                          : "bg-slate-50/40 border-slate-100 text-slate-300 opacity-40 cursor-default"
                        : isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-[1.02] z-10"
                        : cell.isToday
                        ? "bg-blue-50/60 border-blue-400 ring-2 ring-blue-400/40 cursor-pointer hover:border-blue-500"
                        : hasEvents
                        ? "bg-white border-blue-200 hover:border-blue-500 hover:shadow-md cursor-pointer hover:scale-[1.01] ring-1 ring-blue-500/20"
                        : "bg-white border-slate-100 text-slate-700"
                    }`}
                  >
                    {/* Top Row: Date Number & Micro Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            isSelected
                              ? "text-white font-black"
                              : cell.isToday
                              ? "text-blue-700 font-black px-1.5 py-0.5 rounded-md bg-blue-100"
                              : cell.isCurrentMonth
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {/* Visible Pulsing Dot on days with agenda */}
                        {hasEvents && !isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 animate-pulse shrink-0" />
                        )}
                      </div>

                      {/* Event Count Badge */}
                      {hasEvents && (
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs ${
                            isSelected
                              ? "bg-white text-blue-700"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {cell.eventsCount}
                        </span>
                      )}
                    </div>

                    {/* Middle: Micro Event Pills */}
                    {hasEvents && (
                      <div className="space-y-1 mt-1.5 overflow-hidden">
                        {cell.matchedEvents.slice(0, 2).map((ev) => {
                          const style = getTypeStyle(ev.type);
                          return (
                            <div
                              key={ev.id}
                              className={`text-[10px] font-bold truncate px-1.5 py-0.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : `${style.pill} bg-opacity-90`
                              }`}
                              title={`${ev.title} (${ev.time})`}
                            >
                              <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-white" : style.dot}`} />
                              <span className="truncate">{ev.title}</span>
                            </div>
                          );
                        })}
                        {cell.eventsCount > 2 && (
                          <span
                            className={`text-[9px] font-black block pl-1 ${
                              isSelected ? "text-blue-100" : "text-blue-600"
                            }`}
                          >
                            +{cell.eventsCount - 2} sesi lainnya
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom: Date hint */}
                    {cell.isToday && !hasEvents && (
                      <div className="text-[9px] font-bold text-blue-600 text-center uppercase tracking-wider">
                        Hari Ini
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Tips: Klik tanggal bertitik biru di atas untuk melihat rincian agenda hari tersebut.</span>
              </span>
              <button
                type="button"
                onClick={() => setViewMode("agenda")}
                className="text-blue-600 font-bold hover:underline self-start sm:self-auto flex items-center gap-1"
              >
                <span>Buka Tampilan List Agenda</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sesi Terjadwal Card Stream below Calendar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Daftar Kelas &amp; Agenda Terkait</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  {filteredEvents.length} Tersedia
                </span>
              </h4>
              {selectedDateFilter && (
                <button
                  onClick={() => setSelectedDateFilter(null)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold underline"
                >
                  Tampilkan Seluruh Agenda Bulan Ini
                </button>
              )}
            </div>

            {filteredEvents.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h5 className="font-bold text-slate-700">Tidak ada agenda pada tanggal / filter ini</h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Silakan pilih tanggal lain pada kalender atau klik tombol di bawah untuk melihat seluruh jadwal.
                </p>
                <button
                  onClick={() => { setSelectedDateFilter(null); setSelectedType("all"); setSearchQuery(""); }}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-sm"
                >
                  Lihat Semua Tanggal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredEvents.map((evt) => (
                  <BespokeClassCard 
                    key={evt.id}
                    event={evt}
                    isRegistered={registered.includes(evt.id)}
                    onToggleReg={() => toggleReg(evt.id)}
                    onOpenDetail={() => setActiveEventDetail(evt)}
                    typeStyle={getTypeStyle(evt.type)}
                    relativeDay={getRelativeDayText(evt.date)}
                    dateParts={parseAnyEventDate(evt.date)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 6. VIEW: AGENDA & MY CLASSES ==================== */}
      {(viewMode === "agenda" || viewMode === "my-classes") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {viewMode === "my-classes" ? "Kelas & Pelatihan yang Anda Ikuti" : "Seluruh Jadwal Kelas Aktif"}
            </h3>
            <span className="text-xs text-slate-500">
              Menampilkan {filteredEvents.length} agenda pelatihan
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
              <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                {viewMode === "my-classes" ? "Belum ada kelas yang Anda ikuti" : "Tidak ada jadwal yang cocok"}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {viewMode === "my-classes" 
                  ? "Buka tab Kalender Interaktif atau Daftar Seluruh Kelas, lalu klik tombol 'Daftar Sesi' untuk menyimpan kelas ke daftar Anda."
                  : "Coba ubah kata kunci pencarian atau ganti filter kategori."}
              </p>
              {viewMode === "my-classes" ? (
                <button
                  onClick={() => setViewMode("calendar")}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 shadow-sm"
                >
                  Jelajahi Kalender Kelas Sekarang
                </button>
              ) : (
                <button
                  onClick={() => { setSelectedType("all"); setSearchQuery(""); }}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredEvents.map((evt) => (
                <BespokeClassCard 
                  key={evt.id}
                  event={evt}
                  isRegistered={registered.includes(evt.id)}
                  onToggleReg={() => toggleReg(evt.id)}
                  onOpenDetail={() => setActiveEventDetail(evt)}
                  typeStyle={getTypeStyle(evt.type)}
                  relativeDay={getRelativeDayText(evt.date)}
                  dateParts={parseAnyEventDate(evt.date)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== 7. BESPOKE INTERACTIVE DETAIL MODAL ==================== */}
      {activeEventDetail && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setActiveEventDetail(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-5 sm:p-6 rounded-t-3xl relative">
              <button
                type="button"
                onClick={() => setActiveEventDetail(null)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Tutup (ESC)"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${getTypeStyle(activeEventDetail.type).badgeBg}`}>
                  {activeEventDetail.type}
                </span>
                <span className="text-xs text-slate-300">
                  {activeEventDetail.isOnline ? "• Kelas Online" : "• Tatap Muka"}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                {activeEventDetail.title}
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-600">
              
              {/* Date & Time Highlights */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tanggal Sesi</span>
                    <strong className="text-slate-800 font-bold">{parseAnyEventDate(activeEventDetail.date).label} {parseAnyEventDate(activeEventDetail.date).year}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Waktu</span>
                    <strong className="text-slate-800 font-bold">{activeEventDetail.time}</strong>
                  </div>
                </div>
              </div>

              {/* Trainer & Location */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Trainer / Pemateri</span>
                    <div className="font-bold text-slate-900 text-sm">{activeEventDetail.trainer}</div>
                    <span className="text-[11px] text-slate-500">Instruktur Resmi Training Center FMCU</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                    {activeEventDetail.isOnline ? (
                      <Video className="w-4 h-4 text-blue-600" />
                    ) : (
                      <MapPin className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Lokasi / Platform</span>
                    <div className="font-bold text-slate-900">{activeEventDetail.location}</div>
                    <span className="text-[11px] text-slate-500">
                      {activeEventDetail.isOnline ? "Tautan meeting akan aktif saat kelas dimulai." : "Harap hadir 15 menit sebelum acara."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {activeEventDetail.description && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Silabus &amp; Ringkasan Materi:</span>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs leading-relaxed">
                    {activeEventDetail.description}
                  </div>
                </div>
              )}

              {/* Quota Indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Kapasitas Ruangan / Kuota Kelas:
                  </span>
                  <span className="text-blue-700 font-bold">
                    {activeEventDetail.registeredCount} / {activeEventDetail.maxCapacity} Peserta
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, Math.round((activeEventDetail.registeredCount / (activeEventDetail.maxCapacity || 1)) * 100))}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
              <a
                href={generateGoogleCalendarAddUrl(activeEventDetail)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Simpan di Google Calendar</span>
              </a>

              <div className="flex items-center gap-2">
                {activeEventDetail.isOnline && activeEventDetail.meetingUrl && (
                  <a
                    href={activeEventDetail.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Masuk Kelas Sekarang</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => toggleReg(activeEventDetail.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                    registered.includes(activeEventDetail.id)
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {registered.includes(activeEventDetail.id) ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Terdaftar di Kelas Ini</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Daftar Sesi Ini</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ==================== BESPOKE CLASS CARD COMPONENT ====================
interface BespokeClassCardProps {
  event: CalendarEvent;
  isRegistered: boolean;
  onToggleReg: () => void;
  onOpenDetail: () => void;
  typeStyle: {
    pill: string;
    dot: string;
    gradient: string;
    accentBorder: string;
    badgeBg: string;
  };
  relativeDay: {
    label: string;
    color: string;
  };
  dateParts: {
    day: number;
    month: number;
    year: number;
    label: string;
  };
}

const BespokeClassCard: React.FC<BespokeClassCardProps> = ({
  event,
  isRegistered,
  onToggleReg,
  onOpenDetail,
  typeStyle,
  relativeDay,
  dateParts
}) => {
  const gcalUrl = generateGoogleCalendarAddUrl(event);
  const capacityPercent = Math.min(100, Math.round((event.registeredCount / (event.maxCapacity || 1)) * 100));

  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-blue-400 ${
      isRegistered ? "ring-1 ring-emerald-500/30 bg-emerald-50/10" : ""
    }`}>
      
      {/* Left: Event Details & Date Ribbon */}
      <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
        
        {/* High-Visibility Date Ribbon */}
        <div className="flex flex-col items-center justify-center w-14 sm:w-16 h-16 sm:h-18 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 text-white border border-slate-700 shadow-sm shrink-0 text-center overflow-hidden group-hover:from-blue-700 group-hover:to-indigo-800 transition-colors">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 group-hover:text-white">
            {MONTH_SHORT[dateParts.month]}
          </span>
          <span className="text-xl sm:text-2xl font-black leading-none text-white my-0.5">
            {dateParts.day}
          </span>
          <span className="text-[9px] text-slate-400 leading-none">
            {dateParts.year}
          </span>
        </div>

        {/* Content Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          
          {/* Badge & Timing Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${typeStyle.pill}`}>
              {event.type}
            </span>

            {/* Relative day pill (Hari ini, Besok, etc) */}
            <span className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold tracking-wide uppercase ${relativeDay.color}`}>
              {relativeDay.label}
            </span>

            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{event.time}</span>
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={onOpenDetail}
            className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer leading-snug line-clamp-2"
          >
            {event.title}
          </h3>

          {/* Trainer and Location Row */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Trainer: <strong className="text-slate-700 font-semibold">{event.trainer}</strong></span>
            </span>

            <span className="text-slate-300 hidden sm:inline">•</span>

            <span className="flex items-center gap-1.5">
              {event.isOnline ? (
                <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <strong className="text-slate-700 font-semibold">{event.location}</strong>
            </span>
          </div>

          {/* Micro Capacity Bar */}
          <div className="flex items-center gap-2 pt-1 max-w-xs">
            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full rounded-full ${
                  capacityPercent > 80 ? "bg-amber-500" : "bg-blue-600"
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {event.registeredCount}/{event.maxCapacity} Kursi
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 self-end md:self-center pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
        
        {/* Detail Button */}
        <button
          type="button"
          onClick={onOpenDetail}
          className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 hover:text-slate-900"
          title="Lihat rincian materi dan silabus kelas"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Detail</span>
        </button>

        {/* Add to Personal Google Calendar */}
        <a
          href={gcalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 sm:px-3 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          title="Simpan reminder jadwal ke Google Calendar pribadi"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">+ G-Cal</span>
        </a>

        {/* Masuk Kelas Virtual Button (if Online) */}
        {event.isOnline && event.meetingUrl && (
          <a
            href={event.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            title="Masuk ruang pertemuan virtual"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Masuk Kelas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Toggle Register */}
        <button
          type="button"
          onClick={onToggleReg}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isRegistered
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          {isRegistered ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Terdaftar</span>
            </>
          ) : (
            <span>Daftar Sesi</span>
          )}
        </button>
      </div>

    </div>
  );
};
