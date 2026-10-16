"use client";

import React, { useState } from "react";
import { DocumentItem } from "@/types";
import { 
  FolderArchive, 
  FileText, 
  Download, 
  Eye, 
  FileCheck, 
  Search,
  Check
} from "lucide-react";

interface KnowledgeBaseProps {
  documents: DocumentItem[];
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ documents }) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) => {
    if (activeTab === "all") return true;
    return doc.category.toLowerCase().includes(activeTab.toLowerCase());
  });

  const handleDownload = (id: string) => {
    setDownloadSuccessId(id);
    setTimeout(() => {
      setDownloadSuccessId(null);
    }, 2500);
  };

  return (
    <div id="knowledge-base" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <FolderArchive className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pusat Dokumen, SOP & Panduan Kerja
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Akses langsung ke arsip standar operasional prosedur, handbook materi, dan pedoman kepatuhan FMCU.
          </p>
        </div>

        {/* Categories filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {[
            { key: "all", label: "Semua Dokumen" },
            { key: "sop", label: "SOP Keselamatan" },
            { key: "manual", label: "Panduan Sistem" },
            { key: "modul", label: "Slide Presentasi" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                activeTab === tab.key
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/30">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-4 sm:px-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 hover:text-teal-600 transition-colors">
                  {doc.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {doc.format}
                  </span>
                  <span>Ukuran: {doc.size}</span>
                  <span>•</span>
                  <span>Diperbarui: {doc.updatedAt}</span>
                  <span>•</span>
                  <span className="text-slate-600 font-medium">{doc.category}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => handleDownload(doc.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  downloadSuccessId === doc.id
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {downloadSuccessId === doc.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersimpan</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Unduh File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
