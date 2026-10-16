"use client";

import React, { useState } from "react";
import { CalendarEvent } from "@/types";
import { Calendar, Clock, MapPin, Video, Check, ArrowUpRight } from "lucide-react";

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Jadwal Training & Webinar</h2>
        <p className="text-xs text-slate-500">Sesi kelas online dan workshop terdekat yang dapat Anda ikuti.</p>
      </div>

      <div className="space-y-3">
        {events.map((evt) => {
          const isReg = registered.includes(evt.id);

          return (
            <div
              key={evt.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0 border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-blue-500">
                    {evt.date.split(" ")[1]}
                  </span>
                  <span className="text-base font-extrabold text-blue-900 leading-none">
                    {evt.date.split(" ")[0]}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {evt.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      Oleh: <strong className="text-slate-700 font-medium">{evt.trainer}</strong>
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{evt.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {evt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      {evt.isOnline ? (
                        <Video className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      {evt.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                {evt.isOnline && isReg ? (
                  <a
                    href={evt.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    <span>Masuk Kelas (Teams)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => toggleReg(evt.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
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
    </div>
  );
};
