package com.stocklab.app.marketdata;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "symbols")
public class SymbolEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String ticker;

    private String name;

    @Column(nullable = false, length = 10)
    private String exchange;

    private String industry;

    @Column(name = "industry_group", length = 20)
    private String industryGroup;

    @Column(name = "listing_date")
    private LocalDate listingDate;

    @Column(name = "delisting_date")
    private LocalDate delistingDate;

    @Column(nullable = false, length = 20)
    private String status = "LISTED";

    @Column(name = "shares_outstanding")
    private Long sharesOutstanding;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getExchange() { return exchange; }
    public void setExchange(String exchange) { this.exchange = exchange; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getIndustryGroup() { return industryGroup; }
    public void setIndustryGroup(String industryGroup) { this.industryGroup = industryGroup; }
    public LocalDate getListingDate() { return listingDate; }
    public void setListingDate(LocalDate listingDate) { this.listingDate = listingDate; }
    public LocalDate getDelistingDate() { return delistingDate; }
    public void setDelistingDate(LocalDate delistingDate) { this.delistingDate = delistingDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getSharesOutstanding() { return sharesOutstanding; }
    public void setSharesOutstanding(Long sharesOutstanding) { this.sharesOutstanding = sharesOutstanding; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
