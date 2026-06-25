package com.localoot.localoot.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "subscription_packages")
@Data
public class SubscriptionPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
private Integer topOffersAllowed; // Top offers allowed
    private String name; // e.g., "Basic", "Premium", "Enterprise"
    private String description;
    
    // Offer limits
    private Integer monthlyOfferLimit; // Offers per month
    private Integer yearlyOfferLimit; // Offers per year (optional, can be null)
    
    // Pricing
    private Double monthlyPrice;
    private Double yearlyPrice;
    
    // Duration type (MONTHLY, YEARLY, or both)
    private String durationType; // "MONTHLY", "YEARLY", "BOTH"
    
    // Status
    private Boolean isActive = true;
    private Integer displayOrder = 0; // For sorting in UI
    
    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
        if (this.isActive == null) {
            this.isActive = true;
        }
    }
}
