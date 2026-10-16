"use client";

import React, { useState } from "react";
import { Search, Bell, ShieldCheck } from "lucide-react";
import { UserProfile, UserNotification } from "@/types";

interface HeaderProps {
  user: UserProfile;
  notifications: UserNotification[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  notifications,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 w-full transition-all">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
            FM
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-base">
              FMCU <span className="font-normal text-slate-400">Portal</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              SSO
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari sistem, kursus, dokumen..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-3.5 h-3.5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50">
                <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Pemberitahuan</span>
                  <span className="text-[11px] text-blue-600 cursor-pointer">Tandai dibaca</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                      <p className="font-medium text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-1">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
            />
            <span className="hidden md:inline text-xs font-medium text-slate-700">
              {user.name.split(" ")[0]}
            </span>
          </div>

        </div>

      </div>
    </header>
  );
};
