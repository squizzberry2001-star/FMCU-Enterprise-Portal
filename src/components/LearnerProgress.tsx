"use client";

import React from "react";
import { TrainingCourse } from "@/types";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";

interface LearnerProgressProps {
  courses: TrainingCourse[];
}

export const LearnerProgress: React.FC<LearnerProgressProps> = ({ courses }) => {
  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {course.isMandatory && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                  Wajib
                </span>
              )}
              <span className="text-xs text-slate-400">
                Tenggat: <strong className="text-slate-600 font-medium">{course.dueDate}</strong>
              </span>
            </div>

            <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
              {course.title}
            </h3>

            {/* Sleek Progress Bar */}
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
            </div>
          </div>

          <div className="shrink-0 self-end sm:self-center">
            {course.status === "completed" ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lulus
              </span>
            ) : (
              <a
                href="https://lms.fmcu-portal.internal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <span>{course.progress > 0 ? "Lanjutkan" : "Mulai"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
