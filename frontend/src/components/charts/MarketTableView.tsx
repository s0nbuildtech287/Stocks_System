"use client";

import React, { useState, useMemo } from "react";
import { VIETNAM_50_STOCKS, StockProfile, getStockLongTermTrend } from "@/lib/stockData";
import ExpandedRowChart from "./ExpandedRowChart";
import {
  Search,
  Star,
  ChevronDown,
  ChevronUp,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Zap,
  Info,
  Check,
  X,
  Maximize2,
  Briefcase,
  BarChart2,
} from "lucide-react";

interface MarketTableViewProps {
  initialExpandedTicker?: string;
  onSelectTickerForFullView?: (ticker: string) => void;
}

export default function MarketTableView({ initialExpandedTicker, onSelectTickerForFullView }: MarketTableViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedTickers, setExpandedTickers] = useState<Set<string>>(
    new Set(initialExpandedTicker ? [initialExpandedTicker] : [])
  );
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["FPT", "HPG", "TCB", "MBB"]));
  const [sortField, setSortField] = useState<keyof StockProfile>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedStockForModal, setSelectedStockForModal] = useState<StockProfile | null>(null);
  const [liveQuotes, setLiveQuotes] = useState<Record<string, any>>({});
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [lastSyncDate, setLastSyncDate] = useState<string>("");

  // Sync live quotes from vnstock API
  const fetchLiveQuotes = async () => {
    setIsLiveSyncing(true);
    try {
      const res = await fetch("/api/quotes/live");
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setLiveQuotes(json.data);
          const firstKey = Object.keys(json.data)[0];
          if (firstKey && json.data[firstKey].date) {
            setLastSyncDate(json.data[firstKey].date);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to sync live quotes", err);
    } finally {
      setIsLiveSyncing(false);
    }
  };

  React.useEffect(() => {
    fetchLiveQuotes();
  }, []);

  React.useEffect(() => {
    if (initialExpandedTicker) {
      setExpandedTickers((prev) => {
        const next = new Set(prev);
        next.add(initialExpandedTicker);
        return next;
      });
    }
  }, [initialExpandedTicker]);

  // Toggle expand for a specific row
  const toggleRowExpand = (ticker: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedTickers((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
      } else {
        next.add(ticker);
      }
      return next;
    });
  };

  // Toggle favorite
  const toggleFavorite = (ticker: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
      } else {
        next.add(ticker);
      }
      return next;
    });
  };

  // Sort handler
  const handleSort = (field: keyof StockProfile) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to desc for financial numbers
    }
  };

  // Filter categories
  const categories = [
    { id: "ALL", label: "Tất cả 50 Mã", count: 50 },
    { id: "VN30", label: "VN30 Rổ Chuẩn", count: 30 },
    { id: "TOP20", label: "Top 20 Dẫn Đầu", count: 20 },
    { id: "FAVORITES", label: "Yêu Thích ⭐", count: favorites.size },
    { id: "BANKING", label: "Ngân Hàng", count: 12 },
    { id: "TECH_TELECOM", label: "Công Nghệ", count: 4 },
    { id: "STEEL_MATERIALS", label: "Thép & VLXD", count: 5 },
    { id: "REAL_ESTATE", label: "Bất Động Sản", count: 7 },
    { id: "SECURITIES", label: "Chứng Khoán", count: 6 },
    { id: "RETAIL_CONSUMER", label: "Bán Lẻ & TD", count: 6 },
  ];

  // Filtered & Sorted Stocks with Live vnstock Merged Data
  const filteredStocks = useMemo(() => {
    return VIETNAM_50_STOCKS.map((stock) => {
      const live = liveQuotes[stock.ticker];
      if (live) {
        return {
          ...stock,
          price: live.price ?? stock.price,
          change: live.change ?? stock.change,
          changePct: live.changePct ?? stock.changePct,
          volume24h: live.volume24h ?? stock.volume24h,
        };
      }
      return stock;
    }).filter((stock) => {
      // 1. Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        stock.ticker.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.industry.toLowerCase().includes(q) ||
        stock.exchange.toLowerCase().includes(q);

      if (!matchQuery) return false;

      // 2. Category filter
      if (selectedCategory === "VN30") {
        return stock.category === "VN30" || stock.id <= 30;
      }
      if (selectedCategory === "TOP20") {
        return stock.id > 30;
      }
      if (selectedCategory === "FAVORITES") {
        return favorites.has(stock.ticker);
      }
      if (selectedCategory === "BANKING") {
        return stock.industryGroup === "BANKING" || stock.industry.includes("Ngân hàng");
      }
      if (selectedCategory === "TECH_TELECOM") {
        return stock.industryGroup === "TECHNOLOGY" || stock.industryGroup === "TELECOM";
      }
      if (selectedCategory === "STEEL_MATERIALS") {
        return stock.industryGroup === "STEEL" || stock.industryGroup === "MATERIALS";
      }
      if (selectedCategory === "REAL_ESTATE") {
        return stock.industryGroup === "REALESTATE" || stock.industryGroup === "INDUSTRIAL_RE";
      }
      if (selectedCategory === "SECURITIES") {
        return stock.industryGroup === "SECURITIES";
      }
      if (selectedCategory === "RETAIL_CONSUMER") {
        return stock.industryGroup === "RETAIL" || stock.industryGroup === "CONSUMER";
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [searchQuery, selectedCategory, favorites, sortField, sortOrder, liveQuotes]);

  // Mini Long-Term (52W Macro) Sparkline SVG Renderer
  const renderLongTermSparkline = (stock: StockProfile) => {
    const points = getStockLongTermTrend(stock, 36);
    if (!points || points.length === 0) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 120;
    const height = 30;

    const startVal = points[0];
    const endVal = points[points.length - 1];
    const longReturnPct = ((endVal - startVal) / startVal) * 100;
    const isMacroUp = longReturnPct >= 0;

    const coords = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * (width - 8) + 4;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return `${x},${y}`;
    });

    const polylineStr = coords.join(" ");
    const color = isMacroUp ? "#10b981" : "#ef4444";
    const gradientId = `sparkline-52w-${stock.ticker}`;

    return (
      <div className="flex items-center justify-center gap-2">
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Fill area */}
          <polygon
            points={`4,${height} ${polylineStr} ${width - 4},${height}`}
            fill={`url(#${gradientId})`}
          />
          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylineStr}
          />
          {/* Current price terminal dot */}
          {coords.length > 0 && (
            <circle
              cx={coords[coords.length - 1].split(",")[0]}
              cy={coords[coords.length - 1].split(",")[1]}
              r="2.5"
              fill={color}
            />
          )}
        </svg>

        <div className="text-right shrink-0">
          <span
            className={`text-[10px] font-bold font-mono-num block ${
              isMacroUp ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isMacroUp ? "+" : ""}
            {longReturnPct.toFixed(1)}%
          </span>
          <span className="text-[9px] text-slate-500 block">52W</span>
        </div>
      </div>
    );
  };

  // Get category badge style
  const getCategoryBadge = (stock: StockProfile) => {
    if (stock.category === "VN30" || stock.id <= 30) {
      return {
        label: "VN30",
        bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      };
    }
    switch (stock.industryGroup) {
      case "BANKING":
        return { label: "Banking", bg: "bg-blue-500/15 text-blue-300 border-blue-500/30" };
      case "TECHNOLOGY":
      case "TELECOM":
        return { label: "Tech", bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" };
      case "SECURITIES":
        return { label: "Securities", bg: "bg-purple-500/15 text-purple-300 border-purple-500/30" };
      case "STEEL":
        return { label: "Steel", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
      case "REALESTATE":
      case "INDUSTRIAL_RE":
        return { label: "Real Estate", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
      case "RETAIL":
      case "CONSUMER":
        return { label: "Retail", bg: "bg-teal-500/15 text-teal-300 border-teal-500/30" };
      default:
        return { label: "Leading Top 20", bg: "bg-slate-700/40 text-slate-300 border-slate-600/40" };
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & SUMMARY BANNER */}
      <div className="glass-panel p-5 rounded-2xl border border-[#2B313A] bg-[#12161C] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#181A20] text-[#F0B90B] border border-[#F0B90B]/30">
              50 Bluechips Universe
            </span>
            <span className="text-xs text-[#848E9C] font-medium">
              30 VN30 + 20 Cổ phiếu dẫn dắt hàng đầu
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Market &amp; Interactive Charts Terminal
          </h2>
          <p className="text-xs text-[#848E9C] mt-0.5">
            Nhấn vào từng dòng để mở biểu đồ nến kỹ thuật TradingView tích hợp, xem chỉ báo và phân tích tức thì.
          </p>
        </div>

        {/* Right quick stats */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLiveQuotes}
            disabled={isLiveSyncing}
            className="px-3 py-2 rounded-xl bg-[#181A20] hover:bg-[#2B313A] border border-[#2B313A] text-xs text-[#EAECEF] flex items-center gap-2 transition-all font-mono-num"
            title="Đồng bộ dữ liệu thời gian thực từ vnstock"
          >
            <span className={`w-2 h-2 rounded-full ${isLiveSyncing ? "bg-[#F0B90B] animate-spin" : "bg-[#0ECB81] animate-pulse"}`} />
            <span>{isLiveSyncing ? "Đang đồng bộ..." : lastSyncDate ? `EOD ${lastSyncDate}` : "vnstock Live"}</span>
          </button>

          <div className="px-4 py-2 rounded-xl bg-[#181A20] border border-[#2B313A] text-right">
            <div className="text-[10px] text-[#848E9C]">Số mã hiển thị</div>
            <div className="text-sm font-black font-mono-num text-white">
              {filteredStocks.length} / 50
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#181A20] border border-[#2B313A] text-right">
            <div className="text-[10px] text-[#848E9C]">Đang mở Chart</div>
            <div className="text-sm font-black font-mono-num text-[#F0B90B]">
              {expandedTickers.size} mã
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & CATEGORY FILTER BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-[#2B313A] bg-[#12161C] space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848E9C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã (FPT, HPG), tên hoặc nhóm ngành..."
              className="w-full pl-10 pr-4 py-2 bg-[#0B0E11] border border-[#2B313A] rounded-xl text-xs text-white placeholder-[#848E9C] focus:outline-none focus:border-[#F0B90B] focus:ring-1 focus:ring-[#F0B90B]/30 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848E9C] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#F0B90B] text-black shadow-md shadow-yellow-500/20 font-black"
                      : "bg-[#181A20] text-[#848E9C] hover:text-white hover:bg-[#2B313A] border border-[#2B313A]"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-black/30 text-black font-extrabold" : "bg-[#2B313A] text-[#848E9C]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MULTI-ASSET INTERACTIVE TABLE */}
      <div className="glass-panel rounded-2xl border border-[#2B313A] bg-[#12161C] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-[#2B313A] bg-[#0B0E11] text-[11px] font-extrabold uppercase tracking-wider text-[#848E9C] select-none">
                <th
                  onClick={() => handleSort("id")}
                  className="py-3.5 px-4 cursor-pointer hover:text-white w-12 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>#</span>
                    {sortField === "id" && <ArrowUpDown className="w-3 h-3 text-[#F0B90B]" />}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("name")}
                  className="py-3.5 px-4 cursor-pointer hover:text-white min-w-[200px]"
                >
                  <div className="flex items-center gap-1">
                    <span>ASSET NAME</span>
                    {sortField === "name" && <ArrowUpDown className="w-3 h-3 text-[#F0B90B]" />}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("ticker")}
                  className="py-3.5 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>YAHOO / TICKER</span>
                    {sortField === "ticker" && <ArrowUpDown className="w-3 h-3 text-[#F0B90B]" />}
                  </div>
                </th>

                <th className="py-3.5 px-3">CATEGORY</th>

                <th
                  onClick={() => handleSort("price")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>LAST PRICE</span>
                    {sortField === "price" && <ArrowUpDown className="w-3 h-3 text-[#F0B90B]" />}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("changePct")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>CHG (24H)</span>
                    {sortField === "changePct" && <ArrowUpDown className="w-3 h-3 text-[#F0B90B]" />}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("volume20d")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white min-w-[130px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>VOLUME (24H)</span>
                    {sortField === "volume20d" && <ArrowUpDown className="w-3 h-3 text-[#F0B90B]" />}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("value20d")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white min-w-[120px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>VALUE (24H)</span>
                    {sortField === "value20d" && <ArrowUpDown className="w-3 h-3 text-[#F0B90B]" />}
                  </div>
                </th>

                <th className="py-3.5 px-4 text-center min-w-[160px]">52W RANGE</th>

                <th className="py-3.5 px-4 text-center min-w-[190px]">
                  <div className="flex items-center justify-center gap-1 text-[#F0B90B]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>MACRO TREND (52W)</span>
                  </div>
                </th>

                <th className="py-3.5 px-4 text-center w-28">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-white/5 text-xs font-mono-num">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 font-sans">
                    Không tìm thấy mã cổ phiếu phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock, index) => {
                  const isExpanded = expandedTickers.has(stock.ticker);
                  const isFav = favorites.has(stock.ticker);
                  const isPositive = stock.changePct >= 0;
                  const categoryBadge = getCategoryBadge(stock);

                  // 52W range progress percentage
                  const rangeSpan = stock.high52w - stock.low52w || 1;
                  const currentPct = Math.min(
                    100,
                    Math.max(0, ((stock.price - stock.low52w) / rangeSpan) * 100)
                  );

                  return (
                    <React.Fragment key={stock.ticker}>
                      {/* Main Stock Row */}
                      <tr
                        onClick={() => toggleRowExpand(stock.ticker)}
                        className={`group cursor-pointer transition-all ${
                          isExpanded
                            ? "bg-[#0d1424] border-l-4 border-l-cyan-400"
                            : "hover:bg-slate-800/40 border-l-4 border-l-transparent"
                        }`}
                      >
                        {/* # Index */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500 group-hover:text-slate-300">
                          {stock.id}
                        </td>

                        {/* Asset Name + Logo / Icon */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0">
                              {stock.ticker.slice(0, 2)}
                            </div>
                            <div className="font-sans leading-tight">
                              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                <span>{stock.name}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-normal block truncate max-w-[220px]">
                                {stock.industry}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Ticker */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-white text-sm">{stock.ticker}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold">
                              {stock.exchange}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider font-sans ${categoryBadge.bg}`}
                          >
                            {categoryBadge.label}
                          </span>
                        </td>

                        {/* Last Price */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-black text-white text-sm">
                            {stock.price.toLocaleString("vi-VN")} đ
                          </span>
                        </td>

                        {/* Change 24h */}
                        <td className="py-3.5 px-4 text-right">
                          <div
                            className={`inline-flex items-center gap-1 font-bold ${
                              isPositive ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {isPositive ? "+" : ""}
                              {stock.changePct.toFixed(2)}%
                            </span>
                          </div>
                        </td>

                        {/* Volume 24H */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold text-slate-100 flex items-center justify-end gap-1.5">
                            <BarChart2 className="w-3.5 h-3.5 text-cyan-400 opacity-70" />
                            <span>{stock.volume24h}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            TB 20P: {(stock.volume20d / 1000000).toFixed(1)}M
                          </div>
                        </td>

                        {/* Value 24H */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold font-mono-num text-yellow-400">
                            {stock.value24h}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            Vốn hóa: {stock.marketCap.toLocaleString("vi-VN")} Tỷ
                          </div>
                        </td>

                        {/* 52W Range */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 min-w-[140px]">
                            <div className="flex items-center justify-between text-[10px] font-medium">
                              <span className="text-red-400 font-semibold">
                                ▼ {stock.low52w.toLocaleString("vi-VN")}
                              </span>
                              <span className="text-emerald-400 font-semibold">
                                ▲ {stock.high52w.toLocaleString("vi-VN")}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400 rounded-full"
                                style={{ width: `${currentPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Macro Trend 52W Sparkline */}
                        <td className="py-3.5 px-4 text-center">
                          {renderLongTermSparkline(stock)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Star Favorite */}
                            <button
                              onClick={(e) => toggleFavorite(stock.ticker, e)}
                              className={`p-1.5 rounded-lg transition-all ${
                                isFav
                                  ? "text-yellow-400 hover:text-yellow-300"
                                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                              }`}
                              title={isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                            >
                              <Star className={`w-4 h-4 ${isFav ? "fill-yellow-400" : ""}`} />
                            </button>

                            {/* Details Modal Trigger */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStockForModal(stock);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all"
                              title="Xem hồ sơ & chỉ số chi tiết"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {/* Expand / Collapse Chevron */}
                            <button
                              onClick={(e) => toggleRowExpand(stock.ticker, e)}
                              className={`p-1.5 rounded-lg transition-all ${
                                isExpanded
                                  ? "bg-cyan-500/20 text-cyan-300"
                                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                              }`}
                              title={isExpanded ? "Đóng biểu đồ" : "Mở biểu đồ nến"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Chart Accordion Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={11} className="p-0 bg-[#090e1a]">
                            <ExpandedRowChart
                              stock={stock}
                              onOpenFullAnalysis={onSelectTickerForFullView}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: FULL STOCK FUNDAMENTAL PROFILE (When clicking 📄 Details) */}
      {selectedStockForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b101e] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedStockForModal(null)}
              className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center font-black text-lg text-slate-950 shadow-lg">
                {selectedStockForModal.ticker}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  {selectedStockForModal.name} ({selectedStockForModal.ticker})
                </h3>
                <p className="text-xs text-slate-400">
                  Sàn {selectedStockForModal.exchange} • {selectedStockForModal.industry}
                </p>
              </div>
            </div>

            {/* Price Banner */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">Giá Thị Trường (VND)</div>
                <div className="text-2xl font-black font-mono-num text-white">
                  {selectedStockForModal.price.toLocaleString("vi-VN")} đ
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Thay đổi 24h</div>
                <div
                  className={`text-lg font-bold font-mono-num ${
                    selectedStockForModal.change >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {selectedStockForModal.change >= 0 ? "+" : ""}
                  {selectedStockForModal.change.toLocaleString("vi-VN")} ({selectedStockForModal.changePct >= 0 ? "+" : ""}
                  {selectedStockForModal.changePct.toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Detailed Financial Ratios Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 block text-[10px]">P/E (Hệ số giá/LN)</span>
                <span className="font-mono-num font-bold text-base text-cyan-400">
                  {selectedStockForModal.pe}x
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 block text-[10px]">P/B (Giá/Giá trị sổ sách)</span>
                <span className="font-mono-num font-bold text-base text-cyan-400">
                  {selectedStockForModal.pb}x
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 block text-[10px]">ROE (Sinh lời VCSH)</span>
                <span className="font-mono-num font-bold text-base text-emerald-400">
                  {selectedStockForModal.roe}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 block text-[10px]">ROA (Sinh lời tài sản)</span>
                <span className="font-mono-num font-bold text-base text-emerald-400">
                  {selectedStockForModal.roa}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 block text-[10px]">EPS Cơ bản</span>
                <span className="font-mono-num font-bold text-base text-white">
                  {selectedStockForModal.eps.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 block text-[10px]">BVPS Sổ sách</span>
                <span className="font-mono-num font-bold text-base text-white">
                  {selectedStockForModal.bvps.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 block text-[10px]">Tăng trưởng DT YoY</span>
                <span className="font-mono-num font-bold text-base text-emerald-400">
                  +{selectedStockForModal.revenueGrowthYoY}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-500 block text-[10px]">Tăng trưởng LN YoY</span>
                <span className="font-mono-num font-bold text-base text-emerald-400">
                  +{selectedStockForModal.profitGrowthYoY}%
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedStockForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const ticker = selectedStockForModal.ticker;
                  setSelectedStockForModal(null);
                  setExpandedTickers((prev) => {
                    const next = new Set(prev);
                    next.add(ticker);
                    return next;
                  });
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black shadow-lg glow-emerald"
              >
                Xem Biểu Đồ Nến
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
