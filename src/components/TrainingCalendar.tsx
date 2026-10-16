"use client";

import React, { useState } from "react";
import { CalendarEvent } from "@/types";
import { Video, MapPin, ArrowUpRight, Check } from "lucide-react";

interface TrainingCalendarProps {
  events: CalendarEvent[];
}

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({ events }) => {
  const [registered, setRegistered] = useState<string[]>(["evt-201"]);

  const toggleReg = (id: string) => {
    setRegistered((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3">
      {events.map((evt) => {
        const isReg = registered.includes(evt.id);

        return (
          <div
            key={evt.id}
            className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              {/* Date Box */}
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 text-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {evt.date.split(" ")[1]}
                </span>
                <span className="text-base font-bold leading-none">
                  {evt.date.split(" ")[0]}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {evt.type}
                  </span>
                  <span className="text-xs text-slate-400">
                    {evt.time}
                  </span>
                </div>
                
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                  {evt.title}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  {evt.isOnline ? (
                    <Video className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>{evt.location}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400">{evt.trainer}</span>
                </p>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              {evt.isOnline && isReg ? (
                <a
                  href={evt.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <span>Masuk Kelas</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={() => toggleReg(evt.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isReg
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {isReg ? "✓ Terdaftar" : "Daftar Sesi"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
