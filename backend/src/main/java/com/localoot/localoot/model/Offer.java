package com.localoot.localoot.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "offers")
@Data
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String category;
    private String area;
    private String shopName;
    private String address;
    private String googleMapUrl;
    private String mobileNumber;
    private String imageUrl;
private LocalDateTime expiryDate;
    private Double price;
    private Double originalPrice;
    private Integer discount;
    private Integer likes = 0;
    @Column(nullable = false)
    private boolean topOffer = false;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;

    private String durationType;
    private Integer durationValue;

    private String status = "PENDING";
    private String adminStatusComment;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;

    private Integer pinnedRank;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "shopkeeper_id")
    private User shopkeeper;
}