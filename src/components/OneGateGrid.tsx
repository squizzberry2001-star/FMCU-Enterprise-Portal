"use client";

import React, { useState } from "react";
import { OneGateApp } from "@/types";
import { 
  GraduationCap, 
  Video, 
  FileCheck2, 
  Award, 
  BookOpen, 
  Target, 
  FileText, 
  Cpu, 
  ArrowUpRight,
  ShieldCheck,
  Search
} from "lucide-react";

interface OneGateGridProps {
  apps: OneGateApp[];
}

export const OneGateGrid: React.FC<OneGateGridProps> = ({ apps }) => {
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [search, setSearch] = useState("");

  const getIcon = (name: string) => {
    const props = { className: "w-6 h-6" };
    switch (name) {
      case "GraduationCap":
        return <GraduationCap {...props} className="w-6 h-6 text-blue-600" />;
      case "Video":
        return <Video {...props} className="w-6 h-6 text-indigo-600" />;
      case "FileSpreadsheet":
        return <FileCheck2 {...props} className="w-6 h-6 text-emerald-600" />;
      case "Award":
        return <Award {...props} className="w-6 h-6 text-amber-600" />;
      case "BookOpen":
        return <BookOpen {...props} className="w-6 h-6 text-cyan-600" />;
      case "Target":
        return <Target {...props} className="w-6 h-6 text-rose-600" />;
      case "FolderGit2":
        return <FileText {...props} className="w-6 h-6 text-teal-600" />;
      default:
        return <Cpu {...props} className="w-6 h-6 text-violet-600" />;
    }
  };

  const filtered = apps.filter((app) => {
    if (selectedTag !== "all" && app.category !== selectedTag) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.shortDesc.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "Semua Sistem" },
            { id: "lms", label: "LMS & Kursus" },
            { id: "classroom", label: "Kelas Virtual" },
            { id: "assessment", label: "Ujian" },
            { id: "certification", label: "Sertifikat" },
            { id: "repository", label: "SOP & Buku" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedTag(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedTag === cat.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari sistem atau link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Clean Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((app) => (
          <a
            key={app.id}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-white border border-slate-200/80 hover:border-blue-500/50 hover:shadow-md rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getIcon(app.iconName)}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <ShieldCheck className="w-3 h-3" />
                  <span>SSO</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors flex items-center gap-1">
                <span>{app.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {app.shortDesc}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-600 font-medium transition-colors">
              <span>Buka aplikasi</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>
        ))}
      </div>

    </div>
  );
};
