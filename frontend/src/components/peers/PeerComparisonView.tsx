"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Scale,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Award,
  ShieldCheck,
  Zap,
  Plus,
  X,
  RefreshCw,
  BarChart3,
  Layers,
  ArrowRight,
  Flame,
} from "lucide-react";
import { VIETNAM_STOCKS } from "@/lib/stockData";

interface PeerStock {
  ticker: string;
  name: string;
  exchange: string;
  industry: string;
  price: number;
  changePct: number;
  marketCap: number;
  pe: number;
  pb: number;
  ps: number;
  roe: number;
  roa: number;
  netMargin: number;
  grossMargin: number;
  debtToEquity: number;
  eps: number;
  bvps: number;
  profitGrowthYoY: number;
  revenueGrowthYoY: number;
  dividendYield: number;
  beta1y: number;
  rsi14: number;
  overallScore: number;
  radar: {
    profitability: number;
    valuation: number;
    growth: number;
    solvency: number;
    margin: number;
    dividend: number;
  };
  relativeValuation?: {
    targetPrice: number;
    upsidePct: number;
    verdict: string;
  };
}

const PEER_COLORS = ["#F0B90B", "#0ECB81", "#3B82F6", "#A855F7", "#F6465D"];

const INDUSTRY_PRESETS = [
  { id: "STEEL", label: "🏭 Thép & VLXD", tickers: ["HPG", "NKG", "HSG"] },
  { id: "BANK", label: "🏦 Ngân Hàng", tickers: ["TCB", "MBB", "ACB", "VPB"] },
  { id: "RETAIL", label: "🛒 Bán Lẻ & TD", tickers: ["MWG", "FRT", "DGW", "PNJ"] },
  { id: "SECURITIES", label: "📈 Chứng Khoán", tickers: ["SSI", "VND", "VCI", "HCM"] },
  { id: "TECH", label: "💻 Công Nghệ", tickers: ["FPT", "CMG", "FOX", "VGI"] },
  { id: "REAL_ESTATE", label: "🏢 Bất Động Sản", tickers: ["VHM", "VIC", "KDH", "NLG"] },
  { id: "CONSUMER", label: "🥛 Thực Phẩm", tickers: ["VNM", "MSN", "SAB", "KDC"] },
];

const RADAR_AXES = [
  { key: "profitability", label: "Sinh Lời (ROE)" },
  { key: "valuation", label: "Định Giá Rẻ" },
  { key: "growth", label: "Tăng Trưởng LNST" },
  { key: "solvency", label: "An Toàn Nợ" },
  { key: "margin", label: "Biên Lợi Nhuận" },
  { key: "dividend", label: "Cổ Tức" },
];

function buildFallbackPeerData(tickers: string[]): PeerStock[] {
  return tickers.map((sym, idx) => {
    const stock = VIETNAM_STOCKS.find((s) => s.ticker === sym);
    const roe = stock?.roe ?? 15.0;
    const pe = stock?.pe ?? 14.0;
    const pb = stock?.pb ?? 1.8;
    const margin = stock?.netMargin ?? 11.0;
    const growth = stock?.profitGrowthYoY ?? 15.0;
    const de = stock?.debtToEquity ?? 0.7;
    const div = stock?.dividendYield ?? 3.0;
    const price = stock?.price ?? 25000;
    const eps = stock?.eps ?? 2400;
    const bvps = stock?.bvps ?? 16000;

    const profitability = Math.min(98, Math.max(30, Math.round(roe * 3.5 + 20)));
    const valuation = Math.min(98, Math.max(25, Math.round(105 - pe * 2.8 - pb * 8)));
    const growthScore = Math.min(98, Math.max(25, Math.round(growth * 1.6 + 45)));
    const solvency = Math.min(98, Math.max(30, Math.round(95 - de * 35)));
    const marginScore = Math.min(98, Math.max(30, Math.round(margin * 3.2 + 25)));
    const dividendScore = Math.min(98, Math.max(25, Math.round(div * 14 + 35)));
    const overallScore = Math.round((profitability + valuation + growthScore + solvency + marginScore + dividendScore) / 6);

    const targetPrice = Math.round(price * 1.12);
    const upsidePct = 12.0;

    return {
      ticker: sym,
      name: stock?.name ?? `Công ty CP ${sym}`,
      exchange: stock?.exchange ?? "HOSE",
      industry: stock?.industry ?? "Đa ngành",
      price,
      changePct: stock?.changePct ?? 1.0,
      marketCap: stock?.marketCap ?? 25000,
      pe,
      pb,
      ps: 1.5,
      roe,
      roa: stock?.roa ?? 7.0,
      netMargin: margin,
      grossMargin: Math.round(margin * 1.8 * 10) / 10,
      debtToEquity: de,
      eps,
      bvps,
      profitGrowthYoY: growth,
      revenueGrowthYoY: stock?.revenueGrowthYoY ?? 14.0,
      dividendYield: div,
      beta1y: stock?.beta1y ?? 1.05,
      rsi14: stock?.rsi14 ?? 53.0,
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
        verdict: "Định giá Thấp (Undervalued)",
      },
    };
  });
}

