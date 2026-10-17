"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { TrainingCourse } from "@/types";
import { 
  Presentation, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  X, 
  Play,
  BookOpen,
  Clock,
  Search,
  Sparkles,
  Layers
} from "lucide-react";
import { parseGoogleSlideEmbedUrl, getGoogleSlideExternalUrl } from "@/lib/slideUtils";

interface LearnerProgressProps {
  courses: TrainingCourse[];
}

export const LearnerProgress: React.FC<LearnerProgressProps> = ({ courses }) => {
  const [selectedCourseForSlide, setSelectedCourseForSlide] = useState<TrainingCourse | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const presentationContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Escape to close or exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else if (selectedCourseForSlide) {
          setSelectedCourseForSlide(null);
        }
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [selectedCourseForSlide]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (presentationContainerRef.current) {
          await presentationContainerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
    }
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
    return ["all", ...cats];
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchCategory = selectedCategory === "all" || course.category === selectedCategory;
      const matchSearch = 
        !searchFilter.trim() || 
        course.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchFilter.toLowerCase())) ||
        course.category.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [courses, selectedCategory, searchFilter]);

  return (
    <div className="space-y-4">
      {/* Category Pills & Quick Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 p-3 sm:p-4 rounded-xl shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cat === "all" ? "Semua Modul" : cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cari modul materi..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Grid of Modules */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-medium text-slate-600">Tidak ada modul yang cocok dengan pencarian.</p>
          <button
            onClick={() => { setSelectedCategory("all"); setSearchFilter(""); }}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((course) => {
            const hasSlide = Boolean(course.slideUrl && course.slideUrl.trim().length > 0);

            return (
              <div
                key={course.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between gap-4 group relative overflow-hidden"
              >
                {/* Decorative Subtle Background Accent for Slides */}
                {hasSlide && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent pointer-events-none rounded-tr-2xl" />
                )}

                <div className="space-y-2.5">
                  {/* Category & Duration Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                      {course.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {course.estimatedHours && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {course.estimatedHours}
                        </span>
                      )}
                      {hasSlide && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70">
                          <Presentation className="w-3 h-3 text-amber-600" />
                          Slide Show PPT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Description (if provided) */}
                  {course.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Direct Action Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {hasSlide ? "Siap dipresentasikan" : "Materi dokumen"}
                  </span>

                  {hasSlide ? (
                    <button
                      type="button"
                      onClick={() => setSelectedCourseForSlide(course)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all group/btn"
                      title="Buka dan presentasikan modul slide ini"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400 transition-transform group-hover/btn:scale-110" />
                      <span>Buka Modul</span>
                    </button>
                  ) : (
                    <a
                      href="https://lms.fmcu-portal.internal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <span>Buka LMS</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== INTERACTIVE SLIDESHOW PRESENTATION MODAL ==================== */}
      {selectedCourseForSlide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div
            ref={presentationContainerRef}
            className={`bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all ${
              isFullscreen 
                ? "w-screen h-screen rounded-none border-0" 
                : "w-full max-w-5xl h-[88vh] max-h-[780px]"
            }`}
          >
            {/* Modal Header */}
            <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Presentation className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Modul Pelatihan
                    </span>
                    <span className="text-xs text-slate-400 truncate hidden sm:inline">
                      {selectedCourseForSlide.category}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">
                    {selectedCourseForSlide.title}
                  </h2>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                  title={isFullscreen ? "Keluar Layar Penuh" : "Mode Layar Penuh (Kiosk PPT)"}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span className="hidden md:inline">Kecilkan</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden md:inline">Layar Penuh</span>
                    </>
                  )}
                </button>

                <a
                  href={getGoogleSlideExternalUrl(selectedCourseForSlide.slideUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                  title="Buka langsung di tab Google Slides baru"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden md:inline">Tab Baru</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedCourseForSlide(null)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Tutup Presentasi (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded 16:9 Presentation Viewport */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              <iframe
                src={parseGoogleSlideEmbedUrl(selectedCourseForSlide.slideUrl)}
                title={selectedCourseForSlide.title}
                className="w-full h-full border-0"
                allowFullScreen={true}
                // @ts-ignore
                webkitallowfullscreen="true"
                // @ts-ignore
                mozallowfullscreen="true"
              />
            </div>

            {/* Modal Footer Presentation Guide */}
            <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Navigasi: Gunakan tombol panah ⬅️ ➡️ pada keyboard atau klik slide untuk maju/mundur.</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-[10px]">
                {selectedCourseForSlide.estimatedHours && (
                  <>
                    <span>Durasi: {selectedCourseForSlide.estimatedHours}</span>
                    <span>•</span>
                  </>
                )}
                <span>Tekan <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">ESC</kbd> untuk menutup</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
