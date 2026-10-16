"use client";

import React, { useState } from "react";
import { TrainingCourse } from "@/types";
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Sparkles,
  Award,
  Calendar,
  Layers
} from "lucide-react";

interface LearnerProgressProps {
  courses: TrainingCourse[];
}

export const LearnerProgress: React.FC<LearnerProgressProps> = ({ courses }) => {
  const [filter, setFilter] = useState<"all" | "mandatory" | "in-progress" | "completed">("all");

  const filteredCourses = courses.filter((c) => {
    if (filter === "mandatory") return c.isMandatory;
    if (filter === "in-progress") return c.status === "in-progress";
    if (filter === "completed") return c.status === "completed";
    return true;
  });

  return (
    <div id="learner-progress" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Aktivitas Pelatihan Saya
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau status modul wajib, progress penyelesaian materi, dan sertifikasi keahlian Anda.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {[
            { key: "all", label: "Semua Kursus" },
            { key: "mandatory", label: "Pelatihan Wajib" },
            { key: "in-progress", label: "Sedang Berjalan" },
            { key: "completed", label: "Selesai" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                filter === tab.key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="group p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-indigo-400/80 bg-slate-50/50 hover:bg-white transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {course.isMandatory && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                    Wajib (Compliance)
                  </span>
                )}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {course.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {course.estimatedHours}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                {course.title}
              </h4>

              {/* Progress bar */}
              <div className="max-w-md space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Progres: {course.completedModules} dari {course.totalModules} Modul
                  </span>
                  <span className="font-bold text-slate-800">{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      course.progress === 100
                        ? "bg-emerald-500"
                        : course.progress > 50
                        ? "bg-indigo-600"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Due Date & Action */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block">Batas Waktu:</span>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {course.dueDate}
                </span>
              </div>

              {course.status === "completed" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Lulus & Bersertifikat</span>
                </div>
              ) : (
                <a
                  href="https://lms.fmcu-portal.internal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm shadow-indigo-500/20"
                >
                  <span>{course.progress > 0 ? "Lanjutkan" : "Mulai Belajar"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
