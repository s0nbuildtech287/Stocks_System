package com.stocklab.app.common.dto;

import java.util.List;

/**
 * Standard paginated response envelope.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean isLast
) {
    public static <T> PageResponse<T> of(List<T> content, int page, int size, long total) {
        int totalPages = size > 0 ? (int) Math.ceil((double) total / size) : 1;
        boolean isLast = page >= totalPages - 1;
        return new PageResponse<>(content, page, size, total, totalPages, isLast);
    }
}
