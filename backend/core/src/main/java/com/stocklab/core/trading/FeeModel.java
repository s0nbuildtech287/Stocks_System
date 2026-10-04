package com.stocklab.core.trading;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record FeeModel(
        BigDecimal buyFeeRate,   // default 0.0015 (0.15%)
        BigDecimal sellFeeRate,  // default 0.0015 (0.15%)
        BigDecimal sellTaxRate   // default 0.0010 (0.10%)
) {
    public static FeeModel defaultVietnamRates() {
        return new FeeModel(
                BigDecimal.valueOf(0.0015),
                BigDecimal.valueOf(0.0015),
                BigDecimal.valueOf(0.0010)
        );
    }

    public BigDecimal calculateBuyCost(BigDecimal grossValue) {
        if (grossValue == null) return BigDecimal.ZERO;
        return grossValue.multiply(buyFeeRate).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateSellCost(BigDecimal grossValue) {
        if (grossValue == null) return BigDecimal.ZERO;
        BigDecimal fee = grossValue.multiply(sellFeeRate);
        BigDecimal tax = grossValue.multiply(sellTaxRate);
        return fee.add(tax).setScale(2, RoundingMode.HALF_UP);
    }
}
