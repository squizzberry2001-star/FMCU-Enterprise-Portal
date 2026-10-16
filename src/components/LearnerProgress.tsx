"use client";

import React from "react";
import { TrainingCourse } from "@/types";
import { Clock, Calendar, CheckCircle, ArrowRight } from "lucide-react";

interface LearnerProgressProps {
  courses: TrainingCourse[];
}

export const LearnerProgress: React.FC<LearnerProgressProps> = ({ courses }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pelatihan & Modul Anda</h2>
          <p className="text-xs text-slate-500">Daftar kursus aktif dan sertifikasi wajib kepatuhan kerja.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  course.isMandatory
                    ? "bg-red-50 text-red-600 border border-red-200/60"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {course.isMandatory ? "Wajib (Compliance)" : course.category}
                </span>

                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Jatuh tempo: {course.dueDate}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{course.title}</h3>
              
              {/* Clean progress bar */}
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Selesai {course.completedModules} dari {course.totalModules} modul</span>
                  <span className="font-semibold text-slate-800">{course.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      course.progress === 100
                        ? "bg-emerald-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Estimasi {course.estimatedHours}
              </span>

              {course.status === "completed" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle className="w-4 h-4" /> Selesai
                </span>
              ) : (
                <a
                  href="https://lms.fmcu-portal.internal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors"
                >
                  <span>{course.progress > 0 ? "Lanjutkan" : "Mulai Belajar"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
