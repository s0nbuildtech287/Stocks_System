"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  PlusCircle,
  CheckCircle2,
  History,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { VIETNAM_STOCKS } from "@/lib/stockData";

interface Position {
  ticker: string;
  shares: number;
  availableShares: number;
  avgCost: number;
}

interface TradeOrder {
  id: string;
  timestamp: string;
  ticker: string;
  side: "BUY" | "SELL";
  shares: number;
  price: number;
  totalValue: number;
  fee: number;
  tax: number;
  thesis: string;
}

const INITIAL_CASH = 100_000_000; // 100M VND

export default function PaperTradingView() {
  // Live quotes state
  const [liveQuotes, setLiveQuotes] = useState<Record<string, any>>({});
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  // Portfolio State (with localStorage persistence)
  const [cash, setCash] = useState<number>(INITIAL_CASH);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Form State
  const [ticker, setTicker] = useState("HPG");
  const [quantity, setQuantity] = useState(100);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [thesis, setThesis] = useState("");
  const [orderMessage, setOrderMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCash = localStorage.getItem("ss_paper_cash_v2");
      const savedPositions = localStorage.getItem("ss_paper_positions_v2");
      const savedOrders = localStorage.getItem("ss_paper_orders_v2");

      if (savedCash !== null) setCash(Number(savedCash));
      else setCash(INITIAL_CASH);

      if (savedPositions !== null) setPositions(JSON.parse(savedPositions));
      else setPositions([]);

      if (savedOrders !== null) setOrders(JSON.parse(savedOrders));
      else setOrders([]);
    } catch (e) {
      console.error("Error loading paper trading data:", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("ss_paper_cash_v2", cash.toString());
      localStorage.setItem("ss_paper_positions_v2", JSON.stringify(positions));
      localStorage.setItem("ss_paper_orders_v2", JSON.stringify(orders));
    } catch (e) {
      console.error("Error saving paper trading data:", e);
    }
  }, [cash, positions, orders, isInitialized]);

  // Fetch live quotes from vnstock API
  useEffect(() => {
    const fetchLiveQuotes = async () => {
      setIsLiveLoading(true);
      try {
        const res = await fetch("/api/quotes/live");
        if (res.ok) {
          const json = await res.json();
          if (json && json.data) {
            setLiveQuotes(json.data);
          }
        }
      } catch (e) {
        console.error("Failed to fetch live quotes for paper trading:", e);
      } finally {
        setIsLiveLoading(false);
      }
    };

    fetchLiveQuotes();
  }, []);

  // Get current market price for any ticker
  const getStockPrice = (t: string) => {
    const live = liveQuotes[t];
    if (live && live.price > 0) return live.price;
    const staticStock = VIETNAM_STOCKS.find((s) => s.ticker === t);
    return staticStock ? staticStock.price : 25000;
  };

  const selectedLivePrice = getStockPrice(ticker);

  // Fee calculation: 0.15% brokerage fee + 0.1% tax on sell
  const tradeValue = quantity * selectedLivePrice;
  const brokerageFee = Math.round(tradeValue * 0.0015);
  const sellTax = side === "SELL" ? Math.round(tradeValue * 0.001) : 0;
  const totalOrderCost = side === "BUY" ? tradeValue + brokerageFee : tradeValue - brokerageFee - sellTax;

  // Portfolio calculations
  const totalStockValue = useMemo(() => {
    return positions.reduce((acc, pos) => {
      const p = getStockPrice(pos.ticker);
      return acc + pos.shares * p;
    }, 0);
  }, [positions, liveQuotes]);

  const totalNAV = cash + totalStockValue;
  const totalProfit = totalNAV - INITIAL_CASH;
  const totalProfitPct = (totalProfit / INITIAL_CASH) * 100;

  // Execute Order
  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thesis.trim()) {
      setOrderMessage({ type: "error", text: "Vui lòng nhập luận điểm đầu tư (Thesis) trước khi đặt lệnh!" });
      return;
    }

    if (quantity <= 0 || quantity % 100 !== 0) {
      setOrderMessage({ type: "error", text: "Khối lượng phải là bội số của 100 (quy định sàn HSX/HNX)!" });
      return;
    }

    const currentPrice = selectedLivePrice;
    const grossValue = quantity * currentPrice;
    const fee = Math.round(grossValue * 0.0015);
    const tax = side === "SELL" ? Math.round(grossValue * 0.001) : 0;

    if (side === "BUY") {
      const totalCost = grossValue + fee;
      if (cash < totalCost) {
        setOrderMessage({
          type: "error",
          text: `Số dư tiền mặt không đủ (${cash.toLocaleString("vi-VN")} đ < ${totalCost.toLocaleString("vi-VN")} đ)!`,
        });
        return;
      }

      // Deduct cash
      setCash((prev) => prev - totalCost);

      // Update positions
      setPositions((prev) => {
        const existing = prev.find((p) => p.ticker === ticker);
        if (existing) {
          const totalShares = existing.shares + quantity;
          const newAvgCost = Math.round((existing.shares * existing.avgCost + totalCost) / totalShares);
          return prev.map((p) =>
            p.ticker === ticker
              ? { ...p, shares: totalShares, availableShares: p.availableShares + quantity, avgCost: newAvgCost }
              : p
          );
        } else {
          return [
            ...prev,
            { ticker, shares: quantity, availableShares: quantity, avgCost: Math.round(totalCost / quantity) },
          ];
        }
      });
    } else {
      // SELL
      const existing = positions.find((p) => p.ticker === ticker);
      if (!existing || existing.availableShares < quantity) {
        setOrderMessage({
          type: "error",
          text: `Số lượng cổ phiếu ${ticker} khả dụng không đủ để bán (${existing?.availableShares || 0} < ${quantity})!`,
        });
        return;
      }

      const netProceeds = grossValue - fee - tax;
      setCash((prev) => prev + netProceeds);

      setPositions((prev) => {
        return prev
          .map((p) => {
            if (p.ticker === ticker) {
              const remaining = p.shares - quantity;
              return { ...p, shares: remaining, availableShares: p.availableShares - quantity };
            }
            return p;
          })
          .filter((p) => p.shares > 0);
      });
    }

    // Record trade order
    const newOrder: TradeOrder = {
      id: "ORD-" + Date.now().toString().slice(-6),
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      ticker,
      side,
      shares: quantity,
      price: currentPrice,
      totalValue: grossValue,
      fee,
      tax,
      thesis,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setOrderMessage({
      type: "success",
      text: `Khớp lệnh thành công: ${side === "BUY" ? "MUA" : "BÁN"} ${quantity.toLocaleString()} ${ticker} tại giá ${currentPrice.toLocaleString("vi-VN")} đ (vnstock Live)!`,
    });
    setThesis("");
  };

  const handleResetPortfolio = () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại tài khoản về 100,000,000 đ tiền mặt ban đầu?")) {
      setCash(INITIAL_CASH);
      setPositions([]);
      setOrders([]);
      localStorage.removeItem("ss_paper_cash");
      localStorage.removeItem("ss_paper_positions");
      localStorage.removeItem("ss_paper_orders");
      localStorage.removeItem("ss_paper_cash_v2");
      localStorage.removeItem("ss_paper_positions_v2");
      localStorage.removeItem("ss_paper_orders_v2");
      setOrderMessage({ type: "success", text: "Tài khoản Paper Trading đã được làm mới về 100,000,000 đ tiền mặt!" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] bg-[#12161C] space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                <Briefcase className="w-3.5 h-3.5 text-[#F0B90B]" /> Hệ thống Giao dịch Giả lập Real-time
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#181A20] text-[#0ECB81] border border-[#0ECB81]/30">
                <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
                vnstock Live Pricing Engine
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Paper Trading &amp; Quản lý Danh mục Ảo
            </h2>
            <p className="text-xs text-[#848E9C] mt-1">
              Thực hành giao dịch với giá khớp lệnh thực tế từ sàn HSX/HNX, tính toán chuẩn thuế phí 0.25%
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetPortfolio}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181A20] hover:bg-[#2B313A] text-[#EAECEF] text-xs font-semibold border border-[#2B313A] transition-colors shadow-sm"
              title="Đặt lại số dư 100M VND"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Đặt lại Danh mục
            </button>
          </div>
        </div>

        {/* Portfolio KPI Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#2B313A]">
          <div className="p-4 rounded-xl glass-card border border-[#2B313A] bg-[#181A20] space-y-1">
            <span className="text-xs text-[#848E9C] font-medium">Tiền mặt khả dụng</span>
            <div className="text-2xl font-black text-white font-mono-num">
              {cash.toLocaleString("vi-VN")} đ
            </div>
            <span className="text-[11px] text-[#848E9C] block">Sức mua khả dụng</span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-[#2B313A] bg-[#181A20] space-y-1">
            <span className="text-xs text-[#848E9C] font-medium">Giá trị Cổ phiếu</span>
            <div className="text-2xl font-black text-[#F0B90B] font-mono-num">
              {totalStockValue.toLocaleString("vi-VN")} đ
            </div>
            <span className="text-[11px] text-[#848E9C] block">{positions.length} mã đang nắm giữ</span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-[#2B313A] bg-[#181A20] space-y-1">
            <span className="text-xs text-[#848E9C] font-medium">Tổng tài sản (NAV)</span>
            <div className="text-2xl font-black text-white font-mono-num">
              {totalNAV.toLocaleString("vi-VN")} đ
            </div>
            <span className="text-[11px] text-[#848E9C] block">Vốn khởi tạo: 100,000,000 đ</span>
          </div>

          <div className="p-4 rounded-xl glass-card border border-[#2B313A] bg-[#181A20] space-y-1">
            <span className="text-xs text-[#848E9C] font-medium">Tổng Lãi / Lỗ ròng</span>
            <div
              className={`text-2xl font-black font-mono-num ${
                totalProfit >= 0 ? "text-[#0ECB81]" : "text-[#F6465D]"
              }`}
            >
              {totalProfit >= 0 ? "+" : ""}
              {totalProfit.toLocaleString("vi-VN")} đ
            </div>
            <span
              className={`text-[11px] font-bold block ${
                totalProfit >= 0 ? "text-[#0ECB81]" : "text-[#F6465D]"
              }`}
            >
              {totalProfitPct >= 0 ? "+" : ""}
              {totalProfitPct.toFixed(2)}% so với vốn gốc
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Positions & Order Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Positions Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" /> Vị thế Nắm giữ Hiện tại (Positions)
              </h3>
              <span className="text-xs text-slate-400">Định giá theo giá thị trường vnstock Live</span>
            </div>

            {positions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Chưa có cổ phiếu nào trong danh mục. Hãy thực hiện lệnh MUA bên cạnh!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Mã</th>
                      <th className="p-3.5 text-right">Khối lượng</th>
                      <th className="p-3.5 text-right">Giá vốn TB</th>
                      <th className="p-3.5 text-right">Giá Live vnstock</th>
                      <th className="p-3.5 text-right">Giá trị thị trường</th>
                      <th className="p-3.5 text-right">Lãi / Lỗ tạm tính</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono-num font-medium">
                    {positions.map((pos) => {
                      const livePrice = getStockPrice(pos.ticker);
                      const marketVal = pos.shares * livePrice;
                      const costVal = pos.shares * pos.avgCost;
                      const unPnl = marketVal - costVal;
                      const unPnlPct = costVal > 0 ? (unPnl / costVal) * 100 : 0;
                      const isGain = unPnl >= 0;

                      return (
                        <tr key={pos.ticker} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                              {pos.ticker}
                            </span>
                          </td>
                          <td className="p-3.5 text-right text-slate-200">
                            {pos.shares.toLocaleString()} cp
                          </td>
                          <td className="p-3.5 text-right text-slate-300">
                            {pos.avgCost.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="p-3.5 text-right font-bold text-white">
                            {livePrice.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="p-3.5 text-right text-slate-200 font-bold">
                            {marketVal.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="p-3.5 text-right">
                            <div className={`font-bold ${isGain ? "text-emerald-400" : "text-red-400"}`}>
                              {isGain ? "+" : ""}
                              {unPnl.toLocaleString("vi-VN")} đ
                            </div>
                            <div className={`text-[10px] ${isGain ? "text-emerald-400" : "text-red-400"}`}>
                              {isGain ? "+" : ""}
                              {unPnlPct.toFixed(2)}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Trade Execution History */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" /> Nhật ký Lệnh &amp; Luận điểm Đầu tư (Journal)
              </h3>
              <span className="text-xs text-slate-400">{orders.length} lệnh đã thực thi</span>
            </div>

            {orders.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Chưa có lịch sử giao dịch. Các lệnh khớp sẽ tự động lưu trữ tại đây.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-3">Thời gian</th>
                      <th className="p-3">Mã</th>
                      <th className="p-3">Lệnh</th>
                      <th className="p-3 text-right">Khối lượng</th>
                      <th className="p-3 text-right">Giá khớp</th>
                      <th className="p-3 text-right">Tổng GT</th>
                      <th className="p-3">Luận điểm (Thesis)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-slate-400 text-[11px]">{ord.timestamp}</td>
                        <td className="p-3 font-bold text-white">{ord.ticker}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.side === "BUY"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-red-500/20 text-red-400 border border-red-500/40"
                            }`}
                          >
                            {ord.side}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono-num">{ord.shares.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono-num">{ord.price.toLocaleString("vi-VN")} đ</td>
                        <td className="p-3 text-right font-mono-num text-slate-200">
                          {ord.totalValue.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="p-3 text-slate-400 italic max-w-xs truncate" title={ord.thesis}>
                          {ord.thesis}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Order Placement Form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5 shadow-xl h-fit">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Sổ Lệnh Điện Tử</h3>
          </div>

          {orderMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                orderMessage.type === "success"
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-red-500/20 border-red-500/40 text-red-300"
              }`}
            >
              {orderMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span>{orderMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleOrder} className="space-y-4">
            {/* Buy / Sell Tab Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide("BUY")}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  side === "BUY"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                MUA (BUY)
              </button>
              <button
                type="button"
                onClick={() => setSide("SELL")}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  side === "SELL"
                    ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-md shadow-red-500/10"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                BÁN (SELL)
              </button>
            </div>

            {/* Ticker Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Chọn Mã Cổ phiếu</label>
              <select
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
              >
                {VIETNAM_STOCKS.map((s) => {
                  const p = getStockPrice(s.ticker);
                  return (
                    <option key={s.ticker} value={s.ticker}>
                      {s.ticker} - {s.name} ({p.toLocaleString("vi-VN")} đ)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Live Price Display */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Giá khớp Live (vnstock):</span>
              <span className="text-sm font-black text-white font-mono-num">
                {selectedLivePrice.toLocaleString("vi-VN")} đ
              </span>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">Khối lượng (Lô 100 cp)</label>
                <div className="flex items-center gap-1">
                  {[100, 500, 1000, 2000].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantity(qty)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                step="100"
                min="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(100, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono-num font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Order Cost Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Giá trị lệnh:</span>
                <span className="text-slate-200 font-mono-num">{tradeValue.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Phí môi giới (0.15%):</span>
                <span className="text-slate-300 font-mono-num">{brokerageFee.toLocaleString("vi-VN")} đ</span>
              </div>
              {side === "SELL" && (
                <div className="flex justify-between text-[11px]">
                  <span>Thuế TNCN (0.1%):</span>
                  <span className="text-slate-300 font-mono-num">{sellTax.toLocaleString("vi-VN")} đ</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 border-t border-slate-800 font-bold text-white text-xs">
                <span>{side === "BUY" ? "Tổng thanh toán:" : "Thực nhận sau thuế phí:"}</span>
                <span className="font-mono-num text-cyan-400">{totalOrderCost.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>

            {/* Investment Thesis Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-amber-400 font-semibold flex items-center justify-between">
                <span>Luận điểm Đầu tư (Trading Thesis) *</span>
                <span className="text-[10px] text-slate-500 font-normal">Kỷ luật &amp; Nhật ký</span>
              </label>
              <textarea
                rows={3}
                required
                value={thesis}
                onChange={(e) => setThesis(e.target.value)}
                placeholder="VD: Cổ phiếu test MA50 rút chân, kết quả kinh doanh Q3 tăng trưởng mạnh..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-lg ${
                side === "BUY"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20"
                  : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-red-500/20"
              }`}
            >
              {side === "BUY" ? "Xác nhận Đặt Mua" : "Xác nhận Đặt Bán"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
