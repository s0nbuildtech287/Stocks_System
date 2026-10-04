"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Calculator,
  Sparkles,
  Building2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Scale,
  DollarSign,
  Activity,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { VIETNAM_STOCKS } from "@/lib/stockData";

export default function ValuationView({ selectedTicker = "FPT" }: { selectedTicker?: string }) {
  const [activeTicker, setActiveTicker] = useState<string>(selectedTicker);
  const [valuationModel, setValuationModel] = useState<"DDM" | "MULTIPLES" | "GRAHAM" | "COMPOSITE">("COMPOSITE");

  // Live quotes state
  const [liveQuotes, setLiveQuotes] = useState<Record<string, any>>({});
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  // Model Parameters
  const [rf, setRf] = useState<number>(2.85); // 2.85% TPCP 10Y
  const [beta, setBeta] = useState<number>(1.08);
  const [erp, setErp] = useState<number>(8.0); // 8% Equity Risk Premium
  const [d0, setD0] = useState<number>(2500); // Dividend in VND
  const [g, setG] = useState<number>(5.0); // Long-term growth 5%

  // Multiples parameters
  const [targetPe, setTargetPe] = useState<number>(18.0);
  const [targetPb, setTargetPb] = useState<number>(2.5);

  useEffect(() => {
    const fetchLiveQuotes = async () => {
      setIsLiveLoading(true);
      try {
        const res = await fetch("/api/quotes/live");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.quotes) {
            const map: Record<string, any> = {};
            data.quotes.forEach((q: any) => {
              map[q.ticker] = q;
            });
            setLiveQuotes(map);
          }
        }
      } catch (e) {
        console.error("Failed to fetch live quotes for valuation:", e);
      } finally {
        setIsLiveLoading(false);
      }
    };

    fetchLiveQuotes();
  }, []);

  const stockInfo = useMemo(() => {
    return VIETNAM_STOCKS.find((s) => s.ticker === activeTicker) || VIETNAM_STOCKS[0];
  }, [activeTicker]);

  // Current real market price (live from vnstock if available, fallback to static)
  const currentLivePrice = useMemo(() => {
    const live = liveQuotes[activeTicker];
    return live && live.price > 0 ? live.price : stockInfo.price;
  }, [liveQuotes, activeTicker, stockInfo]);

  // Estimated EPS and BVPS
  const eps = useMemo(() => {
    return stockInfo.pe > 0 ? Math.round(currentLivePrice / stockInfo.pe) : 2500;
  }, [currentLivePrice, stockInfo.pe]);

  const bvps = useMemo(() => {
    return stockInfo.pb > 0 ? Math.round(currentLivePrice / stockInfo.pb) : 15000;
  }, [currentLivePrice, stockInfo.pb]);

  // When activeTicker changes, update initial parameters
  const handleStockChange = (ticker: string) => {
    setActiveTicker(ticker);
    const stock = VIETNAM_STOCKS.find((s) => s.ticker === ticker);
    if (stock) {
      setBeta(stock.beta1y);
      const liveP = liveQuotes[ticker]?.price || stock.price;
      const estimatedD0 = Math.round((liveP * stock.dividendYield) / 100) || (stock.dividendYield > 0 ? Math.round(stock.dividendYield * 300) : 1500);
      setD0(estimatedD0 > 0 ? estimatedD0 : 1200);
      setTargetPe(Math.round(stock.pe * 1.05 * 10) / 10 || 15.0);
      setTargetPb(Math.round(stock.pb * 1.0 * 10) / 10 || 2.0);
    }
  };

  // 1. CAPM & Gordon DDM Calculation
  const r = rf + beta * erp; // Discount rate %
  const rDecimal = r / 100;
  const gDecimal = g / 100;
  const isInvalidDDM = gDecimal >= rDecimal;
  const ddmValue = isInvalidDDM ? 0 : Math.round((d0 * (1 + gDecimal)) / (rDecimal - gDecimal));

  // 2. Multiples Valuations
  const peValue = Math.round(eps * targetPe);
  const pbValue = Math.round(bvps * targetPb);
  const multiplesValue = Math.round((peValue + pbValue) / 2);

  // 3. Graham Number: V = sqrt(22.5 * EPS * BVPS)
  const grahamValue = eps > 0 && bvps > 0 ? Math.round(Math.sqrt(22.5 * eps * bvps)) : 0;

  // 4. Composite Weighted Fair Value
  const compositeFairValue = useMemo(() => {
    const validModels: { val: number; weight: number }[] = [];
    if (ddmValue > 0) validModels.push({ val: ddmValue, weight: 0.35 });
    if (peValue > 0) validModels.push({ val: peValue, weight: 0.30 });
    if (pbValue > 0) validModels.push({ val: pbValue, weight: 0.20 });
    if (grahamValue > 0) validModels.push({ val: grahamValue, weight: 0.15 });

    if (!validModels.length) return currentLivePrice;
    const totalWeight = validModels.reduce((acc, m) => acc + m.weight, 0);
    const weightedSum = validModels.reduce((acc, m) => acc + m.val * m.weight, 0);
    return Math.round(weightedSum / totalWeight);
  }, [ddmValue, peValue, pbValue, grahamValue, currentLivePrice]);

  // Selected Fair Value for display
  const activeFairValue = useMemo(() => {
    switch (valuationModel) {
      case "DDM":
        return ddmValue;
      case "MULTIPLES":
        return multiplesValue;
      case "GRAHAM":
        return grahamValue;
      case "COMPOSITE":
      default:
        return compositeFairValue;
    }
  }, [valuationModel, ddmValue, multiplesValue, grahamValue, compositeFairValue]);

  const upsidePct = activeFairValue > 0 ? ((activeFairValue - currentLivePrice) / currentLivePrice) * 100 : 0;

  // Sensitivity Matrix for DDM
  const sensitivityR = [r - 2, r - 1, r, r + 1, r + 2];
  const sensitivityG = [g - 2, g - 1, g, g + 1, g + 2];

  return (
    <div className="space-y-6">
      {/* Top Header & Stock Selector */}
      <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                <Calculator className="w-3.5 h-3.5 text-[#F0B90B]" /> Trung tâm Định giá Định lượng Đa mô hình
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#181A20] text-[#0ECB81] border border-[#0ECB81]/30">
                <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
                vnstock Live Data
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Định giá Giá trị Nội tại &amp; Phân tích Biên An toàn
            </h2>
            <p className="text-xs text-[#848E9C] mt-1">
              Tính toán định giá theo Gordon DDM, CAPM Cost of Equity, P/E &amp; P/B Multiples và Chỉ số Graham
            </p>
          </div>

          {/* Quick Stock Switcher Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#848E9C]">Chọn cổ phiếu:</span>
            <select
              value={activeTicker}
              onChange={(e) => handleStockChange(e.target.value)}
              className="bg-[#0B0E11] border border-[#2B313A] rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#F0B90B] shadow-md"
            >
              {VIETNAM_STOCKS.map((s) => {
                const liveP = liveQuotes[s.ticker]?.price || s.price;
                return (
                  <option key={s.ticker} value={s.ticker}>
                    {s.ticker} - {s.name} ({liveP.toLocaleString("vi-VN")} đ)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Model Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-[#2B313A]">
          {[
            { id: "COMPOSITE", label: "🎯 Định giá Tổng hợp (Composite Fair Value)", icon: Sparkles },
            { id: "DDM", label: "💵 Chiết khấu Cổ tức (Gordon DDM + CAPM)", icon: DollarSign },
            { id: "MULTIPLES", label: "📊 Bội số P/E & P/B Ngành", icon: BarChart3 },
            { id: "GRAHAM", label: "🏛️ Chỉ số Benjamin Graham", icon: Scale },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setValuationModel(m.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  valuationModel === m.id
                    ? "bg-[#F0B90B] text-black border-[#F0B90B] shadow-md shadow-yellow-500/20 font-black"
                    : "bg-[#181A20] text-[#848E9C] border-[#2B313A] hover:text-white hover:border-[#F0B90B]/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Inputs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2 border-t border-slate-800">
          <div className="p-4 rounded-xl glass-card border border-white/5 space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold block">Lãi suất phi rủi ro (rf)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.05"
                value={rf}
                onChange={(e) => setRf(Number(e.target.value))}
                className="w-full bg-slate-900 text-white font-mono-num font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 text-sm focus:outline-none focus:border-yellow-500"
              />
              <span className="text-xs text-slate-400 font-bold">%</span>
            </div>
            <span className="text-[10px] text-slate-500 block">TPCP 10 Năm Việt Nam</span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-white/5 space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold block">Hệ số Beta (β)</label>
            <input
              type="number"
              step="0.05"
              value={beta}
              onChange={(e) => setBeta(Number(e.target.value))}
              className="w-full bg-slate-900 text-white font-mono-num font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 text-sm focus:outline-none focus:border-yellow-500"
            />
            <span className="text-[10px] text-slate-500 block">Hồi quy 1Y vs VN-Index ({stockInfo.ticker})</span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-white/5 space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold block">Cổ tức tiền mặt (D0)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="100"
                value={d0}
                onChange={(e) => setD0(Number(e.target.value))}
                className="w-full bg-slate-900 text-white font-mono-num font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 text-sm focus:outline-none focus:border-yellow-500"
              />
              <span className="text-xs text-slate-400 font-bold">đ</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Cổ tức tiền/cp hàng năm</span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-white/5 space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold block">Tăng trưởng dài hạn (g)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.5"
                value={g}
                onChange={(e) => setG(Number(e.target.value))}
                className="w-full bg-slate-900 text-white font-mono-num font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 text-sm focus:outline-none focus:border-yellow-500"
              />
              <span className="text-xs text-slate-400 font-bold">%</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Tăng trưởng bền vững sau 5Y</span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-white/5 space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold block">Target P/E &amp; P/B</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.5"
                value={targetPe}
                onChange={(e) => setTargetPe(Number(e.target.value))}
                className="w-full bg-slate-900 text-white font-mono-num font-bold px-2 py-1.5 rounded-lg border border-slate-700 text-xs focus:outline-none focus:border-yellow-500"
                placeholder="P/E"
              />
              <input
                type="number"
                step="0.1"
                value={targetPb}
                onChange={(e) => setTargetPb(Number(e.target.value))}
                className="w-full bg-slate-900 text-white font-mono-num font-bold px-2 py-1.5 rounded-lg border border-slate-700 text-xs focus:outline-none focus:border-yellow-500"
                placeholder="P/B"
              />
            </div>
            <span className="text-[10px] text-slate-500 block">Bội số mục tiêu ngành</span>
          </div>
        </div>

        {/* Big Valuation Results Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Chi phí vốn cổ phần CAPM (r)
            </span>
            <div className="text-3xl font-black text-cyan-400 font-mono-num mt-1">
              {r.toFixed(2)}%
            </div>
            <span className="text-[11px] text-slate-500 block">
              rf ({rf}%) + β({beta}) × ERP({erp}%)
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Giá thị trường thực tế (vnstock Live)
            </span>
            <div className="text-3xl font-black text-white font-mono-num mt-1">
              {currentLivePrice.toLocaleString("vi-VN")} đ
            </div>
            <span className="text-[11px] text-slate-400 block">
              {stockInfo.ticker} - {stockInfo.name} ({stockInfo.exchange})
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/10 border border-yellow-500/40 space-y-1">
            <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider block">
              Giá trị nội tại định giá ({valuationModel})
            </span>
            <div className="text-3xl font-black text-white font-mono-num mt-1">
              {activeFairValue > 0 ? `${activeFairValue.toLocaleString("vi-VN")} đ` : "Chưa đủ dữ liệu"}
            </div>
            <span className={`text-[11px] font-bold block ${upsidePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {activeFairValue > 0
                ? `Biên an toàn / Upside: ${upsidePct >= 0 ? "+" : ""}${upsidePct.toFixed(1)}%`
                : "Vui lòng điều chỉnh tham số"}
            </span>
          </div>
        </div>

        {/* Breakdown of All 4 Models */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">1. Gordon DDM Model</span>
            <div className="text-lg font-bold text-white font-mono-num">
              {ddmValue > 0 ? `${ddmValue.toLocaleString("vi-VN")} đ` : "N/A"}
            </div>
            <span className="text-[10px] text-slate-500 block">D0*(1+g)/(r-g)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">2. P/E Multiple ({targetPe}x)</span>
            <div className="text-lg font-bold text-white font-mono-num">
              {peValue > 0 ? `${peValue.toLocaleString("vi-VN")} đ` : "N/A"}
            </div>
            <span className="text-[10px] text-slate-500 block">EPS {eps.toLocaleString()}đ × {targetPe}x</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">3. P/B Multiple ({targetPb}x)</span>
            <div className="text-lg font-bold text-white font-mono-num">
              {pbValue > 0 ? `${pbValue.toLocaleString("vi-VN")} đ` : "N/A"}
            </div>
            <span className="text-[10px] text-slate-500 block">BVPS {bvps.toLocaleString()}đ × {targetPb}x</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">4. Graham Number</span>
            <div className="text-lg font-bold text-white font-mono-num">
              {grahamValue > 0 ? `${grahamValue.toLocaleString("vi-VN")} đ` : "N/A"}
            </div>
            <span className="text-[10px] text-slate-500 block">√(22.5 × EPS × BVPS)</span>
          </div>
        </div>

        {/* Interactive Sensitivity Matrix Table for DDM */}
        {!isInvalidDDM && (
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Ma trận Độ nhạy Định giá theo Chi phí vốn (r) &amp; Tăng trưởng (g)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3 bg-slate-950 text-slate-400 border-r border-slate-800">r \ g</th>
                    {sensitivityG.map((gVal) => (
                      <th key={gVal} className="p-3">
                        {gVal.toFixed(1)}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-num">
                  {sensitivityR.map((rVal) => (
                    <tr key={rVal} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-bold bg-slate-950/80 text-slate-300 border-r border-slate-800">
                        {rVal.toFixed(1)}%
                      </td>
                      {sensitivityG.map((gVal) => {
                        const cellR = rVal / 100;
                        const cellG = gVal / 100;
                        const val = cellG >= cellR ? null : Math.round((d0 * (1 + cellG)) / (cellR - cellG));
                        const isBase = Math.abs(rVal - r) < 0.01 && Math.abs(gVal - g) < 0.01;

                        return (
                          <td
                            key={gVal}
                            className={`p-3 font-semibold ${
                              isBase
                                ? "bg-yellow-500/20 text-yellow-300 font-black border-2 border-yellow-500/50"
                                : val
                                ? val >= currentLivePrice
                                  ? "text-emerald-400"
                                  : "text-slate-300"
                                : "text-slate-600"
                            }`}
                          >
                            {val ? `${val.toLocaleString("vi-VN")} đ` : "N/A"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Disclaimer & Academic Warning */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4" /> Quy ước Phương pháp luận &amp; Giả định Nghiên cứu
          </div>
          <ul className="list-disc list-inside space-y-1 leading-relaxed text-[11px]">
            <li>Mọi dữ liệu giá thị trường được đồng bộ trực tiếp từ vnstock theo thời gian thực.</li>
            <li>Các mô hình định giá định lượng mang tính chất tham khảo học thuật dựa trên dữ liệu quá khứ và giả định chiết khấu dòng tiền.</li>
            <li>Luôn kết hợp phân tích định tính về lợi thế cạnh tranh doanh nghiệp (Moat) và chu kỳ kinh tế trước khi đưa ra quyết định.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
