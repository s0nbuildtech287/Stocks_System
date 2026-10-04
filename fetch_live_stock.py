import sys
import json
from datetime import datetime, timedelta
from vnstock import Quote

def get_stock_data(symbol: str, days: int = 180):
    try:
        q = Quote(symbol=symbol.upper())
        start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        df = q.history(start=start_date)
        if df is None or df.empty:
            return {"error": "No data returned"}

        records = []
        for _, row in df.iterrows():
            t = str(row.get("time", row.get("date", ""))).split()[0]
            c = float(row.get("close", 0))
            o = float(row.get("open", c))
            h = float(row.get("high", c))
            l = float(row.get("low", c))
            v = int(row.get("volume", 0))

            # If values are in thousands VND (< 500), convert to VND
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

        latest = records[-1] if records else {}
        prev = records[-2] if len(records) > 1 else latest
        change = latest.get("close", 0) - prev.get("close", 0)
        change_pct = (change / prev.get("close", 1)) * 100 if prev.get("close", 0) > 0 else 0

        return {
            "symbol": symbol.upper(),
            "latestPrice": latest.get("close", 0),
            "change": change,
            "changePct": change_pct,
            "history": records
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    ticker = sys.argv[1] if len(sys.argv) > 1 else "FPT"
    data = get_stock_data(ticker)
    print(json.dumps(data))
