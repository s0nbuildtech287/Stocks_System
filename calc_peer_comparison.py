import os
import sys
import json
import argparse
from datetime import datetime

# Ensure UTF-8 output and self-contained import path
sys.stdout.reconfigure(encoding='utf-8')
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from stock_dataset import KNOWN_PROFILES

def compute_peer_comparison(tickers):
    tickers = [t.strip().upper() for t in tickers if t.strip()]
    if not tickers:
        tickers = ["HPG", "NKG", "HSG"]

    peer_data = []

    for sym in tickers:
        base = KNOWN_PROFILES.get(sym, {
            "ticker": sym,
            "name": f"Công ty CP {sym}",
            "exchange": "HOSE",
            "category": "Niêm yết",
            "industry": "Đa ngành",
            "price": 25000,
            "change": 200,
            "changePct": 0.8,
            "marketCap": 20000,
            "pe": 14.0,
            "pb": 1.6,
            "ps": 1.4,
            "roe": 15.0,
            "roa": 6.5,
            "netMargin": 10.5,
            "debtToEquity": 0.75,
            "eps": 2200,
            "bvps": 15000,
            "revenueGrowthYoY": 12.0,
            "profitGrowthYoY": 14.0,
            "dividendYield": 3.0,
            "beta1y": 1.05,
            "rsi14": 52.0,
        })

        # Try fetching real quote if available
        live_price = base.get("price", 25000)
        live_change_pct = base.get("changePct", 0)
        try:
            from vnstock import Quote
            q = Quote(symbol=sym, source='VCI')
            df = q.history(start=(datetime.now()).strftime('%Y-%m-%d'), end=(datetime.now()).strftime('%Y-%m-%d'), interval='1D')
            if df is not None and not df.empty:
                last_row = df.iloc[-1]
                close_p = float(last_row.get('close', 0))
                open_p = float(last_row.get('open', close_p))
                if close_p > 0:
                    if close_p < 1000:
                        close_p *= 1000
                        open_p *= 1000
                    live_price = int(close_p)
                    live_change_pct = round(((close_p - open_p) / (open_p or 1)) * 100, 2)
        except Exception:
            pass

        # Normalized Radar Scores (0 to 100 scale)
        roe_val = base.get("roe", 12.0)
        pe_val = base.get("pe", 15.0)
        pb_val = base.get("pb", 1.8)
        margin_val = base.get("netMargin", 10.0)
        growth_val = base.get("profitGrowthYoY", 15.0)
        de_val = base.get("debtToEquity", 0.8)
        div_val = base.get("dividendYield", 2.5)

        # 1. Profitability (Sinh lời)
        score_profitability = min(98, max(30, int(roe_val * 3.5 + 20)))
        # 2. Valuation (Định giá hấp dẫn: P/E & P/B càng thấp điểm càng cao)
        score_valuation = min(98, max(25, int(105 - pe_val * 2.8 - pb_val * 8)))
        # 3. Growth (Tăng trưởng)
        score_growth = min(98, max(25, int(growth_val * 1.6 + 45)))
        # 4. Financial Health / Solvency (An toàn tài chính: D/E càng thấp điểm càng cao)
        score_solvency = min(98, max(30, int(95 - de_val * 35)))
        # 5. Margin (Biên lợi nhuận)
        score_margin = min(98, max(30, int(margin_val * 3.2 + 25)))
        # 6. Dividend & Cashflow (Cổ tức & Dòng tiền)
        score_dividend = min(98, max(25, int(div_val * 14 + 35)))

        radar_scores = {
            "profitability": score_profitability,
            "valuation": score_valuation,
            "growth": score_growth,
            "solvency": score_solvency,
            "margin": score_margin,
            "dividend": score_dividend,
        }

        overall_score = round(sum(radar_scores.values()) / len(radar_scores))

        peer_data.append({
            "ticker": sym,
            "name": base.get("name", f"Công ty CP {sym}"),
            "exchange": base.get("exchange", "HOSE"),
            "industry": base.get("industry", "Đa ngành"),
            "price": live_price,
            "changePct": live_change_pct,
            "marketCap": base.get("marketCap", 20000),
            "pe": pe_val,
            "pb": pb_val,
            "ps": base.get("ps", 1.4),
            "roe": roe_val,
            "roa": base.get("roa", 6.5),
            "netMargin": margin_val,
            "grossMargin": round(margin_val * 1.8, 1),
            "debtToEquity": de_val,
            "eps": base.get("eps", 2200),
            "bvps": base.get("bvps", 15000),
            "profitGrowthYoY": growth_val,
            "revenueGrowthYoY": base.get("revenueGrowthYoY", 12.0),
            "dividendYield": div_val,
            "beta1y": base.get("beta1y", 1.05),
            "rsi14": base.get("rsi14", 52.0),
            "overallScore": overall_score,
            "radar": radar_scores,
        })

    # Compute Sector Medians / Averages
    n = len(peer_data)
    sector_medians = {
        "pe": round(sum(p["pe"] for p in peer_data) / n, 2),
        "pb": round(sum(p["pb"] for p in peer_data) / n, 2),
        "roe": round(sum(p["roe"] for p in peer_data) / n, 1),
        "roa": round(sum(p["roa"] for p in peer_data) / n, 1),
        "netMargin": round(sum(p["netMargin"] for p in peer_data) / n, 1),
        "grossMargin": round(sum(p["grossMargin"] for p in peer_data) / n, 1),
        "debtToEquity": round(sum(p["debtToEquity"] for p in peer_data) / n, 2),
        "profitGrowthYoY": round(sum(p["profitGrowthYoY"] for p in peer_data) / n, 1),
        "dividendYield": round(sum(p["dividendYield"] for p in peer_data) / n, 1),
    }

    # Identify Leaders
    best_overall = max(peer_data, key=lambda x: x["overallScore"])
    best_value = min(peer_data, key=lambda x: x["pe"] * x["pb"])
    best_profitability = max(peer_data, key=lambda x: x["roe"])
    best_growth = max(peer_data, key=lambda x: x["profitGrowthYoY"])
    lowest_debt = min(peer_data, key=lambda x: x["debtToEquity"])

    # Relative Valuation Fair Values (Target Prices based on sector median multiples)
    for p in peer_data:
        # Fair price = (EPS * Median P/E + BVPS * Median P/B) / 2
        fair_pe_price = p["eps"] * sector_medians["pe"]
        fair_pb_price = p["bvps"] * sector_medians["pb"]
        target_fair_price = round((fair_pe_price + fair_pb_price) / 2)
        upside_pct = round(((target_fair_price - p["price"]) / (p["price"] or 1)) * 100, 1)
        p["relativeValuation"] = {
            "targetPrice": target_fair_price,
            "upsidePct": upside_pct,
            "verdict": "Định giá Thấp (Undervalued)" if upside_pct > 10 else "Định giá Hợp lý (Fair)" if upside_pct >= -10 else "Định giá Cao (Overvalued)"
        }

    return {
        "peers": peer_data,
        "sectorMedians": sector_medians,
        "leaders": {
            "bestOverall": best_overall["ticker"],
            "bestValue": best_value["ticker"],
            "bestProfitability": best_profitability["ticker"],
            "bestGrowth": best_growth["ticker"],
            "lowestDebt": lowest_debt["ticker"],
        },
        "radarLabels": [
            { "key": "profitability", "label": "Sinh lời (ROE/ROA)" },
            { "key": "valuation", "label": "Định giá Rẻ (P/E, P/B)" },
            { "key": "growth", "label": "Tăng trưởng LNST" },
            { "key": "solvency", "label": "An toàn Nợ (1/DE)" },
            { "key": "margin", "label": "Biên Lợi Nhuận" },
            { "key": "dividend", "label": "Cổ tức & Dòng tiền" },
        ]
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--tickers", type=str, default="HPG,NKG,HSG", help="Comma-separated ticker list")
    args = parser.parse_args()

    ticker_list = [t.strip() for t in args.tickers.split(",") if t.strip()]
    result = compute_peer_comparison(ticker_list)
    print(json.dumps(result, ensure_ascii=False, indent=2))
