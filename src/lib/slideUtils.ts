/**
 * FMCU Enterprise Portal - Google Slides Embed & Presentation Utility
 * Mendukung konversi berbagai variasi URL Google Slides (edit, view, pub, present, iframe)
 * menjadi URL embed responsif untuk presentasi slide show interaktif.
 */

export function parseGoogleSlideEmbedUrl(inputUrl?: string): string {
  if (!inputUrl) return "";
  let url = inputUrl.trim();

  // 1. Jika pengguna menempelkan tag <iframe> lengkap, ekstrak atribut src
  const iframeSrcMatch = url.match(/src=["'](.*?)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    url = iframeSrcMatch[1].trim();
  }

  // 2. Jika merupakan link publikasi Google Docs Presentation (/presentation/d/e/{publishedId}/...)
  const pubMatch = url.match(/docs\.google\.com\/presentation\/d\/e\/([a-zA-Z0-9_-]+)/);
  if (pubMatch && pubMatch[1]) {
    const pubId = pubMatch[1];
    return `https://docs.google.com/presentation/d/e/${pubId}/embed?start=false&loop=false&delayms=3000`;
  }

  // 3. Jika merupakan link standar Google Presentation (/presentation/d/{presentationId}/...)
  const idMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    const slideId = idMatch[1];
    return `https://docs.google.com/presentation/d/${slideId}/embed?start=false&loop=false&delayms=3000`;
  }

  // 4. Jika merupakan link Google Drive File (/file/d/{fileId}/...)
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // 5. Fallback jika URL sudah berupa link embed kustom atau link lainnya
  return url;
}

export function isGoogleSlideUrl(url?: string): boolean {
  if (!url) return false;
  return (
    /docs\.google\.com\/presentation/i.test(url) ||
    /drive\.google\.com\/file/i.test(url) ||
    /<iframe.*?docs\.google\.com\/presentation/i.test(url)
  );
}

export function getGoogleSlideExternalUrl(inputUrl?: string): string {
  if (!inputUrl) return "";
  let url = inputUrl.trim();

  const iframeSrcMatch = url.match(/src=["'](.*?)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    url = iframeSrcMatch[1].trim();
  }

  // Jika URL adalah embed, buat versi present / view untuk dibuka di tab baru
  const pubMatch = url.match(/docs\.google\.com\/presentation\/d\/e\/([a-zA-Z0-9_-]+)/);
  if (pubMatch && pubMatch[1]) {
    return `https://docs.google.com/presentation/d/e/${pubMatch[1]}/pub`;
  }

  const idMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://docs.google.com/presentation/d/${idMatch[1]}/present`;
  }

  return url;
}
