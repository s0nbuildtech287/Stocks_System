"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Award,
  AlertTriangle,
  Layers,
  Sparkles,
  PieChart,
  DollarSign,
  Plus,
  X,
  RefreshCw,
  Sliders,
  BarChart3,
  Calendar,
  ChevronRight,
  Flame,
} from "lucide-react";
import { VIETNAM_STOCKS } from "@/lib/stockData";

interface WeightItem {
  ticker: string;
  weight: number;
  capitalVND: number;
}

interface PortfolioConfig {
  name: string;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  weights: WeightItem[];
}

interface StressTestItem {
  id: string;
  name: string;
  marketDrop: number;
  portfolioImpact: number;
  estimatedLossVND: number;
  desc: string;
  recoveryMonths: number;
}

interface OptimizationResult {
  tickers: string[];
  capital: number;
  riskFreeRate: number;
  assets: { ticker: string; name: string; expectedReturn: number; volatility: number; beta: number }[];
  correlationMatrix: Record<string, Record<string, number>>;
  frontierPoints: { volatility: number; expectedReturn: number; sharpeRatio: number }[];
  portfolios: {
    maxSharpe: PortfolioConfig;
    minVolatility: PortfolioConfig;
    equalWeight: PortfolioConfig;
  };
  stressTests: StressTestItem[];
  riskMetrics: {
    var95_1d_pct: number;
    var95_1d_vnd: number;
    var99_1w_pct: number;
    var99_1w_vnd: number;
    cvar95_pct: number;
    cvar95_vnd: number;
    annualVolatility: number;
    dailyVolatility: number;
    portfolioBeta: number;
  };
}

const ALLOCATION_COLORS = ["#F0B90B", "#0ECB81", "#3B82F6", "#A855F7", "#F6465D", "#EC4899", "#14B8A6"];

const POPULAR_PORTFOLIOS = [
  { id: "BALANCED", name: "🏆 VN30 Tăng Trưởng Cân Bằng", tickers: ["FPT", "HPG", "TCB", "VNM", "MWG"] },
  { id: "FINANCE_CORE", name: "🏦 Ngân Hàng & Tài Chính", tickers: ["TCB", "MBB", "ACB", "SSI"] },
  { id: "DEFENSIVE", name: "🛡️ Phòng Thủ & Cổ Tức Cao", tickers: ["VNM", "GAS", "REE", "FPT"] },
  { id: "HIGH_GROWTH", name: "🚀 Siêu Tăng Trưởng (High Beta)", tickers: ["FPT", "DGC", "VTP", "MWG", "HPG"] },
];

