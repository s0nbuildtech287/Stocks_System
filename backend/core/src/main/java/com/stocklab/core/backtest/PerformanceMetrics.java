package com.stocklab.core.backtest;

import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class PerformanceMetrics {

    public record MetricsResult(
            BigDecimal totalReturn,
            BigDecimal cagr,
            BigDecimal annualizedVolatility,
            BigDecimal sharpeRatio,
            BigDecimal maxDrawdown,
            BigDecimal winRate
    ) {}

    /**
     * Compute comprehensive performance metrics given daily NAV history.
     */
    public static MetricsResult compute(List<BigDecimal> navHistory, BigDecimal riskFreeRateAnnual) {
        if (navHistory == null || navHistory.size() < 2) {
            return new MetricsResult(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal initialNav = navHistory.get(0);
        BigDecimal finalNav = navHistory.get(navHistory.size() - 1);
        int totalDays = navHistory.size();

        // 1. Total Return
        BigDecimal totalReturn = finalNav.subtract(initialNav).divide(initialNav, 4, RoundingMode.HALF_UP);

        // 2. CAGR: (final / initial)^(252 / totalDays) - 1
        double years = (double) totalDays / 252.0;
        double cagrDouble = years > 0 ? Math.pow(finalNav.doubleValue() / initialNav.doubleValue(), 1.0 / years) - 1.0 : 0.0;
        BigDecimal cagr = BigDecimal.valueOf(cagrDouble).setScale(4, RoundingMode.HALF_UP);

        // 3. Daily returns, Volatility & Max Drawdown
        DescriptiveStatistics stats = new DescriptiveStatistics();
        BigDecimal peak = initialNav;
        BigDecimal maxDd = BigDecimal.ZERO;
        int positiveDays = 0;

        for (int i = 1; i < navHistory.size(); i++) {
            BigDecimal prev = navHistory.get(i - 1);
            BigDecimal curr = navHistory.get(i);

            if (curr.compareTo(peak) > 0) {
                peak = curr;
            } else {
                BigDecimal dd = peak.subtract(curr).divide(peak, 4, RoundingMode.HALF_UP);
                if (dd.compareTo(maxDd) > 0) {
                    maxDd = dd;
                }
            }

            double dailyReturn = (curr.doubleValue() - prev.doubleValue()) / prev.doubleValue();
            stats.addValue(dailyReturn);
            if (dailyReturn > 0) {
                positiveDays++;
            }
        }

        double dailyVol = stats.getStandardDeviation();
        double annualizedVol = dailyVol * Math.sqrt(252.0);
        BigDecimal vol = BigDecimal.valueOf(annualizedVol).setScale(4, RoundingMode.HALF_UP);

        // 4. Sharpe Ratio = (CAGR - rf) / annualizedVol
        double rf = riskFreeRateAnnual != null ? riskFreeRateAnnual.doubleValue() : 0.045;
        double sharpe = annualizedVol > 0 ? (cagrDouble - rf) / annualizedVol : 0.0;
        BigDecimal sharpeRatio = BigDecimal.valueOf(sharpe).setScale(4, RoundingMode.HALF_UP);

        // 5. Win rate
        BigDecimal winRate = BigDecimal.valueOf((double) positiveDays / (totalDays - 1)).setScale(4, RoundingMode.HALF_UP);

        return new MetricsResult(totalReturn, cagr, vol, sharpeRatio, maxDd, winRate);
    }
}
