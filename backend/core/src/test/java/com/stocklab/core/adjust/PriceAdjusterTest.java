package com.stocklab.core.adjust;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PriceAdjusterTest {

    @Test
    @DisplayName("Should adjust historical prices for cash dividend")
    void testCashDividendAdjustment() {
        LocalDate d1 = LocalDate.of(2025, 1, 10);
        LocalDate d2 = LocalDate.of(2025, 1, 13); // Ex-date
        LocalDate d3 = LocalDate.of(2025, 1, 14);

        List<PriceAdjuster.DailyPrice> raw = List.of(
                createPrice(d1, new BigDecimal("100000")),
                createPrice(d2, new BigDecimal("95000")),
                createPrice(d3, new BigDecimal("96000"))
        );

        // Cash dividend 5,000 VND on d2
        PriceAdjuster.CorporateAction action = new PriceAdjuster.CorporateAction(
                PriceAdjuster.ActionType.CASH_DIVIDEND,
                d2,
                new BigDecimal("5000"),
                null, null, null
        );

        List<PriceAdjuster.DailyPrice> adjusted = PriceAdjuster.adjustPrices(raw, List.of(action));

        // Factor before d2 = (100,000 - 5,000) / 100,000 = 0.95
        // Price on d1 adjusted: 100,000 * 0.95 = 95,000
        assertThat(adjusted.get(0).adjClose()).isEqualByComparingTo("95000.0000");
        assertThat(adjusted.get(1).adjClose()).isEqualByComparingTo("95000.0000");
        assertThat(adjusted.get(2).adjClose()).isEqualByComparingTo("96000.0000");
    }

    @Test
    @DisplayName("Should adjust historical prices for 10% stock dividend")
    void testStockDividendAdjustment() {
        LocalDate d1 = LocalDate.of(2025, 2, 1);
        LocalDate d2 = LocalDate.of(2025, 2, 2); // Ex-date

        List<PriceAdjuster.DailyPrice> raw = List.of(
                createPrice(d1, new BigDecimal("110000")),
                createPrice(d2, new BigDecimal("100000"))
        );

        // 10% stock dividend (10:100)
        PriceAdjuster.CorporateAction action = new PriceAdjuster.CorporateAction(
                PriceAdjuster.ActionType.STOCK_DIVIDEND,
                d2,
                null,
                new BigDecimal("10"),
                new BigDecimal("100"),
                null
        );

        List<PriceAdjuster.DailyPrice> adjusted = PriceAdjuster.adjustPrices(raw, List.of(action));

        // Factor = 1 / (1 + 0.1) = 1 / 1.1 = 0.9090909091
        // d1 adjClose = 110,000 / 1.1 = 100,000
        assertThat(adjusted.get(0).adjClose()).isEqualByComparingTo("100000.0000");
        assertThat(adjusted.get(1).adjClose()).isEqualByComparingTo("100000.0000");
    }

    private PriceAdjuster.DailyPrice createPrice(LocalDate date, BigDecimal close) {
        return new PriceAdjuster.DailyPrice(
                date, close, close, close, close, 100000, close.multiply(BigDecimal.valueOf(100000)),
                BigDecimal.ONE, close
        );
    }
}
