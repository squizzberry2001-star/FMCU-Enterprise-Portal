"use client";

import React, { useState, useMemo } from "react";
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
  X
} from "lucide-react";
import { generateGoogleCalendarAddUrl, getGoogleCalendarEmbedUrl } from "@/lib/calendarUtils";

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

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({ events, embedUrl }) => {
  const [viewMode, setViewMode] = useState<"agenda" | "grid" | "embed">("embed");
  const activeEmbedUrl = embedUrl || getGoogleCalendarEmbedUrl();
  const [registered, setRegistered] = useState<string[]>(["evt-201"]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEventDetail, setActiveEventDetail] = useState<CalendarEvent | null>(null);

  // Month navigation state for grid view
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  const toggleReg = (id: string) => {
    setRegistered((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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
        matchDate = evt.date.toLowerCase().includes(selectedDateFilter.toLowerCase());
      }

      return matchType && matchSearch && matchDate;
    });
  }, [events, selectedType, searchQuery, selectedDateFilter]);

  // Helper to parse event date into comparable parts
  const parseEventDayMonth = (dateStr: string) => {
    if (!dateStr) return { day: "1", month: "Okt", year: "2026" };

    // Handle ISO timestamp string (e.g. from Google Sheets or CalendarApp: "2026-09-08T17:00:00.000Z")
    if (dateStr.includes("T") || (dateStr.includes("-") && !dateStr.includes(" "))) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return {
          day: String(d.getDate()),
          month: MONTH_SHORT[d.getMonth()],
          year: String(d.getFullYear())
        };
      }
    }

    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      let monthPart = parts[1];
      const foundIdx = MONTH_NAMES.findIndex(
        (m) => m.toLowerCase().startsWith(monthPart.toLowerCase().slice(0, 3))
      );
      if (foundIdx !== -1) {
        monthPart = MONTH_SHORT[foundIdx];
      }
      return {
        day: parts[0],
        month: monthPart,
        year: parts[2] || "2026"
      };
    }
    return { day: "1", month: "Okt", year: "2026" };
  };

  // Calendar Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Create grid cells
  const calendarDays = useMemo(() => {
    const days: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      dateStr: string;
      eventsCount: number;
      matchedEvents: CalendarEvent[];
    }> = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${dayNum} ${MONTH_SHORT[prevMonthIdx]} ${prevYear}`;
      days.push({
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateStr,
        eventsCount: 0,
        matchedEvents: []
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${d} ${MONTH_SHORT[month]} ${year}`;
      const matchedEvents = events.filter((e) => {
        const p = parseEventDayMonth(e.date);
        return (
          parseInt(p.day, 10) === d &&
          p.month.toLowerCase().startsWith(MONTH_SHORT[month].toLowerCase().substring(0, 3))
        );
      });

      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr,
        eventsCount: matchedEvents.length,
        matchedEvents
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let n = 1; n <= remaining; n++) {
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${n} ${MONTH_SHORT[nextMonthIdx]} ${nextYear}`;
      days.push({
        dayNumber: n,
        isCurrentMonth: false,
        dateStr,
        eventsCount: 0,
        matchedEvents: []
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
    setCurrentDate(new Date());
    setSelectedDateFilter(null);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Webinar":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Workshop Offline":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Certification Exam":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Sharing Session":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar: Status & View Mode Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Tersinkronisasi Google Calendar
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              • Jadwal Resmi Training Center FMCU
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Jadwal Pelatihan & Webinar Interaktif
          </h2>
        </div>

        {/* View Switcher: Google Live vs Monthly Grid vs Agenda Cards */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("embed")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "embed"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Calendar Live</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Kalender Bulanan</span>
            </button>
            <button
              type="button"
              onClick={() => { setViewMode("agenda"); setSelectedDateFilter(null); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "agenda"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Row (only for grid & agenda views) */}
      {viewMode !== "embed" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 p-3 sm:p-4 rounded-xl shadow-2xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {eventTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setSelectedType(t); setSelectedDateFilter(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  selectedType === t
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {t === "all" ? "Semua Sesi" : t}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik, trainer, lokasi..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all"
            />
          </div>
        </div>
      )}

      {/* Date Filter Notification Banner if selected from Grid */}
      {viewMode !== "embed" && selectedDateFilter && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Menampilkan jadwal khusus untuk tanggal: <strong>{selectedDateFilter}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDateFilter(null)}
            className="text-blue-700 hover:text-blue-900 font-semibold underline"
          >
            Tampilkan Semua Tanggal
          </button>
        </div>
      )}

      {/* ==================== VIEW 0: GOOGLE CALENDAR LIVE EMBED ==================== */}
      {viewMode === "embed" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-slate-800 text-xs sm:text-sm">Google Calendar Terintegrasi Langsung (Live)</span>
                <span className="text-slate-500 block text-[11px]">Menampilkan kalender resmi Google Workspace FMCU secara interaktif dan real-time.</span>
              </div>
            </div>
            <a
              href={activeEmbedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-blue-600 font-semibold text-xs transition-colors self-start sm:self-auto shrink-0 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Layar Penuh</span>
            </a>
          </div>

          <div className="w-full h-[620px] sm:h-[720px] bg-slate-50 relative">
            <iframe
              src={activeEmbedUrl}
              title="Google Calendar Live FMCU"
              className="w-full h-full border-0"
              style={{ border: 0 }}
              frameBorder="0"
              scrolling="no"
            />
          </div>
        </div>
      )}

      {/* ==================== VIEW 1: AGENDA LIST ==================== */}
      {viewMode === "agenda" && (
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-600">Tidak ada jadwal pelatihan yang cocok.</p>
              <button
                onClick={() => { setSelectedType("all"); setSearchQuery(""); setSelectedDateFilter(null); }}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Reset pencarian
              </button>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const isReg = registered.includes(evt.id);
              const dateParts = parseEventDayMonth(evt.date);
              const gcalUrl = generateGoogleCalendarAddUrl(evt);

              return (
                <div
                  key={evt.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Modern Date Box */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/90 flex flex-col items-center justify-center shrink-0 shadow-2xs group-hover:border-blue-400 transition-colors">
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                        {dateParts.month}
                      </span>
                      <span className="text-lg font-black text-slate-900 leading-tight">
                        {dateParts.day}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Top Meta: Type & Time */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getTypeBadgeColor(evt.type)}`}>
                          {evt.type}
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {evt.time}
                        </span>
                        <span className="text-xs text-slate-400 hidden sm:inline">• {evt.date}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                        {evt.title}
                      </h3>

                      {/* Location & Trainer */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          {evt.isOnline ? (
                            <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          <strong className="font-medium text-slate-700">{evt.location}</strong>
                        </span>

                        <span className="text-slate-300 hidden sm:inline">•</span>

                        <span className="flex items-center gap-1 text-slate-500">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Trainer: <strong className="text-slate-700 font-medium">{evt.trainer}</strong></span>
                        </span>
                      </div>

                      {/* Optional Description */}
                      {evt.description && (
                        <p className="text-xs text-slate-400 line-clamp-1 pt-0.5">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                    {/* Add to Google Calendar 1-Click Link */}
                    <a
                      href={gcalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all hover:text-slate-900"
                      title="Tambahkan jadwal ini ke akun Google Calendar pribadi Anda"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">+ Google Cal</span>
                      <span className="sm:hidden">+ Cal</span>
                    </a>

                    {/* Join Class / Meeting URL button if online & registered */}
                    {evt.isOnline && evt.meetingUrl && (
                      <a
                        href={evt.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                        title="Buka link pertemuan virtual (Google Meet / Zoom / Teams)"
                      >
                        <span>Masuk Kelas</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Register toggle */}
                    <button
                      type="button"
                      onClick={() => toggleReg(evt.id)}
                      className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isReg
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                      }`}
                    >
                      {isReg ? (
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
            })
          )}
        </div>
      )}

      {/* ==================== VIEW 2: MONTHLY CALENDAR GRID ==================== */}
      {viewMode === "grid" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {MONTH_NAMES[month]} {year}
              </h3>
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Hari Ini
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 py-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* 7-Columns Date Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              const hasEvents = cell.eventsCount > 0;
              const isSelected = selectedDateFilter === cell.dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedDateFilter(isSelected ? null : cell.dateStr);
                    }
                  }}
                  className={`min-h-[72px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    !cell.isCurrentMonth
                      ? "bg-slate-50/50 border-slate-100 text-slate-300 opacity-60"
                      : isSelected
                      ? "bg-blue-50/80 border-blue-500 shadow-sm"
                      : hasEvents
                      ? "bg-white border-blue-200 hover:border-blue-400 cursor-pointer hover:shadow-xs"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isSelected
                          ? "text-blue-700 font-bold"
                          : cell.isCurrentMonth
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasEvents && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </div>

                  {/* Micro event indicators in cell */}
                  {hasEvents && (
                    <div className="space-y-1 mt-1">
                      <div className="hidden sm:block">
                        {cell.matchedEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className="text-[10px] font-medium truncate px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 mb-0.5"
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {cell.eventsCount > 2 && (
                          <span className="text-[9px] text-slate-400 font-bold block pl-1">
                            +{cell.eventsCount - 2} sesi
                          </span>
                        )}
                      </div>
                      <span className="sm:hidden text-[10px] font-bold text-blue-600 text-center block">
                        {cell.eventsCount} sesi
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick instructions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>💡 Klik pada tanggal yang memiliki titik biru untuk melihat daftar sesi hari tersebut.</span>
            <button
              onClick={() => setViewMode("agenda")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Lihat Format Daftar Lengkap →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
