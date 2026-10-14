package com.stocklab.app.papertrading.service.impl;

import com.stocklab.app.common.exception.AppException;
import com.stocklab.app.papertrading.dto.CreatePortfolioRequest;
import com.stocklab.app.papertrading.dto.PlaceOrderRequest;
import com.stocklab.app.papertrading.service.PaperTradingService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class PaperTradingServiceImpl implements PaperTradingService {

    @Override
    public List<Map<String, Object>> getUserPortfolios() {
        return List.of(
                Map.of(
                        "id", 1L,
                        "name", "Danh mục Tăng trưởng VN30",
                        "cash", 75000000,
                        "marketValue", 125000000,
                        "nav", 200000000,
                        "returnPct", 0.125
                )
        );
    }

    @Override
    public Map<String, Object> getPortfolioDetail(Long portfolioId) {
        return Map.of(
                "id", portfolioId,
                "name", "Danh mục Tăng trưởng VN30",
                "cash", 75000000,
                "nav", 200000000,
                "positions", List.of(
                        Map.of("ticker", "FPT", "totalQuantity", 500, "availableQuantity", 500, "avgCost", 115000, "currentPrice", 135000, "unrealizedPnl", 10000000),
                        Map.of("ticker", "MBB", "totalQuantity", 2000, "availableQuantity", 2000, "avgCost", 21000, "currentPrice", 24500, "unrealizedPnl", 7000000)
                ),
                "recentOrders", List.of(
                        Map.of("id", 101, "ticker", "FPT", "side", "BUY", "quantity", 500, "status", "FILLED", "thesis", "Kỳ vọng tăng trưởng AI 30%", "date", "2025-02-15")
                )
        );
    }

    @Override
    public Map<String, Object> createPortfolio(CreatePortfolioRequest req) {
        return Map.of(
                "id", System.currentTimeMillis() % 10000,
                "name", req.name(),
                "cash", req.initialCash() != null ? req.initialCash() : BigDecimal.valueOf(100000000),
                "message", "Khởi tạo danh mục mô phỏng thành công"
        );
    }

    @Override
    public Map<String, Object> placeOrder(Long portfolioId, PlaceOrderRequest req) {
        if (req.quantity() <= 0 || req.quantity() % 100 != 0) {
            throw new AppException("Khối lượng đặt lệnh phải là bội số của 100 (quy chuẩn lô chẵn sàn HOSE/HNX).");
        }
        if (req.thesis() == null || req.thesis().trim().length() < 5) {
            throw new AppException("Bắt buộc nhập Lý do đầu tư (Investment Thesis) ít nhất 5 ký tự để rèn luyện kỷ luật.");
        }

        return Map.of(
                "orderId", System.currentTimeMillis() % 100000,
                "portfolioId", portfolioId,
                "ticker", req.ticker().toUpperCase(),
                "side", req.side().toUpperCase(),
                "quantity", req.quantity(),
                "status", "FILLED",
                "message", "Khớp lệnh thành công. Cổ phiếu sẽ về tài khoản vào 13h00 ngày T+2 theo chu kỳ T+2.5."
        );
    }
}
