"use client";

import React from "react";
import { UserProfile } from "@/types";
import { Clock, Award, BookCheck, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";

interface HeroBannerProps {
  user: UserProfile;
  onJumpToMandatory: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ user, onJumpToMandatory }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl shadow-blue-950/20 border border-slate-800 p-6 sm:p-8">
      {/* Decorative background glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Welcome Text & Call to Action */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>FMCU Integrated Competency System</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-sky-300">{user.name}</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            Pusat akses satu pintu (*One-Gate*) seluruh ekosistem pelatihan, LMS, kelas virtual, sertifikasi, dan repositori pengetahuan operasional FMCU.
          </p>

          {/* Quick Alert Banner inside Hero */}
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-3.5 flex items-start gap-3 backdrop-blur-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-200">Peringatan Kepatuhan (Mandatory HSE 2026)</p>
              <p className="text-xs text-slate-300 mt-0.5">
                Ada 2 modul wajib keselamatan yang harus diselesaikan sebelum <strong>28 Okt 2026</strong>.
              </p>
            </div>
            <button
              onClick={onJumpToMandatory}
              className="shrink-0 hidden sm:inline-flex items-center gap-1 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-xl transition-all shadow-sm"
            >
              <span>Lanjut Belajar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Stats Bento Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
          
          {/* Card 1: Compliance Rate */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/15 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Target Kepatuhan</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BookCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white">{user.complianceRate}%</div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${user.complianceRate}%` }} 
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">Target Departemen: 90%</p>
            </div>
          </div>

          {/* Card 2: Learning Hours */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/15 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Jam Belajar (YTD)</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white">{user.learningHoursThisYear} <span className="text-xs font-normal text-slate-300">Jam</span></div>
              <p className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                <span className="text-emerald-400 font-semibold">+4.5 jam</span> bulan ini
              </p>
            </div>
          </div>

          {/* Card 3: Completed Courses */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/15 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Modul Selesai</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <BookCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white">{user.completedCourses}</div>
              <p className="text-[10px] text-slate-400 mt-1">1 kursus aktif</p>
            </div>
          </div>

          {/* Card 4: Certificates */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/15 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Sertifikasi Resmi</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white">{user.certificatesEarned}</div>
              <p className="text-[10px] text-amber-300 mt-1 flex items-center gap-1 font-medium">
                Semua Terverifikasi
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
