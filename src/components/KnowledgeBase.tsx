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
    <div className="bg-white border border-slate-200/80 rounded-xl divide-y divide-slate-100 overflow-hidden">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-slate-900 truncate">{doc.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {doc.format} • {doc.size} • Diperbarui {doc.updatedAt}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload(doc.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
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
  );
};
