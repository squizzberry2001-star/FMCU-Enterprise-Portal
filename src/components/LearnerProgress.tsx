"use client";

import React, { useState, useRef, useEffect } from "react";
import { TrainingCourse } from "@/types";
import { 
  ArrowRight, 
  CheckCircle2, 
  Presentation, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  X, 
  Play,
  Tv,
  Layers
} from "lucide-react";
import { parseGoogleSlideEmbedUrl, getGoogleSlideExternalUrl } from "@/lib/slideUtils";

interface LearnerProgressProps {
  courses: TrainingCourse[];
}

export const LearnerProgress: React.FC<LearnerProgressProps> = ({ courses }) => {
  const [selectedCourseForSlide, setSelectedCourseForSlide] = useState<TrainingCourse | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  return (
    <div className="space-y-3">
      {courses.map((course) => {
        const hasSlide = Boolean(course.slideUrl && course.slideUrl.trim().length > 0);

        return (
          <div
            key={course.id}
            className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {course.isMandatory && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                    Wajib
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  Tenggat: <strong className="text-slate-600 font-medium">{course.dueDate}</strong>
                </span>

                {hasSlide && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Presentation className="w-3 h-3 text-amber-600" />
                    Google Slides Ready
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                {course.title}
              </h3>

              {/* Progress Bar & Module counter */}
              <div className="flex items-center gap-3 pt-1 max-w-md">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      course.progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 shrink-0">
                  {course.progress}%
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  ({course.completedModules}/{course.totalModules} modul)
                </span>
              </div>
            </div>

            {/* Actions: Presentation Mode + LMS Button */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {hasSlide && (
                <button
                  type="button"
                  onClick={() => setSelectedCourseForSlide(course)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all group"
                  title="Presentasikan modul ini seperti Slide Show PowerPoint"
                >
                  <Presentation className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                  <span>Presentasi Slide</span>
                </button>
              )}

              {course.status === "completed" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lulus
                </span>
              ) : (
                <a
                  href="https://lms.fmcu-portal.internal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <span>{course.progress > 0 ? "Lanjutkan LMS" : "Mulai LMS"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        );
      })}

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
                      Slide Show Modul
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
                <span>Navigasi: Gunakan tombol panah ⬅️ ➡️ keyboard atau klik slide untuk maju/mundur.</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-[10px]">
                <span>Durasi: {selectedCourseForSlide.estimatedHours}</span>
                <span>•</span>
                <span>Tekan <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">ESC</kbd> untuk menutup</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
