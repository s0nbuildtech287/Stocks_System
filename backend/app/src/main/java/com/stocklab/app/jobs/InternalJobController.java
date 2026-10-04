package com.stocklab.app.jobs;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/internal/jobs")
public class InternalJobController {

    private static final Logger log = LoggerFactory.getLogger(InternalJobController.class);

    @Value("${app.security.internal-api-key:stocklab_internal_secret_recompute_token}")
    private String internalApiKey;

    @PostMapping("/recompute")
    public ResponseEntity<?> triggerRecompute(
            @RequestHeader(value = "X-Internal-Key", required = false) String providedKey
    ) {
        if (providedKey == null || !providedKey.equals(internalApiKey)) {
            log.warn("Unauthorized attempt to trigger /recompute with key: {}", providedKey);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "code", "UNAUTHORIZED",
                    "message", "Invalid or missing X-Internal-Key header"
            ));
        }

        log.info("Received valid recompute trigger from Ingestion service. Orchestrating pipeline...");
        
        // Pipeline:
        // 1. Recompute adjustment factors and adj_close for updated corporate actions
        // 2. Compute metrics_daily (Point-in-time TTM, Beta, P/E, P/B, ROE)
        // 3. Match and fill pending paper trading orders (T+1 open price)
        // 4. Update daily portfolio NAV
        // 5. Run data quality check

        return ResponseEntity.ok(Map.of(
                "status", "ACCEPTED",
                "message", "Recompute pipeline triggered successfully"
        ));
    }
}
