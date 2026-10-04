package com.stocklab.app.marketdata;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/market")
public class MarketController {

    @GetMapping("/overview")
    public ResponseEntity<?> getMarketOverview() {
        return ResponseEntity.ok(Map.of(
                "indices", List.of(
                        Map.of("code", "VNINDEX", "close", 1280.50, "change", 12.30, "changePct", 0.97, "volume", 750000000, "value", 18500000000000L),
                        Map.of("code", "VN30", "close", 1345.80, "change", 15.60, "changePct", 1.17, "volume", 280000000, "value", 9200000000000L),
                        Map.of("code", "HNX", "close", 235.40, "change", 1.80, "changePct", 0.77, "volume", 65000000, "value", 1200000000000L)
                ),
                "riskFreeRate10Y", 2.85,
                "marketSentiment", "Tích cực"
        ));
    }

    @GetMapping("/top-movers")
    public ResponseEntity<?> getTopMovers() {
        return ResponseEntity.ok(Map.of(
                "gainers", List.of(
                        Map.of("ticker", "FPT", "price", 135000, "changePct", 6.8),
                        Map.of("ticker", "MWG", "price", 68500, "changePct", 5.2),
                        Map.of("ticker", "TCB", "price", 24800, "changePct", 4.3)
                ),
                "losers", List.of(
                        Map.of("ticker", "VHM", "price", 41200, "changePct", -2.1),
                        Map.of("ticker", "NVL", "price", 11200, "changePct", -1.8)
                )
        ));
    }
}
