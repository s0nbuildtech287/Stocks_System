import sys
import json
from datetime import datetime, timedelta
from vnstock import Quote

STOCKS = [
    "FPT", "HPG", "TCB", "MBB", "MWG", "VCB", "ACB", "SSI", "CTG", "VPB",
    "STB", "VNM", "MSN", "GAS", "VHM", "VIC", "VRE", "BID", "HDB", "VIB",
    "TPB", "SHB", "SSB", "PNJ", "PLX", "POW", "GVR", "BCM", "VJC", "BVH",
    "DGC", "PVS", "PVD", "BSR", "GMD", "HAH", "VSC", "VCI", "HCM", "VND",
    "MBS", "HSG", "NKG", "KDH", "NLG", "IDC", "KBC", "DGW", "FRT", "REE",
    "LPB", "SAB", "PDR", "DIG", "DXG", "PVT", "DPM", "DCM"
]

def fetch_all():
    results = {}
    for sym in STOCKS:
        try:
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
                results[sym] = {
                    "price": c,
                    "change": change,
                    "changePct": round(change_pct, 2),
                    "volume24h": f"{round(v/1000000, 2)} M",
                    "volume": v,
                    "date": str(last_row.get("time", last_row.get("date", ""))).split()[0]
                }
        except Exception as e:
            continue
    return results

if __name__ == "__main__":
    data = fetch_all()
    print(json.dumps(data, indent=2))
