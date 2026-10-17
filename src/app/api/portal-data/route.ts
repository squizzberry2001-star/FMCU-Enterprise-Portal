import { NextRequest, NextResponse } from "next/server";
import defaultCloudConfig from "@/config/cloudConfig.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gasUrl = searchParams.get("gasUrl") || process.env.NEXT_PUBLIC_GAS_API_URL || defaultCloudConfig.gasApiUrl;
  const action = searchParams.get("action") || "getAll";

  if (action === "fetchIcal") {
    const icalUrl = searchParams.get("url");
    if (!icalUrl) {
      return NextResponse.json({ success: false, error: "URL iCal belum diisi." }, { status: 400 });
    }
    try {
      const icsRes = await fetch(icalUrl, { cache: "no-store" });
      if (!icsRes.ok) {
        if (icsRes.status === 404) {
          return NextResponse.json({
            success: false,
            error: "Google Calendar mengembalikan error 404 (Tidak Ditemukan). Kalender belum disetel 'Make available to public' di Setelan Google Calendar, atau URL iCal salah."
          });
        }
        return NextResponse.json({
          success: false,
          error: `Gagal membaca iCal dari server (HTTP ${icsRes.status}: ${icsRes.statusText})`
        });
      }
      const text = await icsRes.text();
      if (!text.includes("BEGIN:VCALENDAR")) {
        return NextResponse.json({
          success: false,
          error: "Tautan tidak menghasilkan data kalender iCal yang valid."
        });
      }
      return NextResponse.json({ success: true, icsContent: text }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        }
      });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  if (!gasUrl) {
    return NextResponse.json(
      { success: false, message: "GAS API URL belum dikonfigurasi." },
      { status: 400 }
    );
  }

  try {
    const cacheBuster = `_t=${Date.now()}`;
    const calendarId = searchParams.get("calendarId") || "";
    const targetUrl = `${gasUrl}?action=${encodeURIComponent(action)}${calendarId ? `&calendarId=${encodeURIComponent(calendarId)}` : ""}&${cacheBuster}`;
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil data dari Google Apps Script" },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache",
        }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gasUrl = searchParams.get("gasUrl") || process.env.NEXT_PUBLIC_GAS_API_URL || defaultCloudConfig.gasApiUrl;

  if (!gasUrl) {
    return NextResponse.json(
      { success: false, message: "GAS API URL belum dikonfigurasi." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const res = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengirim data ke Google Apps Script" },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache",
        }
      }
    );
  }
}
