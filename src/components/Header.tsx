"use client";

import React, { useState } from "react";
import { ShieldCheck, Bell } from "lucide-react";
import { UserProfile, UserNotification } from "@/types";

interface HeaderProps {
  user: UserProfile;
  notifications: UserNotification[];
}

export const Header: React.FC<HeaderProps> = ({ user, notifications }) => {
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 w-full">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            FM
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
              FMCU <span className="font-normal text-slate-500">Learning Center</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              One Gate SSO Aktif
            </span>
          </div>
        </div>

        {/* Right: Notif & User */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Notifikasi</span>
                  <span className="text-[11px] text-blue-600 cursor-pointer">Tandai dibaca</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 text-xs">
                      <p className="font-semibold text-slate-800">{n.title}</p>
                      <p className="text-slate-500 mt-0.5 leading-snug">{n.description}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-1">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{user.role}</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
