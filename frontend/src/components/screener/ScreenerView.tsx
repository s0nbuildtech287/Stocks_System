"use client";

import React, { useState, useMemo } from "react";
import {
  Filter,
  Search,
  Download,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Check,
  Building2,
  BarChart3,
  Layers,
  Flame,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { VIETNAM_STOCKS, StockProfile } from "@/lib/stockData";

type SortKey = keyof StockProfile;

export default function ScreenerView({ onSelectTicker }: { onSelectTicker?: (ticker: string) => void }) {
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExchange, setSelectedExchange] = useState<string>("ALL");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [minRoe, setMinRoe] = useState<number>(10);
  const [maxPe, setMaxPe] = useState<number>(25);
  const [minMarketCap, setMinMarketCap] = useState<number>(0); // in Billion VND
  const [minValue20d, setMinValue20d] = useState<number>(0);   // in Billion VND
  const [minDivYield, setMinDivYield] = useState<number>(0);   // in %
  const [minProfitGrowth, setMinProfitGrowth] = useState<number>(-50); // in %

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("value20d");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Presets definition
  const presets = [
    {
      id: "growth",
      name: "🚀 Siêu Tăng trưởng (ROE > 20%, LNST > 20%)",
      desc: "Doanh nghiệp sinh lời vượt trội & tăng trưởng lợi nhuận 2 chữ số",
      apply: () => {
        setMinRoe(20);
        setMaxPe(25);
        setMinProfitGrowth(20);
        setMinMarketCap(10000);
        setMinDivYield(0);
        setMinValue20d(50);
        setSelectedIndustry("ALL");
        setSelectedExchange("ALL");
      },
    },
    {
      id: "value",
      name: "💎 Giá trị & Rẻ (P/E < 10, P/B < 1.5, ROE > 15%)",
      desc: "Cổ phiếu định giá chiết khấu sâu với nền tảng tài chính lành mạnh",
      apply: () => {
        setMinRoe(15);
        setMaxPe(10);
        setMinProfitGrowth(0);
        setMinMarketCap(5000);
        setMinDivYield(0);
        setMinValue20d(20);
        setSelectedIndustry("ALL");
        setSelectedExchange("ALL");
      },
    },
    {
      id: "dividend",
      name: "💰 Cổ tức tiền mặt cao (> 3.5%)",
      desc: "Doanh nghiệp trả cổ tức tiền mặt đều đặn, dòng tiền vững vàng",
      apply: () => {
        setMinRoe(12);
        setMaxPe(20);
        setMinDivYield(3.5);
        setMinProfitGrowth(-20);
        setMinMarketCap(0);
        setMinValue20d(0);
        setSelectedIndustry("ALL");
        setSelectedExchange("ALL");
      },
    },
    {
      id: "liquidity",
      name: "🌊 Thanh khoản khủng (Khớp lệnh > 200 Tỷ/phiên)",
      desc: "Dòng tiền lớn, phù hợp giải ngân quy mô lớn không lo trượt giá",
      apply: () => {
        setMinRoe(0);
        setMaxPe(40);
        setMinProfitGrowth(-50);
        setMinMarketCap(20000);
        setMinDivYield(0);
        setMinValue20d(200);
        setSelectedIndustry("ALL");
        setSelectedExchange("ALL");
      },
    },
  ];

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedExchange("ALL");
    setSelectedIndustry("ALL");
    setMinRoe(0);
    setMaxPe(40);
    setMinMarketCap(0);
    setMinValue20d(0);
    setMinDivYield(0);
    setMinProfitGrowth(-50);
  };

  // Filter & Sort Logic
  const filteredStocks = useMemo(() => {
    return VIETNAM_STOCKS.filter((stock) => {
      // Search
      if (
        searchQuery &&
        !stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Exchange
      if (selectedExchange !== "ALL" && stock.exchange !== selectedExchange) {
        return false;
      }
      // Industry
      if (selectedIndustry !== "ALL" && stock.industryGroup !== selectedIndustry) {
        return false;
      }
      // Numerical sliders
      if (stock.roe < minRoe) return false;
      if (stock.pe > maxPe) return false;
      if (stock.marketCap < minMarketCap) return false;
      if (stock.value20d < minValue20d) return false;
      if (stock.dividendYield < minDivYield) return false;
      if (stock.profitGrowthYoY < minProfitGrowth) return false;

      return true;
    }).sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return sortOrder === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [
    searchQuery,
    selectedExchange,
    selectedIndustry,
    minRoe,
    maxPe,
    minMarketCap,
    minValue20d,
    minDivYield,
    minProfitGrowth,
    sortKey,
    sortOrder,
  ]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  // Summary Metrics
  const avgRoe = useMemo(() => {
    if (!filteredStocks.length) return 0;
    return filteredStocks.reduce((acc, s) => acc + s.roe, 0) / filteredStocks.length;
  }, [filteredStocks]);

  const medianPe = useMemo(() => {
    if (!filteredStocks.length) return 0;
    const sorted = [...filteredStocks].map((s) => s.pe).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }, [filteredStocks]);

  const totalMarketCap = useMemo(() => {
    return filteredStocks.reduce((acc, s) => acc + s.marketCap, 0);
  }, [filteredStocks]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Presets */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Flame className="w-3.5 h-3.5 text-emerald-400" /> Hệ thống Lọc Cổ phiếu Chuyên sâu
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Screener Đa Chiều &amp; Xếp Hạng Định Lượng
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Dữ liệu Point-in-time cuối ngày, chuẩn hóa 100% theo quy ước tài chính thị trường Việt Nam
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={p.apply}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 hover:border-emerald-500/40 hover:text-emerald-300 transition-all shadow-sm flex items-center gap-1.5"
                title={p.desc}
              >
                <span>{p.name.split(" ")[0]}</span>
                <span className="hidden sm:inline">{p.name.split(" ").slice(1).join(" ")}</span>
              </button>
            ))}

            <button
              onClick={resetFilters}
              className="p-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-2 border-t border-slate-800/80 relative z-10">
          {/* Search bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" /> Tìm kiếm Mã / Tên
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="VD: FPT, HPG, Thế Giới Di Động..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sàn giao dịch */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Sàn giao dịch</label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl">
              {["ALL", "HOSE", "HNX", "UPCOM"].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setSelectedExchange(ex)}
                  className={`py-1 rounded-lg text-[11px] font-bold transition-all text-center ${
                    selectedExchange === ex
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* ROE Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">ROE TTM tối thiểu</span>
              <span className="font-mono-num font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                &ge; {minRoe}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={minRoe}
              onChange={(e) => setMinRoe(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* P/E Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">P/E TTM tối đa</span>
              <span className="font-mono-num font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                &le; {maxPe}x
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={maxPe}
              onChange={(e) => setMaxPe(Number(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Giá trị GD 20D */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Thanh khoản (20D Value)</span>
              <span className="font-mono-num font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                &ge; {minValue20d} Tỷ
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={minValue20d}
              onChange={(e) => setMinValue20d(Number(e.target.value))}
              className="w-full accent-yellow-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Cổ tức tiền mặt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Tỷ suất Cổ tức (Div Yield)</span>
              <span className="font-mono-num font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                &ge; {minDivYield}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={minDivYield}
              onChange={(e) => setMinDivYield(Number(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Tăng trưởng LNST YoY */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Tăng trưởng LNST YoY</span>
              <span className="font-mono-num font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                &ge; {minProfitGrowth}%
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="100"
              step="5"
              value={minProfitGrowth}
              onChange={(e) => setMinProfitGrowth(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Vốn hóa tối thiểu */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Vốn hóa tối thiểu</span>
              <span className="font-mono-num font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                &ge; {minMarketCap ? `${(minMarketCap / 1000).toFixed(0)}k Tỷ` : "Tất cả"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="5000"
              value={minMarketCap}
              onChange={(e) => setMinMarketCap(Number(e.target.value))}
              className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Industry Group Filter Pills */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Ngành:
          </span>
          {[
            { id: "ALL", label: "Tất cả ngành" },
            { id: "BANK", label: "🏦 Ngân hàng" },
            { id: "SECURITIES", label: "📈 Chứng khoán" },
            { id: "TECHNOLOGY", label: "💻 Công nghệ" },
            { id: "RETAIL", label: "🛒 Bán lẻ" },
            { id: "STEEL", label: "🏗️ Thép" },
            { id: "REALESTATE", label: "🏢 Bất động sản" },
            { id: "ENERGY", label: "⚡ Dầu khí & Điện" },
            { id: "LOGISTICS", label: "🚢 Cảng biển & Vận tải" },
            { id: "CONSUMER", label: "🥛 Hàng tiêu dùng" },
            { id: "MATERIALS", label: "🧪 Hóa chất" },
          ].map((ind) => (
            <button
              key={ind.id}
              onClick={() => setSelectedIndustry(ind.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all border ${
                selectedIndustry === ind.id
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card border border-white/5">
          <span className="text-xs text-slate-400 font-medium">Số mã thỏa mãn</span>
          <div className="text-2xl font-black text-white mt-1 font-mono-num">
            {filteredStocks.length}{" "}
            <span className="text-xs text-slate-500 font-normal">/ {VIETNAM_STOCKS.length} mã</span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-white/5">
          <span className="text-xs text-slate-400 font-medium">ROE TTM Trung bình</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono-num">
            {avgRoe.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-white/5">
          <span className="text-xs text-slate-400 font-medium">P/E Trung vị</span>
          <div className="text-2xl font-black text-cyan-400 mt-1 font-mono-num">
            {medianPe.toFixed(1)}x
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-white/5">
          <span className="text-xs text-slate-400 font-medium">Tổng vốn hóa lọc</span>
          <div className="text-2xl font-black text-blue-400 mt-1 font-mono-num">
            {(totalMarketCap / 1000).toFixed(0)}k Tỷ
          </div>
        </div>
      </div>

      {/* Main Screener Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Hiển thị <strong>{filteredStocks.length}</strong> cổ phiếu được chọn lọc</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const headers = "Ticker,Name,Exchange,Price,ChangePct,PE,PB,ROE,ProfitGrowth,MarketCap\n";
                const rows = filteredStocks
                  .map((s) => `${s.ticker},"${s.name}",${s.exchange},${s.price},${s.changePct},${s.pe},${s.pb},${s.roe},${s.profitGrowthYoY},${s.marketCap}`)
                  .join("\n");
                const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `screener_stocks_${new Date().toISOString().split("T")[0]}.csv`;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Xuất Excel / CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th
                  onClick={() => handleSort("ticker")}
                  className="p-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Mã CP {sortKey === "ticker" && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("price")}
                  className="p-3.5 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Giá (VND) {sortKey === "price" && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("changePct")}
                  className="p-3.5 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    +/- % {sortKey === "changePct" && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
                  </div>
                </th>
                <th className="p-3.5 text-center">Xu hướng (7D)</th>
                <th
                  onClick={() => handleSort("pe")}
                  className="p-3.5 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    P/E TTM {sortKey === "pe" && <ArrowUpDown className="w-3 h-3 text-cyan-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("pb")}
                  className="p-3.5 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    P/B {sortKey === "pb" && <ArrowUpDown className="w-3 h-3 text-cyan-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("roe")}
                  className="p-3.5 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    ROE TTM {sortKey === "roe" && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("profitGrowthYoY")}
                  className="p-3.5 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Tăng trưởng LN {sortKey === "profitGrowthYoY" && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("dividendYield")}
                  className="p-3.5 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Cổ tức % {sortKey === "dividendYield" && <ArrowUpDown className="w-3 h-3 text-purple-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("value20d")}
                  className="p-3.5 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    GTGD 20D {sortKey === "value20d" && <ArrowUpDown className="w-3 h-3 text-yellow-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("marketCap")}
                  className="p-3.5 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Vốn hóa {sortKey === "marketCap" && <ArrowUpDown className="w-3 h-3 text-blue-400" />}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredStocks.map((stock) => {
                const isGainer = stock.changePct > 0;
                const isLoser = stock.changePct < 0;

                return (
                  <tr
                    key={stock.ticker}
                    onClick={() => onSelectTicker && onSelectTicker(stock.ticker)}
                    className="hover:bg-slate-800/50 transition-all cursor-pointer group"
                  >
                    {/* Ticker & Name */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm group-hover:text-emerald-400 transition-colors">
                          {stock.ticker}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700/80">
                          {stock.exchange}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5">
                        {stock.name}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-3.5 text-right font-mono-num font-bold text-white text-sm">
                      {stock.price.toLocaleString("vi-VN")}
                    </td>

                    {/* Change % */}
                    <td className="p-3.5 text-right font-mono-num">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-bold text-xs ${
                          isGainer
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : isLoser
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {isGainer ? "+" : ""}
                        {stock.changePct.toFixed(2)}%
                      </span>
                    </td>

                    {/* Sparkline */}
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-end gap-0.5 h-6 w-16 px-1">
                        {stock.sparkline.map((val, idx) => {
                          const min = Math.min(...stock.sparkline);
                          const max = Math.max(...stock.sparkline);
                          const range = max - min || 1;
                          const heightPct = Math.max(20, ((val - min) / range) * 100);
                          return (
                            <div
                              key={idx}
                              style={{ height: `${heightPct}%` }}
                              className={`flex-1 rounded-t-sm ${
                                isGainer ? "bg-emerald-400" : isLoser ? "bg-red-400" : "bg-cyan-400"
                              } opacity-80 group-hover:opacity-100 transition-opacity`}
                            />
                          );
                        })}
                      </div>
                    </td>

                    {/* P/E */}
                    <td className="p-3.5 text-right font-mono-num font-semibold text-slate-200">
                      {stock.pe.toFixed(1)}x
                    </td>

                    {/* P/B */}
                    <td className="p-3.5 text-right font-mono-num text-slate-300">
                      {stock.pb.toFixed(2)}
                    </td>

                    {/* ROE */}
                    <td className="p-3.5 text-right font-mono-num">
                      <span className="font-bold text-emerald-400">{stock.roe.toFixed(1)}%</span>
                      <div className="w-16 h-1 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, (stock.roe / 35) * 100)}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </td>

                    {/* Profit Growth */}
                    <td className="p-3.5 text-right font-mono-num">
                      <span
                        className={`font-semibold ${
                          stock.profitGrowthYoY > 0
                            ? "text-emerald-400"
                            : stock.profitGrowthYoY < 0
                            ? "text-red-400"
                            : "text-slate-400"
                        }`}
                      >
                        {stock.profitGrowthYoY > 0 ? "+" : ""}
                        {stock.profitGrowthYoY.toFixed(1)}%
                      </span>
                    </td>

                    {/* Dividend Yield */}
                    <td className="p-3.5 text-right font-mono-num">
                      {stock.dividendYield > 0 ? (
                        <span className="text-purple-300 font-semibold">{stock.dividendYield.toFixed(1)}%</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* 20D Value */}
                    <td className="p-3.5 text-right font-mono-num font-semibold text-slate-200">
                      {stock.value20d.toFixed(1)} Tỷ
                    </td>

                    {/* Market Cap */}
                    <td className="p-3.5 text-right font-mono-num text-slate-400">
                      {(stock.marketCap / 1000).toFixed(1)}k Tỷ
                    </td>
                  </tr>
                );
              })}

              {filteredStocks.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-slate-500">
                    <Filter className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    Không tìm thấy mã cổ phiếu nào phù hợp với bộ lọc hiện tại.
                    <div className="mt-3">
                      <button
                        onClick={resetFilters}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                      >
                        Đặt lại bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
