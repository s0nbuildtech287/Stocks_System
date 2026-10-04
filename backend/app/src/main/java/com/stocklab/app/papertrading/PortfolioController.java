package com.stocklab.app.papertrading;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/portfolios")
public class PortfolioController {

    public record CreatePortfolioRequest(String name, BigDecimal initialCash) {}

    public record PlaceOrderRequest(
            String ticker,
            String side,          // BUY | SELL
            String orderType,     // MARKET | LIMIT
            int quantity,         // Must be multiple of 100
            BigDecimal limitPrice,
            String thesis         // REQUIRED: reason for buying/selling
    ) {}

    @GetMapping
    public ResponseEntity<?> getUserPortfolios() {
        return ResponseEntity.ok(List.of(
                Map.of(
                        "id", 1,
                        "name", "Danh mục Tăng trưởng VN30",
                        "cash", 75000000,
                        "marketValue", 125000000,
                        "nav", 200000000,
                        "returnPct", 0.125
                )
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPortfolioDetail(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of(
                "id", id,
                "name", "Danh mục Tăng trưởng VN30",
                "cash", 75000000,
                "nav", 200000000,
                "positions", List.of(
                        Map.of("ticker", "FPT", "totalQuantity", 500, "availableQuantity", 500, "avgCost", 115000, "currentPrice", 135000, "unrealizedPnl", 10000000),
                        Map.of("ticker", "MBB", "totalQuantity", 2000, "availableQuantity", 2000, "avgCost", 21000, "currentPrice", 24500, "unrealizedPnl", 7000000)
                ),
                "recentOrders", List.of(
                        Map.of("id", 101, "ticker", "FPT", "side", "BUY", "quantity", 500, "status", "FILLED", "thesis", "Kỳ vọng tăng trưởng mảng AI & Cloud 30% YoY", "date", "2025-02-15")
                )
        ));
    }

    @PostMapping("/{id}/orders")
    public ResponseEntity<?> placeOrder(@PathVariable Long id, @RequestBody PlaceOrderRequest req) {
        if (req.quantity() <= 0 || req.quantity() % 100 != 0) {
            return ResponseEntity.badRequest().body(Map.of("code", "INVALID_LOT", "message", "Khối lượng phải là bội số của 100 cổ phiếu."));
        }
        if (req.thesis() == null || req.thesis().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("code", "THESIS_REQUIRED", "message", "Bắt buộc nhập lý do (thesis) vào lệnh để học tập và rèn luyện kỷ luật."));
        }

        return ResponseEntity.ok(Map.of(
                "orderId", System.currentTimeMillis(),
                "status", "PENDING",
                "message", "Lệnh đã được ghi nhận vào hàng đợi, sẽ được khớp theo giá mở cửa phiên giao dịch tiếp theo (T+1)."
        ));
    }
}
