import sys
import json
import warnings
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
import yfinance as yf

warnings.filterwarnings("ignore")

STOCKS = [
    "FPT", "HPG", "TCB", "MBB", "MWG", "VCB", "ACB", "SSI", "CTG", "VPB",
    "STB", "VNM", "MSN", "GAS", "VHM", "VIC", "VRE", "BID", "HDB", "VIB",
    "TPB", "SHB", "SSB", "PNJ", "PLX", "POW", "GVR", "BCM", "VJC", "BVH",
    "DGC", "PVS", "PVD", "BSR", "GMD", "HAH", "VSC", "VCI", "HCM", "VND",
    "MBS", "HSG", "NKG", "KDH", "NLG", "IDC", "KBC", "DGW", "FRT", "REE",
    "LPB", "SAB", "PDR", "DIG", "DXG", "PVT", "DPM", "DCM"
]

def fetch_single_vnstock(sym):
    try:
        from vnstock import Quote
        q = Quote(symbol=sym)
        df = q.history(start=(datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d"))
        if df is not None and not df.empty:
            last_row = df.iloc[-1]
            prev_row = df.iloc[-2] if len(df) > 1 else last_row
            c = float(last_row.get("close", 0))
            p = float(prev_row.get("close", c))
            if c < 500 and c > 0:
                c *= 1000
                p *= 1000
            v = int(last_row.get("volume", 0))
            change = c - p
            change_pct = (change / p) * 100 if p > 0 else 0
            return sym, {
                "price": c,
                "change": round(change, 2),
                "changePct": round(change_pct, 2),
                "volume24h": f"{round(v/1000000, 2)} M",
                "volume": v,
                "date": str(last_row.get("time", last_row.get("date", ""))).split()[0]
            }
    except Exception:
        pass
    return sym, None

def fetch_all_hybrid():
    results = {}
    missing_symbols = []

    # 1. Primary engine: Yahoo Finance batch download
    try:
        yf_tickers = [f"{s}.VN" for s in STOCKS]
        df = yf.download(yf_tickers, period="5d", progress=False)

        if df is not None and not df.empty:
            close_df = df["Close"] if "Close" in df else None
            vol_df = df["Volume"] if "Volume" in df else None

            for sym in STOCKS:
                col = f"{sym}.VN"
                has_data = False
                if close_df is not None and col in close_df.columns:
                    s_close = close_df[col].dropna()
                    if len(s_close) >= 1:
                        c = float(s_close.iloc[-1])
                        p = float(s_close.iloc[-2]) if len(s_close) > 1 else c
                        change = c - p
                        change_pct = (change / p) * 100 if p > 0 else 0

                        v = 0
                        if vol_df is not None and col in vol_df.columns:
                            s_vol = vol_df[col].dropna()
                            if not s_vol.empty:
                                v = int(s_vol.iloc[-1])

                        d_str = str(s_close.index[-1]).split()[0]

                        results[sym] = {
                            "price": c,
                            "change": round(change, 2),
                            "changePct": round(change_pct, 2),
                            "volume24h": f"{round(v/1000000, 2)} M",
                            "volume": v,
                            "date": d_str
                        }
                        has_data = True

                if not has_data:
                    missing_symbols.append(sym)
        else:
            missing_symbols = list(STOCKS)
    except Exception:
        missing_symbols = list(STOCKS)

    # 2. Secondary fallback engine: vnstock for any missing symbols (e.g. HNX tickers)
    if missing_symbols:
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(fetch_single_vnstock, sym) for sym in missing_symbols]
            for f in futures:
                sym, data = f.result()
                if data:
                    results[sym] = data

    return results

if __name__ == "__main__":
    data = fetch_all_hybrid()
    print(json.dumps(data))
