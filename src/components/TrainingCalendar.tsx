"use client";

import React, { useState } from "react";
import { CalendarEvent } from "@/types";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  ArrowUpRight, 
  Check, 
  Share2,
  CalendarCheck
} from "lucide-react";

interface TrainingCalendarProps {
  events: CalendarEvent[];
}

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({ events }) => {
  const [registeredEvents, setRegisteredEvents] = useState<string[]>(["evt-201"]);

  const toggleRegister = (id: string) => {
    setRegisteredEvents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div id="training-calendar" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Jadwal Sesi & Webinar Terdekat
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar sesi tatap muka online dan workshop offline yang diselenggarakan Training Center FMCU.
          </p>
        </div>

        <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200/80 self-start sm:self-auto">
          3 Sesi Tersedia Bulan Ini
        </span>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map((evt) => {
          const isRegistered = registeredEvents.includes(evt.id);

          return (
            <div
              key={evt.id}
              className="group bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-sky-400 p-5 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Event Type Badge & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    evt.isOnline 
                      ? "bg-blue-100 text-blue-700 border border-blue-200" 
                      : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}>
                    {evt.type}
                  </span>

                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {evt.registeredCount}/{evt.maxCapacity} Peserta
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors line-clamp-2">
                  {evt.title}
                </h3>

                {/* Trainer info */}
                <p className="text-xs text-slate-500 font-medium">
                  Fasilitator: <span className="text-slate-700">{evt.trainer}</span>
                </p>

                {/* Date & Time */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="font-semibold text-slate-800">{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {evt.isOnline ? (
                      <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="truncate text-slate-500">{evt.location}</span>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-200 flex items-center gap-2">
                {evt.isOnline && isRegistered ? (
                  <a
                    href={evt.meetingUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    <span>Masuk Kelas (Teams)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => toggleRegister(evt.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isRegistered
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : "bg-slate-900 hover:bg-sky-600 text-white shadow-sm"
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Terdaftar</span>
                      </>
                    ) : (
                      <span>Daftar Sekarang</span>
                    )}
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
