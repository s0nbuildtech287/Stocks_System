import sys
import json
import urllib.request
from datetime import datetime

STOCKS = [
    "FPT", "HPG", "TCB", "MBB", "MWG", "VCB", "ACB", "SSI", "CTG", "VPB",
    "STB", "VNM", "MSN", "GAS", "VHM", "VIC", "VRE", "BID", "HDB", "VIB",
    "TPB", "SHB", "SSB", "PNJ", "PLX", "POW", "GVR", "BCM", "VJC", "BVH",
    "DGC", "PVS", "PVD", "BSR", "GMD", "HAH", "VSC", "VCI", "HCM", "VND",
    "MBS", "HSG", "NKG", "KDH", "NLG", "IDC", "KBC", "DGW", "FRT", "REE",
    "LPB", "SAB", "PDR", "DIG", "DXG", "PVT", "DPM", "DCM"
]

def fetch_live():
    results = {}
    try:
        url = "https://bgapidatafeed.vps.com.vn/getliststockdata/" + ",".join(STOCKS)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            items = json.loads(response.read().decode("utf-8"))
            today_str = datetime.now().strftime("%Y-%m-%d")
            for s in items:
                sym = s.get("sym")
                if not sym:
                    continue
                raw_price = float(s.get("lastPrice") or s.get("r") or 0)
                price = raw_price * 1000 if raw_price < 1000 and raw_price > 0 else raw_price
                ref_raw = float(s.get("r") or raw_price)
                ref = ref_raw * 1000 if ref_raw < 1000 and ref_raw > 0 else ref_raw
                change = price - ref
                change_pct = (change / ref * 100) if ref > 0 else 0
                vol = int(s.get("lot") or 0)
                results[sym] = {
                    "price": round(price),
                    "change": round(change),
                    "changePct": round(change_pct, 2),
                    "volume24h": f"{round(vol / 1000000, 2)} M",
                    "volume": vol,
                    "date": today_str
                }
    except Exception as e:
        pass
    return results

if __name__ == "__main__":
    data = fetch_live()
    print(json.dumps(data))
