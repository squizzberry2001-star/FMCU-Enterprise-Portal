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
  ArrowUpRight 
} from "lucide-react";

interface OneGateGridProps {
  apps: OneGateApp[];
  searchQuery?: string;
}

export const OneGateGrid: React.FC<OneGateGridProps> = ({ apps, searchQuery = "" }) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const getIcon = (name: string) => {
    const props = { className: "w-5 h-5 transition-transform duration-200" };
    switch (name) {
      case "GraduationCap":
        return <GraduationCap {...props} className="w-5 h-5 text-blue-600" />;
      case "Video":
        return <Video {...props} className="w-5 h-5 text-indigo-600" />;
      case "FileSpreadsheet":
        return <FileCheck2 {...props} className="w-5 h-5 text-emerald-600" />;
      case "Award":
        return <Award {...props} className="w-5 h-5 text-amber-600" />;
      case "BookOpen":
        return <BookOpen {...props} className="w-5 h-5 text-sky-600" />;
      case "Target":
        return <Target {...props} className="w-5 h-5 text-rose-600" />;
      case "FolderGit2":
        return <FileText {...props} className="w-5 h-5 text-teal-600" />;
      default:
        return <Cpu {...props} className="w-5 h-5 text-violet-600" />;
    }
  };

  const getIconBg = (name: string) => {
    switch (name) {
      case "GraduationCap": return "bg-blue-50 border-blue-100/80";
      case "Video": return "bg-indigo-50 border-indigo-100/80";
      case "FileSpreadsheet": return "bg-emerald-50 border-emerald-100/80";
      case "Award": return "bg-amber-50 border-amber-100/80";
      case "BookOpen": return "bg-sky-50 border-sky-100/80";
      case "Target": return "bg-rose-50 border-rose-100/80";
      case "FolderGit2": return "bg-teal-50 border-teal-100/80";
      default: return "bg-violet-50 border-violet-100/80";
    }
  };

  const filtered = apps.filter((app) => {
    if (activeCategory !== "all" && app.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.shortDesc.toLowerCase().includes(q) ||
        app.categoryLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "Semua" },
          { id: "lms", label: "LMS" },
          { id: "classroom", label: "Kelas Virtual" },
          { id: "assessment", label: "Ujian" },
          { id: "certification", label: "Sertifikat" },
          { id: "repository", label: "SOP & Buku" },
          { id: "tools", label: "Tools" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Clean Modern App Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {filtered.map((app) => (
          <a
            key={app.id}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white border border-slate-200/80 hover:border-blue-500/40 hover:shadow-sm rounded-xl p-4 transition-all duration-150 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${app.customIconUrl ? "bg-white border-slate-200/80 p-1.5" : getIconBg(app.iconName)} group-hover:scale-105 transition-transform`}>
                {app.customIconUrl ? (
                  <img
                    src={app.customIconUrl}
                    alt={app.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  getIcon(app.iconName)
                )}
              </div>
              
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                  {app.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 leading-normal">
                  {app.shortDesc}
                </p>
              </div>
            </div>

            <div className="shrink-0 pt-1 text-slate-300 group-hover:text-blue-600 transition-colors">
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>
        ))}
      </div>

    </div>
  );
};
