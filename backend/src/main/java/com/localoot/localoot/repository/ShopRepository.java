package com.localoot.localoot.repository;

import com.localoot.localoot.model.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {
    
    // AdminController calls this for filtering
    List<Shop> findByRegistrationStatus(String status);
    
    // AdminController calls this for stats
    long countByRegistrationStatus(String status);
    
    // AdminController calls this for charts
    @Query(value = "SELECT DATE_FORMAT(registration_date, '%Y-%m') as month, COUNT(*) as count " +
                   "FROM shops GROUP BY month ORDER BY month DESC", nativeQuery = true)
    List<Object[]> getShopsRegisteredByMonth();
List<Shop> findByShopkeeper_Id(Long id);
}