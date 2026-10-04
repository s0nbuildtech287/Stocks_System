package com.stocklab.app.backtest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/backtests")
public class BacktestController {

    public record BacktestDefinition(
            String name,
            String benchmark,
            LocalDate startDate,
            LocalDate endDate,
            String universe,
            String rankingFactor,
            int topN,
            String rebalanceFrequency
    ) {}

    @PostMapping
    public ResponseEntity<?> submitBacktest(@RequestBody BacktestDefinition def) {
        long runId = System.currentTimeMillis();
        return ResponseEntity.accepted().body(Map.of(
                "runId", runId,
                "status", "QUEUED",
                "message", "Backtest job đã được đưa vào hàng đợi xử lý bất đồng bộ."
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBacktestResult(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of(
                "id", id,
                "name", "Chiến lược Factor Ranking ROE Top 15 (VN100)",
                "status", "DONE",
                "benchmark", "VNINDEX",
                "metrics", Map.of(
                        "totalReturn", 0.452,
                        "cagr", 0.185,
                        "annualizedVol", 0.213,
                        "sharpeRatio", 0.657,
                        "maxDrawdown", 0.168,
                        "winRate", 0.582,
                        "turnover", 0.85
                ),
                "benchmarkMetrics", Map.of(
                        "totalReturn", 0.221,
                        "cagr", 0.098,
                        "annualizedVol", 0.235,
                        "sharpeRatio", 0.225,
                        "maxDrawdown", 0.284
                )
        ));
    }

    @GetMapping("/{id}/equity")
    public ResponseEntity<?> getEquityCurve(@PathVariable Long id) {
        return ResponseEntity.ok(List.of(
                Map.of("date", "2024-01-02", "nav", 100.0, "benchmarkNav", 100.0, "drawdown", 0.0),
                Map.of("date", "2024-03-31", "nav", 112.5, "benchmarkNav", 106.2, "drawdown", 0.0),
                Map.of("date", "2024-06-30", "nav", 124.8, "benchmarkNav", 109.4, "drawdown", 0.02),
                Map.of("date", "2024-09-30", "nav", 138.2, "benchmarkNav", 115.1, "drawdown", 0.0),
                Map.of("date", "2024-12-31", "nav", 145.2, "benchmarkNav", 122.1, "drawdown", 0.03)
        ));
    }
}