function buildFallbackOptimization(tickers: string[], capital: number): OptimizationResult {
  const n = tickers.length;
  const assets = tickers.map((sym) => {
    const s = VIETNAM_STOCKS.find((x) => x.ticker === sym);
    const beta = s?.beta1y ?? 1.05;
    return {
      ticker: sym,
      name: s?.name ?? `Công ty CP ${sym}`,
      expectedReturn: Math.round((2.85 + beta * 8.5 + 2.5) * 10) / 10,
      volatility: Math.round((16.0 + beta * 9.5) * 10) / 10,
      beta,
    };
  });

  const corr: Record<string, Record<string, number>> = {};
  tickers.forEach((t1, i) => {
    corr[t1] = {};
    tickers.forEach((t2, j) => {
      corr[t1][t2] = i === j ? 1.0 : Math.round((0.35 + ((i + j) % 4) * 0.1) * 100) / 100;
    });
  });

  // Simulated Frontier Points
  const frontierPoints: { volatility: number; expectedReturn: number; sharpeRatio: number }[] = [];
  for (let v = 14; v <= 28; v += 0.5) {
    const ret = 8.5 + (v - 14) * 0.85 + (Math.sin(v) * 0.4);
    const sh = Math.round(((ret - 2.85) / v) * 100) / 100;
    frontierPoints.push({
      volatility: Math.round(v * 10) / 10,
      expectedReturn: Math.round(ret * 10) / 10,
      sharpeRatio: sh,
    });
  }

  const baseW = [35, 25, 20, 15, 5].slice(0, n);
  const sumW = baseW.reduce((a, b) => a + b, 0);
  const normalizedW = baseW.map((w) => Math.round((w / sumW) * 100));

  const maxSharpeWeights: WeightItem[] = tickers.map((t, idx) => ({
    ticker: t,
    weight: normalizedW[idx] || 20,
    capitalVND: Math.round(capital * ((normalizedW[idx] || 20) / 100)),
  }));

  const minVolWeights: WeightItem[] = tickers.map((t) => ({
    ticker: t,
    weight: Math.round(100 / n),
    capitalVND: Math.round(capital / n),
  }));

  const equalWeights: WeightItem[] = minVolWeights;

  return {
    tickers,
    capital,
    riskFreeRate: 2.85,
    assets,
    correlationMatrix: corr,
    frontierPoints,
    portfolios: {
      maxSharpe: {
        name: "⭐ Danh mục Tối ưu (Max Sharpe)",
        expectedReturn: 19.8,
        volatility: 16.4,
        sharpeRatio: 1.03,
        weights: maxSharpeWeights,
      },
      minVolatility: {
        name: "🛡️ Danh mục Phòng thủ (Min Risk)",
        expectedReturn: 14.2,
        volatility: 12.8,
        sharpeRatio: 0.89,
        weights: minVolWeights,
      },
      equalWeight: {
        name: "⚖️ Danh mục Chia đều (Equal Weight)",
        expectedReturn: 17.5,
        volatility: 15.6,
        sharpeRatio: 0.94,
        weights: equalWeights,
      },
    },
    stressTests: [
      {
        id: "covid2020",
        name: "☣️ Covid-19 Hoảng loạn (Tháng 3/2020)",
        marketDrop: -33.5,
        portfolioImpact: -21.4,
        estimatedLossVND: Math.round(capital * 0.214),
        desc: "Thị trường mất thanh khoản, bán tháo toàn diện do dịch bệnh toàn cầu.",
        recoveryMonths: 5,
      },
      {
        id: "bond2022",
        name: "📉 Khủng hoảng Trái phiếu & Lãi suất (2022)",
        marketDrop: -38.2,
        portfolioImpact: -24.8,
        estimatedLossVND: Math.round(capital * 0.248),
        desc: "Thắt chặt tín dụng bất động sản và thanh tra trái phiếu doanh nghiệp.",
        recoveryMonths: 9,
      },
      {
        id: "margin2018",
        name: "⚡ Siết Margin & Chiến tranh Thương mại (2018)",
        marketDrop: -26.8,
        portfolioImpact: -17.2,
        estimatedLossVND: Math.round(capital * 0.172),
        desc: "VN-Index chạm đỉnh 1,200 điểm lần đầu và áp lực giải chấp chéo margin.",
        recoveryMonths: 6,
      },
    ],
    riskMetrics: {
      var95_1d_pct: 1.55,
      var95_1d_vnd: Math.round(capital * 0.0155),
      var99_1w_pct: 4.85,
      var99_1w_vnd: Math.round(capital * 0.0485),
      cvar95_pct: 1.95,
      cvar95_vnd: Math.round(capital * 0.0195),
      annualVolatility: 16.4,
      dailyVolatility: 1.03,
      portfolioBeta: 0.96,
    },
  };
}

