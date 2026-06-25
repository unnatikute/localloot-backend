package com.localoot.localoot.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.localoot.localoot.model.User;
import com.localoot.localoot.model.Subscription;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByShopkeeperIdAndStatus(Long shopkeeperId, String status);

    List<Subscription> findByShopkeeperId(Long shopkeeperId);

    List<Subscription> findByStatus(String status);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.endDate < :date")
    List<Subscription> findExpiringSubscriptions(@Param("date") LocalDateTime date);

    @Query("SELECT s FROM Subscription s WHERE s.shopkeeper.id = :shopkeeperId AND s.status = 'ACTIVE' AND s.endDate >= :now")
    Optional<Subscription> findActiveSubscriptionForShopkeeper(@Param("shopkeeperId") Long shopkeeperId,
            @Param("now") LocalDateTime now);

    Subscription findTopByShopkeeperAndStatusOrderByStartDateDesc(User shopkeeper, String status);
}
