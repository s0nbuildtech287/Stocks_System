package com.stocklab.app.marketdata;

import com.stocklab.app.common.dto.ApiResponse;
import com.stocklab.app.marketdata.dto.DailyPriceResponse;
import com.stocklab.app.marketdata.dto.SymbolResponse;
import com.stocklab.app.marketdata.service.MarketDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/symbols")
@Tag(name = "Market Data - Symbols", description = "Endpoints tra cứu mã niêm yết, lịch sử giá và chỉ số tài chính")
public class SymbolController {

    private final MarketDataService marketDataService;

    public SymbolController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách mã chứng khoán theo sàn hoặc từ khóa tìm kiếm")
    public ResponseEntity<ApiResponse<List<SymbolResponse>>> getAllSymbols(
            @RequestParam(required = false) String exchange,
            @RequestParam(required = false) String query
    ) {
        List<SymbolResponse> list = marketDataService.getAllSymbols(exchange, query);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{ticker}")
    @Operation(summary = "Lấy thông tin chi tiết của một mã chứng khoán")
    public ResponseEntity<ApiResponse<SymbolResponse>> getSymbolDetail(@PathVariable String ticker) {
        SymbolResponse detail = marketDataService.getSymbolDetail(ticker);
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    @GetMapping("/{ticker}/prices")
    @Operation(summary = "Lấy chuỗi dữ liệu giá lịch sử OHLCV theo khoảng thời gian")
    public ResponseEntity<ApiResponse<List<DailyPriceResponse>>> getSymbolPrices(
            @PathVariable String ticker,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "true") boolean adjusted
    ) {
        List<DailyPriceResponse> prices = marketDataService.getHistoricalPrices(ticker, from, to, adjusted);
        return ResponseEntity.ok(ApiResponse.ok(prices));
    }

    @GetMapping("/{ticker}/metrics")
    @Operation(summary = "Lấy các chỉ số tài chính định lượng Point-in-time của mã")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSymbolMetrics(@PathVariable String ticker) {
        Map<String, Object> metrics = marketDataService.getSymbolMetrics(ticker);
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }
}
