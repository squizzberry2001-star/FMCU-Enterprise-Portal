"use client";

import React, { useState } from "react";
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ShieldCheck, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  ExternalLink,
  Menu,
  X
} from "lucide-react";
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
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <span className="tracking-tight text-lg">FM</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  FMCU <span className="text-blue-600 font-semibold text-base">Learning Center</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> SSO Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden md:block">
                One-Gate Enterprise Training & Competency Hub
              </p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari link sistem, LMS, modul wajib, SOP, atau jadwal..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 text-slate-800"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/80 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Helpdesk link */}
            <a
              href="#helpdesk"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Bantuan & Panduan</span>
            </a>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-900">Notifikasi Pelatihan</h3>
                    <span className="text-[11px] text-blue-600 font-medium cursor-pointer hover:underline">
                      Tandai sudah dibaca
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 ${!item.read ? 'bg-blue-50/40' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {item.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {item.type === "info" && <Info className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{item.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Card Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 ring-2 ring-blue-500/20">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{user.department}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                  <div className="pb-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIK: {user.nik}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">{user.role}</p>
                    <p className="text-[11px] text-slate-400">{user.company}</p>
                  </div>
                  <div className="py-2 space-y-1">
                    <div className="flex justify-between items-center text-xs py-1 px-2 text-slate-600">
                      <span>Kepatuhan Belajar</span>
                      <span className="font-bold text-blue-600">{user.complianceRate}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 px-2 text-slate-600">
                      <span>Total Jam Belajar 2026</span>
                      <span className="font-bold text-slate-800">{user.learningHoursThisYear} Jam</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <button className="w-full text-left px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
                      Keluar / Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
