"use client";

import React, { useState } from "react";
import { AlertTriangle, Calculator, Sparkles, Building2, TrendingUp, ShieldCheck, CheckCircle2 } from "lucide-react";
import { VIETNAM_STOCKS } from "@/lib/stockData";

export default function ValuationView({ selectedTicker = "FPT" }: { selectedTicker?: string }) {
  const [activeTicker, setActiveTicker] = useState<string>(selectedTicker);
  const [rf, setRf] = useState<number>(2.85); // 2.85%
  const [beta, setBeta] = useState<number>(1.08);
  const [erp, setErp] = useState<number>(8.0); // 8%
  const [d0, setD0] = useState<number>(2500); // 2500 VND
  const [g, setG] = useState<number>(5.0); // 5%

  const handleStockChange = (ticker: string) => {
    setActiveTicker(ticker);
    const stock = VIETNAM_STOCKS.find((s) => s.ticker === ticker);
    if (stock) {
      setBeta(stock.beta1y);
      // Estimate cash dividend based on dividend yield
      const estimatedD0 = Math.round((stock.price * stock.dividendYield) / 100) || 1500;
      setD0(estimatedD0);
    }
  };

  // CAPM: r = rf + beta * erp
  const r = rf + beta * erp; // in %
  const rDecimal = r / 100;
  const gDecimal = g / 100;

  // Gordon DDM: P = D0*(1+g) / (r - g)
  const isInvalid = gDecimal >= rDecimal;
  const baseValue = isInvalid
    ? 0
    : Math.round((d0 * (1 + gDecimal)) / (rDecimal - gDecimal));

  const stockInfo = VIETNAM_STOCKS.find((s) => s.ticker === activeTicker) || VIETNAM_STOCKS[0];
  const marketPrice = stockInfo.price;
  const upsidePct = baseValue > 0 ? ((baseValue - marketPrice) / marketPrice) * 100 : 0;

  const sensitivityR = [r - 2, r - 1, r, r + 1, r + 2];
  const sensitivityG = [g - 2, g - 1, g, g + 1, g + 2];

  return (
    <div className="space-y-6">
      {/* Top Header & Stock Selector */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 mb-2">
              <Calculator className="w-3.5 h-3.5 text-yellow-400" /> Mô hình Định lượng DDM &amp; CAPM
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Định giá Chiết khấu Cổ tức &amp; Chi phí Vốn
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Phân tích độ nhạy đa kịch bản với hệ số rủi ro thực tế trên thị trường Việt Nam
            </p>
          </div>

          {/* Quick Stock Switcher Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Chọn cổ phiếu:</span>
            <select
              value={activeTicker}
              onChange={(e) => handleStockChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-yellow-500 shadow-md"
            >
              {VIETNAM_STOCKS.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker} - {s.name} ({s.price.toLocaleString("vi-VN")} đ)
                </option>
              ))}
            </select>
          </div>
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
            <span className="text-[10px] text-slate-500 block">Hồi quy 1 năm vs VN-Index</span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-white/5 space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold block">Phần bù rủi ro (ERP)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.5"
                value={erp}
                onChange={(e) => setErp(Number(e.target.value))}
                className="w-full bg-slate-900 text-white font-mono-num font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 text-sm focus:outline-none focus:border-yellow-500"
              />
              <span className="text-xs text-slate-400 font-bold">%</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Giả định thị trường VN</span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-white/5 space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold block">Cổ tức tiền gần nhất (D0)</label>
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
            <span className="text-[10px] text-slate-500 block">VNĐ / Cổ phiếu</span>
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
            <span className="text-[10px] text-slate-500 block">Tốc độ tăng trưởng bền vững</span>
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
              Giá thị trường hiện tại
            </span>
            <div className="text-3xl font-black text-white font-mono-num mt-1">
              {marketPrice.toLocaleString("vi-VN")} đ
            </div>
            <span className="text-[11px] text-slate-500 block">
              {stockInfo.ticker} ({stockInfo.exchange})
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/10 border border-yellow-500/40 space-y-1">
            <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider block">
              Giá trị nội tại ước tính (DDM)
            </span>
            <div className="text-3xl font-black text-white font-mono-num mt-1">
              {isInvalid ? "Không hợp lệ (g ≥ r)" : `${baseValue.toLocaleString("vi-VN")} đ`}
            </div>
            <span className={`text-[11px] font-bold block ${upsidePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {isInvalid ? "Vui lòng điều chỉnh g < r" : `Biên an toàn / Upside: ${upsidePct >= 0 ? "+" : ""}${upsidePct.toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* Multi-Scenario Cards */}
        {!isInvalid && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl glass-card border border-white/5 space-y-1">
              <span className="text-xs font-bold text-slate-400">Kịch bản Thận trọng</span>
              <div className="text-xl font-bold text-slate-200 font-mono-num">
                {Math.round((d0 * (1 + (g - 1) / 100)) / ((r + 1) / 100 - (g - 1) / 100)).toLocaleString("vi-VN")} đ
              </div>
              <span className="text-[11px] text-slate-500 block">r = {(r + 1).toFixed(1)}%, g = {(g - 1).toFixed(1)}%</span>
            </div>

            <div className="p-4 rounded-xl glass-card border border-yellow-500/30 space-y-1 bg-yellow-500/5">
              <span className="text-xs font-bold text-yellow-400">Kịch bản Cơ sở (Base)</span>
              <div className="text-xl font-black text-yellow-300 font-mono-num">
                {baseValue.toLocaleString("vi-VN")} đ
              </div>
              <span className="text-[11px] text-slate-400 block">r = {r.toFixed(1)}%, g = {g.toFixed(1)}%</span>
            </div>

            <div className="p-4 rounded-xl glass-card border border-white/5 space-y-1">
              <span className="text-xs font-bold text-emerald-400">Kịch bản Lạc quan</span>
              <div className="text-xl font-bold text-emerald-300 font-mono-num">
                {Math.round((d0 * (1 + (g + 0.5) / 100)) / ((r - 0.5) / 100 - (g + 0.5) / 100)).toLocaleString("vi-VN")} đ
              </div>
              <span className="text-[11px] text-slate-500 block">r = {(r - 0.5).toFixed(1)}%, g = {(g + 0.5).toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Interactive Sensitivity Matrix Table */}
        {!isInvalid && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Ma trận Độ nhạy Định giá theo Chi phí vốn (r) &amp; Tăng trưởng (g)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 bg-slate-950 text-slate-400 border-r border-slate-800">r \ g</th>
                    {sensitivityG.map((gVal) => (
                      <th key={gVal} className="p-3.5">
                        {gVal.toFixed(1)}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-num">
                  {sensitivityR.map((rVal) => (
                    <tr key={rVal} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold bg-slate-950/80 text-slate-300 border-r border-slate-800">
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
                            className={`p-3.5 font-semibold ${
                              isBase
                                ? "bg-yellow-500/20 text-yellow-300 font-black border-2 border-yellow-500/50"
                                : val
                                ? val >= marketPrice
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

        {/* Disclaimer & Warnings */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4" /> Lưu ý phương pháp luận &amp; Giả định
          </div>
          <ul className="list-disc list-inside space-y-1 leading-relaxed">
            <li>Mô hình chiết khấu cổ tức (DDM) phù hợp nhất với các doanh nghiệp chi trả cổ tức tiền mặt bền vững (như VNM, FPT, REE, Ngân hàng...).</li>
            <li>Đối với các doanh nghiệp giữ lại toàn bộ lợi nhuận để tái đầu tư, nên kết hợp thêm góc nhìn định giá tương đối (P/E, P/B so với trung vị ngành).</li>
            <li>Mọi kết quả tính toán đều dựa trên giả định học tập cá nhân, tuyệt đối không phải khuyến nghị đầu tư.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
