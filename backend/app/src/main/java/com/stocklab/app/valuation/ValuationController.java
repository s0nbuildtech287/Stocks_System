package com.stocklab.app.valuation;

import com.stocklab.app.common.dto.ApiResponse;
import com.stocklab.app.valuation.dto.CapmRequest;
import com.stocklab.app.valuation.dto.DdmRequest;
import com.stocklab.app.valuation.service.ValuationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/valuation")
@Tag(name = "Valuation Models", description = "Các mô hình định giá tài chính: CAPM, Gordon DDM")
public class ValuationController {

    private final ValuationService valuationService;

    public ValuationController(ValuationService valuationService) {
        this.valuationService = valuationService;
    }

    @PostMapping("/capm")
    @Operation(summary = "Tính toán chi phí vốn chủ sở hữu theo mô hình CAPM")
    public ResponseEntity<ApiResponse<Object>> calculateCapm(@RequestBody CapmRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(valuationService.calculateCapm(req)));
    }

    @PostMapping("/ddm")
    @Operation(summary = "Định giá giá trị hợp lý cổ phiếu theo mô hình Chiết khấu Cổ tức Gordon (DDM)")
    public ResponseEntity<ApiResponse<Object>> calculateDdm(@RequestBody DdmRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(valuationService.calculateDdm(req)));
    }

    @GetMapping("/{ticker}/defaults")
    @Operation(summary = "Lấy các giả định định giá tham chiếu mặc định của mã")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getValuationDefaults(@PathVariable String ticker) {
        return ResponseEntity.ok(ApiResponse.ok(valuationService.getValuationDefaults(ticker)));
    }
}
