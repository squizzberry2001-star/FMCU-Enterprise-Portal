import { NextRequest, NextResponse } from "next/server";
import defaultCloudConfig from "@/config/cloudConfig.json";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gasUrl = searchParams.get("gasUrl") || process.env.NEXT_PUBLIC_GAS_API_URL || defaultCloudConfig.gasApiUrl;
  const action = searchParams.get("action") || "getAll";

  if (!gasUrl) {
    return NextResponse.json(
      { success: false, message: "GAS API URL belum dikonfigurasi." },
      { status: 400 }
    );
  }

  try {
    const targetUrl = `${gasUrl}?action=${encodeURIComponent(action)}`;
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      // Avoid excessive caching for real-time dashboard updates
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil data dari Google Apps Script" },
      { status: 500 }
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
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengirim data ke Google Apps Script" },
      { status: 500 }
    );
  }
}
