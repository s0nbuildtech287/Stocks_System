"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Building2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Zap,
  Flame,
  Globe,
  DollarSign,
  BarChart3,
  Calendar,
  ExternalLink,
  Newspaper,
  Layers,
  Award,
  AlertCircle,
  Activity,
  PieChart,
  RefreshCw,
  ChevronRight,
  Calculator,
  Briefcase,
} from "lucide-react";
import { VIETNAM_STOCKS } from "@/lib/stockData";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  time: string;
  tag: string;
}

interface CorporateEvent {
  id: string;
  date: string;
  type: string;
  content: string;
  impact: string;
}

interface StockInsightData {
  ticker: string;
  name: string;
  exchange: string;
  category: string;
  industry: string;
  industryGroup: string;
  description: string;
  quote: {
    price: number;
    change: number;
    changePct: number;
    volume: number;
    high52w: number;
    low52w: number;
    marketCap: number;
  };
  ratios: {
    pe: number;
    pb: number;
    ps: number;
    roe: number;
    roa: number;
    netMargin: number;
    debtToEquity: number;
    eps: number;
    bvps: number;
    revenueGrowthYoY: number;
    profitGrowthYoY: number;
    dividendYield: number;
    beta1y: number;
    rsi14: number;
  };
  healthScores: {
    overall: number;
    profitability: number;
    valuation: number;
    growth: number;
    solvency: number;
    dividend: number;
    rating: string;
  };
  quarterlyFinancials: {
    quarter: string;
    revenue: number;
    npat: number;
    grossMargin: number;
    netMargin: number;
  }[];
  newsFeed: NewsItem[];
  corporateEvents: CorporateEvent[];
  shareholders: {
    name: string;
    percentage: number;
    type: string;
  }[];
}

interface StockInsightViewProps {
  initialTicker?: string;
  onNavigateToTab?: (tab: string, ticker?: string) => void;
}

