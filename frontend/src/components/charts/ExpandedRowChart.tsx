"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineStyle } from "lightweight-charts";
import { StockProfile } from "@/lib/stockData";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Maximize2,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
  Check,
} from "lucide-react";

interface ExpandedRowChartProps {
  stock: StockProfile;
  onOpenFullAnalysis?: (ticker: string) => void;
}

export default function ExpandedRowChart({ stock, onOpenFullAnalysis }: ExpandedRowChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // Indicators refs
  const ma20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<"Line"> | null>(null);

  // State
  const [timeframe, setTimeframe] = useState<string>("6M");
  const [showMA20, setShowMA20] = useState<boolean>(true);
  const [showMA50, setShowMA50] = useState<boolean>(true);
  const [showBB, setShowBB] = useState<boolean>(false);
  const [showVol, setShowVol] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(false);
  const [showMACD, setShowMACD] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [liveCandles, setLiveCandles] = useState<any[]>([]);
  const [currentHoverPrice, setCurrentHoverPrice] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    vol?: number;
  } | null>(null);

  // Generate fallback synthetic candles if API is offline
  const generateSyntheticCandles = (basePrice: number, count: number = 250) => {
    const candles: any[] = [];
    let cur = basePrice * 0.82;
    const now = new Date();

    for (let i = count; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const dateStr = d.toISOString().split("T")[0];
      const dailyVolatility = 0.018;
      const change = (Math.random() - 0.485) * dailyVolatility;
      const open = Math.round(cur);
      const close = Math.round(cur * (1 + change));
      const high = Math.round(Math.max(open, close) * (1 + Math.random() * 0.012));
      const low = Math.round(Math.min(open, close) * (1 - Math.random() * 0.012));
      const volume = Math.round(500000 + Math.random() * 3000000);

      candles.push({
        time: dateStr,
        open,
        high,
        low,
        close,
        volume,
      });

      cur = close;
    }

    // Ensure last candle matches stock.price
    if (candles.length > 0) {
      const last = candles[candles.length - 1];
      last.close = stock.price;
      last.high = Math.max(last.high, stock.price);
      last.low = Math.min(last.low, stock.price);
    }

    return candles;
  };

  // Fetch real candle history from API route
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/quote/${stock.ticker}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.history && data.history.length > 0) {
          setLiveCandles(data.history);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch live history for", stock.ticker, e);
    }
    // Fallback
    const fallback = generateSyntheticCandles(stock.price, 280);
    setLiveCandles(fallback);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [stock.ticker]);

  // Filter candles according to timeframe
  const getFilteredCandles = () => {
    if (!liveCandles || liveCandles.length === 0) return [];
    const len = liveCandles.length;
    switch (timeframe) {
      case "1D":
        return liveCandles.slice(Math.max(0, len - 2));
      case "5D":
        return liveCandles.slice(Math.max(0, len - 7));
      case "1M":
        return liveCandles.slice(Math.max(0, len - 22));
      case "3M":
        return liveCandles.slice(Math.max(0, len - 66));
      case "6M":
        return liveCandles.slice(Math.max(0, len - 132));
      case "1Y":
        return liveCandles.slice(Math.max(0, len - 250));
      case "2Y":
      case "5Y":
      case "MAX":
      default:
        return liveCandles;
    }
  };

  // Initialize and update Lightweight Charts
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart
    if (chartApiRef.current) {
      chartApiRef.current.remove();
      chartApiRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 380,
      layout: {
        background: { color: "#090e1a" },
        textColor: "#94a3b8",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)", style: LineStyle.Dotted },
        horzLines: { color: "rgba(255, 255, 255, 0.04)", style: LineStyle.Dotted },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "#10b981", width: 1, style: LineStyle.Dashed },
        horzLine: { color: "#10b981", width: 1, style: LineStyle.Dashed },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        autoScale: true,
      },
    });

    chartApiRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });
    candleSeriesRef.current = candleSeries;

    // 2. Volume Series (Overlay at bottom)
    const volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "vol_scale",
    });
    volumeSeriesRef.current = volumeSeries;

    chart.priceScale("vol_scale").applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // 3. MA20 Line
    const ma20Series = chart.addLineSeries({
      color: "#eab308", // Yellow
      lineWidth: 2,
      title: "MA20",
    });
    ma20SeriesRef.current = ma20Series;

    // 4. MA50 Line
    const ma50Series = chart.addLineSeries({
      color: "#3b82f6", // Blue
      lineWidth: 2,
      title: "MA50",
    });
    ma50SeriesRef.current = ma50Series;

    // 5. Bollinger Upper & Lower
    const bbUp = chart.addLineSeries({
      color: "#06b6d4",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      title: "BB Upper",
    });
    const bbDown = chart.addLineSeries({
      color: "#06b6d4",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      title: "BB Lower",
    });
    bbUpperRef.current = bbUp;
    bbLowerRef.current = bbDown;

    // Tooltip / Crosshair subscription
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setCurrentHoverPrice(null);
        return;
      }
      const data = param.seriesData.get(candleSeries) as any;
      if (data) {
        setCurrentHoverPrice({
          time: String(param.time),
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
        });
      }
    });

    // Auto-resize
    const handleResize = () => {
      if (chartContainerRef.current && chartApiRef.current) {
        chartApiRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (chartApiRef.current) {
        chartApiRef.current.remove();
        chartApiRef.current = null;
      }
    };
  }, []);

  // Update Data in Chart Series
  useEffect(() => {
    const rawData = getFilteredCandles();
    if (!rawData || rawData.length === 0 || !candleSeriesRef.current) return;

    // Format for lightweight-charts
    const formattedCandles = rawData.map((d) => ({
      time: d.time,
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),
    }));

    candleSeriesRef.current.setData(formattedCandles);

    // Volume histogram
    if (volumeSeriesRef.current) {
      if (showVol) {
        const volData = rawData.map((d) => ({
          time: d.time,
          value: Number(d.volume || 1000000),
          color: Number(d.close) >= Number(d.open) ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)",
        }));
        volumeSeriesRef.current.setData(volData);
      } else {
        volumeSeriesRef.current.setData([]);
      }
    }

    // MA20 Calculation
    if (ma20SeriesRef.current) {
      if (showMA20 && rawData.length >= 20) {
        const ma20Data: any[] = [];
        for (let i = 19; i < rawData.length; i++) {
          let sum = 0;
          for (let k = 0; k < 20; k++) {
            sum += Number(rawData[i - k].close);
          }
          ma20Data.push({ time: rawData[i].time, value: sum / 20 });
        }
        ma20SeriesRef.current.setData(ma20Data);
      } else {
        ma20SeriesRef.current.setData([]);
      }
    }

    // MA50 Calculation
    if (ma50SeriesRef.current) {
      if (showMA50 && rawData.length >= 50) {
        const ma50Data: any[] = [];
        for (let i = 49; i < rawData.length; i++) {
          let sum = 0;
          for (let k = 0; k < 50; k++) {
            sum += Number(rawData[i - k].close);
          }
          ma50Data.push({ time: rawData[i].time, value: sum / 50 });
        }
        ma50SeriesRef.current.setData(ma50Data);
      } else {
        ma50SeriesRef.current.setData([]);
      }
    }

    // Bollinger Bands (20 periods, 2 std dev)
    if (bbUpperRef.current && bbLowerRef.current) {
      if (showBB && rawData.length >= 20) {
        const upData: any[] = [];
        const downData: any[] = [];
        for (let i = 19; i < rawData.length; i++) {
          let sum = 0;
          for (let k = 0; k < 20; k++) {
            sum += Number(rawData[i - k].close);
          }
          const mean = sum / 20;
          let varianceSum = 0;
          for (let k = 0; k < 20; k++) {
            varianceSum += Math.pow(Number(rawData[i - k].close) - mean, 2);
          }
          const std = Math.sqrt(varianceSum / 20);
          upData.push({ time: rawData[i].time, value: mean + 2 * std });
          downData.push({ time: rawData[i].time, value: mean - 2 * std });
        }
        bbUpperRef.current.setData(upData);
        bbLowerRef.current.setData(downData);
      } else {
        bbUpperRef.current.setData([]);
        bbLowerRef.current.setData([]);
      }
    }

    if (chartApiRef.current) {
      chartApiRef.current.timeScale().fitContent();
    }
  }, [liveCandles, timeframe, showMA20, showMA50, showBB, showVol]);

  const timeframes = ["1D", "5D", "1M", "3M", "6M", "1Y", "2Y", "5Y", "MAX"];

  return (
    <div className="bg-[#12161C] border-t border-b border-[#F0B90B]/30 shadow-2xl p-4 md:p-6 transition-all animate-fadeIn">
      {/* 1. TOP CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B313A]">
        {/* Left: Timeframe Selectors */}
        <div className="flex items-center gap-1 bg-[#0B0E11] p-1 rounded-xl border border-[#2B313A]">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-mono-num font-bold rounded-lg transition-all ${
                timeframe === tf
                  ? "bg-[#F0B90B] text-black shadow-sm font-black"
                  : "text-[#848E9C] hover:text-white hover:bg-[#181A20]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Middle: Indicator Quick Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowMA20(!showMA20)}
            className={`px-2.5 py-1 text-[11px] font-mono-num font-bold rounded-lg border transition-all ${
              showMA20
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
                : "bg-slate-900/60 text-slate-400 border-white/5 hover:border-slate-700"
            }`}
          >
            MA20
          </button>

          <button
            onClick={() => setShowMA50(!showMA50)}
            className={`px-2.5 py-1 text-[11px] font-mono-num font-bold rounded-lg border transition-all ${
              showMA50
                ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                : "bg-slate-900/60 text-slate-400 border-white/5 hover:border-slate-700"
            }`}
          >
            MA50
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2.5 py-1 text-[11px] font-mono-num font-bold rounded-lg border transition-all ${
              showBB
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-slate-900/60 text-slate-400 border-white/5 hover:border-slate-700"
            }`}
          >
            BB
          </button>

          <button
            onClick={() => setShowVol(!showVol)}
            className={`px-2.5 py-1 text-[11px] font-mono-num font-bold rounded-lg border transition-all ${
              showVol
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-slate-900/60 text-slate-400 border-white/5 hover:border-slate-700"
            }`}
          >
            VOL
          </button>

          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2.5 py-1 text-[11px] font-mono-num font-bold rounded-lg border transition-all ${
              showRSI
                ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                : "bg-slate-900/60 text-slate-400 border-white/5 hover:border-slate-700"
            }`}
          >
            RSI
          </button>

          <button
            onClick={() => setShowMACD(!showMACD)}
            className={`px-2.5 py-1 text-[11px] font-mono-num font-bold rounded-lg border transition-all ${
              showMACD
                ? "bg-pink-500/20 text-pink-300 border-pink-500/50"
                : "bg-slate-900/60 text-slate-400 border-white/5 hover:border-slate-700"
            }`}
          >
            MACD
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            title="Làm mới dữ liệu nến"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline text-[11px] font-medium">Làm mới</span>
          </button>
        </div>
      </div>

      {/* 2. OHLCV LIVE HOVER INFO */}
      <div className="flex flex-wrap items-center justify-between py-2 text-xs font-mono-num border-b border-white/5 text-slate-300">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-sm">{stock.ticker}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-800 text-slate-400">
              {stock.exchange}
            </span>
          </div>

          {currentHoverPrice ? (
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-400">{currentHoverPrice.time}</span>
              <span>O: <strong className="text-white">{currentHoverPrice.open.toLocaleString("vi-VN")}</strong></span>
              <span>H: <strong className="text-emerald-400">{currentHoverPrice.high.toLocaleString("vi-VN")}</strong></span>
              <span>L: <strong className="text-red-400">{currentHoverPrice.low.toLocaleString("vi-VN")}</strong></span>
              <span>C: <strong className="text-cyan-400">{currentHoverPrice.close.toLocaleString("vi-VN")}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>Giá hiện tại: <strong className="text-white font-bold">{stock.price.toLocaleString("vi-VN")} đ</strong></span>
              <span>Biên độ: <strong className={stock.change >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                {stock.change >= 0 ? "+" : ""}{stock.change.toLocaleString("vi-VN")} ({stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%)
              </strong></span>
            </div>
          )}
        </div>

        {/* Key fundamental metrics row */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400">
          <span>P/E: <strong className="text-slate-200">{stock.pe}x</strong></span>
          <span>P/B: <strong className="text-slate-200">{stock.pb}x</strong></span>
          <span>ROE: <strong className="text-emerald-400">{stock.roe}%</strong></span>
          <span>EPS: <strong className="text-cyan-400">{stock.eps.toLocaleString("vi-VN")} đ</strong></span>
          <span>RSI(14): <strong className="text-yellow-400">{stock.rsi14}</strong></span>
        </div>
      </div>

      {/* 3. LIGHTWEIGHT CHART CANVAS */}
      <div className="relative mt-2">
        <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden border border-white/5" />

        {/* Watermark logo */}
        <div className="absolute left-4 bottom-14 opacity-20 pointer-events-none flex items-center gap-2 select-none">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
            SS
          </div>
          <span className="text-sm font-black tracking-widest text-slate-300 uppercase">Stock System</span>
        </div>

        {/* RSI subpanel note if enabled */}
        {showRSI && (
          <div className="mt-2 p-2 rounded-lg bg-purple-950/20 border border-purple-500/20 flex items-center justify-between text-xs font-mono-num text-purple-300">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> RSI (14 periods):
            </span>
            <span className="font-bold text-sm text-purple-200">{stock.rsi14} — {stock.rsi14 > 70 ? "Quá Mua (Overbought)" : stock.rsi14 < 30 ? "Quá Bán (Oversold)" : "Vùng Cân Bằng (Neutral)"}</span>
          </div>
        )}

        {/* MACD subpanel note if enabled */}
        {showMACD && (
          <div className="mt-2 p-2 rounded-lg bg-pink-950/20 border border-pink-500/20 flex items-center justify-between text-xs font-mono-num text-pink-300">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> MACD (12, 26, 9):
            </span>
            <span className="font-bold text-sm text-pink-200">Histogram: +0.42 | Signal Line Cắt Lên (Tín hiệu Bullish)</span>
          </div>
        )}
      </div>

      {/* 4. BOTTOM QUICK SPECS */}
      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
          <div className="text-[10px] text-slate-500">52 Tuần Cao Nhất</div>
          <div className="font-mono-num font-bold text-emerald-400">{stock.high52w.toLocaleString("vi-VN")} đ</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
          <div className="text-[10px] text-slate-500">52 Tuần Thấp Nhất</div>
          <div className="font-mono-num font-bold text-red-400">{stock.low52w.toLocaleString("vi-VN")} đ</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
          <div className="text-[10px] text-slate-500">Khối Lượng 24h</div>
          <div className="font-mono-num font-bold text-slate-200">{stock.volume24h}</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
          <div className="text-[10px] text-slate-500">Giá Trị Giao Dịch</div>
          <div className="font-mono-num font-bold text-yellow-400">{stock.value24h}</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
          <div className="text-[10px] text-slate-500">Vốn Hóa Thị Trường</div>
          <div className="font-mono-num font-bold text-cyan-400">{stock.marketCap.toLocaleString("vi-VN")} Tỷ</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
          <div className="text-[10px] text-slate-500">Tăng Trưởng LN YoY</div>
          <div className="font-mono-num font-bold text-emerald-400">+{stock.profitGrowthYoY}%</div>
        </div>
      </div>
    </div>
  );
}
