package com.stocklab.app.papertrading;

import com.stocklab.app.common.dto.ApiResponse;
import com.stocklab.app.papertrading.dto.CreatePortfolioRequest;
import com.stocklab.app.papertrading.dto.PlaceOrderRequest;
import com.stocklab.app.papertrading.service.PaperTradingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/portfolios")
@Tag(name = "Paper Trading", description = "Giao dịch mô phỏng chứng khoán Việt Nam chuẩn chu kỳ T+2.5")
public class PortfolioController {

    private final PaperTradingService paperTradingService;

    public PortfolioController(PaperTradingService paperTradingService) {
        this.paperTradingService = paperTradingService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách các danh mục đầu tư mô phỏng của người dùng")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUserPortfolios() {
        return ResponseEntity.ok(ApiResponse.ok(paperTradingService.getUserPortfolios()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết danh mục, số dư tiền, vị thế nắm giữ và lịch sử lệnh")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPortfolioDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(paperTradingService.getPortfolioDetail(id)));
    }

    @PostMapping
    @Operation(summary = "Tạo danh mục đầu tư mô phỏng mới")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPortfolio(@RequestBody CreatePortfolioRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Tạo danh mục thành công", paperTradingService.createPortfolio(req)));
    }

    @PostMapping("/{id}/orders")
    @Operation(summary = "Đặt lệnh MUA/BÁN cổ phiếu mô phỏng theo quy tắc khớp lệnh lô chẵn")
    public ResponseEntity<ApiResponse<Map<String, Object>>> placeOrder(
            @PathVariable Long id,
            @RequestBody PlaceOrderRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Đặt lệnh thành công", paperTradingService.placeOrder(id, req)));
    }
}