export default function StockInsightView({ initialTicker = "FPT", onNavigateToTab }: StockInsightViewProps) {
  const [ticker, setTicker] = useState<string>(initialTicker);
  const [searchInput, setSearchInput] = useState<string>(initialTicker);
  const [data, setData] = useState<StockInsightData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "financials" | "news" | "events" | "shareholders">("overview");

  const quickTickers = ["FPT", "HPG", "VIC", "VNM", "TCB", "MBB", "MWG", "SSI", "GAS", "VHM", "DGC", "VTP", "REE"];

  const fetchInsightData = async (symbol: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stock/insight/${symbol.toUpperCase().trim()}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setData(json.data);
          setTicker(symbol.toUpperCase().trim());
        }
      }
    } catch (err) {
      console.error("Failed to fetch stock insight:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightData(initialTicker);
  }, [initialTicker]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchInsightData(searchInput);
    }
  };

  const handleQuickSelect = (sym: string) => {
    setSearchInput(sym);
    fetchInsightData(sym);
  };

  if (!data && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#F0B90B] animate-spin" />
        <span className="text-sm font-bold text-[#EAECEF]">Đang tải dữ liệu hồ sơ 360° &amp; tin tức {ticker}...</span>
      </div>
    );
  }

  const isUp = (data?.quote?.changePct ?? 0) >= 0;
  const currentPrice = data?.quote?.price ?? 25000;
  const low52 = data?.quote?.low52w ?? currentPrice * 0.75;
  const high52 = data?.quote?.high52w ?? currentPrice * 1.25;
  const rangePct = Math.max(0, Math.min(100, ((currentPrice - low52) / (high52 - low52 || 1)) * 100));

  return (
    <div className="space-y-6">
      {/* 1. TOP SEARCH & QUICK TICKER BAR */}
      <div className="glass-panel p-5 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#F0B90B]" /> Stock Insight &amp; 360° Intelligence
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#181A20] text-[#0ECB81] border border-[#0ECB81]/30">
                <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
                Live vnstock &amp; Web News
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Tra Cứu Thông Tin Toàn Diện &amp; Tin Tức Doanh Nghiệp
            </h2>
            <p className="text-xs text-[#848E9C]">
              Nhập bất kỳ mã cổ phiếu nào để xem báo cáo tài chính, chỉ số định lượng, sức khỏe doanh nghiệp và tin tức mới nhất
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-96">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848E9C]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã CP (VD: FPT, HPG, VIC...)"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0E11] border border-[#2B313A] rounded-xl text-sm font-bold text-white uppercase placeholder-[#848E9C] focus:outline-none focus:border-[#F0B90B] focus:ring-1 focus:ring-[#F0B90B]/30"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F0B90B] to-[#E5A905] hover:from-[#FCD535] hover:to-[#F0B90B] text-black text-xs font-black transition-all shadow-md shadow-yellow-500/20 disabled:opacity-50 shrink-0"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Tra cứu"}
            </button>
          </form>
        </div>

        {/* Quick Ticker Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#2B313A] text-xs pb-1">
          <span className="text-[#848E9C] font-semibold flex items-center gap-1 shrink-0">
            <Flame className="w-3.5 h-3.5 text-[#F0B90B]" /> Mã phổ biến:
          </span>
          {quickTickers.map((sym) => (
            <button
              key={sym}
              onClick={() => handleQuickSelect(sym)}
              className={`px-2.5 py-1 rounded-lg font-mono-num font-bold transition-all border ${
                data?.ticker === sym
                  ? "bg-[#F0B90B] text-black border-[#F0B90B] shadow-sm font-extrabold"
                  : "bg-[#181A20] text-[#848E9C] border-[#2B313A] hover:text-white hover:border-[#F0B90B]/40"
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <>
          {/* 2. HERO COMPANY PROFILE BANNER */}
          <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Left: Ticker & Name */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white px-3.5 py-1 rounded-xl bg-[#0B0E11] border border-[#F0B90B]/40 font-mono-num text-[#F0B90B]">
                    {data.ticker}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#181A20] text-[#848E9C] border border-[#2B313A]">
                    {data.exchange}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                    {data.category}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">{data.name}</h1>
                <p className="text-xs text-[#848E9C] leading-relaxed">{data.description}</p>
              </div>

              {/* Right: Live Price & Key Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 bg-[#0B0E11] p-5 rounded-2xl border border-[#2B313A]">
                <div className="space-y-0.5 text-left lg:text-right">
                  <div className="text-[11px] text-[#848E9C] font-semibold">Giá thị trường Live (vnstock)</div>
                  <div className="text-3xl font-black font-mono-num text-white">
                    {data.quote.price.toLocaleString("vi-VN")} đ
                  </div>
                  <div className={`text-xs font-bold font-mono-num flex items-center gap-1 ${isUp ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isUp ? "+" : ""}{data.quote.change.toLocaleString("vi-VN")} đ ({isUp ? "+" : ""}{data.quote.changePct}%)</span>
                  </div>
                </div>

                {/* 52W Range Bar */}
                <div className="w-full sm:w-56 lg:w-56 space-y-1 text-xs font-mono-num">
                  <div className="flex justify-between text-[10px] text-[#848E9C]">
                    <span>52W Thấp: {low52.toLocaleString("vi-VN")}</span>
                    <span>52W Cao: {high52.toLocaleString("vi-VN")}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#181A20] overflow-hidden border border-[#2B313A] relative">
                    <div
                      style={{ width: `${rangePct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#0ECB81] via-[#F0B90B] to-[#F6465D]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-[#2B313A]">
              {[
                { id: "overview", label: "🌟 Tổng quan & Sức khỏe (Health Score)", icon: Award },
                { id: "financials", label: "📊 Chỉ báo & BCTC 4 Quý", icon: BarChart3 },
                { id: "news", label: `📰 Tin tức Thời sự (${data.newsFeed.length})`, icon: Newspaper },
                { id: "events", label: `📅 Sự kiện & Cổ tức (${data.corporateEvents.length})`, icon: Calendar },
                { id: "shareholders", label: "👥 Cơ cấu Cổ đông", icon: PieChart },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeSubTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveSubTab(t.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                      isActive
                        ? "bg-[#F0B90B] text-black border-[#F0B90B] shadow-md shadow-yellow-500/20 font-black"
                        : "bg-[#181A20] text-[#848E9C] border-[#2B313A] hover:text-white hover:border-[#F0B90B]/40"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. SUB-TAB CONTENTS */}

          {/* A. OVERVIEW & HEALTH SCORE */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              {/* Financial Health Scorecard */}
              <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#F0B90B]" /> Thẻ Chấm Điểm Sức Khỏe Doanh Nghiệp (Health Scorecard)
                    </h3>
                    <p className="text-xs text-[#848E9C]">
                      Chấm điểm định lượng 5 trụ cột dựa trên chuẩn mực phân tích tài chính quốc tế
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B0E11] border border-[#F0B90B]/40 font-mono-num">
                    <span className="text-xs text-[#848E9C]">Xếp hạng:</span>
                    <span className="text-lg font-black text-[#F0B90B]">{data.healthScores.rating}</span>
                    <span className="text-sm font-bold text-white">({data.healthScores.overall}/100)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { label: "1. Sinh lời (Profitability)", score: data.healthScores.profitability, desc: `ROE ${data.ratios.roe}% | Net Margin ${data.ratios.netMargin}%`, color: "#0ECB81" },
                    { label: "2. Định giá (Valuation)", score: data.healthScores.valuation, desc: `P/E ${data.ratios.pe}x | P/B ${data.ratios.pb}x`, color: "#F0B90B" },
                    { label: "3. Tăng trưởng (Growth)", score: data.healthScores.growth, desc: `LNST YoY +${data.ratios.profitGrowthYoY}%`, color: "#0ECB81" },
                    { label: "4. An toàn nợ (Solvency)", score: data.healthScores.solvency, desc: `D/E ${data.ratios.debtToEquity}x | An toàn`, color: "#3B82F6" },
                    { label: "5. Dòng tiền & Cổ tức", score: data.healthScores.dividend, desc: `Cổ tức tiền ${data.ratios.dividendYield}%`, color: "#A855F7" },
                  ].map((pillar) => (
                    <div key={pillar.label} className="p-4 rounded-xl glass-card border border-[#2B313A] bg-[#181A20] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#848E9C] font-semibold">{pillar.label}</span>
                        <span className="font-mono-num font-black text-white">{pillar.score}/100</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#0B0E11] overflow-hidden">
                        <div
                          style={{ width: `${pillar.score}%`, backgroundColor: pillar.color }}
                          className="h-full rounded-full transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-[#848E9C] block truncate">{pillar.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Valuation & Fundamentals Grid */}
              <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#F0B90B]" /> Chỉ Số Định Giá &amp; Hiệu Quả Hoạt Động (Key Multiples)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono-num text-xs">
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">P/E TTM</span>
                    <div className="text-lg font-black text-white mt-0.5">{data.ratios.pe}x</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">P/B</span>
                    <div className="text-lg font-black text-white mt-0.5">{data.ratios.pb}x</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">ROE TTM</span>
                    <div className="text-lg font-black text-[#0ECB81] mt-0.5">{data.ratios.roe}%</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">ROA TTM</span>
                    <div className="text-lg font-black text-[#0ECB81] mt-0.5">{data.ratios.roa}%</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">EPS (Thu nhập/cp)</span>
                    <div className="text-lg font-black text-white mt-0.5">{data.ratios.eps.toLocaleString("vi-VN")} đ</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">BVPS (Giá trị sổ sách)</span>
                    <div className="text-lg font-black text-white mt-0.5">{data.ratios.bvps.toLocaleString("vi-VN")} đ</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">Cổ tức Tiền mặt</span>
                    <div className="text-lg font-black text-[#F0B90B] mt-0.5">{data.ratios.dividendYield}%</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">Tăng trưởng LNST</span>
                    <div className="text-lg font-black text-[#0ECB81] mt-0.5">+{data.ratios.profitGrowthYoY}%</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">Tăng trưởng DThu</span>
                    <div className="text-lg font-black text-white mt-0.5">+{data.ratios.revenueGrowthYoY}%</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">Biên LN Ròng</span>
                    <div className="text-lg font-black text-white mt-0.5">{data.ratios.netMargin}%</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">Nợ / Vốn CSH (D/E)</span>
                    <div className="text-lg font-black text-white mt-0.5">{data.ratios.debtToEquity}x</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">Hệ số Beta (1Y)</span>
                    <div className="text-lg font-black text-white mt-0.5">{data.ratios.beta1y}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">RSI (14 phiên)</span>
                    <div className="text-lg font-black text-white mt-0.5">{data.ratios.rsi14}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A]">
                    <span className="text-[11px] text-[#848E9C]">Vốn hóa (Tỷ VND)</span>
                    <div className="text-lg font-black text-[#F0B90B] mt-0.5">{data.quote.marketCap.toLocaleString("vi-VN")} Tỷ</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. FINANCIAL STATEMENTS & 4 QUARTERS */}
          {activeSubTab === "financials" && (
            <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#F0B90B]" /> Xu Hướng Kết Quả Kinh Doanh 4 Quý Gần Nhất (Tỷ VND)
              </h3>

              <div className="overflow-x-auto rounded-xl border border-[#2B313A]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0E11] text-[#848E9C] uppercase tracking-wider font-semibold border-b border-[#2B313A]">
                    <tr>
                      <th className="p-3.5">Kỳ Báo Cáo</th>
                      <th className="p-3.5 text-right">Doanh Thu Thuần</th>
                      <th className="p-3.5 text-right">Lợi Nhuận Sau Thuế (LNST)</th>
                      <th className="p-3.5 text-right">Biên Lợi Nhuận Gộp</th>
                      <th className="p-3.5 text-right">Biên Lợi Nhuận Ròng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B313A] font-mono-num">
                    {data.quarterlyFinancials.map((q) => (
                      <tr key={q.quarter} className="hover:bg-[#181A20] transition-colors">
                        <td className="p-3.5 font-bold text-white">{q.quarter}</td>
                        <td className="p-3.5 text-right font-bold text-white">{q.revenue.toLocaleString("vi-VN")} Tỷ</td>
                        <td className="p-3.5 text-right font-bold text-[#0ECB81]">{q.npat.toLocaleString("vi-VN")} Tỷ</td>
                        <td className="p-3.5 text-right text-slate-300">{q.grossMargin}%</td>
                        <td className="p-3.5 text-right text-[#F0B90B] font-bold">{q.netMargin}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* C. NEWS FEED */}
          {activeSubTab === "news" && (
            <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#F0B90B]" /> Tin Tức &amp; Thời Sự Doanh Nghiệp ({data.newsFeed.length} tin)
                </h3>
                <span className="text-xs text-[#848E9C]">Cập nhật thời gian thực từ báo chí tài chính</span>
              </div>

              {data.newsFeed.length === 0 ? (
                <div className="py-10 text-center text-[#848E9C] text-xs">
                  Không tìm thấy tin tức mới nào cho mã {data.ticker}.
                </div>
              ) : (
                <div className="divide-y divide-[#2B313A] space-y-1">
                  {data.newsFeed.map((news) => (
                    <a
                      key={news.id}
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3.5 rounded-xl hover:bg-[#181A20] transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                              {news.tag}
                            </span>
                            <span className="text-[11px] text-[#848E9C]">{news.source}</span>
                            <span className="text-[11px] text-[#848E9C]">• {news.time}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-[#F0B90B] transition-colors leading-snug">
                            {news.title}
                          </h4>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#848E9C] group-hover:text-[#F0B90B] shrink-0 mt-1" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* D. CORPORATE EVENTS */}
          {activeSubTab === "events" && (
            <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#F0B90B]" /> Lịch Sự Kiện, Cổ Tức &amp; Quyền Mua
              </h3>

              <div className="overflow-x-auto rounded-xl border border-[#2B313A]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0E11] text-[#848E9C] uppercase tracking-wider font-semibold border-b border-[#2B313A]">
                    <tr>
                      <th className="p-3.5">Ngày Thực Hiện</th>
                      <th className="p-3.5">Loại Sự Kiện</th>
                      <th className="p-3.5">Nội Dung Chi Tiết</th>
                      <th className="p-3.5 text-center">Tác Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B313A]">
                    {data.corporateEvents.map((ev) => (
                      <tr key={ev.id} className="hover:bg-[#181A20] transition-colors">
                        <td className="p-3.5 font-bold font-mono-num text-white">{ev.date}</td>
                        <td className="p-3.5 font-bold text-[#F0B90B]">{ev.type}</td>
                        <td className="p-3.5 text-slate-300">{ev.content}</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                            {ev.impact}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* E. SHAREHOLDERS */}
          {activeSubTab === "shareholders" && (
            <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#F0B90B]" /> Cơ Cấu Cổ Đông &amp; Tỷ Lệ Sở Hữu
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.shareholders.map((sh) => (
                  <div key={sh.name} className="p-4 rounded-xl glass-card border border-[#2B313A] bg-[#181A20] space-y-2">
                    <span className="text-xs text-[#848E9C] font-semibold">{sh.name}</span>
                    <div className="text-2xl font-black font-mono-num text-white">{sh.percentage}%</div>
                    <div className="w-full h-1.5 rounded-full bg-[#0B0E11] overflow-hidden">
                      <div style={{ width: `${sh.percentage * 2}%` }} className="h-full bg-[#F0B90B] rounded-full" />
                    </div>
                    <span className="text-[10px] text-[#848E9C] block">{sh.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
