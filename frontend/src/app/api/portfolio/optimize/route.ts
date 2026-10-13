import { NextRequest, NextResponse } from "next/server";
import { VIETNAM_STOCKS } from "@/lib/stockData";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawTickers: string[] = body.tickers || ["FPT", "HPG", "TCB", "VNM", "MWG"];
    const tickers = rawTickers.map(t => t.trim().toUpperCase()).filter(Boolean);
    const capital = Number(body.capital) || 500_000_000;
    const rf = Number(body.rf) || 2.85;

    const numAssets = tickers.length;

    // 1. Asset Metadata & Annualized Returns
    const assetMeta = tickers.map((sym) => {
      const stock = VIETNAM_STOCKS.find((s) => s.ticker === sym);
      const beta = stock?.beta1y ?? 1.05;
      const roe = stock?.roe ?? 16.0;
      const expReturn = Number((rf + beta * 8.5 + (roe - 15) * 0.35).toFixed(2));
      const expVol = Number((16.0 + beta * 9.5).toFixed(2));

      return {
        ticker: sym,
        name: stock?.name ?? `Công ty CP ${sym}`,
        expectedReturn: expReturn,
        volatility: expVol,
        beta,
      };
    });

    const baseReturns = assetMeta.map(a => a.expectedReturn);
    const baseVols = assetMeta.map(a => a.volatility);

    // 2. Correlation Matrix
    const corrMatrix: Record<string, Record<string, number>> = {};
    for (let i = 0; i < numAssets; i++) {
      const s1 = tickers[i];
      corrMatrix[s1] = {};
      const st1 = VIETNAM_STOCKS.find(s => s.ticker === s1);

      for (let j = 0; j < numAssets; j++) {
        const s2 = tickers[j];
        if (i === j) {
          corrMatrix[s1][s2] = 1.0;
        } else {
          const st2 = VIETNAM_STOCKS.find(s => s.ticker === s2);
          const sameInd = st1?.industryGroup === st2?.industryGroup;
          const baseC = sameInd ? 0.55 : 0.32;
          const shift = (((s1.charCodeAt(0) + s2.charCodeAt(0)) % 15) / 100);
          corrMatrix[s1][s2] = Number(Math.max(0.1, Math.min(0.85, baseC + shift)).toFixed(2));
        }
      }
    }

    // Helper to calculate portfolio stats
    const getPortfolioStats = (weights: number[]) => {
      const pReturn = weights.reduce((sum, w, i) => sum + w * baseReturns[i], 0);
      let pVar = 0.0;
      for (let i = 0; i < numAssets; i++) {
        for (let j = 0; j < numAssets; j++) {
          const cov = corrMatrix[tickers[i]][tickers[j]] * (baseVols[i] / 100.0) * (baseVols[j] / 100.0);
          pVar += weights[i] * weights[j] * cov;
        }
      }
      const pVol = Math.sqrt(Math.max(0.0001, pVar)) * 100.0;
      const sharpe = (pReturn - rf) / (pVol > 0 ? pVol : 1.0);
      return { pReturn, pVol, sharpe };
    };

    // 3. Monte Carlo Simulation for Efficient Frontier (600 points)
    const frontierPoints: { volatility: number; expectedReturn: number; sharpeRatio: number }[] = [];
    let bestSharpe = -999.0;
    let bestSharpeWeights = [1 / numAssets];
    let minVol = 999.0;
    let minVolWeights = [1 / numAssets];

    // Seeded random simulation for deterministic fast frontier
    for (let s = 0; s < 600; s++) {
      const rawWeights = Array.from({ length: numAssets }, (_, i) => {
        const seedVal = Math.sin(s * 13.37 + i * 7.11);
        return Math.max(0.01, Math.abs(seedVal));
      });
      const sumRaw = rawWeights.reduce((a, b) => a + b, 0);
      const weights = rawWeights.map(w => Number((w / sumRaw).toFixed(4)));
      const diff = 1.0 - weights.reduce((a, b) => a + b, 0);
      weights[0] = Number((weights[0] + diff).toFixed(4));

      const { pReturn, pVol, sharpe } = getPortfolioStats(weights);
      frontierPoints.push({
        volatility: Number(pVol.toFixed(2)),
        expectedReturn: Number(pReturn.toFixed(2)),
        sharpeRatio: Number(sharpe.toFixed(2)),
      });

      if (sharpe > bestSharpe) {
        bestSharpe = sharpe;
        bestSharpeWeights = weights;
      }
      if (pVol < minVol) {
        minVol = pVol;
        minVolWeights = weights;
      }
    }

    // Portfolios
    const equalWeights = Array.from({ length: numAssets }, () => Number((1 / numAssets).toFixed(4)));
    equalWeights[0] += Number((1.0 - equalWeights.reduce((a, b) => a + b, 0)).toFixed(4));

    const maxStats = getPortfolioStats(bestSharpeWeights);
    const minStats = getPortfolioStats(minVolWeights);
    const eqStats = getPortfolioStats(equalWeights);

    const makeWeightsArr = (weights: number[]) => {
      return tickers.map((sym, i) => ({
        ticker: sym,
        weight: Number((weights[i] * 100).toFixed(1)),
        capitalVND: Math.round(capital * weights[i]),
      }));
    };

    // Stress tests
    const maxBeta = bestSharpeWeights.reduce((sum, w, i) => sum + w * assetMeta[i].beta, 0);

    const stressTests = [
      {
        id: "covid2020",
        name: "☣️ Covid-19 Hoảng loạn (Tháng 3/2020)",
        marketDrop: -33.5,
        portfolioImpact: Number((-33.5 * maxBeta * 0.78).toFixed(1)),
        estimatedLossVND: Math.round(capital * Math.abs(-33.5 * maxBeta * 0.78) / 100),
        desc: "Thị trường mất thanh khoản, bán tháo toàn diện do dịch bệnh toàn cầu.",
        recoveryMonths: 5,
      },
      {
        id: "bond2022",
        name: "📉 Khủng hoảng Trái phiếu & Lãi suất (2022)",
        marketDrop: -38.2,
        portfolioImpact: Number((-38.2 * maxBeta * 0.82).toFixed(1)),
        estimatedLossVND: Math.round(capital * Math.abs(-38.2 * maxBeta * 0.82) / 100),
        desc: "Thắt chặt tín dụng bất động sản và thanh tra trái phiếu doanh nghiệp.",
        recoveryMonths: 9,
      },
      {
        id: "margin2018",
        name: "⚡ Siết Margin & Chiến tranh Thương mại (2018)",
        marketDrop: -26.8,
        portfolioImpact: Number((-26.8 * maxBeta * 0.75).toFixed(1)),
        estimatedLossVND: Math.round(capital * Math.abs(-26.8 * maxBeta * 0.75) / 100),
        desc: "VN-Index chạm đỉnh 1,200 điểm lần đầu và áp lực giải chấp chéo margin.",
        recoveryMonths: 6,
      },
    ];

    // VaR
    const dailyVol = maxStats.pVol / Math.sqrt(252);
    const var95_1d_pct = Number((dailyVol * 1.645).toFixed(2));
    const var95_1d_vnd = Math.round(capital * (var95_1d_pct / 100));
    const var99_1w_pct = Number((dailyVol * Math.sqrt(5) * 2.326).toFixed(2));
    const var99_1w_vnd = Math.round(capital * (var99_1w_pct / 100));
    const cvar95_pct = Number((var95_1d_pct * 1.25).toFixed(2));
    const cvar95_vnd = Math.round(capital * (cvar95_pct / 100));

    const result = {
      tickers,
      capital,
      rf,
      assets: assetMeta,
      correlationMatrix: corrMatrix,
      efficientFrontier: frontierPoints,
      portfolios: {
        maxSharpe: {
          name: "⭐ Danh mục Tối ưu (Max Sharpe)",
          expectedReturn: Number(maxStats.pReturn.toFixed(2)),
          volatility: Number(maxStats.pVol.toFixed(2)),
          sharpeRatio: Number(maxStats.sharpe.toFixed(2)),
          weights: makeWeightsArr(bestSharpeWeights),
        },
        minVolatility: {
          name: "🛡️ Danh mục Phòng thủ (Min Risk)",
          expectedReturn: Number(minStats.pReturn.toFixed(2)),
          volatility: Number(minStats.pVol.toFixed(2)),
          sharpeRatio: Number(minStats.sharpe.toFixed(2)),
          weights: makeWeightsArr(minVolWeights),
        },
        equalWeight: {
          name: "⚖️ Danh mục Chia đều (Equal Weight)",
          expectedReturn: Number(eqStats.pReturn.toFixed(2)),
          volatility: Number(eqStats.pVol.toFixed(2)),
          sharpeRatio: Number(eqStats.sharpe.toFixed(2)),
          weights: makeWeightsArr(equalWeights),
        },
      },
      stressTests,
      riskMetrics: {
        var95_1d_pct,
        var95_1d_vnd,
        var99_1w_pct,
        var99_1w_vnd,
        cvar95_pct,
        cvar95_vnd,
        annualVolatility: Number(maxStats.pVol.toFixed(2)),
        dailyVolatility: Number(dailyVol.toFixed(2)),
        portfolioBeta: Number(maxBeta.toFixed(2)),
      },
    };

    return NextResponse.json({ source: "live-native", data: result });
  } catch (error: any) {
    console.error("Optimizer calculation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate portfolio optimization" },
      { status: 500 }
    );
  }
}
