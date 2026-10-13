import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory cache for 3 seconds to ensure rapid updates while preventing spam
let cachedData: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION_MS = 3 * 1000;

const STOCKS = [
  "FPT", "HPG", "TCB", "MBB", "MWG", "VCB", "ACB", "SSI", "CTG", "VPB",
  "STB", "VNM", "MSN", "GAS", "VHM", "VIC", "VRE", "BID", "HDB", "VIB",
  "TPB", "SHB", "SSB", "PNJ", "PLX", "POW", "GVR", "BCM", "VJC", "BVH",
  "DGC", "PVS", "PVD", "BSR", "GMD", "HAH", "VSC", "VCI", "HCM", "VND",
  "MBS", "HSG", "NKG", "KDH", "NLG", "IDC", "KBC", "DGW", "FRT", "REE",
  "LPB", "SAB", "PDR", "DIG", "DXG", "PVT", "DPM", "DCM"
];

export async function GET(request: NextRequest) {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_DURATION_MS) {
    return NextResponse.json({ source: "cache", data: cachedData });
  }

  try {
    const url = "https://bgapidatafeed.vps.com.vn/getliststockdata/" + STOCKS.join(",");
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`VPS API status: ${res.status}`);
    }

    const items = await res.json();
    const results: Record<string, any> = {};

    if (Array.isArray(items)) {
      const todayStr = new Date().toISOString().split("T")[0];

      for (const s of items) {
        if (!s || !s.sym) continue;
        const sym = s.sym;

        const rawPrice = s.lastPrice && s.lastPrice > 0 ? s.lastPrice : s.r;
        const price = rawPrice < 1000 ? Math.round(rawPrice * 1000) : Math.round(rawPrice);
        const ref = s.r < 1000 ? Math.round(s.r * 1000) : Math.round(s.r);
        const change = price - ref;
        const changePct = ref > 0 ? (change / ref) * 100 : 0;
        const vol = s.lot || 0;

        results[sym] = {
          price,
          change: Math.round(change),
          changePct: Number(changePct.toFixed(2)),
          volume24h: `${(vol / 1_000_000).toFixed(2)} M`,
          volume: vol,
          high: s.highPrice ? (s.highPrice < 1000 ? Math.round(s.highPrice * 1000) : Math.round(s.highPrice)) : price,
          low: s.lowPrice ? (s.lowPrice < 1000 ? Math.round(s.lowPrice * 1000) : Math.round(s.lowPrice)) : price,
          open: s.openPrice ? (s.openPrice < 1000 ? Math.round(s.openPrice * 1000) : Math.round(s.openPrice)) : ref,
          ref,
          date: todayStr,
        };
      }
    }

    cachedData = results;
    lastFetchTime = now;

    return NextResponse.json({ source: "live-vps", data: results });
  } catch (error: any) {
    if (cachedData) {
      return NextResponse.json({ source: "stale-cache", data: cachedData });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch live quotes" },
      { status: 500 }
    );
  }
}
