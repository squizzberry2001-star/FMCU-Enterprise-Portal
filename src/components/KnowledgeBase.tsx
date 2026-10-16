"use client";

import React, { useState } from "react";
import { DocumentItem } from "@/types";
import { FileText, Download, Check } from "lucide-react";

interface KnowledgeBaseProps {
  documents: DocumentItem[];
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ documents }) => {
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloaded(id);
    setTimeout(() => setDownloaded(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Pusat Dokumen & SOP</h2>
        <p className="text-xs text-slate-500">Arsip standar prosedur kerja, handbook, dan materi pelatihan.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl divide-y divide-slate-100 overflow-hidden">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{doc.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="font-medium text-slate-600">{doc.format}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>Diperbarui {doc.updatedAt}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(doc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                downloaded === doc.id
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {downloaded === doc.id ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Tersimpan
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Unduh
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
