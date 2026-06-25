package com.localoot.localoot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.localoot.localoot.model.Offer;
import com.localoot.localoot.model.User;
public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByStatus(String status);
 List<Offer> findByShopkeeper_Id(Long id);
    
    // For the Customer app filtering
    List<Offer> findByStatusAndAreaAndCategory(String status, String area, String category);
    long countByShopkeeperAndTopOfferTrue(User shopkeeper);
  List<Offer> findTop5ByTopOfferTrueAndStatusOrderByPinnedRankAsc(String status);
}