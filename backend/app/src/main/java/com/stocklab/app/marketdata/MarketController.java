package com.stocklab.app.marketdata;

import com.stocklab.app.common.dto.ApiResponse;
import com.stocklab.app.marketdata.service.MarketDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/market")
@Tag(name = "Market Overview", description = "Tổng quan chỉ số thị trường VN-Index, VN30 và Top biến động")
public class MarketController {

    private final MarketDataService marketDataService;

    public MarketController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Tổng quan chỉ số VN-Index, VN30, HNX và Lãi suất TPCP 10Y")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMarketOverview() {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.getMarketOverview()));
    }

    @GetMapping("/top-movers")
    @Operation(summary = "Danh sách top cổ phiếu tăng giá mạnh nhất và giảm giá mạnh nhất")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTopMovers() {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.getTopMovers()));
    }
}
