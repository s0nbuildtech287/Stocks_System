package com.stocklab.app.backtest.service.impl;

import com.stocklab.app.backtest.BacktestController.BacktestDefinition;
import com.stocklab.app.backtest.service.BacktestService;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class BacktestServiceImpl implements BacktestService {

    @Override
    public Map<String, Object> submitBacktest(BacktestDefinition def) {
        long runId = System.currentTimeMillis();
        return Map.of(
                "runId", runId,
                "status", "QUEUED",
                "message", "Chiến lược " + def.name() + " đã được tiếp nhận vào hàng đợi kiểm thử định lượng."
        );
    }

    @Override
    public Map<String, Object> getBacktestResult(Long id) {
        return Map.of(
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
        );
    }
}
