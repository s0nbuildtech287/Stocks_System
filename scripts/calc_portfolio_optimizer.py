import os
import sys
import json
import argparse
import math
import random
from datetime import datetime

# Ensure UTF-8 output and self-contained import path
sys.stdout.reconfigure(encoding='utf-8')
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from stock_dataset import KNOWN_PROFILES

def calculate_portfolio_optimization(tickers, capital=500_000_000, rf=2.85):
    tickers = [t.strip().upper() for t in tickers if t.strip()]
    if not tickers:
        tickers = ["FPT", "HPG", "TCB", "VNM", "MWG"]

    num_assets = len(tickers)

    # 1. Asset Expected Returns & Annualized Volatility
    asset_meta = []
    base_annual_returns = []
    base_annual_vols = []

    for sym in tickers:
        prof = KNOWN_PROFILES.get(sym, {})
        beta = prof.get("beta1y", 1.05)
        roe = prof.get("roe", 16.0)
        growth = prof.get("profitGrowthYoY", 15.0)

        # Expected Annual Return estimate (CAPM + Fundamental Growth factor)
        exp_return = round(rf + beta * 8.5 + (roe - 15) * 0.35, 2)
        exp_vol = round(16.0 + beta * 9.5, 2)

        base_annual_returns.append(exp_return)
        base_annual_vols.append(exp_vol)

        asset_meta.append({
            "ticker": sym,
            "name": prof.get("name", f"Công ty CP {sym}"),
            "expectedReturn": exp_return,
            "volatility": exp_vol,
            "beta": beta,
        })

    # 2. Correlation Matrix
    # Deterministic correlation based on sector overlap
    corr_matrix = {}
    for i, s1 in enumerate(tickers):
        corr_matrix[s1] = {}
        for j, s2 in enumerate(tickers):
            if i == j:
                corr_matrix[s1][s2] = 1.0
            else:
                p1 = KNOWN_PROFILES.get(s1, {})
                p2 = KNOWN_PROFILES.get(s2, {})
                same_ind = p1.get("industryGroup") == p2.get("industryGroup")
                # Positive baseline correlation on VN-Index
                base_c = 0.55 if same_ind else 0.32
                # Slightly shift by deterministic ticker hash
                shift = (hash(s1 + s2) % 15) / 100.0
                corr_matrix[s1][s2] = round(max(0.1, min(0.85, base_c + shift)), 2)

    # Helper to compute portfolio stats given weights
    def get_portfolio_stats(weights):
        # Portfolio Expected Return = sum(w_i * r_i)
        p_return = sum(w * r for w, r in zip(weights, base_annual_returns))

        # Portfolio Variance = sum_i sum_j w_i w_j cov_ij
        p_var = 0.0
        for i, s1 in enumerate(tickers):
            for j, s2 in enumerate(tickers):
                cov = corr_matrix[s1][s2] * (base_annual_vols[i] / 100.0) * (base_annual_vols[j] / 100.0)
                p_var += weights[i] * weights[j] * cov

        p_vol = math.sqrt(max(0.0001, p_var)) * 100.0
        sharpe = (p_return - rf) / (p_vol if p_vol > 0 else 1.0)
        return p_return, p_vol, sharpe

    # 3. Monte Carlo Simulation for Efficient Frontier (600 simulation points)
    random.seed(42)
    frontier_points = []
    best_sharpe = -999.0
    best_sharpe_weights = None
    min_vol = 999.0
    min_vol_weights = None

    for _ in range(600):
        # Generate random weights summing to 1.0
        raw_weights = [random.expovariate(1.0) for _ in range(num_assets)]
        total = sum(raw_weights)
        weights = [round(w / total, 4) for w in raw_weights]
        # Re-normalize to exactly 1
        diff = 1.0 - sum(weights)
        weights[0] += diff

        p_ret, p_v, sh = get_portfolio_stats(weights)

        frontier_points.append({
            "volatility": round(p_v, 2),
            "expectedReturn": round(p_ret, 2),
            "sharpeRatio": round(sh, 2),
        })

        if sh > best_sharpe:
            best_sharpe = sh
            best_sharpe_weights = weights

        if p_v < min_vol:
            min_vol = p_v
            min_vol_weights = weights

    # Equal Weight Portfolio
    eq_weights = [round(1.0 / num_assets, 4)] * num_assets
    eq_weights[0] += 1.0 - sum(eq_weights)
    eq_ret, eq_vol, eq_sh = get_portfolio_stats(eq_weights)

    max_ret, max_vol, max_sh = get_portfolio_stats(best_sharpe_weights)
    min_ret, min_v, min_sh = get_portfolio_stats(min_vol_weights)

    # 4. Stress Testing Scenarios
    # Weighted beta
    max_sharpe_beta = sum(w * m["beta"] for w, m in zip(best_sharpe_weights, asset_meta))

    stress_tests = [
        {
            "id": "covid2020",
            "name": "☣️ Covid-19 Hoảng loạn (Tháng 3/2020)",
            "marketDrop": -33.5,
            "portfolioImpact": round(-33.5 * max_sharpe_beta * 0.78, 1),
            "estimatedLossVND": round(capital * abs(-33.5 * max_sharpe_beta * 0.78) / 100),
            "desc": "Thị trường mất thanh khoản, bán tháo toàn diện do dịch bệnh toàn cầu.",
            "recoveryMonths": 5,
        },
        {
            "id": "bond2022",
            "name": "📉 Khủng hoảng Trái phiếu & Lãi suất (2022)",
            "marketDrop": -38.2,
            "portfolioImpact": round(-38.2 * max_sharpe_beta * 0.82, 1),
            "estimatedLossVND": round(capital * abs(-38.2 * max_sharpe_beta * 0.82) / 100),
            "desc": "Thắt chặt tín dụng bất động sản và thanh tra trái phiếu doanh nghiệp.",
            "recoveryMonths": 9,
        },
        {
            "id": "margin2018",
            "name": "⚡ Siết Margin & Chiến tranh Thương mại (2018)",
            "marketDrop": -26.8,
            "portfolioImpact": round(-26.8 * max_sharpe_beta * 0.75, 1),
            "estimatedLossVND": round(capital * abs(-26.8 * max_sharpe_beta * 0.75) / 100),
            "desc": "VN-Index chạm đỉnh 1,200 điểm lần đầu và áp lực giải chấp chéo margin.",
            "recoveryMonths": 6,
        },
    ]

    # 5. Value at Risk (VaR & CVaR)
    daily_vol = max_vol / math.sqrt(252)
    # Parametric 95% 1-Day VaR (Z = 1.645)
    var_95_1d_pct = round(1.645 * daily_vol, 2)
    var_95_1d_vnd = round(capital * var_95_1d_pct / 100)

    # Parametric 99% 1-Week VaR (Z = 2.326, T = 5 days)
    var_99_1w_pct = round(2.326 * daily_vol * math.sqrt(5), 2)
    var_99_1w_vnd = round(capital * var_99_1w_pct / 100)

    # Expected Shortfall (CVaR 95%)
    cvar_95_pct = round(var_95_1d_pct * 1.25, 2)
    cvar_95_vnd = round(capital * cvar_95_pct / 100)

    # Format Allocation Weights
    max_sharpe_allocation = [
        {
            "ticker": sym,
            "weight": round(w * 100, 1),
            "capitalVND": round(capital * w),
        }
        for sym, w in zip(tickers, best_sharpe_weights)
    ]

    min_vol_allocation = [
        {
            "ticker": sym,
            "weight": round(w * 100, 1),
            "capitalVND": round(capital * w),
        }
        for sym, w in zip(tickers, min_vol_weights)
    ]

    equal_allocation = [
        {
            "ticker": sym,
            "weight": round(w * 100, 1),
            "capitalVND": round(capital * w),
        }
        for sym, w in zip(tickers, eq_weights)
    ]

    return {
        "tickers": tickers,
        "capital": capital,
        "riskFreeRate": rf,
        "assets": asset_meta,
        "correlationMatrix": corr_matrix,
        "frontierPoints": frontier_points,
        "portfolios": {
            "maxSharpe": {
                "name": "⭐ Danh mục Tối ưu (Max Sharpe)",
                "expectedReturn": round(max_ret, 2),
                "volatility": round(max_vol, 2),
                "sharpeRatio": round(max_sh, 2),
                "weights": max_sharpe_allocation,
            },
            "minVolatility": {
                "name": "🛡️ Danh mục Phòng thủ (Min Risk)",
                "expectedReturn": round(min_ret, 2),
                "volatility": round(min_v, 2),
                "sharpeRatio": round(min_sh, 2),
                "weights": min_vol_allocation,
            },
            "equalWeight": {
                "name": "⚖️ Danh mục Chia đều (Equal Weight)",
                "expectedReturn": round(eq_ret, 2),
                "volatility": round(eq_vol, 2),
                "sharpeRatio": round(eq_sh, 2),
                "weights": equal_allocation,
            },
        },
        "stressTests": stress_tests,
        "riskMetrics": {
            "var95_1d_pct": var_95_1d_pct,
            "var95_1d_vnd": var_95_1d_vnd,
            "var99_1w_pct": var_99_1w_pct,
            "var99_1w_vnd": var_99_1w_vnd,
            "cvar95_pct": cvar_95_pct,
            "cvar95_vnd": cvar_95_vnd,
            "annualVolatility": round(max_vol, 2),
            "dailyVolatility": round(daily_vol, 2),
            "portfolioBeta": round(max_sharpe_beta, 2),
        },
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--tickers", type=str, default="FPT,HPG,TCB,VNM,MWG", help="Comma-separated ticker list")
    parser.add_argument("--capital", type=int, default=500000000, help="Total investment capital in VND")
    parser.add_argument("--rf", type=float, default=2.85, help="Risk free rate %")
    args = parser.parse_args()

    ticker_list = [t.strip() for t in args.tickers.split(",") if t.strip()]
    res = calculate_portfolio_optimization(ticker_list, capital=args.capital, rf=args.rf)
    print(json.dumps(res, ensure_ascii=False, indent=2))
