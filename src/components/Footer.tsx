"use client";

import React from "react";
import { ShieldCheck, Mail, Phone, LifeBuoy, ExternalLink, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="helpdesk" className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Branding & Description */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm">
                FM
              </div>
              <span className="font-bold text-white text-base tracking-tight">
                FMCU <span className="text-blue-400 font-semibold text-sm">Learning Center</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Portal gerbang tunggal (*One-Gate System*) pengembangan talenta, kompetensi, dan pelatihan terpadu bagi seluruh insan perusahaan FMCU.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Semua Layanan SSO Beroperasi Normal</span>
            </div>
          </div>

          {/* Col 2: Akses Cepat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#one-gate-hub" className="hover:text-white transition-colors">
                  One-Gate App Hub
                </a>
              </li>
              <li>
                <a href="#learner-progress" className="hover:text-white transition-colors">
                  Pelatihan Wajib & Compliance
                </a>
              </li>
              <li>
                <a href="#training-calendar" className="hover:text-white transition-colors">
                  Jadwal Webinar & Kelas
                </a>
              </li>
              <li>
                <a href="#knowledge-base" className="hover:text-white transition-colors">
                  Pusat SOP & Handbooks
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan Bantuan / Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Helpdesk & Dukungan IT
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>learning-center@fmcu.co.id</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Ext. 4080 (Jam Kerja 08:00 - 17:00)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <LifeBuoy className="w-4 h-4 text-amber-400" />
                <span>Tiket Permohonan Training Baru</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Keamanan & Kepatuhan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Keamanan Data & Privasi
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dilindungi oleh protokol enkripsi enterprise & Single Sign-On berbasis Active Directory / Azure AD. Akses diaudit secara berkala.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg text-[11px] text-slate-300 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>ISO 27001 Security Compliant</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 FMCU Enterprise Portal. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-mono">v1.0.0-production</span>
            <span>•</span>
            <a href="#" className="hover:text-slate-300">Kebijakan Privasi</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300">Ketentuan Layanan</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
