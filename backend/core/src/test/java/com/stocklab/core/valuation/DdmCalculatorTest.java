package com.stocklab.core.valuation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class DdmCalculatorTest {

    @Test
    @DisplayName("Should correctly calculate Gordon DDM valuation")
    void testGordonDdm() {
        // D0 = 2,000 VND, r = 12% (0.12), g = 5% (0.05)
        // D1 = 2000 * 1.05 = 2100
        // P = 2100 / (0.12 - 0.05) = 2100 / 0.07 = 30,000 VND
        BigDecimal d0 = new BigDecimal("2000");
        BigDecimal r = new BigDecimal("0.12");
        BigDecimal g = new BigDecimal("0.05");

        DdmCalculator.ValuationResult result = DdmCalculator.calculateGordon(d0, r, g);

        assertThat(result.baseValue()).isEqualByComparingTo("30000.00");
        assertThat(result.warnings()).isEmpty();
        assertThat(result.scenarios()).hasSize(3);
    }

    @Test
    @DisplayName("Should block and return warning when g >= r")
    void testGordonInvalidG() {
        BigDecimal d0 = new BigDecimal("2000");
        BigDecimal r = new BigDecimal("0.10");
        BigDecimal g = new BigDecimal("0.10");

        DdmCalculator.ValuationResult result = DdmCalculator.calculateGordon(d0, r, g);

        assertThat(result.baseValue()).isEqualByComparingTo("0");
        assertThat(result.warnings()).anyMatch(w -> w.contains("nhỏ hơn chi phí vốn"));
    }
}
