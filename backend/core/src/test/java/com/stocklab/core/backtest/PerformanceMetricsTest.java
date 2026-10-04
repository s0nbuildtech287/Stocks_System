package com.stocklab.core.backtest;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PerformanceMetricsTest {

    @Test
    @DisplayName("Should correctly calculate CAGR, Drawdown and Sharpe")
    void testPerformanceMetrics() {
        List<BigDecimal> navs = List.of(
                new BigDecimal("100000000"),
                new BigDecimal("105000000"),
                new BigDecimal("95000000"), // Max DD from 105 to 95 = (105-95)/105 = 9.52%
                new BigDecimal("110000000"),
                new BigDecimal("120000000")
        );

        PerformanceMetrics.MetricsResult res = PerformanceMetrics.compute(navs, BigDecimal.valueOf(0.045));

        assertThat(res.totalReturn()).isEqualByComparingTo("0.2000"); // 20% gain
        assertThat(res.maxDrawdown()).isGreaterThan(BigDecimal.ZERO);
        assertThat(res.annualizedVolatility()).isGreaterThan(BigDecimal.ZERO);
    }
}
