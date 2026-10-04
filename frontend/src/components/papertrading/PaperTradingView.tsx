"use client";

import React, { useState } from "react";
import { Briefcase, PlusCircle, CheckCircle2, History } from "lucide-react";

export default function PaperTradingView() {
  const [ticker, setTicker] = useState("FPT");
  const [quantity, setQuantity] = useState(100);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [thesis, setThesis] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thesis.trim()) return;
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Portfolio Overview */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Danh mục Tăng trưởng VN30</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              Khởi tạo: 100M VND
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400">Tiền mặt khả dụng</span>
              <div className="text-xl font-bold text-white mt-1">45,200,000 đ</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400">Giá trị chứng khoán</span>
              <div className="text-xl font-bold text-white mt-1">67,500,000 đ</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400">Tổng tài sản (NAV)</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">112,700,000 đ</div>
              <span className="text-[10px] text-emerald-400 font-medium">+12.7%</span>
            </div>
          </div>

          {/* Positions Table */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vị thế nắm giữ</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400">
                  <tr>
                    <th className="p-3">Mã</th>
                    <th className="p-3">Số lượng</th>
                    <th className="p-3">Khả dụng</th>
                    <th className="p-3">Giá vốn TB</th>
                    <th className="p-3">Giá thị trường</th>
                    <th className="p-3">Lãi / Lỗ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-3 font-bold text-white">FPT</td>
                    <td className="p-3">300</td>
                    <td className="p-3 text-emerald-400">300</td>
                    <td className="p-3">115,000 đ</td>
                    <td className="p-3">135,000 đ</td>
                    <td className="p-3 font-bold text-emerald-400">+6,000,000 đ (+17.4%)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">MBB</td>
                    <td className="p-3">1,000</td>
                    <td className="p-3 text-emerald-400">1,000</td>
                    <td className="p-3">22,000 đ</td>
                    <td className="p-3">24,500 đ</td>
                    <td className="p-3 font-bold text-emerald-400">+2,500,000 đ (+11.3%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Order Placement Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Đặt lệnh Ảo</h3>
        </div>

        {orderSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Lệnh đã ghi nhận, sẽ khớp tại ATO phiên kế tiếp!
          </div>
        )}

        <form onSubmit={handleOrder} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSide("BUY")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                side === "BUY"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              MUA
            </button>
            <button
              type="button"
              onClick={() => setSide("SELL")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                side === "SELL"
                  ? "bg-red-500/20 text-red-400 border-red-500/50"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              BÁN
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Mã cổ phiếu</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold uppercase focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Khối lượng (Lô 100 cp)</label>
            <input
              type="number"
              step="100"
              min="100"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-amber-400 font-semibold flex items-center justify-between">
              <span>Lý do mua/bán (Thesis) *</span>
              <span className="text-[10px] text-slate-500 font-normal">Chống FOMO & Học tập</span>
            </label>
            <textarea
              rows={3}
              required
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="VD: Cổ phiếu test MA50 rút chân, kết quả kinh doanh Q3 tăng trưởng mạnh..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            Xác nhận Đặt lệnh
          </button>
        </form>
      </div>
    </div>
  );
}
