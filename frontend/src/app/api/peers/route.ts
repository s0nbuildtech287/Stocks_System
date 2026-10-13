import { NextRequest, NextResponse } from "next/server";
import { VIETNAM_STOCKS } from "@/lib/stockData";

export const dynamic = "force-dynamic";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 10 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTickers = searchParams.get("tickers") || "HPG,NKG,HSG";
  const tickers = rawTickers.toUpperCase().split(",").map(t => t.trim()).filter(Boolean);
  const cacheKey = tickers.join(",");
  const now = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return NextResponse.json({ source: "cache", data: cached.data });
  }

  try {
    // 1. Fetch live quotes from VPS for all requested tickers
    const vpsMap: Record<string, any> = {};
    try {
      const vpsRes = await fetch(`https://bgapidatafeed.vps.com.vn/getliststockdata/${tickers.join(",")}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(3000),
      });
      if (vpsRes.ok) {
        const arr = await vpsRes.json();
        if (Array.isArray(arr)) {
          arr.forEach((item: any) => {
            if (item && item.sym) vpsMap[item.sym] = item;
          });
        }
      }
    } catch (e) {
      // ignore
    }

    // 2. Build Peer data
    const peerData = tickers.map((sym) => {
      const stock = VIETNAM_STOCKS.find((s) => s.ticker === sym);
      const vps = vpsMap[sym];

      let price = stock?.price ?? 25000;
      let changePct = stock?.changePct ?? 0;

      if (vps) {
        const rawP = vps.lastPrice && vps.lastPrice > 0 ? vps.lastPrice : vps.r;
        if (rawP > 0) {
          price = rawP < 1000 ? Math.round(rawP * 1000) : Math.round(rawP);
          const refP = vps.r < 1000 ? Math.round(vps.r * 1000) : Math.round(vps.r);
          changePct = refP > 0 ? Number((((price - refP) / refP) * 100).toFixed(2)) : 0;
        }
      }

      const roe = stock?.roe ?? 15.0;
      const roa = stock?.roa ?? 6.5;
      const eps = stock?.eps ?? 2200;
      const bvps = stock?.bvps ?? 15000;
      const pe = Number((price / (eps || 1)).toFixed(1));
      const pb = Number((price / (bvps || 1)).toFixed(2));
      const ps = stock?.ps ?? 1.4;
      const netMargin = stock?.netMargin ?? 10.5;
      const grossMargin = Number((netMargin * 1.8).toFixed(1));
      const debtToEquity = stock?.debtToEquity ?? 0.75;
      const profitGrowthYoY = stock?.profitGrowthYoY ?? 14.0;
      const revenueGrowthYoY = stock?.revenueGrowthYoY ?? 12.0;
      const dividendYield = stock?.dividendYield ?? 3.0;
      const beta1y = stock?.beta1y ?? 1.05;
      const rsi14 = stock?.rsi14 ?? 52.0;
      const marketCap = stock ? Math.round((price / stock.price) * stock.marketCap) : 20000;

      const profitability = Math.min(98, Math.max(30, Math.round(roe * 3.5 + 20)));
      const valuation = Math.min(98, Math.max(25, Math.round(105 - pe * 2.8 - pb * 8)));
      const growthScore = Math.min(98, Math.max(25, Math.round(profitGrowthYoY * 1.6 + 45)));
      const solvency = Math.min(98, Math.max(30, Math.round(95 - debtToEquity * 35)));
      const marginScore = Math.min(98, Math.max(30, Math.round(netMargin * 3.2 + 25)));
      const dividendScore = Math.min(98, Math.max(25, Math.round(dividendYield * 14 + 35)));
      const overallScore = Math.round((profitability + valuation + growthScore + solvency + marginScore + dividendScore) / 6);

      const targetPrice = Math.round(price * (valuation > 60 ? 1.15 : 1.05));
      const upsidePct = Number((((targetPrice - price) / price) * 100).toFixed(1));
      const verdict = upsidePct >= 12 ? "Định giá Thấp (Undervalued)" : upsidePct >= 0 ? "Định giá Hợp lý (Fair)" : "Định giá Cao (Overvalued)";

      return {
        ticker: sym,
        name: stock?.name ?? `Công ty CP ${sym}`,
        exchange: stock?.exchange ?? "HOSE",
        industry: stock?.industry ?? "Đa ngành",
        price,
        changePct,
        marketCap,
        pe,
        pb,
        ps,
        roe,
        roa,
        netMargin,
        grossMargin,
        debtToEquity,
        eps,
        bvps,
        profitGrowthYoY,
        revenueGrowthYoY,
        dividendYield,
        beta1y,
        rsi14,
        overallScore,
        radar: {
          profitability,
          valuation,
          growth: growthScore,
          solvency,
          margin: marginScore,
          dividend: dividendScore,
        },
        relativeValuation: {
          targetPrice,
          upsidePct,
          verdict,
        },
      };
    });

    // 3. Compute sector medians
    const median = (arr: number[]) => {
      const s = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      return s.length % 2 !== 0 ? s[mid] : Number(((s[mid - 1] + s[mid]) / 2).toFixed(2));
    };

    const sectorMedians = {
      pe: median(peerData.map(p => p.pe)),
      pb: median(peerData.map(p => p.pb)),
      roe: median(peerData.map(p => p.roe)),
      roa: median(peerData.map(p => p.roa)),
      netMargin: median(peerData.map(p => p.netMargin)),
      grossMargin: median(peerData.map(p => p.grossMargin)),
      debtToEquity: median(peerData.map(p => p.debtToEquity)),
      profitGrowthYoY: median(peerData.map(p => p.profitGrowthYoY)),
      dividendYield: median(peerData.map(p => p.dividendYield)),
    };

    const bestOverall = [...peerData].sort((a, b) => b.overallScore - a.overallScore)[0]?.ticker ?? tickers[0];
    const bestValue = [...peerData].sort((a, b) => b.radar.valuation - a.radar.valuation)[0]?.ticker ?? tickers[0];
    const bestProfitability = [...peerData].sort((a, b) => b.radar.profitability - a.radar.profitability)[0]?.ticker ?? tickers[0];
    const bestGrowth = [...peerData].sort((a, b) => b.radar.growth - a.radar.growth)[0]?.ticker ?? tickers[0];
    const lowestDebt = [...peerData].sort((a, b) => a.debtToEquity - b.debtToEquity)[0]?.ticker ?? tickers[0];

    const result = {
      peers: peerData,
      sectorMedians,
      leaders: {
        bestOverall,
        bestValue,
        bestProfitability,
        bestGrowth,
        lowestDebt,
      },
      radarLabels: [
        { key: "profitability", label: "Sinh lời (ROE/ROA)" },
        { key: "valuation", label: "Định giá Rẻ (P/E, P/B)" },
        { key: "growth", label: "Tăng trưởng LNST" },
        { key: "solvency", label: "An toàn Nợ (1/DE)" },
        { key: "margin", label: "Biên Lợi Nhuận" },
        { key: "dividend", label: "Cổ tức & Dòng tiền" },
      ],
    };

    cache.set(cacheKey, { data: result, timestamp: now });
    return NextResponse.json({ source: "live-vps", data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to compute peer comparison" },
      { status: 500 }
    );
  }
}
