"use client";

import React, { useState } from "react";
import {
  Activity,
  BarChart3,
  Briefcase,
  Filter,
  LineChart,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  Flame,
  Search,
  Zap,
  Globe,
  Radio,
  Sliders,
  ChevronRight,
  HelpCircle,
  Database,
} from "lucide-react";
import MarketTableView from "@/components/charts/MarketTableView";
import ScreenerView from "@/components/screener/ScreenerView";
import ValuationView from "@/components/valuation/ValuationView";
import PaperTradingView from "@/components/papertrading/PaperTradingView";
import BacktestView from "@/components/backtest/BacktestView";
import { VIETNAM_STOCKS } from "@/lib/stockData";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "screener" | "papertrading" | "backtest" | "valuation">("overview");
  const [selectedTicker, setSelectedTicker] = useState<string>("FPT");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    setActiveTab("overview");
  };

  const navItems = [
    { id: "overview", label: "Market & Charts", badge: "Live", icon: TrendingUp, desc: "TradingView candles & live quote" },
    { id: "screener", label: "Stock Screener", badge: "Pro", icon: Filter, desc: "Multi-factor fundamental & technical" },
    { id: "papertrading", label: "Paper Trading", badge: "T+2", icon: Briefcase, desc: "Portfolio & trade thesis journal" },
    { id: "backtest", label: "Strategy Backtest", badge: "Quant", icon: LineChart, desc: "Factor ranking & bias-free engine" },
    { id: "valuation", label: "Valuation Models", badge: "Model", icon: BarChart3, desc: "CAPM, DDM & sensitivity matrix" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* 1. VERTICAL LEFT SIDEBAR NAVIGATOR */}
      <aside
        className={`border-r border-white/10 bg-[#090e1a]/95 backdrop-blur-2xl flex flex-col justify-between shrink-0 transition-all duration-300 z-40 ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Brand Logo */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0 text-base">
              SS
            </div>
            {!sidebarCollapsed && (
              <div className="leading-tight truncate">
                <span className="text-base font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent block">
                  Stock System
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Quantitative Terminal
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            {!sidebarCollapsed ? "Analysis Modules" : "Menu"}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full group rounded-xl transition-all text-left flex items-center gap-3 p-3 relative ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent text-white border-l-4 border-emerald-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border-l-4 border-transparent"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-md glow-emerald"
                      : "bg-slate-800/60 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!sidebarCollapsed && (
                  <div className="flex-1 truncate">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-300"}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            isActive
                              ? "bg-emerald-500/30 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Quick Pinned Watchlist in Sidebar */}
          {!sidebarCollapsed && (
            <div className="pt-5 border-t border-white/5 space-y-2">
              <div className="px-3 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" /> Quick Watchlist
                </span>
                <span className="text-slate-600 font-normal">Select</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 px-1">
                {["FPT", "HPG", "TCB", "MBB", "MWG", "SSI", "VNM", "VHM", "GAS"].map((ticker) => {
                  const stock = VIETNAM_STOCKS.find((s) => s.ticker === ticker);
                  const isSelected = selectedTicker === ticker;
                  const isUp = (stock?.changePct ?? 0) >= 0;

                  return (
                    <button
                      key={ticker}
                      onClick={() => handleSelectTicker(ticker)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-black shadow-sm"
                          : "bg-slate-900/60 text-slate-300 border-slate-800/80 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <div className="text-[11px] font-bold">{ticker}</div>
                      <div className={`text-[9px] font-mono-num font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                        {isUp ? "+" : ""}{stock?.changePct.toFixed(1)}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom System Status */}
        <div className="p-4 border-t border-white/5 bg-slate-950/40">
          {!sidebarCollapsed ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> vnstock API
                </span>
                <span className="font-mono-num text-emerald-400 font-bold">Connected</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Dữ liệu Point-in-time</span>
                <span className="text-slate-400 font-mono-num">EOD Ready</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Connected" />
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN RIGHT CONTENT CONTAINER (FLUID & FULL SCREEN) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Ticker Tape Bar */}
        <header className="h-12 border-b border-white/10 bg-[#090e1a]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6 overflow-x-auto text-xs font-mono-num whitespace-nowrap">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>VN-INDEX</span>
              <span className="text-white">1,280.50</span>
              <span className="text-emerald-400 font-bold">+12.30 (+0.97%)</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <span>VN30</span>
              <span className="text-white">1,345.80</span>
              <span className="text-emerald-400 font-bold">+15.60 (+1.17%)</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span>HNX:</span>
              <span className="text-white font-bold">235.40</span>
              <span className="text-emerald-400">+0.77%</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span>HOSE Value:</span>
              <span className="text-yellow-400 font-bold">18,450 Tỷ</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span>TPCP 10Y:</span>
              <span className="text-cyan-400 font-bold">2.85%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              EOD Point-in-time
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "screener" && (
            <ScreenerView onSelectTicker={handleSelectTicker} />
          )}

          {activeTab === "overview" && (
            <MarketTableView initialExpandedTicker={selectedTicker} />
          )}

          {activeTab === "papertrading" && <PaperTradingView />}
          {activeTab === "backtest" && <BacktestView />}
          {activeTab === "valuation" && <ValuationView selectedTicker={selectedTicker} />}
        </main>

        {/* Bottom Disclaimer Footer */}
        <footer className="h-9 border-t border-white/5 bg-[#050810] px-6 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              <strong>Disclaimer:</strong> Nền tảng Stock System phục vụ học tập &amp; nghiên cứu định lượng. Dữ liệu cuối ngày không phải khuyến nghị đầu tư.
            </span>
          </div>
          <div className="whitespace-nowrap font-mono-num text-[10px] pl-4">Stock System v1.0.0 © 2026</div>
        </footer>
      </div>
    </div>
  );
}
