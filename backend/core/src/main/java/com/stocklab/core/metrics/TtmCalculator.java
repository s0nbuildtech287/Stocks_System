package com.stocklab.core.metrics;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public class TtmCalculator {

    public record FinancialQuarter(
            int year,
            int quarter,
            LocalDate publishedDate,
            BigDecimal revenue,
            BigDecimal netProfit,
            BigDecimal equity,
            BigDecimal totalAssets
    ) {}

    /**
     * Compute trailing twelve months (TTM) sum of net profit as of date T.
     * Only considers quarters with publishedDate <= asOfDate.
     */
    public static BigDecimal calculateNetProfitTtm(List<FinancialQuarter> quarters, LocalDate asOfDate) {
        if (quarters == null || quarters.isEmpty() || asOfDate == null) {
            return null;
        }

        // Filter point-in-time
        List<FinancialQuarter> valid = quarters.stream()
                .filter(q -> q.publishedDate() != null && !q.publishedDate().isAfter(asOfDate))
                .sorted(Comparator.comparingInt(FinancialQuarter::year).reversed()
                        .thenComparing(Comparator.comparingInt(FinancialQuarter::quarter).reversed()))
                .limit(4)
                .toList();

        if (valid.size() < 4) {
            return null; // Not enough 4 quarters for accurate TTM
        }

        BigDecimal sum = BigDecimal.ZERO;
        for (FinancialQuarter q : valid) {
            if (q.netProfit() == null) return null;
            sum = sum.add(q.netProfit());
        }
        return sum;
    }

    /**
     * Compute trailing twelve months (TTM) sum of revenue as of date T.
     */
    public static BigDecimal calculateRevenueTtm(List<FinancialQuarter> quarters, LocalDate asOfDate) {
        if (quarters == null || quarters.isEmpty() || asOfDate == null) {
            return null;
        }

        List<FinancialQuarter> valid = quarters.stream()
                .filter(q -> q.publishedDate() != null && !q.publishedDate().isAfter(asOfDate))
                .sorted(Comparator.comparingInt(FinancialQuarter::year).reversed()
                        .thenComparing(Comparator.comparingInt(FinancialQuarter::quarter).reversed()))
                .limit(4)
                .toList();

        if (valid.size() < 4) {
            return null;
        }

        BigDecimal sum = BigDecimal.ZERO;
        for (FinancialQuarter q : valid) {
            if (q.revenue() == null) return null;
            sum = sum.add(q.revenue());
        }
        return sum;
    }
}
