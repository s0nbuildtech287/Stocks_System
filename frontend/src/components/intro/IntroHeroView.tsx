"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  PieChart,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ChevronDown,
  BarChart3,
  Flame,
} from "lucide-react";
import IntroCanvas3D from "./IntroCanvas3D";

interface IntroHeroViewProps {
  onEnterTerminal: () => void;
}

export default function IntroHeroView({ onEnterTerminal }: IntroHeroViewProps) {
  const [livePrices, setLivePrices] = useState<
    Array<{ ticker: string; price: number; change: number; changePct: number }>
  >([
    { ticker: "FPT", price: 57900, change: -1800, changePct: -3.02 },
    { ticker: "PNJ", price: 19500, change: 1250, changePct: 6.85 },
    { ticker: "HPG", price: 20100, change: -50, changePct: -0.25 },
    { ticker: "MWG", price: 75900, change: -200, changePct: -0.26 },
    { ticker: "TCB", price: 32350, change: 450, changePct: 1.41 },
    { ticker: "VCB", price: 56700, change: 100, changePct: 0.18 },
    { ticker: "SSI", price: 19000, change: -50, changePct: -0.26 },
    { ticker: "FRT", price: 149600, change: -1300, changePct: -0.86 },
  ]);

  // Try to load latest live quotes from API
  useEffect(() => {
    fetch("/api/quotes/live")
      .then((res) => res.json())
      .then((res) => {
        if (res && res.data) {
          const sample = ["FPT", "PNJ", "HPG", "MWG", "TCB", "VCB", "SSI", "FRT"];
          const updated = sample
            .filter((t) => res.data[t])
            .map((t) => ({
              ticker: t,
              price: res.data[t].price,
              change: res.data[t].change,
              changePct: res.data[t].changePct,
            }));
          if (updated.length > 0) setLivePrices(updated);
        }
      })
      .catch(() => {});
  }, []);

  const features = [
    {
      icon: PieChart,
      title: "Tối Ưu Hóa Danh Mục Markowitz",
      badge: "Quant MPT",
      color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-[#F0B90B]",
      desc: "Mô hình toán học định lượng Markowitz, tính toán tỷ trọng Sharpe tối ưu & vẽ đường biên hiệu quả (Efficient Frontier) cho các mã cổ phiếu VN.",
    },
    {
      icon: Zap,
      title: "Đồng Bộ Dữ Liệu vnstock Realtime",
      badge: "vnstock 4.0",
      color: "from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-[#0ECB81]",
      desc: "Kết nối dữ liệu khớp lệnh, giá lịch sử OHLCV và báo cáo tài chính trực tiếp từ vnstock, hỗ trợ fallback tự động bảo đảm hệ thống luôn sẵn sàng.",
    },
    {
      icon: Scale,
      title: "So Sánh Đối Thủ Ngang Hàng (Peers)",
      badge: "Radar Matrix",
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-[#00F0FF]",
      desc: "Trực quan hóa đa chiều qua Radar Chart: so sánh P/E, P/B, ROE, biên lợi nhuận giữa các mã cổ phiếu cùng ngành trong rổ VN30.",
    },
    {
      icon: Sparkles,
      title: "Hồ Sơ Doanh Nghiệp 360° & RSS News",
      badge: "Deep Dive",
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-[#B7791F]",
      desc: "Chấm điểm sức khỏe doanh nghiệp, cơ cấu cổ đông, lịch chia cổ tức và cập nhật tin tức tài chính thời gian thực qua luồng RSS Google News.",
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-x-hidden overflow-y-auto bg-[#0B0E11] text-[#EAECEF] select-none">
      {/* 1. THREE.JS 3D BACKGROUND CANVAS */}
      <IntroCanvas3D />

      {/* Subtle Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E11]/70 via-transparent to-[#0B0E11] pointer-events-none z-10" />

      {/* 2. TOP NAVBAR */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-[#2B313A]/50 backdrop-blur-md bg-[#0B0E11]/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-yellow-500/20 border border-[#F0B90B]/60 bg-[#181A20] flex items-center justify-center p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Stock System Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white flex items-center gap-2">
              STOCK <span className="text-[#F0B90B]">SYSTEM</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0B90B]/10 text-[#F0B90B] border border-[#F0B90B]/30 font-bold uppercase">
                v2.0
              </span>
            </div>
            <div className="text-[10px] text-[#848E9C] font-semibold tracking-wider uppercase">
              VN Quantitative Terminal & Lab
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181A20]/80 border border-[#2B313A] text-xs text-[#848E9C]">
            <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
            <span className="text-[#EAECEF] font-medium">vnstock 4.0.5</span> Live Engine
          </div>

          <button
            onClick={onEnterTerminal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F0B90B] to-[#FCD535] text-[#1E2329] font-bold text-xs hover:shadow-lg hover:shadow-yellow-500/30 transition-all active:scale-95 cursor-pointer"
          >
            <span>Vào Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. HERO CONTENT */}
      <main className="relative z-20 max-w-6xl mx-auto px-6 lg:px-12 pt-12 pb-20 flex flex-col items-center text-center">
        {/* Glow pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#181A20]/80 border border-[#F0B90B]/40 text-[#F0B90B] text-xs font-semibold shadow-lg shadow-yellow-500/10 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
          <span>THẾ HỆ TERMINAL ĐỊNH LƯỢNG MỚI CHO THỊ TRƯỜNG CHỨNG KHOÁN VIỆT NAM</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl text-white mb-6">
          Phân Tích Định Lượng &{" "}
          <span className="bg-gradient-to-r from-[#F0B90B] via-[#FFE259] to-[#FFA751] bg-clip-text text-transparent">
            Tối Ưu Hóa Danh Mục
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#848E9C] max-w-2xl font-normal leading-relaxed mb-8">
          Hệ thống chuyên sâu kết hợp dữ liệu khớp lệnh thời gian thực từ{" "}
          <span className="text-[#EAECEF] font-semibold">vnstock</span>, mô hình toán học{" "}
          <span className="text-[#F0B90B] font-semibold">Markowitz MPT</span> và bộ công cụ định giá
          cổ phiếu dành cho nhà đầu tư định lượng.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <button
            onClick={onEnterTerminal}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F0B90B] to-[#FCD535] text-[#1E2329] font-black text-sm hover:shadow-xl hover:shadow-yellow-500/40 hover:scale-105 transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>KHÁM PHÁ TERMINAL NGAY</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#181A20]/80 border border-[#2B313A] text-[#EAECEF] font-semibold text-sm hover:border-[#F0B90B]/50 hover:bg-[#1E2329] transition-all flex items-center justify-center gap-2"
          >
            <span>Xem Các Tính Năng</span>
            <ChevronDown className="w-4 h-4 text-[#848E9C]" />
          </a>
        </div>

        {/* 4. LIVE TICKER TICKER RIBBON */}
        <div className="w-full max-w-4xl p-2.5 rounded-2xl bg-[#12161C]/80 border border-[#2B313A] backdrop-blur-md shadow-2xl mb-16 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1 mb-2 border-b border-[#2B313A]/50 text-[11px] text-[#848E9C]">
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-ping" />
              <span>DỮ LIỆU THỰC TẾ (VNSTOCK LIVE)</span>
            </div>
            <span>Cập nhật phiên gần nhất</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {livePrices.map((stk) => {
              const isUp = stk.change >= 0;
              return (
                <div
                  key={stk.ticker}
                  className="p-2.5 rounded-xl bg-[#181A20]/90 border border-[#2B313A]/60 flex items-center justify-between hover:border-[#F0B90B]/40 transition-colors"
                >
                  <div className="text-left">
                    <div className="text-xs font-black text-white">{stk.ticker}</div>
                    <div className="text-[11px] font-mono text-[#848E9C]">
                      {stk.price.toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                  <div
                    className={`text-right text-[11px] font-bold font-mono ${
                      isUp ? "text-[#0ECB81]" : "text-[#F6465D]"
                    }`}
                  >
                    <div>{isUp ? `+${stk.changePct}%` : `${stk.changePct}%`}</div>
                    <div className="text-[10px] font-normal opacity-80">
                      {isUp ? `+${stk.change}` : stk.change}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. FOUR FEATURE CARDS */}
        <div id="features" className="w-full max-w-5xl text-left">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Bộ Công Cụ Định Lượng Toàn Diện
            </h2>
            <p className="text-sm text-[#848E9C] mt-2">
              Xây dựng chuyên biệt cho thị trường chứng khoán Việt Nam (HOSE, HNX, UPCoM)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#12161C]/80 border border-[#2B313A] backdrop-blur-md hover:border-[#F0B90B]/50 hover:bg-[#181A20]/90 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center border`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#2B313A]/50 border border-[#2B313A] text-[#848E9C] uppercase tracking-wider">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#F0B90B] transition-colors mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#848E9C] leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. BOTTOM CTA & TECH STACK BADGES */}
        <div className="mt-16 pt-8 border-t border-[#2B313A]/40 w-full max-w-4xl flex flex-col items-center gap-4">
          <button
            onClick={onEnterTerminal}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#F0B90B] to-[#FCD535] text-[#1E2329] font-black text-sm hover:shadow-xl hover:shadow-yellow-500/40 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>BẮT ĐẦU TRẢI NGHIỆM TERMINAL</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#848E9C] mt-2">
            <span>Powered by:</span>
            <span className="px-2 py-0.5 rounded bg-[#181A20] border border-[#2B313A] text-[#EAECEF]">
              Three.js 3D WebGL
            </span>
            <span className="px-2 py-0.5 rounded bg-[#181A20] border border-[#2B313A] text-[#EAECEF]">
              Next.js 14
            </span>
            <span className="px-2 py-0.5 rounded bg-[#181A20] border border-[#2B313A] text-[#EAECEF]">
              vnstock 4.0.5
            </span>
            <span className="px-2 py-0.5 rounded bg-[#181A20] border border-[#2B313A] text-[#EAECEF]">
              Markowitz Portfolio Optimizer
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
