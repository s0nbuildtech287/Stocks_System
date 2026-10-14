package com.stocklab.app.backtest;

import com.stocklab.app.backtest.service.BacktestService;
import com.stocklab.app.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/backtests")
@Tag(name = "Backtest Engine", description = "Kiểm thử chiến lược đầu tư đa yếu tố theo chuỗi dữ liệu lịch sử")
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

    private final BacktestService backtestService;

    public BacktestController(BacktestService backtestService) {
        this.backtestService = backtestService;
    }

    @PostMapping
    @Operation(summary = "Gửi yêu cầu chạy kiểm thử chiến lược định lượng mới")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitBacktest(@RequestBody BacktestDefinition def) {
        return ResponseEntity.accepted().body(ApiResponse.ok("Job accepted", backtestService.submitBacktest(def)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy kết quả báo cáo hiệu suất và rủi ro của chiến lược sau khi chạy xong")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBacktestResult(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(backtestService.getBacktestResult(id)));
    }
}
