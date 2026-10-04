package com.stocklab.core.common;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Vietnam Stock Market Trading Calendar helper.
 * Filters weekends and statutory public holidays.
 */
public class TradingCalendar {

    private final Set<LocalDate> holidays = new HashSet<>();

    public TradingCalendar() {
        // Common statutory VN holidays (Tet, National day, etc.) can be loaded dynamically or registered
    }

    public void addHoliday(LocalDate holiday) {
        if (holiday != null) {
            holidays.add(holiday);
        }
    }

    public boolean isTradingDay(LocalDate date) {
        if (date == null) return false;
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return false;
        }
        return !holidays.contains(date);
    }

    public LocalDate nextTradingDay(LocalDate from) {
        LocalDate current = from.plusDays(1);
        while (!isTradingDay(current)) {
            current = current.plusDays(1);
        }
        return current;
    }

    public LocalDate addTradingDays(LocalDate from, int n) {
        LocalDate current = from;
        int count = 0;
        while (count < n) {
            current = current.plusDays(1);
            if (isTradingDay(current)) {
                count++;
            }
        }
        return current;
    }
}
