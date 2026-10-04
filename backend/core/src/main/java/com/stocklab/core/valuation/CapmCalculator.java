package com.stocklab.core.valuation;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

public class CapmCalculator {

    public record CapmResult(
            BigDecimal expectedReturn,
            BigDecimal riskFreeRate,
            BigDecimal beta,
            BigDecimal equityRiskPremium,
            List<String> warnings
    ) {}

    /**
     * Calculate cost of equity (r) using CAPM: r = rf + beta * ERP
     */
    public static CapmResult calculate(BigDecimal riskFreeRate, BigDecimal beta, BigDecimal equityRiskPremium) {
        List<String> warnings = new ArrayList<>();

        if (riskFreeRate == null || riskFreeRate.compareTo(BigDecimal.ZERO) <= 0) {
            warnings.add("Lãi suất phi rủi ro (rf) không hợp lệ hoặc <= 0.");
        }
        if (beta == null || beta.compareTo(BigDecimal.ZERO) <= 0) {
            warnings.add("Hệ số Beta không hợp lệ hoặc <= 0 (cổ phiếu có thể biến động nghịch pha hoặc thiếu dữ liệu).");
        }
        if (equityRiskPremium == null || equityRiskPremium.compareTo(BigDecimal.ZERO) <= 0) {
            warnings.add("Phần bù rủi ro vốn cổ phần (ERP) phải > 0.");
        }

        BigDecimal rf = riskFreeRate != null ? riskFreeRate : BigDecimal.valueOf(0.045);
        BigDecimal b = beta != null ? beta : BigDecimal.ONE;
        BigDecimal erp = equityRiskPremium != null ? equityRiskPremium : BigDecimal.valueOf(0.08);

        BigDecimal expectedReturn = rf.add(b.multiply(erp)).setScale(4, RoundingMode.HALF_UP);

        if (expectedReturn.compareTo(BigDecimal.valueOf(0.25)) > 0) {
            warnings.add("Chi phí vốn kỳ vọng (r) rất cao (> 25%), hãy kiểm tra lại giả định Beta hoặc ERP.");
        }

        return new CapmResult(expectedReturn, rf, b, erp, warnings);
    }
}
