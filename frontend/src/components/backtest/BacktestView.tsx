"use client";

import React, { useState } from "react";
import { Play, LineChart, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

export default function BacktestView() {
  const [universe, setUniverse] = useState("VN100");
  const [factor, setFactor] = useState("ROE_TTM");
  const [topN, setTopN] = useState(15);
  const [rebalance, setRebalance] = useState("QUARTERLY");
  const [isRunning, setIsRunning] = useState(false);

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Strategy Configuration */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Cấu hình Chiến lược Backtest (Factor Ranking)</h3>
          </div>
          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? "Đang chạy mô phỏng..." : "Chạy Backtest"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Vũ trụ cổ phiếu (Universe)</label>
            <select
              value={universe}
              onChange={(e) => setUniverse(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="VN100">VN100 (Chống survivorship bias)</option>
              <option value="VN30">VN30 Index</option>
              <option value="ALL">Toàn thị trường</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Nhân tố xếp hạng (Factor)</label>
            <select
              value={factor}
              onChange={(e) => setFactor(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="ROE_TTM">ROE TTM cao nhất</option>
              <option value="EARNINGS_GROWTH">Tăng trưởng Lợi nhuận YoY</option>
              <option value="VALUE_COMPOSITE">P/E &amp; P/B rẻ nhất</option>
              <option value="MOMENTUM_12M">Momentum 12 tháng</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Số lượng nắm giữ (Top N)</label>
            <input
              type="number"
              min="5"
              max="50"
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Chu kỳ tái cân bằng</label>
            <select
              value={rebalance}
              onChange={(e) => setRebalance(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="QUARTERLY">Hàng quý (Quarterly - Sau BCTC)</option>
              <option value="MONTHLY">Hàng tháng (Monthly)</option>
              <option value="ANNUALLY">Hàng năm (Annually)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Lợi nhuận (CAGR)</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">+18.5%</div>
          <span className="text-[10px] text-slate-500">Benchmark: +9.8%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Sharpe Ratio</span>
          <div className="text-xl font-bold text-cyan-400 mt-1">0.86</div>
          <span className="text-[10px] text-slate-500">Benchmark: 0.32</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Max Drawdown</span>
          <div className="text-xl font-bold text-amber-400 mt-1">-16.8%</div>
          <span className="text-[10px] text-slate-500">Benchmark: -28.4%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Biến động năm hóa</span>
          <div className="text-xl font-bold text-white mt-1">21.3%</div>
          <span className="text-[10px] text-slate-500">√252 phiên</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Win Rate</span>
          <div className="text-xl font-bold text-white mt-1">58.2%</div>
          <span className="text-[10px] text-slate-500">Tỷ lệ ngày dương</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Turnover</span>
          <div className="text-xl font-bold text-white mt-1">85% / năm</div>
          <span className="text-[10px] text-slate-500">Đã trừ phí + thuế</span>
        </div>
      </div>

      {/* Equity Curve Comparison */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white">Đường cong vốn (Equity Curve) vs VN-Index Benchmark</h4>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Chiến lược ({factor})
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> VN-INDEX
            </span>
          </div>
        </div>

        {/* Visual Simulated Curve */}
        <div className="h-52 w-full flex items-end gap-3 pt-6 pb-2 px-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
          {[
            { date: "Q1/24", strat: 40, bm: 35 },
            { date: "Q2/24", strat: 55, bm: 42 },
            { date: "Q3/24", strat: 70, bm: 48 },
            { date: "Q4/24", strat: 88, bm: 56 },
            { date: "Q1/25", strat: 105, bm: 65 },
          ].map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full flex items-end justify-center gap-1.5 h-40">
                <div
                  style={{ height: `${item.strat}%` }}
                  className="w-4 rounded-t bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-500"
                />
                <div
                  style={{ height: `${item.bm}%` }}
                  className="w-4 rounded-t bg-slate-700 transition-all duration-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
