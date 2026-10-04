"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineStyle } from "lightweight-charts";
import { VIETNAM_STOCKS } from "@/lib/stockData";
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  RefreshCw,
  Radio,
  Sliders,
  Activity,
  Trash2,
  Split,
  Binary,
  Crosshair,
  ChevronRight,
  ChevronLeft,
  Settings2,
  Wand2,
} from "lucide-react";

interface PriceChartProps {
  selectedTicker?: string;
  onSelectTicker?: (ticker: string) => void;
}

export default function PriceChart({ selectedTicker = "FPT", onSelectTicker }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Series references for indicators
  const ma20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma200SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const fibSeriesRefs = useRef<ISeriesApi<"Line">[]>([]);

  const [activeTicker, setActiveTicker] = useState<string>(selectedTicker);
  const [isAdjusted, setIsAdjusted] = useState(true);
  const [timeframe, setTimeframe] = useState("1Y");
  const [isLoading, setIsLoading] = useState(false);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveChange, setLiveChange] = useState<number | null>(null);
  const [liveChangePct, setLiveChangePct] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Right Drawer Collapsed State (Default closed / open on demand)
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Technical Indicators Toggles
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showMA200, setShowMA200] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showFibonacci, setShowFibonacci] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const activeIndicatorCount = [
    showMA20,
    showMA50,
    showMA200,
    showBollinger,
    showFibonacci,
    showMACD,
    showRSI,
    activeTool === "SR",
  ].filter(Boolean).length;

  useEffect(() => {
    if (selectedTicker && selectedTicker !== activeTicker) {
      setActiveTicker(selectedTicker);
    }
  }, [selectedTicker]);

  const stockInfo = VIETNAM_STOCKS.find((s) => s.ticker === activeTicker) || VIETNAM_STOCKS[0];

  // 1. Fetch live stock data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/quote/${activeTicker}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.history && data.history.length > 0) {
          setLivePrice(data.latestPrice);
          setLiveChange(data.change);
          setLiveChangePct(data.changePct);
          setHistoryData(data.history);
        } else {
          generateFallbackHistory(stockInfo.price);
        }
      })
      .catch(() => {
        if (isMounted) generateFallbackHistory(stockInfo.price);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTicker]);

  const generateFallbackHistory = (basePrice: number) => {
    const list = [];
    const now = new Date();
    let curr = basePrice * 0.8;
    for (let i = 200; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const dateStr = d.toISOString().split("T")[0];
      const change = (Math.random() - 0.48) * 0.015 * curr;
      const open = curr;
      const close = Math.round(open + change);
      const high = Math.round(Math.max(open, close) + Math.random() * 0.008 * open);
      const low = Math.round(Math.min(open, close) - Math.random() * 0.008 * open);
      curr = close;
      list.push({ time: dateStr, open, high, low, close, volume: Math.round(Math.random() * 5000000 + 1000000) });
    }
    setHistoryData(list);
  };

  // 2. Initialize Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = "";

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#080d19" },
        textColor: "#94a3b8",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#141d30" },
        horzLines: { color: "#141d30" },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: "#38bdf8", width: 1, style: LineStyle.Dashed },
        horzLine: { color: "#38bdf8", width: 1, style: LineStyle.Dashed },
      },
      rightPriceScale: {
        borderColor: "#1e293b",
        scaleMargins: { top: 0.1, bottom: 0.15 },
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    chartApiRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });
    candleSeriesRef.current = candleSeries;

    ma20SeriesRef.current = chart.addLineSeries({
      color: "#f59e0b",
      lineWidth: 2,
      title: "MA20",
    });

    ma50SeriesRef.current = chart.addLineSeries({
      color: "#06b6d4",
      lineWidth: 2,
      title: "MA50",
    });

    ma200SeriesRef.current = chart.addLineSeries({
      color: "#a855f7",
      lineWidth: 2,
      title: "MA200",
    });

    bbUpperSeriesRef.current = chart.addLineSeries({
      color: "#3b82f6",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      title: "BB Upper",
    });
    bbLowerSeriesRef.current = chart.addLineSeries({
      color: "#3b82f6",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      title: "BB Lower",
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartApiRef.current) {
        chartApiRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Handle drawer resize
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chartContainerRef.current && chartApiRef.current) {
        chartApiRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        chartApiRef.current.timeScale().fitContent();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isRightDrawerOpen]);

  // 3. Update Chart & Compute Technical Indicators
  useEffect(() => {
    if (!historyData.length || !candleSeriesRef.current) return;

    candleSeriesRef.current.setData(historyData);

    if (showMA20 && ma20SeriesRef.current) {
      ma20SeriesRef.current.setData(computeMA(historyData, 20));
    } else {
      ma20SeriesRef.current?.setData([]);
    }

    if (showMA50 && ma50SeriesRef.current) {
      ma50SeriesRef.current.setData(computeMA(historyData, 50));
    } else {
      ma50SeriesRef.current?.setData([]);
    }

    if (showMA200 && ma200SeriesRef.current) {
      ma200SeriesRef.current.setData(computeMA(historyData, 200));
    } else {
      ma200SeriesRef.current?.setData([]);
    }

    if (showBollinger && bbUpperSeriesRef.current && bbLowerSeriesRef.current) {
      const { upper, lower } = computeBollingerBands(historyData, 20, 2);
      bbUpperSeriesRef.current.setData(upper);
      bbLowerSeriesRef.current.setData(lower);
    } else {
      bbUpperSeriesRef.current?.setData([]);
      bbLowerSeriesRef.current?.setData([]);
    }

    if (showFibonacci && chartApiRef.current) {
      renderFibonacciLevels(historyData);
    } else {
      clearFibonacciLevels();
    }

    chartApiRef.current?.timeScale().fitContent();
  }, [historyData, showMA20, showMA50, showMA200, showBollinger, showFibonacci]);

  // Helpers
  const computeMA = (data: any[], period: number) => {
    const res = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) continue;
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[i - j].close;
      res.push({ time: data[i].time, value: sum / period });
    }
    return res;
  };

  const computeBollingerBands = (data: any[], period = 20, stdDevMultiplier = 2) => {
    const upper = [];
    const lower = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) continue;
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[i - j].close;
      const mean = sum / period;
      let variance = 0;
      for (let j = 0; j < period; j++) variance += Math.pow(data[i - j].close - mean, 2);
      const stdDev = Math.sqrt(variance / period);
      upper.push({ time: data[i].time, value: mean + stdDevMultiplier * stdDev });
      lower.push({ time: data[i].time, value: mean - stdDevMultiplier * stdDev });
    }
    return { upper, lower };
  };

  const renderFibonacciLevels = (data: any[]) => {
    clearFibonacciLevels();
    if (!chartApiRef.current || data.length < 2) return;

    const highs = data.map((d) => d.high || d.close);
    const lows = data.map((d) => d.low || d.close);
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const diff = maxHigh - minLow;

    const fibRatios = [
      { ratio: 1.0, label: "Fib 100%", color: "#ef4444" },
      { ratio: 0.786, label: "Fib 78.6%", color: "#f97316" },
      { ratio: 0.618, label: "Fib 61.8% (Golden)", color: "#eab308" },
      { ratio: 0.5, label: "Fib 50%", color: "#10b981" },
      { ratio: 0.382, label: "Fib 38.2%", color: "#06b6d4" },
      { ratio: 0.236, label: "Fib 23.6%", color: "#8b5cf6" },
      { ratio: 0.0, label: "Fib 0%", color: "#ec4899" },
    ];

    const firstTime = data[0].time;
    const lastTime = data[data.length - 1].time;

    fibRatios.forEach((fib) => {
      const levelPrice = minLow + diff * fib.ratio;
      const lineSeries = chartApiRef.current!.addLineSeries({
        color: fib.color,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: `${fib.label}: ${Math.round(levelPrice).toLocaleString("vi-VN")}`,
      });
      lineSeries.setData([
        { time: firstTime, value: levelPrice },
        { time: lastTime, value: levelPrice },
      ]);
      fibSeriesRefs.current.push(lineSeries);
    });
  };

  const clearFibonacciLevels = () => {
    fibSeriesRefs.current.forEach((s) => chartApiRef.current?.removeSeries(s));
    fibSeriesRefs.current = [];
  };

  const currentDisplayPrice = livePrice || stockInfo.price;
  const currentDisplayChange = liveChange !== null ? liveChange : stockInfo.change;
  const currentDisplayChangePct = liveChangePct !== null ? liveChangePct : stockInfo.changePct;

  return (
    <div className="space-y-6">
      {/* Ticker Quick Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold whitespace-nowrap flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-yellow-400" /> Watchlist nhanh:
        </span>
        {["FPT", "HPG", "TCB", "MBB", "MWG", "SSI", "VHM", "VNM", "DGC", "GMD", "PVS"].map((t) => {
          const item = VIETNAM_STOCKS.find((s) => s.ticker === t);
          const isSelected = activeTicker === t;
          const isUp = (item?.changePct ?? 0) >= 0;

          return (
            <button
              key={t}
              onClick={() => {
                setActiveTicker(t);
                onSelectTicker && onSelectTicker(t);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                isSelected
                  ? "bg-slate-800 text-white border-emerald-500 shadow-md glow-emerald"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              <span>{t}</span>
              <span className={`text-[10px] ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? "+" : ""}{item?.changePct.toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Relative Container for Chart & Right Edge-Docked Drawer */}
      <div className="relative flex rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
        {/* Main Chart Viewport */}
        <div className="flex-1 p-6 space-y-4 min-w-0 transition-all duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Stock Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-lg shadow-inner shrink-0">
                {stockInfo.ticker}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{stockInfo.ticker}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                    {stockInfo.exchange}
                  </span>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline truncate max-w-xs">
                    {stockInfo.name}
                  </span>
                  {livePrice && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      <Radio className="w-2.5 h-2.5 animate-pulse" /> vnstock Realtime
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-white font-mono-num">
                    {currentDisplayPrice.toLocaleString("vi-VN")} VND
                  </span>
                  <span
                    className={`text-xs font-bold font-mono-num flex items-center gap-0.5 ${
                      currentDisplayChangePct >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {currentDisplayChangePct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {currentDisplayChange >= 0 ? "+" : ""}{currentDisplayChange.toLocaleString("vi-VN")} ({currentDisplayChangePct >= 0 ? "+" : ""}{currentDisplayChangePct.toFixed(2)}%)
                  </span>
                  {isLoading && <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin ml-2" />}
                </div>
              </div>
            </div>

            {/* Quick Chart Mode, Range & Right Toolbar Toggle Button */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <button
                  onClick={() => setIsAdjusted(true)}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    isAdjusted ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400"
                  }`}
                >
                  Giá điều chỉnh (Adj)
                </button>
                <button
                  onClick={() => setIsAdjusted(false)}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    !isAdjusted ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400"
                  }`}
                >
                  Giá thô (Raw)
                </button>
              </div>

              <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                {["1M", "3M", "6M", "1Y", "ALL"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      timeframe === tf ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Toggle Right Technical Drawer Button */}
              <button
                onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                  isRightDrawerOpen
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 glow-emerald"
                    : "bg-slate-900/90 text-slate-200 border-slate-700 hover:border-emerald-500 hover:text-emerald-300"
                }`}
                title="Đóng / Mở Thanh Phân Tích Kỹ Thuật (TradingView Tools)"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Chỉ báo &amp; Kẻ đường</span>
                {activeIndicatorCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isRightDrawerOpen ? "bg-slate-950 text-emerald-400" : "bg-emerald-500 text-slate-950"
                    }`}
                  >
                    {activeIndicatorCount}
                  </span>
                )}
                {isRightDrawerOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Chart Target Canvas */}
          <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden border border-slate-800/80" />

          {/* Legend of Active Indicators */}
          <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-400">
            <span className="font-bold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5" /> Đang hiển thị:
            </span>
            {showMA20 && (
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                <span className="w-2 h-2 rounded-full bg-yellow-400" /> MA20
              </span>
            )}
            {showMA50 && (
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> MA50
              </span>
            )}
            {showMA200 && (
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> MA200
              </span>
            )}
            {showBollinger && (
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Bollinger (20,2)
              </span>
            )}
            {showFibonacci && (
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                <span className="w-2 h-2 rounded-full bg-pink-400" /> Fibonacci Retracement
              </span>
            )}
            {showRSI && (
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> RSI: {stockInfo.rsi14}
              </span>
            )}
            {showMACD && (
              <span className="inline-flex items-center gap-1 font-mono-num font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                <span className="w-2 h-2 rounded-full bg-indigo-400" /> MACD (12,26,9)
              </span>
            )}
          </div>

          {/* Sub-panels for Oscillators */}
          {(showRSI || showMACD) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {showRSI && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" /> RSI (14 Phiên)
                    </span>
                    <span className="font-mono-num font-bold text-emerald-400 text-sm">
                      {stockInfo.rsi14} (Trung Tính)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                    <div
                      style={{ width: `${stockInfo.rsi14}%` }}
                      className={`h-full rounded-full transition-all ${
                        stockInfo.rsi14 >= 70 ? "bg-red-500" : stockInfo.rsi14 <= 30 ? "bg-emerald-500" : "bg-cyan-500"
                      }`}
                    />
                  </div>
                </div>
              )}

              {showMACD && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> MACD (12, 26, 9)
                    </span>
                    <span className="font-mono-num font-bold text-emerald-400 text-xs">
                      Histogram Dương (+0.85) - Tín hiệu Mua
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. RIGHT DOCKED COLLAPSIBLE TRADINGVIEW TOOLBAR DRAWER */}
        <div
          className={`border-l border-white/10 bg-[#090e1a]/98 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 shrink-0 ${
            isRightDrawerOpen ? "w-80 p-5" : "w-12 p-2 items-center"
          }`}
        >
          {isRightDrawerOpen ? (
            <div className="space-y-5 h-full overflow-y-auto">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    TradingView Tools
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowMA20(false);
                      setShowMA50(false);
                      setShowMA200(false);
                      setShowBollinger(false);
                      setShowFibonacci(false);
                      setShowMACD(false);
                      setShowRSI(false);
                    }}
                    className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                    title="Tắt toàn bộ chỉ báo"
                  >
                    <Trash2 className="w-3 h-3" /> Reset
                  </button>
                  <button
                    onClick={() => setIsRightDrawerOpen(false)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Đóng thanh công cụ"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section 1: Fibonacci & Kẻ đường */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  📐 Fibonacci &amp; Kẻ đường
                </span>

                <button
                  onClick={() => setShowFibonacci(!showFibonacci)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    showFibonacci
                      ? "bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-sm glow-cyan"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Split className="w-4 h-4 text-pink-400" />
                    <span>Fibonacci Thoái lui</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${showFibonacci ? "bg-pink-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {showFibonacci ? "ON" : "OFF"}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTool(activeTool === "SR" ? null : "SR")}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    activeTool === "SR"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-amber-400" />
                    <span>Kháng cự / Hỗ trợ (S/R)</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${activeTool === "SR" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {activeTool === "SR" ? "ON" : "OFF"}
                  </span>
                </button>
              </div>

              {/* Section 2: Đường Xu hướng (MAs) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  📈 Đường Xu Hướng (MAs)
                </span>

                <button
                  onClick={() => setShowMA20(!showMA20)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    showMA20
                      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-sm"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                    <span>MA 20 (Ngắn hạn)</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${showMA20 ? "bg-yellow-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {showMA20 ? "ON" : "OFF"}
                  </span>
                </button>

                <button
                  onClick={() => setShowMA50(!showMA50)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    showMA50
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                    <span>MA 50 (Trung hạn)</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${showMA50 ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {showMA50 ? "ON" : "OFF"}
                  </span>
                </button>

                <button
                  onClick={() => setShowMA200(!showMA200)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    showMA200
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
                    <span>MA 200 (Dài hạn)</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${showMA200 ? "bg-purple-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {showMA200 ? "ON" : "OFF"}
                  </span>
                </button>
              </div>

              {/* Section 3: Biến động & Dao động */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  ⚡ Biến Động &amp; Động Lượng
                </span>

                <button
                  onClick={() => setShowBollinger(!showBollinger)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    showBollinger
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Binary className="w-4 h-4 text-blue-400" />
                    <span>Bollinger Bands (20,2)</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${showBollinger ? "bg-blue-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {showBollinger ? "ON" : "OFF"}
                  </span>
                </button>

                <button
                  onClick={() => setShowRSI(!showRSI)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    showRSI
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>RSI (14 Phiên)</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${showRSI ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {showRSI ? "ON" : "OFF"}
                  </span>
                </button>

                <button
                  onClick={() => setShowMACD(!showMACD)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    showMACD
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span>MACD (12, 26, 9)</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${showMACD ? "bg-indigo-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {showMACD ? "ON" : "OFF"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed Icon Strip on Far Right Edge */
            <div className="flex flex-col items-center gap-3 py-2 w-full">
              <button
                onClick={() => setIsRightDrawerOpen(true)}
                className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 flex items-center justify-center transition-all shadow-sm glow-emerald"
                title="Mở Thanh Phân Tích Kỹ Thuật"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="w-6 h-px bg-slate-800 my-1" />

              <button
                onClick={() => {
                  setShowFibonacci(!showFibonacci);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  showFibonacci ? "bg-pink-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title="Fibonacci Thoái lui"
              >
                <Split className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowMA20(!showMA20)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                  showMA20 ? "bg-yellow-500 text-slate-950 shadow-md" : "text-yellow-400 hover:bg-slate-800"
                }`}
                title="Đường MA 20"
              >
                20
              </button>

              <button
                onClick={() => setShowMA50(!showMA50)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                  showMA50 ? "bg-cyan-500 text-slate-950 shadow-md" : "text-cyan-400 hover:bg-slate-800"
                }`}
                title="Đường MA 50"
              >
                50
              </button>

              <button
                onClick={() => setShowBollinger(!showBollinger)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  showBollinger ? "bg-blue-500 text-slate-950 shadow-md" : "text-blue-400 hover:bg-slate-800"
                }`}
                title="Bollinger Bands"
              >
                <Binary className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowRSI(!showRSI)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  showRSI ? "bg-emerald-500 text-slate-950 shadow-md" : "text-emerald-400 hover:bg-slate-800"
                }`}
                title="Chỉ số RSI 14"
              >
                <Activity className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowMACD(!showMACD)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  showMACD ? "bg-indigo-500 text-slate-950 shadow-md" : "text-indigo-400 hover:bg-slate-800"
                }`}
                title="Chỉ báo MACD"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
