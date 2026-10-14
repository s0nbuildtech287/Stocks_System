package com.stocklab.app.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger OpenAPI 3 Configuration.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI stockLabOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("VN Stock Lab — Quantitative Terminal API")
                        .description("RESTful Backend Services for Financial Analytics, Quantitative Portfolio Optimization, and Paper Trading.")
                        .version("v1.0.0")
                        .contact(new Contact().name("Xuan Son (xu4ns0n)").url("https://github.com/s0nbuildtech287"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")));
    }
}