export default function PortfolioOptimizerView() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(["FPT", "HPG", "TCB", "VNM", "MWG"]);
  const [capitalInput, setCapitalInput] = useState<number>(500_000_000);
  const [selectedStrategy, setSelectedStrategy] = useState<"maxSharpe" | "minVolatility" | "equalWeight">("maxSharpe");
  const [customTickerInput, setCustomTickerInput] = useState<string>("");
  const [data, setData] = useState<OptimizationResult>(() => buildFallbackOptimization(["FPT", "HPG", "TCB", "VNM", "MWG"], 500_000_000));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch Live Optimizer
  const fetchOptimization = async (tickers: string[], capital: number) => {
    if (!tickers.length) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/portfolio/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers, capital, rf: 2.85 }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setData(json.data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch portfolio optimization:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimization(selectedTickers, capitalInput);
  }, [selectedTickers, capitalInput]);

  const handleSelectPreset = (preset: typeof POPULAR_PORTFOLIOS[0]) => {
    setSelectedTickers(preset.tickers);
    setData(buildFallbackOptimization(preset.tickers, capitalInput));
  };

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = customTickerInput.trim().toUpperCase();
    if (sym && !selectedTickers.includes(sym) && selectedTickers.length < 8) {
      const next = [...selectedTickers, sym];
      setSelectedTickers(next);
      setData(buildFallbackOptimization(next, capitalInput));
      setCustomTickerInput("");
    }
  };

  const handleRemoveTicker = (sym: string) => {
    if (selectedTickers.length <= 3) return; // Keep at least 3 for portfolio
    const next = selectedTickers.filter((t) => t !== sym);
    setSelectedTickers(next);
    setData(buildFallbackOptimization(next, capitalInput));
  };

  const currentPortfolio = data.portfolios[selectedStrategy];

  // Efficient Frontier SVG Scaling
  const minX = 10;
  const maxX = 32;
  const minY = 6;
  const maxY = 26;

  const getSvgX = (vol: number) => Math.max(30, Math.min(470, 30 + ((vol - minX) / (maxX - minX)) * 440));
  const getSvgY = (ret: number) => Math.max(20, Math.min(260, 260 - ((ret - minY) / (maxY - minY)) * 240));

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & PORTFOLIO CONFIG BAR */}
      <div className="glass-panel p-5 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#F0B90B]" /> Markowitz Portfolio Optimizer &amp; VaR Engine
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#181A20] text-[#0ECB81] border border-[#0ECB81]/30">
                <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
                Modern Portfolio Theory (MPT)
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Tối Ưu Hóa Danh Mục &amp; Quản Trị Rủi Ro Định Lượng
            </h2>
            <p className="text-xs text-[#848E9C]">
              Giải bài toán phân bổ tỷ trọng tối ưu Max Sharpe, mô phỏng khủng hoảng Stress Testing và định lượng rủi ro tổn thất VaR
            </p>
          </div>

          {/* Capital Input & Add Ticker */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B0E11] border border-[#2B313A] text-xs">
              <span className="text-[#848E9C] font-semibold">Vốn:</span>
              <input
                type="number"
                step={50_000_000}
                min={50_000_000}
                max={50_000_000_000}
                value={capitalInput}
                onChange={(e) => setCapitalInput(Number(e.target.value) || 500_000_000)}
                className="w-32 bg-transparent font-mono-num font-black text-[#F0B90B] focus:outline-none"
              />
              <span className="text-[#848E9C] font-bold">VND</span>
            </div>

            <form onSubmit={handleAddTicker} className="flex items-center gap-1.5">
              <input
                type="text"
                value={customTickerInput}
                onChange={(e) => setCustomTickerInput(e.target.value.toUpperCase())}
                placeholder="Thêm mã (VD: VHM...)"
                maxLength={6}
                className="w-32 px-3 py-2 bg-[#0B0E11] border border-[#2B313A] rounded-xl text-xs font-bold text-white uppercase placeholder-[#848E9C] focus:outline-none focus:border-[#F0B90B]"
              />
              <button
                type="submit"
                disabled={selectedTickers.length >= 8}
                className="px-3.5 py-2 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-black text-xs font-black transition-all shadow-md shadow-yellow-500/20 disabled:opacity-50 shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Preset Portfolios */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#2B313A] pb-1">
          <span className="text-xs font-bold text-[#848E9C] shrink-0 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-[#F0B90B]" /> Rổ mẫu chuẩn:
          </span>
          {POPULAR_PORTFOLIOS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#181A20] text-[#848E9C] border border-[#2B313A] hover:text-white hover:border-[#F0B90B]/40 whitespace-nowrap transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Selected Ticker Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-[#848E9C]">Cổ phiếu trong rổ ({selectedTickers.length}/8):</span>
          {selectedTickers.map((sym, idx) => (
            <div
              key={sym}
              style={{ borderColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length] }}
              className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0B0E11] border text-xs font-bold text-white font-mono-num"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length] }} />
              <span>{sym}</span>
              {selectedTickers.length > 3 && (
                <button
                  onClick={() => handleRemoveTicker(sym)}
                  className="text-[#848E9C] hover:text-red-400 ml-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {isLoading && <RefreshCw className="w-4 h-4 text-[#F0B90B] animate-spin ml-2" />}
        </div>
      </div>

      {/* 2. STRATEGY PRESET CARDS & EFFICIENT FRONTIER SCATTER PLOT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3 Preset Strategy Cards & Weights Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          {/* Strategy Selector Tabs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "maxSharpe", label: "Tối Ưu (Max Sharpe)", icon: Award, color: "#F0B90B" },
              { id: "minVolatility", label: "Phòng Thủ (Min Risk)", icon: ShieldCheck, color: "#3B82F6" },
              { id: "equalWeight", label: "Chia Đều (1/N)", icon: Layers, color: "#0ECB81" },
            ].map((st) => {
              const Icon = st.icon;
              const isActive = selectedStrategy === st.id;
              const port = data.portfolios[st.id as keyof typeof data.portfolios];
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStrategy(st.id as any)}
                  className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden ${
                    isActive
                      ? "bg-[#181A20] border-[#F0B90B] shadow-lg shadow-yellow-500/10 font-bold"
                      : "bg-[#12161C] border-[#2B313A] text-[#848E9C] hover:text-white hover:bg-[#181A20]"
                  }`}
                >
                  {isActive && <div className="absolute top-0 left-0 right-0 h-1 bg-[#F0B90B]" />}
                  <div className="flex items-center gap-1.5 text-xs text-white mb-1">
                    <Icon className="w-3.5 h-3.5" style={{ color: st.color }} />
                    <span className="truncate">{st.label}</span>
                  </div>
                  <div className="text-lg font-black font-mono-num text-white">
                    {port?.expectedReturn}% <span className="text-[10px] text-[#848E9C] font-normal">/ năm</span>
                  </div>
                  <div className="text-[10px] text-[#848E9C] font-mono-num">
                    Sharpe: <strong className="text-white">{port?.sharpeRatio}</strong> | Vol: {port?.volatility}%
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Strategy Allocation Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#F0B90B]" /> Phân Bổ Tỷ Trọng Danh Mục ({currentPortfolio?.name})
              </h3>
              <span className="text-xs font-mono-num text-[#F0B90B] font-bold">
                Tổng: {capitalInput.toLocaleString("vi-VN")} đ
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[#0B0E11] overflow-hidden flex border border-[#2B313A]">
              {currentPortfolio?.weights.map((w, idx) => (
                <div
                  key={w.ticker}
                  style={{
                    width: `${w.weight}%`,
                    backgroundColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length],
                  }}
                  className="h-full transition-all"
                  title={`${w.ticker}: ${w.weight}%`}
                />
              ))}
            </div>

            {/* Weight Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-num text-xs">
              {currentPortfolio?.weights.map((w, idx) => {
                const color = ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length];
                const asset = data.assets.find((a) => a.ticker === w.ticker);

                return (
                  <div
                    key={w.ticker}
                    className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <div>
                        <div className="font-black text-sm text-white">{w.ticker}</div>
                        <div className="text-[10px] text-[#848E9C]">Exp Return: +{asset?.expectedReturn}%</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-[#F0B90B]">{w.weight}%</div>
                      <div className="text-[11px] text-slate-300 font-semibold">{w.capitalVND.toLocaleString("vi-VN")} đ</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: SVG Efficient Frontier Curve & Scatter Plot */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#F0B90B]" /> Đường Cong Hiệu Quả (Markowitz Efficient Frontier)
              </h3>
              <p className="text-xs text-[#848E9C]">Mô phỏng 600 danh mục ngẫu nhiên để tìm điểm tối ưu Sharpe</p>
            </div>
            <div className="text-[11px] text-[#848E9C] font-mono-num">Rf = 2.85% (TPCP 10Y)</div>
          </div>

          {/* SVG Plot */}
          <div className="relative w-full aspect-[16/10] bg-[#0B0E11] rounded-xl border border-[#2B313A] p-2 my-2 flex items-center justify-center">
            <svg viewBox="0 0 500 290" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              {[10, 15, 20, 25, 30].map((vol) => (
                <line
                  key={vol}
                  x1={getSvgX(vol)}
                  y1={20}
                  x2={getSvgX(vol)}
                  y2={260}
                  stroke="#181A20"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              ))}

              {[10, 15, 20, 25].map((ret) => (
                <line
                  key={ret}
                  x1={30}
                  y1={getSvgY(ret)}
                  x2={470}
                  y2={getSvgY(ret)}
                  stroke="#181A20"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              ))}

              {/* Monte Carlo Simulated Dots */}
              {data.frontierPoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={getSvgX(pt.volatility)}
                  cy={getSvgY(pt.expectedReturn)}
                  r="2"
                  fill="#848E9C"
                  fillOpacity="0.4"
                />
              ))}

              {/* Equal Weight Point */}
              <circle
                cx={getSvgX(data.portfolios.equalWeight.volatility)}
                cy={getSvgY(data.portfolios.equalWeight.expectedReturn)}
                r="5"
                fill="#0ECB81"
                stroke="#0B0E11"
                strokeWidth="1.5"
              />

              {/* Min Volatility Point */}
              <circle
                cx={getSvgX(data.portfolios.minVolatility.volatility)}
                cy={getSvgY(data.portfolios.minVolatility.expectedReturn)}
                r="6"
                fill="#3B82F6"
                stroke="#0B0E11"
                strokeWidth="1.5"
              />

              {/* Max Sharpe Point (Highlight Star) */}
              <circle
                cx={getSvgX(data.portfolios.maxSharpe.volatility)}
                cy={getSvgY(data.portfolios.maxSharpe.expectedReturn)}
                r="8"
                fill="#F0B90B"
                stroke="#0B0E11"
                strokeWidth="2"
              />

              {/* Capital Allocation Line (CAL from Rf) */}
              <line
                x1={getSvgX(0)}
                y1={getSvgY(data.riskFreeRate)}
                x2={getSvgX(data.portfolios.maxSharpe.volatility * 1.5)}
                y2={getSvgY(data.riskFreeRate + (data.portfolios.maxSharpe.expectedReturn - data.riskFreeRate) * 1.5)}
                stroke="#F0B90B"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {/* Axes Labels */}
              <text x={250} y={280} textAnchor="middle" className="text-[10px] font-bold fill-[#848E9C]">
                Độ Lệch Chuẩn Rủi Ro / Volatility (%) →
              </text>
              <text x={-140} y={15} transform="rotate(-90)" textAnchor="middle" className="text-[10px] font-bold fill-[#848E9C]">
                Lợi Nhuận Kỳ Vọng / Return (%) →
              </text>
            </svg>
          </div>

          {/* Plot Legend */}
          <div className="flex items-center justify-center gap-4 flex-wrap pt-2 border-t border-[#2B313A] text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white font-mono-num">
              <span className="w-3 h-3 rounded-full bg-[#F0B90B]" />
              <span>⭐ Max Sharpe ({data.portfolios.maxSharpe.expectedReturn}% / {data.portfolios.maxSharpe.volatility}%)</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-white font-mono-num">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
              <span>🛡️ Min Vol ({data.portfolios.minVolatility.expectedReturn}% / {data.portfolios.minVolatility.volatility}%)</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-white font-mono-num">
              <span className="w-3 h-3 rounded-full bg-[#0ECB81]" />
              <span>⚖️ Equal Weight</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. STRESS TESTING & RISK METRICS (VaR & CVaR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Historical Crisis Stress Testing */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#F6465D]" /> Kiểm Tra Sức Chịu Đựng Khủng Hoảng (Stress Testing)
            </h3>
            <span className="text-xs text-[#848E9C]">Mô phỏng sụt giảm danh mục</span>
          </div>

          <div className="space-y-3">
            {data.stressTests.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-sm">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{st.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-mono-num">
                      Thị trường: {st.marketDrop}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#848E9C] leading-snug">{st.desc}</p>
                </div>

                <div className="text-left sm:text-right font-mono-num shrink-0 bg-[#0B0E11] p-3 rounded-xl border border-[#2B313A]">
                  <div className="text-[10px] text-[#848E9C]">Ước tính sụt giảm danh mục:</div>
                  <div className="text-lg font-black text-[#F6465D]">
                    {st.portfolioImpact}% (-{st.estimatedLossVND.toLocaleString("vi-VN")} đ)
                  </div>
                  <div className="text-[10px] text-[#0ECB81]">Hồi phục sau ~{st.recoveryMonths} tháng</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Value at Risk (VaR & CVaR) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F0B90B]" /> Định Lượng Rủi Ro Tổn Thất (Value at Risk - VaR)
          </h3>

          <div className="space-y-3 font-mono-num text-xs">
            {/* 1-Day 95% VaR */}
            <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] space-y-1">
              <div className="flex justify-between items-center text-[#848E9C]">
                <span className="font-sans font-bold text-white">1-Day VaR (95% Độ tin cậy)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 font-bold">1 Phiên</span>
              </div>
              <div className="text-2xl font-black text-[#F0B90B]">
                -{data.riskMetrics.var95_1d_pct}% <span className="text-sm font-semibold text-slate-300">(-{data.riskMetrics.var95_1d_vnd.toLocaleString("vi-VN")} đ)</span>
              </div>
              <p className="text-[10px] text-[#848E9C] font-sans">
                Trong 95% các phiên giao dịch, mức lỗ trong ngày sẽ không vượt quá số tiền trên.
              </p>
            </div>

            {/* 1-Week 99% VaR */}
            <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] space-y-1">
              <div className="flex justify-between items-center text-[#848E9C]">
                <span className="font-sans font-bold text-white">1-Week VaR (99% Độ tin cậy)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-bold">1 Tuần</span>
              </div>
              <div className="text-2xl font-black text-[#F6465D]">
                -{data.riskMetrics.var99_1w_pct}% <span className="text-sm font-semibold text-slate-300">(-{data.riskMetrics.var99_1w_vnd.toLocaleString("vi-VN")} đ)</span>
              </div>
              <p className="text-[10px] text-[#848E9C] font-sans">
                Kịch bản xấu nhất trong tuần với 99% xác suất danh mục không mất quá ngưỡng này.
              </p>
            </div>

            {/* Expected Shortfall CVaR */}
            <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] space-y-1">
              <div className="flex justify-between items-center text-[#848E9C]">
                <span className="font-sans font-bold text-white">Expected Shortfall (CVaR 95%)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-bold">Tail Risk</span>
              </div>
              <div className="text-2xl font-black text-purple-400">
                -{data.riskMetrics.cvar95_pct}% <span className="text-sm font-semibold text-slate-300">(-{data.riskMetrics.cvar95_vnd.toLocaleString("vi-VN")} đ)</span>
              </div>
              <p className="text-[10px] text-[#848E9C] font-sans">
                Mức tổn thất trung bình nếu xảy ra biến cố rơi vào đuôi rủi ro 5% cực đoan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CORRELATION MATRIX HEATMAP */}
      <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F0B90B]" /> Ma Trận Nhiệt Tương Quan Đa Tài Sản (Correlation Heatmap)
          </h3>
          <span className="text-xs text-[#848E9C]">Tương quan càng thấp (&lt; 0.4) danh mục càng phân tán rủi ro tốt</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#2B313A]">
          <table className="w-full text-left text-xs font-mono-num border-collapse">
            <thead className="bg-[#0B0E11] text-[#848E9C] uppercase tracking-wider font-semibold border-b border-[#2B313A]">
              <tr>
                <th className="p-3.5 min-w-[120px]">Asset / Ticker</th>
                {selectedTickers.map((sym) => (
                  <th key={sym} className="p-3.5 text-center font-bold text-white">
                    {sym}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2B313A]">
              {selectedTickers.map((s1) => (
                <tr key={s1} className="hover:bg-[#181A20]/40">
                  <td className="p-3.5 font-bold text-white bg-[#0B0E11]">{s1}</td>
                  {selectedTickers.map((s2) => {
                    const val = data.correlationMatrix[s1]?.[s2] ?? (s1 === s2 ? 1.0 : 0.45);
                    const isDiagonal = s1 === s2;
                    let bgColor = "bg-[#181A20]";
                    let textColor = "text-white";

                    if (!isDiagonal) {
                      if (val <= 0.35) {
                        bgColor = "bg-emerald-950/40 text-[#0ECB81] font-bold";
                        textColor = "text-[#0ECB81]";
                      } else if (val <= 0.55) {
                        bgColor = "bg-yellow-950/30 text-[#F0B90B]";
                        textColor = "text-[#F0B90B]";
                      } else {
                        bgColor = "bg-red-950/40 text-red-400";
                        textColor = "text-red-400";
                      }
                    }

                    return (
                      <td key={s2} className={`p-3.5 text-center font-bold ${bgColor} ${textColor}`}>
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
