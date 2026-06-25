package com.localoot.localoot.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "shops")
@Data
public class Shop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shopName;
    private String ownerName;
    private String email;
    private String mobileNumber;
    private String address;
    private String area;
    private String category;
    private String shopImage;
    private String registrationStatus; // APPROVED, PENDING, REJECTED
    private LocalDateTime registrationDate;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "shopkeeper_id")
    private User shopkeeper;

    // Document fields
    private String shopRegistrationDoc;
    private String gstDoc;
    private String ownerIdDoc;
    private String addressProofDoc;
    private String description;
private String documentUrl;
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.registrationDate == null) {
            this.registrationDate = LocalDateTime.now();
        }
        if (this.registrationStatus == null) {
            this.registrationStatus = "PENDING";
        }
    }
}
