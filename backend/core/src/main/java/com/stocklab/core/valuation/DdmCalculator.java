package com.stocklab.core.valuation;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class DdmCalculator {

    public record DdmScenario(
            String name,
            BigDecimal costOfEquity,
            BigDecimal growthRate,
            BigDecimal estimatedValue,
            boolean isValid
    ) {}

    public record ValuationResult(
            BigDecimal baseValue,
            List<DdmScenario> scenarios,
            Map<String, Map<String, BigDecimal>> sensitivityGrid, // r -> (g -> value)
            List<String> warnings
    ) {}

    /**
     * Calculate Gordon Growth Model (Constant Dividend Discount Model):
     * P = D0 * (1 + g) / (r - g) = D1 / (r - g)
     */
    public static ValuationResult calculateGordon(BigDecimal dividendD0, BigDecimal r, BigDecimal g) {
        List<String> warnings = new ArrayList<>();

        if (dividendD0 == null || dividendD0.compareTo(BigDecimal.ZERO) <= 0) {
            warnings.add("Doanh nghiệp không trả cổ tức tiền mặt (D0 <= 0), mô hình DDM không áp dụng được.");
            return new ValuationResult(BigDecimal.ZERO, List.of(), Map.of(), warnings);
        }

        if (r == null || g == null) {
            warnings.add("Thiếu tham số chi phí vốn (r) hoặc tốc độ tăng trưởng (g).");
            return new ValuationResult(BigDecimal.ZERO, List.of(), Map.of(), warnings);
        }

        if (g.compareTo(r) >= 0) {
            warnings.add("Tốc độ tăng trưởng dài hạn g (" + g + ") phải nhỏ hơn chi phí vốn r (" + r + ").");
            return new ValuationResult(BigDecimal.ZERO, List.of(), Map.of(), warnings);
        }

        if (r.subtract(g).compareTo(BigDecimal.valueOf(0.01)) < 0) {
            warnings.add("Chênh lệch (r - g) quá nhỏ (< 1%), định giá rất nhạy cảm và có thể bị thổi phồng.");
        }

        BigDecimal baseValue = computeSingleGordon(dividendD0, r, g);

        // Scenarios: Conservative, Base, Optimistic
        List<DdmScenario> scenarios = new ArrayList<>();
        scenarios.add(new DdmScenario("Thận trọng", r.add(BigDecimal.valueOf(0.01)), g.subtract(BigDecimal.valueOf(0.01)),
                computeSingleGordon(dividendD0, r.add(BigDecimal.valueOf(0.01)), g.subtract(BigDecimal.valueOf(0.01))), true));
        scenarios.add(new DdmScenario("Cơ sở", r, g, baseValue, true));
        scenarios.add(new DdmScenario("Lạc quan", r.subtract(BigDecimal.valueOf(0.005)), g.add(BigDecimal.valueOf(0.005)),
                computeSingleGordon(dividendD0, r.subtract(BigDecimal.valueOf(0.005)), g.add(BigDecimal.valueOf(0.005))), true));

        // Sensitivity Grid: r in [r-2%, r-1%, r, r+1%, r+2%], g in [g-2%, g-1%, g, g+1%, g+2%]
        Map<String, Map<String, BigDecimal>> grid = new LinkedHashMap<>();
        BigDecimal[] rSteps = {
                r.subtract(BigDecimal.valueOf(0.02)),
                r.subtract(BigDecimal.valueOf(0.01)),
                r,
                r.add(BigDecimal.valueOf(0.01)),
                r.add(BigDecimal.valueOf(0.02))
        };
        BigDecimal[] gSteps = {
                g.subtract(BigDecimal.valueOf(0.02)),
                g.subtract(BigDecimal.valueOf(0.01)),
                g,
                g.add(BigDecimal.valueOf(0.01)),
                g.add(BigDecimal.valueOf(0.02))
        };

        for (BigDecimal rVal : rSteps) {
            String rKey = rVal.multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP) + "%";
            Map<String, BigDecimal> gMap = new LinkedHashMap<>();
            for (BigDecimal gVal : gSteps) {
                String gKey = gVal.multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP) + "%";
                if (gVal.compareTo(rVal) >= 0 || gVal.compareTo(BigDecimal.ZERO) < 0) {
                    gMap.put(gKey, null); // Invalid
                } else {
                    gMap.put(gKey, computeSingleGordon(dividendD0, rVal, gVal));
                }
            }
            grid.put(rKey, gMap);
        }

        return new ValuationResult(baseValue, scenarios, grid, warnings);
    }

    private static BigDecimal computeSingleGordon(BigDecimal d0, BigDecimal r, BigDecimal g) {
        if (g.compareTo(r) >= 0) return BigDecimal.ZERO;
        BigDecimal d1 = d0.multiply(BigDecimal.ONE.add(g));
        return d1.divide(r.subtract(g), 2, RoundingMode.HALF_UP);
    }
}
