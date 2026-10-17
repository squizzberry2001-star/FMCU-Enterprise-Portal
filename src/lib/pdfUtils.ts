/**
 * FMCU Enterprise Portal - PDF & Document Viewer Utilities
 * Helper untuk parsing dan pembuatan tautan preview PDF interaktif via Google Drive
 * maupun Google Docs Viewer.
 */

import { DocumentItem } from "@/types";

export function getEmbedPdfUrl(doc: DocumentItem): string {
  if (!doc) return "";

  // 1. Jika ada Google Drive File ID eksplisit
  if (doc.gdriveFileId && doc.gdriveFileId.trim() !== "") {
    return `https://drive.google.com/file/d/${doc.gdriveFileId.trim()}/preview`;
  }

  // 2. Jika viewUrl adalah Google Drive link
  if (doc.viewUrl && doc.viewUrl.includes("drive.google.com/file/d/")) {
    const clean = doc.viewUrl.replace(/\/view(\?.*)?$/, "/preview");
    if (!clean.endsWith("/preview")) {
      return `${clean}/preview`;
    }
    return clean;
  }

  // 3. Jika downloadUrl adalah Google Drive uc atau link sharing
  if (doc.downloadUrl && doc.downloadUrl.includes("drive.google.com")) {
    const idMatch = doc.downloadUrl.match(/id=([a-zA-Z0-9_-]+)/) || doc.downloadUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  }

  // 4. Jika tautan web langsung (http/https) dan bukan hash dummy
  if (doc.downloadUrl && doc.downloadUrl.startsWith("http") && doc.downloadUrl !== "#") {
    // Jika file online langsung, gunakan Google Docs Viewer embed
    return `https://docs.google.com/viewer?url=${encodeURIComponent(doc.downloadUrl)}&embedded=true`;
  }

  // 5. Jika viewUrl adalah web link lain
  if (doc.viewUrl && doc.viewUrl.startsWith("http") && doc.viewUrl !== "#") {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(doc.viewUrl)}&embedded=true`;
  }

  return "";
}

export function isPdfDocument(doc: DocumentItem): boolean {
  if (!doc) return false;
  const fmt = (doc.format || "").toUpperCase();
  if (fmt === "PDF") return true;
  if (doc.downloadUrl && doc.downloadUrl.toLowerCase().includes(".pdf")) return true;
  return false;
}
