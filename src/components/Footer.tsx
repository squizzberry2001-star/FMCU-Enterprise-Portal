"use client";

import React from "react";
import { ShieldCheck, Mail, Phone } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-8 mt-12 text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
            FM
          </div>
          <span className="font-semibold text-slate-800">FMCU Enterprise Learning Center</span>
          <span className="text-slate-300">•</span>
          <span>One-Gate System v1.0</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500">
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> learning@fmcu.co.id
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> Ext. 4080 (Helpdesk)
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> SSO Active
          </span>
        </div>
      </div>
    </footer>
  );
};
