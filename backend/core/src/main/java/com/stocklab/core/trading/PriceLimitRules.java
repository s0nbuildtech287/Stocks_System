package com.stocklab.core.trading;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class PriceLimitRules {

    public record PriceCeilFloor(BigDecimal ceiling, BigDecimal floor) {}

    public static PriceCeilFloor getCeilingFloor(String exchange, BigDecimal referencePrice) {
        if (referencePrice == null || referencePrice.compareTo(BigDecimal.ZERO) <= 0) {
            return new PriceCeilFloor(BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal limitPct = switch (exchange != null ? exchange.toUpperCase() : "HOSE") {
            case "HNX" -> BigDecimal.valueOf(0.10);
            case "UPCOM" -> BigDecimal.valueOf(0.15);
            default -> BigDecimal.valueOf(0.07); // HOSE
        };

        BigDecimal delta = referencePrice.multiply(limitPct);
        BigDecimal ceil = referencePrice.add(delta).setScale(2, RoundingMode.HALF_UP);
        BigDecimal floor = referencePrice.subtract(delta).setScale(2, RoundingMode.HALF_UP);

        return new PriceCeilFloor(ceil, floor);
    }

    public static boolean isPriceWithinLimits(String exchange, BigDecimal referencePrice, BigDecimal targetPrice) {
        PriceCeilFloor limits = getCeilingFloor(exchange, referencePrice);
        return targetPrice.compareTo(limits.floor()) >= 0 && targetPrice.compareTo(limits.ceiling()) <= 0;
    }
}
