"use client";

import React, { useState, useMemo, useEffect } from "react";
import { DocumentItem } from "@/types";
import { 
  FileText, 
  Download, 
  Check, 
  Eye, 
  ExternalLink, 
  X, 
  Search, 
  Maximize2, 
  Minimize2, 
  File, 
  ShieldCheck, 
  Calendar, 
  HardDrive,
  Printer,
  Sparkles
} from "lucide-react";
import { getEmbedPdfUrl, isPdfDocument } from "@/lib/pdfUtils";

interface KnowledgeBaseProps {
  documents: DocumentItem[];
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ documents }) => {
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewDoc) {
        setPreviewDoc(null);
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewDoc]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(documents.map((d) => d.category).filter(Boolean)));
    return ["all", ...cats];
  }, [documents]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchCat = selectedCategory === "all" || doc.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.format.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [documents, selectedCategory, searchQuery]);

  const handleDownload = (doc: DocumentItem) => {
    setDownloaded(doc.id);
    if (doc.downloadUrl && doc.downloadUrl !== "#") {
      window.open(doc.downloadUrl, "_blank");
    }
    setTimeout(() => setDownloaded(null), 2500);
  };

  const getFormatBadge = (fmt: string) => {
    const upper = (fmt || "PDF").toUpperCase();
    switch (upper) {
      case "PDF":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "PPTX":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DOCX":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "XLSX":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const activeEmbedUrl = previewDoc ? getEmbedPdfUrl(previewDoc) : "";

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cat === "all" ? "Semua Dokumen" : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul SOP, nomor, kategori..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Document Items List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-2xs">
        {filteredDocs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-600">Tidak ada dokumen yang sesuai dengan pencarian.</p>
            <button
              type="button"
              onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Reset filter
            </button>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isPdf = isPdfDocument(doc);

            return (
              <div
                key={doc.id}
                className="p-4 hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left info */}
                <div 
                  onClick={() => setPreviewDoc(doc)}
                  className="flex items-start gap-3.5 min-w-0 cursor-pointer flex-1"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    isPdf 
                      ? "bg-rose-50/80 border-rose-200 text-rose-600 group-hover:bg-rose-100" 
                      : "bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-slate-100"
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getFormatBadge(doc.format)}`}>
                        {doc.format}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {doc.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {doc.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Ukuran: <strong className="text-slate-600 font-medium">{doc.size}</strong></span>
                      <span>•</span>
                      <span>Diperbarui: {doc.updatedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Lihat (Preview PDF) + Unduh */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-all shadow-2xs hover:shadow-xs"
                    title="Buka dan baca dokumen langsung di website"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Dokumen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                      downloaded === doc.id
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {downloaded === doc.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersimpan</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ==================== INTERACTIVE PDF MODAL UI ==================== */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className={`bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all ${
            isFullscreen ? "w-full h-full max-w-none max-h-none rounded-none" : "w-full max-w-5xl h-[88vh] max-h-[820px]"
          }`}>
            {/* Modal Header */}
            <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {previewDoc.format} Reader
                    </span>
                    <span className="text-xs text-slate-400 truncate hidden sm:inline">
                      {previewDoc.category}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">
                    {previewDoc.title}
                  </h2>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {previewDoc.downloadUrl && previewDoc.downloadUrl !== "#" && (
                  <a
                    href={previewDoc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                    title="Buka di Tab Baru"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden md:inline">Buka Tab Baru</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDownload(previewDoc)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex items-center"
                  title={isFullscreen ? "Kecilkan Layar" : "Layar Penuh"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => { setPreviewDoc(null); setIsFullscreen(false); }}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Tutup (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / PDF Viewport */}
            <div className="relative flex-1 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
              {activeEmbedUrl ? (
                /* Native Embed / Google Drive Preview Iframe */
                <iframe
                  src={activeEmbedUrl}
                  title={previewDoc.title}
                  className="w-full h-full border-0 bg-slate-900"
                  allowFullScreen={true}
                />
              ) : (
                /* Fallback Clean FMCU SOP Document Viewer for local documents */
                <div className="w-full h-full overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-950/60">
                  <div className="bg-white text-slate-900 rounded-xl shadow-2xl max-w-3xl w-full p-6 sm:p-10 space-y-6 border border-slate-200">
                    {/* Official Document Header */}
                    <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                            FMCU ENTERPRISE PORTAL
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                            INTERNAL ONLY
                          </span>
                        </div>
                        <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                          {previewDoc.title}
                        </h1>
                      </div>

                      <div className="text-right text-[11px] text-slate-500 font-mono space-y-0.5 border-l sm:border-l-0 pl-3 sm:pl-0 border-slate-200">
                        <div>ID: <strong>{previewDoc.id.toUpperCase()}</strong></div>
                        <div>Kategori: <strong>{previewDoc.category}</strong></div>
                        <div>Tgl Terbit: <strong>{previewDoc.updatedAt}</strong></div>
                      </div>
                    </div>

                    {/* Metadata Table */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Format Dokumen</span>
                        <span className="font-semibold text-slate-800">{previewDoc.format} File</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Ukuran Berkas</span>
                        <span className="font-semibold text-slate-800">{previewDoc.size}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Status Berkas</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Resmi Berlaku
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Penyimpanan</span>
                        <span className="font-semibold text-slate-800">FMCU Cloud Drive</span>
                      </div>
                    </div>

                    {/* Document Content Preview */}
                    <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">1. Tujuan & Maksud Pedoman</h3>
                        <p className="text-slate-600">
                          Dokumen standar operasional prosedur ini disusun sebagai panduan baku bagi seluruh karyawan FMCU
                          dalam menjalankan aktivitas operasional sesuai ketentuan tata kelola perusahaan yang berlaku.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">2. Ruang Lingkup & Kepatuhan</h3>
                        <p className="text-slate-600">
                          Pedoman ini mencakup seluruh unit kerja, gerai, kantor regional, serta divisi pendukung operasional
                          di bawah naungan FMCU Corporation. Seluruh personil wajib membaca, memahami, dan mengimplementasikan
                          poin-poin keselamatan dan integritas kerja.
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span>Pemberitahuan Tautan Unduhan Asli:</span>
                        </div>
                        <p className="text-xs text-blue-800 leading-normal">
                          Berkas fisik dokumen ini telah diarsipkan secara aman di Google Drive FMCU. Anda dapat mengunduh
                          atau memperbarui file dokumen melalui tombol di bawah atau menu panel admin.
                        </p>
                      </div>
                    </div>

                    {/* Document Footer Verification */}
                    <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Diverifikasi oleh FMCU Compliance & Learning Division</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors self-start sm:self-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Dokumen</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-2.5 text-[11px] text-slate-400 flex items-center justify-between gap-2 shrink-0">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Tekan <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-[10px] font-mono">ESC</kbd> untuk menutup pratinjau</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setPreviewDoc(null); setIsFullscreen(false); }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
