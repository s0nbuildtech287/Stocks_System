import sys
import json
import warnings
from datetime import datetime, timedelta
import yfinance as yf

warnings.filterwarnings("ignore")

def get_stock_data(symbol: str, days: int = 180):
    symbol = symbol.upper().strip()
    records = []

    # 1. Try Yahoo Finance first (Fast, no rate limit)
    try:
        yf_sym = f"{symbol}.VN"
        period = "6mo" if days <= 180 else "1y"
        df = yf.download(yf_sym, period=period, progress=False)

        if df is not None and not df.empty:
            for idx, row in df.iterrows():
                t = str(idx).split()[0]
                c = float(row.get("Close", 0))
                o = float(row.get("Open", c))
                h = float(row.get("High", c))
                l = float(row.get("Low", c))
                v = int(row.get("Volume", 0))

                records.append({
                    "time": t,
                    "open": o,
                    "high": h,
                    "low": l,
                    "close": c,
                    "volume": v
                })
    except Exception:
        pass

    # 2. Fallback to vnstock if Yahoo Finance returned empty
    if not records:
        try:
            from vnstock import Quote
            q = Quote(symbol=symbol)
            start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
            df = q.history(start=start_date)
            if df is not None and not df.empty:
                for _, row in df.iterrows():
                    t = str(row.get("time", row.get("date", ""))).split()[0]
                    c = float(row.get("close", 0))
                    o = float(row.get("open", c))
                    h = float(row.get("high", c))
                    l = float(row.get("low", c))
                    v = int(row.get("volume", 0))

                    if c < 500 and c > 0:
                        c *= 1000
                        o *= 1000
                        h *= 1000
                        l *= 1000

                    records.append({
                        "time": t,
                        "open": o,
                        "high": h,
                        "low": l,
                        "close": c,
                        "volume": v
                    })
        except Exception:
            pass

    if not records:
        return {"error": f"No data returned for {symbol}"}

    latest = records[-1]
    prev = records[-2] if len(records) > 1 else latest
    change = latest.get("close", 0) - prev.get("close", 0)
    change_pct = (change / prev.get("close", 1)) * 100 if prev.get("close", 0) > 0 else 0

    return {
        "symbol": symbol,
        "latestPrice": latest.get("close", 0),
        "change": round(change, 2),
        "changePct": round(change_pct, 2),
        "history": records
    }

if __name__ == "__main__":
    ticker = sys.argv[1] if len(sys.argv) > 1 else "FPT"
    data = get_stock_data(ticker)
    print(json.dumps(data))