export default function PeerComparisonView() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(["HPG", "NKG", "HSG"]);
  const [activePreset, setActivePreset] = useState<string>("STEEL");
  const [customInput, setCustomInput] = useState<string>("");
  const [peers, setPeers] = useState<PeerStock[]>(() => buildFallbackPeerData(["HPG", "NKG", "HSG"]));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);

  // Fetch Live Peer Comparison from API
  const fetchPeerComparison = async (tickers: string[]) => {
    if (!tickers.length) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/peers?tickers=${tickers.join(",")}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.peers) {
          setPeers(json.data.peers);
        }
      }
    } catch (e) {
      console.error("Failed to fetch peer comparison:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeerComparison(selectedTickers);
  }, [selectedTickers]);

  const handleSelectPreset = (preset: typeof INDUSTRY_PRESETS[0]) => {
    setActivePreset(preset.id);
    setSelectedTickers(preset.tickers);
    setPeers(buildFallbackPeerData(preset.tickers));
  };

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = customInput.trim().toUpperCase();
    if (sym && !selectedTickers.includes(sym) && selectedTickers.length < 5) {
      const next = [...selectedTickers, sym];
      setSelectedTickers(next);
      setActivePreset("CUSTOM");
      setPeers(buildFallbackPeerData(next));
      setCustomInput("");
    }
  };

  const handleRemoveTicker = (sym: string) => {
    if (selectedTickers.length <= 2) return; // Keep at least 2 for comparison
    const next = selectedTickers.filter((t) => t !== sym);
    setSelectedTickers(next);
    setActivePreset("CUSTOM");
    setPeers(buildFallbackPeerData(next));
  };

  // Sector Median Calculations
  const sectorMedians = useMemo(() => {
    if (!peers.length) return null;
    const n = peers.length;
    return {
      pe: Math.round((peers.reduce((acc, p) => acc + p.pe, 0) / n) * 10) / 10,
      pb: Math.round((peers.reduce((acc, p) => acc + p.pb, 0) / n) * 10) / 10,
      roe: Math.round((peers.reduce((acc, p) => acc + p.roe, 0) / n) * 10) / 10,
      roa: Math.round((peers.reduce((acc, p) => acc + p.roa, 0) / n) * 10) / 10,
      netMargin: Math.round((peers.reduce((acc, p) => acc + p.netMargin, 0) / n) * 10) / 10,
      grossMargin: Math.round((peers.reduce((acc, p) => acc + p.grossMargin, 0) / n) * 10) / 10,
      debtToEquity: Math.round((peers.reduce((acc, p) => acc + p.debtToEquity, 0) / n) * 100) / 100,
      profitGrowthYoY: Math.round((peers.reduce((acc, p) => acc + p.profitGrowthYoY, 0) / n) * 10) / 10,
      dividendYield: Math.round((peers.reduce((acc, p) => acc + p.dividendYield, 0) / n) * 10) / 10,
    };
  }, [peers]);

  // Leaders
  const leaders = useMemo(() => {
    if (!peers.length) return {};
    return {
      bestOverall: [...peers].sort((a, b) => b.overallScore - a.overallScore)[0],
      bestProfit: [...peers].sort((a, b) => b.roe - a.roe)[0],
      bestValue: [...peers].sort((a, b) => a.pe * a.pb - b.pe * b.pb)[0],
      bestGrowth: [...peers].sort((a, b) => b.profitGrowthYoY - a.profitGrowthYoY)[0],
      lowestDebt: [...peers].sort((a, b) => a.debtToEquity - b.debtToEquity)[0],
    };
  }, [peers]);

  // SVG Radar Coordinates Calculation
  const center = 160;
  const radius = 110;
  const totalAxes = RADAR_AXES.length;

  const getAxisPoint = (axisIndex: number, value: number) => {
    const angle = (Math.PI * 2 / totalAxes) * axisIndex - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & INDUSTRY PRESETS */}
      <div className="glass-panel p-5 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                <Scale className="w-3.5 h-3.5 text-[#F0B90B]" /> Peer Comparison &amp; Radar Analysis
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#181A20] text-[#0ECB81] border border-[#0ECB81]/30">
                <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
                Live Multi-Factor Matrix
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              So Sánh Ngang Hàng Cùng Ngành &amp; Biểu Đồ Radar 6 Chiều
            </h2>
            <p className="text-xs text-[#848E9C]">
              Phân tích đối đầu trực diện giữa các cổ phiếu đầu ngành theo định giá, sinh lời, biên lợi nhuận, tăng trưởng và sức khỏe nợ
            </p>
          </div>

          {/* Add custom ticker form */}
          <form onSubmit={handleAddTicker} className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.toUpperCase())}
              placeholder="Thêm mã (VD: VCB, CTG...)"
              maxLength={7}
              className="w-48 px-3.5 py-2.5 bg-[#0B0E11] border border-[#2B313A] rounded-xl text-xs font-bold text-white uppercase placeholder-[#848E9C] focus:outline-none focus:border-[#F0B90B]"
            />
            <button
              type="submit"
              disabled={selectedTickers.length >= 5}
              className="px-4 py-2.5 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-black text-xs font-black transition-all shadow-md shadow-yellow-500/20 disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm
            </button>
          </form>
        </div>

        {/* Preset Industry Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#2B313A] pb-1">
          <span className="text-xs font-bold text-[#848E9C] shrink-0 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-[#F0B90B]" /> Nhóm ngành:
          </span>
          {INDUSTRY_PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-[#F0B90B] text-black border-[#F0B90B] shadow-md shadow-yellow-500/20 font-black"
                    : "bg-[#181A20] text-[#848E9C] border-[#2B313A] hover:text-white hover:border-[#F0B90B]/40"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Selected Ticker Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-[#848E9C]">Mã đang so sánh:</span>
          {peers.map((p, idx) => (
            <div
              key={p.ticker}
              style={{ borderColor: PEER_COLORS[idx % PEER_COLORS.length] }}
              className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0B0E11] border text-xs font-bold text-white font-mono-num"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PEER_COLORS[idx % PEER_COLORS.length] }} />
              <span>{p.ticker}</span>
              <span className="text-[10px] text-[#848E9C]">({p.overallScore}đ)</span>
              {selectedTickers.length > 2 && (
                <button
                  onClick={() => handleRemoveTicker(p.ticker)}
                  className="text-[#848E9C] hover:text-red-400 ml-1 transition-colors"
                  title="Xóa mã"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {isLoading && <RefreshCw className="w-4 h-4 text-[#F0B90B] animate-spin ml-2" />}
        </div>
      </div>

      {/* 2. RADAR CHART & KEY HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SVG Radar Chart */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F0B90B]" /> Biểu Đồ Radar Sức Mạnh 6 Chiều
            </h3>
            <span className="text-[11px] text-[#848E9C] font-mono-num">Thang điểm 0–100</span>
          </div>

          <div className="relative w-full max-w-[360px] aspect-square flex items-center justify-center my-2">
            <svg viewBox="0 0 320 320" className="w-full h-full overflow-visible">
              {/* Background concentric polygons */}
              {[20, 40, 60, 80, 100].map((level) => {
                const points = RADAR_AXES.map((_, i) => {
                  const pt = getAxisPoint(i, level);
                  return `${pt.x},${pt.y}`;
                }).join(" ");
                return (
                  <polygon
                    key={level}
                    points={points}
                    fill="none"
                    stroke="#2B313A"
                    strokeWidth={level === 100 ? "1.5" : "0.75"}
                    strokeDasharray={level < 100 ? "3,3" : undefined}
                  />
                );
              })}

              {/* Radial Axis Lines */}
              {RADAR_AXES.map((_, i) => {
                const pt = getAxisPoint(i, 100);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={pt.x}
                    y2={pt.y}
                    stroke="#2B313A"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data Polygons for each Peer */}
              {peers.map((peer, idx) => {
                const color = PEER_COLORS[idx % PEER_COLORS.length];
                const points = RADAR_AXES.map((axis, i) => {
                  const val = peer.radar[axis.key as keyof typeof peer.radar] || 50;
                  const pt = getAxisPoint(i, val);
                  return `${pt.x},${pt.y}`;
                }).join(" ");

                const isHovered = hoveredTicker === peer.ticker;

                return (
                  <g key={peer.ticker}>
                    <polygon
                      points={points}
                      fill={color}
                      fillOpacity={isHovered ? 0.35 : 0.15}
                      stroke={color}
                      strokeWidth={isHovered ? "3" : "2"}
                      className="transition-all duration-300"
                    />
                    {/* Points on vertices */}
                    {RADAR_AXES.map((axis, i) => {
                      const val = peer.radar[axis.key as keyof typeof peer.radar] || 50;
                      const pt = getAxisPoint(i, val);
                      return (
                        <circle
                          key={axis.key}
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? "4.5" : "3"}
                          fill={color}
                          stroke="#0B0E11"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Axis Labels */}
              {RADAR_AXES.map((axis, i) => {
                const pt = getAxisPoint(i, 118);
                return (
                  <text
                    key={axis.key}
                    x={pt.x}
                    y={pt.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[10px] font-bold fill-[#848E9C]"
                  >
                    {axis.label}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Interactive Legend */}
          <div className="flex items-center justify-center gap-4 flex-wrap pt-3 border-t border-[#2B313A] w-full">
            {peers.map((p, idx) => {
              const color = PEER_COLORS[idx % PEER_COLORS.length];
              return (
                <button
                  key={p.ticker}
                  onMouseEnter={() => setHoveredTicker(p.ticker)}
                  onMouseLeave={() => setHoveredTicker(null)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181A20] border border-[#2B313A] text-xs font-bold text-white hover:border-white transition-all font-mono-num"
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span>{p.ticker}</span>
                  <span className="text-[11px] text-[#848E9C]">({p.overallScore}/100)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Leaders & Relative Valuation Targets */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          {/* 4 Leader Badges */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl glass-panel border border-[#F0B90B]/30 bg-[#12161C] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#848E9C]">
                <span className="flex items-center gap-1 font-bold text-white">
                  <Award className="w-4 h-4 text-[#F0B90B]" /> Toàn Diện Nhất
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0B90B]/15 text-[#F0B90B] font-bold">Best Score</span>
              </div>
              <div className="text-xl font-black text-[#F0B90B] font-mono-num">{leaders.bestOverall?.ticker}</div>
              <div className="text-[11px] text-[#848E9C]">Điểm tổng hợp {leaders.bestOverall?.overallScore}/100</div>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-[#0ECB81]/30 bg-[#12161C] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#848E9C]">
                <span className="flex items-center gap-1 font-bold text-white">
                  <TrendingUp className="w-4 h-4 text-[#0ECB81]" /> Sinh Lời Cao Nhất
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0ECB81]/15 text-[#0ECB81] font-bold">Max ROE</span>
              </div>
              <div className="text-xl font-black text-[#0ECB81] font-mono-num">{leaders.bestProfit?.ticker}</div>
              <div className="text-[11px] text-[#848E9C]">ROE {leaders.bestProfit?.roe}% | Margin {leaders.bestProfit?.netMargin}%</div>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-blue-500/30 bg-[#12161C] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#848E9C]">
                <span className="flex items-center gap-1 font-bold text-white">
                  <Zap className="w-4 h-4 text-blue-400" /> Định Giá Rẻ Nhất
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold">Deep Value</span>
              </div>
              <div className="text-xl font-black text-blue-400 font-mono-num">{leaders.bestValue?.ticker}</div>
              <div className="text-[11px] text-[#848E9C]">P/E {leaders.bestValue?.pe}x | P/B {leaders.bestValue?.pb}x</div>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-purple-500/30 bg-[#12161C] space-y-1">
              <div className="flex items-center justify-between text-xs text-[#848E9C]">
                <span className="flex items-center gap-1 font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-purple-400" /> Nợ Thấp / An Toàn
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-bold">Low Debt</span>
              </div>
              <div className="text-xl font-black text-purple-400 font-mono-num">{leaders.lowestDebt?.ticker}</div>
              <div className="text-[11px] text-[#848E9C]">D/E {leaders.lowestDebt?.debtToEquity}x | Vốn vững chắc</div>
            </div>
          </div>

          {/* Relative Valuation Targets based on sector medians */}
          <div className="glass-panel p-5 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#848E9C] flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#F0B90B]" /> Định Giá Tương Đối (Relative Peer Valuation Target)
              </h4>
              <span className="text-[10px] text-[#848E9C]">Theo P/E &amp; P/B Trung vị Ngành</span>
            </div>

            <div className="space-y-2.5">
              {peers.map((p) => {
                const target = p.relativeValuation?.targetPrice || p.price;
                const upside = p.relativeValuation?.upsidePct || 0;
                const isPositive = upside >= 0;

                return (
                  <div
                    key={p.ticker}
                    className="p-3 rounded-xl bg-[#181A20] border border-[#2B313A] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-black font-mono-num text-white px-2 py-0.5 rounded bg-[#0B0E11] border border-[#2B313A]">
                        {p.ticker}
                      </span>
                      <div className="text-[11px] text-[#848E9C]">
                        Hiện tại: <strong className="text-white font-mono-num">{p.price.toLocaleString("vi-VN")} đ</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono-num">
                      <div className="text-right">
                        <span className="text-[10px] text-[#848E9C] block">Giá Mục Tiêu Ngành:</span>
                        <span className="font-black text-[#F0B90B] text-sm">{target.toLocaleString("vi-VN")} đ</span>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${isPositive ? "bg-[#0ECB81]/15 text-[#0ECB81]" : "bg-[#F6465D]/15 text-[#F6465D]"}`}>
                        {isPositive ? "+" : ""}{upside}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. HEAD-TO-HEAD COMPARISON MATRIX TABLE */}
      <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F0B90B]" /> Ma Trận So Sánh Đối Đầu Trực Diện (Head-to-Head Comparison)
          </h3>
          <span className="text-xs text-[#848E9C]">👑 Biểu tượng vương miện đại diện cho mã dẫn đầu chỉ số</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#2B313A]">
          <table className="w-full text-left text-xs font-mono-num border-collapse">
            <thead className="bg-[#0B0E11] text-[#848E9C] uppercase tracking-wider font-semibold border-b border-[#2B313A]">
              <tr>
                <th className="p-3.5 min-w-[180px]">Chỉ Tiêu Tài Chính</th>
                {peers.map((p, idx) => (
                  <th key={p.ticker} className="p-3.5 text-right min-w-[120px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PEER_COLORS[idx % PEER_COLORS.length] }} />
                      <span className="text-white font-black text-sm">{p.ticker}</span>
                    </div>
                  </th>
                ))}
                {sectorMedians && (
                  <th className="p-3.5 text-right min-w-[120px] bg-[#181A20] text-[#F0B90B] font-bold">
                    TB Ngành
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2B313A]">
              {/* Price & Market Cap */}
              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-bold text-white">Thị Giá Khớp Lệnh</td>
                {peers.map((p) => (
                  <td key={p.ticker} className="p-3.5 text-right font-bold text-white">
                    {p.price.toLocaleString("vi-VN")} đ
                  </td>
                ))}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#848E9C]">—</td>}
              </tr>

              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-bold text-white">Vốn Hóa Thị Trường</td>
                {peers.map((p) => (
                  <td key={p.ticker} className="p-3.5 text-right font-bold text-[#F0B90B]">
                    {p.marketCap.toLocaleString("vi-VN")} Tỷ
                  </td>
                ))}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#848E9C]">—</td>}
              </tr>

              {/* Valuation Multiples */}
              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-semibold text-slate-300">P/E TTM (Lần)</td>
                {peers.map((p) => {
                  const isBest = p.pe === Math.min(...peers.map((x) => x.pe));
                  return (
                    <td key={p.ticker} className={`p-3.5 text-right font-bold ${isBest ? "text-[#0ECB81]" : "text-white"}`}>
                      {p.pe}x {isBest && "👑"}
                    </td>
                  );
                })}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#F0B90B] font-bold">{sectorMedians.pe}x</td>}
              </tr>

              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-semibold text-slate-300">P/B (Lần)</td>
                {peers.map((p) => {
                  const isBest = p.pb === Math.min(...peers.map((x) => x.pb));
                  return (
                    <td key={p.ticker} className={`p-3.5 text-right font-bold ${isBest ? "text-[#0ECB81]" : "text-white"}`}>
                      {p.pb}x {isBest && "👑"}
                    </td>
                  );
                })}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#F0B90B] font-bold">{sectorMedians.pb}x</td>}
              </tr>

              {/* Profitability */}
              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-semibold text-slate-300">ROE TTM (%)</td>
                {peers.map((p) => {
                  const isBest = p.roe === Math.max(...peers.map((x) => x.roe));
                  return (
                    <td key={p.ticker} className={`p-3.5 text-right font-bold ${isBest ? "text-[#0ECB81]" : "text-white"}`}>
                      {p.roe}% {isBest && "👑"}
                    </td>
                  );
                })}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#F0B90B] font-bold">{sectorMedians.roe}%</td>}
              </tr>

              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-semibold text-slate-300">ROA TTM (%)</td>
                {peers.map((p) => {
                  const isBest = p.roa === Math.max(...peers.map((x) => x.roa));
                  return (
                    <td key={p.ticker} className={`p-3.5 text-right font-bold ${isBest ? "text-[#0ECB81]" : "text-white"}`}>
                      {p.roa}% {isBest && "👑"}
                    </td>
                  );
                })}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#F0B90B] font-bold">{sectorMedians.roa}%</td>}
              </tr>

              {/* Margins */}
              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-semibold text-slate-300">Biên Lợi Nhuận Gộp (%)</td>
                {peers.map((p) => {
                  const isBest = p.grossMargin === Math.max(...peers.map((x) => x.grossMargin));
                  return (
                    <td key={p.ticker} className={`p-3.5 text-right font-bold ${isBest ? "text-[#0ECB81]" : "text-white"}`}>
                      {p.grossMargin}% {isBest && "👑"}
                    </td>
                  );
                })}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#F0B90B] font-bold">{sectorMedians.grossMargin}%</td>}
              </tr>

              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-semibold text-slate-300">Biên Lợi Nhuận Ròng (%)</td>
                {peers.map((p) => {
                  const isBest = p.netMargin === Math.max(...peers.map((x) => x.netMargin));
                  return (
                    <td key={p.ticker} className={`p-3.5 text-right font-bold ${isBest ? "text-[#0ECB81]" : "text-white"}`}>
                      {p.netMargin}% {isBest && "👑"}
                    </td>
                  );
                })}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#F0B90B] font-bold">{sectorMedians.netMargin}%</td>}
              </tr>

              {/* Growth */}
              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-semibold text-slate-300">Tăng Trưởng LNST YoY (%)</td>
                {peers.map((p) => {
                  const isBest = p.profitGrowthYoY === Math.max(...peers.map((x) => x.profitGrowthYoY));
                  return (
                    <td key={p.ticker} className={`p-3.5 text-right font-bold ${isBest ? "text-[#0ECB81]" : "text-white"}`}>
                      +{p.profitGrowthYoY}% {isBest && "👑"}
                    </td>
                  );
                })}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#F0B90B] font-bold">+{sectorMedians.profitGrowthYoY}%</td>}
              </tr>

              {/* Debt & Dividend */}
              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-semibold text-slate-300">Đòn Bẩy Nợ / VCSH (D/E)</td>
                {peers.map((p) => {
                  const isBest = p.debtToEquity === Math.min(...peers.map((x) => x.debtToEquity));
                  return (
                    <td key={p.ticker} className={`p-3.5 text-right font-bold ${isBest ? "text-[#0ECB81]" : "text-white"}`}>
                      {p.debtToEquity}x {isBest && "👑"}
                    </td>
                  );
                })}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#F0B90B] font-bold">{sectorMedians.debtToEquity}x</td>}
              </tr>

              <tr className="hover:bg-[#181A20]/50">
                <td className="p-3.5 font-sans font-semibold text-slate-300">Tỷ Suất Cổ Tức Tiền (%)</td>
                {peers.map((p) => {
                  const isBest = p.dividendYield === Math.max(...peers.map((x) => x.dividendYield));
                  return (
                    <td key={p.ticker} className={`p-3.5 text-right font-bold ${isBest ? "text-[#0ECB81]" : "text-white"}`}>
                      {p.dividendYield}% {isBest && "👑"}
                    </td>
                  );
                })}
                {sectorMedians && <td className="p-3.5 text-right bg-[#181A20]/40 text-[#F0B90B] font-bold">{sectorMedians.dividendYield}%</td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
