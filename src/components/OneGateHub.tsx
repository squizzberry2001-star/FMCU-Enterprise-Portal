"use client";

import React, { useState, useMemo } from "react";
import { OneGateApp, AppCategory } from "@/types";
import { 
  GraduationCap, 
  Video, 
  FileSpreadsheet, 
  Award, 
  BookOpen, 
  Target, 
  Cpu, 
  FolderGit2, 
  ExternalLink, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  LayoutGrid,
  Lock,
  ArrowUpRight,
  SlidersHorizontal,
  Check
} from "lucide-react";

interface OneGateHubProps {
  apps: OneGateApp[];
  searchQuery: string;
}

export const OneGateHub: React.FC<OneGateHubProps> = ({ apps: initialApps, searchQuery }) => {
  const [apps, setApps] = useState<OneGateApp[]>(initialApps);
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeSSOLaunch, setActiveSSOLaunch] = useState<OneGateApp | null>(null);

  // Toggle favorite
  const toggleFavorite = (appId: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, isFavorite: !app.isFavorite } : app
      )
    );
  };

  // Filtered Apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // Category filter
      if (selectedCategory !== "all" && app.category !== selectedCategory) {
        return false;
      }
      // Favorites filter
      if (onlyFavorites && !app.isFavorite) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = app.name.toLowerCase().includes(query);
        const matchDesc = app.shortDesc.toLowerCase().includes(query);
        const matchTags = app.tags.some((tag) => tag.toLowerCase().includes(query));
        const matchCat = app.categoryLabel.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchTags && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }, [apps, selectedCategory, onlyFavorites, searchQuery]);

  // Favorite apps for Quick Access Bar
  const favoriteApps = useMemo(() => apps.filter((a) => a.isFavorite), [apps]);

  // Helper to render icon by name
  const renderAppIcon = (iconName: string) => {
    const iconClass = "w-6 h-6 text-blue-600";
    switch (iconName) {
      case "GraduationCap":
        return <GraduationCap className={iconClass} />;
      case "Video":
        return <Video className={iconClass} />;
      case "FileSpreadsheet":
        return <FileSpreadsheet className={iconClass} />;
      case "Award":
        return <Award className={iconClass} />;
      case "BookOpen":
        return <BookOpen className={iconClass} />;
      case "Target":
        return <Target className={iconClass} />;
      case "Cpu":
        return <Cpu className={iconClass} />;
      case "FolderGit2":
        return <FolderGit2 className={iconClass} />;
      default:
        return <ExternalLink className={iconClass} />;
    }
  };

  const handleLaunchApp = (app: OneGateApp) => {
    setActiveSSOLaunch(app);
  };

  return (
    <div id="one-gate-hub" className="space-y-6">
      
      {/* Title & Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              One-Gate Application Hub
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gerbang tunggal terintegrasi menuju seluruh platform pelatihan, LMS, dan sistem sertifikasi FMCU.
          </p>
        </div>

        {/* Quick Filter: Favorites Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              onlyFavorites
                ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-white" : "text-amber-500"}`} />
            <span>Favorit Saya ({favoriteApps.length})</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { key: "all", label: "Semua Sistem" },
          { key: "lms", label: "Core LMS & Kursus" },
          { key: "classroom", label: "Kelas Virtual" },
          { key: "assessment", label: "Ujian & Post-Test" },
          { key: "certification", label: "E-Sertifikat" },
          { key: "repository", label: "E-Library & SOP" },
          { key: "tools", label: "Kompetensi & Lab" },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key as AppCategory)}
            className={`px-3.5 py-2 rounded-xl font-medium shrink-0 transition-all ${
              selectedCategory === cat.key
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada aplikasi yang sesuai</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau ubah filter kategori di atas.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setOnlyFavorites(false);
            }}
            className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="group relative bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-xl hover:border-blue-400/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Icon & Badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all shadow-sm ${app.customIconUrl ? "bg-white border border-slate-200 p-2" : "bg-blue-50/80 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white"}`}>
                    {app.customIconUrl ? (
                      <img src={app.customIconUrl} alt={app.name} className="w-full h-full object-contain" />
                    ) : (
                      renderAppIcon(app.iconName)
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {app.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {app.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(app.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-amber-500 hover:bg-slate-50 transition-colors"
                      title={app.isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
                    >
                      <Star className={`w-4 h-4 ${app.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Name & Desc */}
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base line-clamp-1">
                  {app.name}
                </h3>
                <span className="inline-block text-[11px] font-medium text-slate-400 mb-2">
                  {app.categoryLabel}
                </span>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {app.shortDesc}
                </p>
              </div>

              {/* Card Bottom: SSO Tag & Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {app.ssoSupported ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>SSO Login</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <Lock className="w-3 h-3" />
                      <span>Kredensial Khusus</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleLaunchApp(app)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <span>Buka</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SSO Launch Modal Simulation */}
      {activeSSOLaunch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            
            <div className="text-center">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
                Single Sign-On (SSO) Handshake
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Membuka {activeSSOLaunch.name}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Portal FMCU sedang mengautentikasi identitas korporat Anda secara otomatis. Anda tidak perlu memasukkan password ulang.
              </p>

              <div className="my-5 p-3 bg-slate-50 rounded-xl text-left border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Target URL:</span>
                  <span className="font-mono text-slate-700 truncate max-w-[200px]">{activeSSOLaunch.url}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Security Token:</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> SAML 2.0 Verified
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSSOLaunch(null)}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Tutup
                </button>
                <a
                  href={activeSSOLaunch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setActiveSSOLaunch(null)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-blue-500/20"
                >
                  <span>Lanjutkan ke Sistem</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
