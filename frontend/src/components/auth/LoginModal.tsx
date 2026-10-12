"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginModal() {
  const {
    isLoginModalOpen,
    closeLoginModal,
    loginModalReason,
    login,
    register,
    quickLoginDemo,
  } = useAuth();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (tab === "login") {
      const res = login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || "Đăng nhập thất bại");
      }
    } else {
      const res = register(name, email, password);
      if (!res.success) {
        setErrorMsg(res.error || "Đăng ký thất bại");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#12161C] border border-[#2B313A] shadow-2xl text-[#EAECEF]">
        {/* Top Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#F0B90B] via-[#FFE259] to-[#0ECB81]" />

        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#848E9C] hover:text-white hover:bg-[#181A20] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Tài Khoản Nhà Đầu Tư
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              {tab === "login" ? "Đăng Nhập Hệ Thống" : "Tạo Tài Khoản Mới"}
            </h3>
            <p className="text-xs text-[#848E9C]">
              {tab === "login"
                ? "Lưu trữ danh mục yêu thích, nhật ký khớp lệnh và mô hình định lượng của riêng bạn."
                : "Gia nhập nền tảng phân tích định lượng chứng khoán Việt Nam chuyên nghiệp."}
            </p>
          </div>

          {/* Reason Notification Banner (if triggered by a save action) */}
          {loginModalReason && (
            <div className="p-3 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-start gap-2.5 text-xs text-[#F0B90B]">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">
                {loginModalReason}
              </div>
            </div>
          )}

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0B0E11] border border-[#2B313A] text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrorMsg("");
              }}
              className={`py-2 rounded-lg transition-all ${
                tab === "login"
                  ? "bg-[#181A20] text-[#F0B90B] shadow-sm"
                  : "text-[#848E9C] hover:text-white"
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setErrorMsg("");
              }}
              className={`py-2 rounded-lg transition-all ${
                tab === "register"
                  ? "bg-[#181A20] text-[#F0B90B] shadow-sm"
                  : "text-[#848E9C] hover:text-white"
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#F6465D]/10 border border-[#F6465D]/30 flex items-center gap-2 text-xs text-[#F6465D]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#848E9C]">Họ và Tên</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848E9C]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0E11] border border-[#2B313A] focus:border-[#F0B90B] focus:outline-none text-xs text-white placeholder-[#848E9C]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#848E9C]">Tên đăng nhập hoặc Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848E9C]" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="xu4ns0n hoặc email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0E11] border border-[#2B313A] focus:border-[#F0B90B] focus:outline-none text-xs text-white placeholder-[#848E9C]"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#848E9C]">Mật Khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848E9C]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0E11] border border-[#2B313A] focus:border-[#F0B90B] focus:outline-none text-xs text-white placeholder-[#848E9C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#848E9C] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F0B90B] to-[#FCD535] text-[#1E2329] font-black text-xs hover:shadow-lg hover:shadow-yellow-500/30 transition-all active:scale-95 cursor-pointer mt-2"
            >
              {tab === "login" ? "ĐĂNG NHẬP" : "HOÀN TẤT ĐĂNG KÝ"}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-[#2B313A]/60 space-y-2">
            <button
              type="button"
              onClick={quickLoginDemo}
              className="w-full py-2.5 px-4 rounded-xl bg-[#181A20] hover:bg-[#2B313A] border border-[#F0B90B]/30 text-xs text-[#F0B90B] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đăng Nhập Nhanh xu4ns0n / 123456 (1-Click)</span>
            </button>

            <button
              type="button"
              onClick={closeLoginModal}
              className="w-full py-2 text-xs text-[#848E9C] hover:text-white transition-colors"
            >
              Tiếp tục chế độ khách (Chỉ xem trải nghiệm)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
