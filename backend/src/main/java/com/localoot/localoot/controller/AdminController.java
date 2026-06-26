package com.localoot.localoot.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import com.localoot.localoot.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.localoot.localoot.dto.UserDetailsDTO;
import com.localoot.localoot.model.Offer;
import com.localoot.localoot.model.Payment;
import com.localoot.localoot.model.Shop;
import com.localoot.localoot.model.Subscription;
import com.localoot.localoot.model.User;
import com.localoot.localoot.repository.OfferRepository;
import com.localoot.localoot.repository.PaymentRepository;
import com.localoot.localoot.repository.ShopRepository;
import com.localoot.localoot.repository.SubscriptionRepository;
import com.localoot.localoot.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private EmailService emailService;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    // ============= SHOP ENDPOINTS =============

    /**
     * Get all registered shops with optional filters
     */
    @GetMapping("/shops")
    public ResponseEntity<?> getAllShops(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String search) {

        List<Shop> shops = shopRepository.findAll();

        // Filter by status if provided
        if (status != null && !status.isEmpty()) {
            shops = shops.stream()
                    .filter(s -> s.getRegistrationStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        // Filter by month (format: YYYY-MM)
        if (month != null && !month.isEmpty()) {
            shops = shops.stream()
                    .filter(s -> s.getRegistrationDate() != null &&
                            s.getRegistrationDate().toString().startsWith(month))
                    .collect(Collectors.toList());
        }

        // Search by shop name or email
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            shops = shops.stream()
                    .filter(s -> s.getShopName().toLowerCase().contains(searchLower) ||
                            s.getEmail().toLowerCase().contains(searchLower) ||
                            s.getOwnerName().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(shops);
    }

    /**
     * Get shop statistics
     */
    @GetMapping("/shops/stats")
    public ResponseEntity<?> getShopStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalShops", shopRepository.count());
        stats.put("approvedShops", shopRepository.countByRegistrationStatus("APPROVED"));
        stats.put("pendingShops", shopRepository.countByRegistrationStatus("PENDING"));
        stats.put("rejectedShops", shopRepository.countByRegistrationStatus("REJECTED"));

        return ResponseEntity.ok(stats);
    }

    /**
     * Get shops registered by month
     */
    @GetMapping("/shops/by-month")
    public ResponseEntity<?> getShopsByMonth() {
        List<Object[]> results = shopRepository.getShopsRegisteredByMonth();
        Map<String, Integer> monthlyData = new LinkedHashMap<>();

        for (Object[] row : results) {
            String month = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            monthlyData.put(month, count.intValue());
        }

        return ResponseEntity.ok(monthlyData);
    }

    /**
     * Get single shop details with documents
     */
    @GetMapping("/shops/{id}")
    public ResponseEntity<?> getShopDetails(@PathVariable Long id) {
        return shopRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Approve shop registration
     */
    @PutMapping("/shops/{id}/approve")
    public ResponseEntity<?> approveShop(@PathVariable Long id) {
        Optional<Shop> shop = shopRepository.findById(id);
        if (shop.isPresent()) {
            Shop s = shop.get();
            s.setRegistrationStatus("APPROVED");
            
shopRepository.save(s);

String recipient = s.getShopkeeper() != null
        ? s.getShopkeeper().getEmail()
        : s.getEmail();

System.out.println("APPROVAL MAIL TO = " + recipient);

emailService.sendMail(
    recipient,
    "Shop Approved 🎉",
    "Congratulations! Your shop '" + s.getShopName() + "' has been approved and is now live on Localoot."
);
            return ResponseEntity.ok("Shop approved successfully!");
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Reject shop registration
     */
    @PutMapping("/shops/{id}/reject")
    public ResponseEntity<?> rejectShop(@PathVariable Long id) {
        Optional<Shop> shop = shopRepository.findById(id);
        if (shop.isPresent()) {
            Shop s = shop.get();
            s.setRegistrationStatus("REJECTED");
            shopRepository.save(s);
            emailService.sendMail(
        s.getEmail(),
        "Shop Rejected",
        "Sorry, your shop '" + s.getShopName() + "' has been rejected. Please contact admin."
);
            return ResponseEntity.ok("Shop rejected!");
        }
        return ResponseEntity.notFound().build();
    }

    // ============= OFFER ENDPOINTS =============

    // Get all pending offers
    @GetMapping("/offers/pending")
    public ResponseEntity<?> getPendingOffers() {
        List<Offer> pending = offerRepository.findByStatus("PENDING");
        return ResponseEntity.ok(pending);
    }

    // Approve offer
          @PutMapping("/offers/{id}/approve")
public ResponseEntity<?> approveOffer(@PathVariable Long id) {
    Optional<Offer> offerOpt = offerRepository.findById(id);

    if (offerOpt.isPresent()) {
        Offer offer = offerOpt.get();

        offer.setStatus("APPROVED");
        offer.setApprovedAt(LocalDateTime.now());
        offerRepository.save(offer);

        // ✅ FIXED: ONLY shopkeeper (NO getShop())
        String recipient = offer.getShopkeeper() != null
                ? offer.getShopkeeper().getEmail()
                : null;

        System.out.println("OFFER APPROVAL MAIL TO = " + recipient);

        if (recipient != null) {
            emailService.sendMail(
                    recipient,
                    "Offer Approved 🎉",
                    "Great news!\n\nYour offer '" + offer.getTitle()
                            + "' has been approved and is now live on Localoot.\n\n- Team Localoot"
            );
        }

        return ResponseEntity.ok("Offer approved + email sent");
    }

    return ResponseEntity.notFound().build();
}
    // Reject offer
  @PutMapping("/offers/{id}/reject")
public ResponseEntity<?> rejectOffer(@PathVariable Long id) {
    Optional<Offer> offerOpt = offerRepository.findById(id);

    if (offerOpt.isPresent()) {
        Offer offer = offerOpt.get();

        offer.setStatus("REJECTED");
        offer.setRejectedAt(LocalDateTime.now());
        offerRepository.save(offer);

        // ✅ FIXED: ONLY shopkeeper
        String recipient = offer.getShopkeeper() != null
                ? offer.getShopkeeper().getEmail()
                : null;

        if (recipient != null) {
            emailService.sendMail(
                    recipient,
                    "Offer Rejected",
                    "Your offer '" + offer.getTitle()
                            + "' was not approved. Please contact admin."
            );
        }

        return ResponseEntity.ok("Offer rejected + email sent");
    }

    return ResponseEntity.notFound().build();
}
    // ============= USER ENDPOINTS =============

    /**
     * Get all users with optional role filter
     */      
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {

        List<User> users;

        if (role != null && !role.isEmpty()) {
            users = userRepository.findByRole(role);
        } else {
            users = userRepository.findAll();
        }

        // Search by name or email
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            users = users.stream()
                    .filter(u -> u.getName().toLowerCase().contains(searchLower) ||
                            u.getEmail().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(users);
    }

    /**
     * Get user statistics
     */
    @GetMapping("/users/stats")
    public ResponseEntity<?> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("regularUsers", userRepository.countByRole("user"));
        stats.put("shopkeepers", userRepository.countByRole("shopkeeper"));
        stats.put("admins", userRepository.countByRole("admin"));

        return ResponseEntity.ok(stats);
    }

    /**
     * Get detailed user information with shops and offers
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserDetails(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        // Create detailed DTO with all information
        UserDetailsDTO detailedUser = new UserDetailsDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.getLastLoginDate(),
                getIntValue(user.getAccountVisits()),
                getIntValue(user.getProfileViews()),
                getIntValue(user.getLikesCount()),
                getIntValue(user.getBookmarksCount()),
                getIntValue(user.getShopsVisited()),
                getIntValue(user.getEngagementScore()));

        // Get all approved shops (simulating bookmarked shops)
        List<Shop> allApprovedShops = shopRepository.findByRegistrationStatus("APPROVED");
        detailedUser.setConnectedShopsCount(allApprovedShops.size());

        // Convert shops to maps for API response
        List<Map<String, Object>> bookmarkedShops = allApprovedShops.stream()
                .map(shop -> {
                    Map<String, Object> shopMap = new HashMap<>();
                    shopMap.put("id", shop.getId());
                    shopMap.put("shopName", shop.getShopName());
                    shopMap.put("ownerName", shop.getOwnerName());
                    shopMap.put("email", shop.getEmail());
                    shopMap.put("area", shop.getArea());
                    shopMap.put("category", shop.getCategory());
                    shopMap.put("address", shop.getAddress());
                    shopMap.put("registrationStatus", shop.getRegistrationStatus());
                    shopMap.put("mobileNumber", shop.getMobileNumber());
                    return shopMap;
                })
                .limit(10)
                .collect(Collectors.toList());

        detailedUser.setBookmarkedShops(bookmarkedShops);

        // Get active offers (simulating user viewed offers)
        List<Offer> activeOffers = offerRepository.findByStatus("APPROVED");
        List<Map<String, Object>> viewedOffers = activeOffers.stream()
                .map(offer -> {
                    Map<String, Object> offerMap = new HashMap<>();
                    offerMap.put("id", offer.getId());
                    offerMap.put("title", offer.getTitle());
                    offerMap.put("shopName", offer.getShopName());
                    offerMap.put("area", offer.getArea());
                    offerMap.put("category", offer.getCategory());
                    return offerMap;
                })
                .limit(10)
                .collect(Collectors.toList());

        detailedUser.setViewedOffers(viewedOffers);

        // Get past offers (expired offers)
        List<Offer> pendingOffers = offerRepository.findByStatus("PENDING");
        List<Map<String, Object>> pastOffers = pendingOffers.stream()
                .map(offer -> {
                    Map<String, Object> offerMap = new HashMap<>();
                    offerMap.put("id", offer.getId());
                    offerMap.put("title", offer.getTitle());
                    offerMap.put("shopName", offer.getShopName());
                    offerMap.put("expiryDate", LocalDateTime.now().plusDays(30)); // Simulated expiry
                    return offerMap;
                })
                .limit(5)
                .collect(Collectors.toList());

        detailedUser.setPastOffers(pastOffers);

        return ResponseEntity.ok(detailedUser);
    }

    // ============= ANALYTICS ENDPOINTS =============

    /**
     * Get platform analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        // User analytics
        analytics.put("totalUsers", userRepository.count());
        analytics.put("totalUsersByRole", Map.of(
                "users", userRepository.countByRole("user"),
                "shopkeepers", userRepository.countByRole("shopkeeper")));

        // Shop analytics
        analytics.put("totalShops", shopRepository.count());
        analytics.put("shopsByStatus", Map.of(
                "approved", shopRepository.countByRegistrationStatus("APPROVED"),
                "pending", shopRepository.countByRegistrationStatus("PENDING"),
                "rejected", shopRepository.countByRegistrationStatus("REJECTED")));

        // Offer analytics
        long totalOffers = offerRepository.count();
        List<Offer> offers = offerRepository.findAll();
        long approvedOffers = offers.stream().filter(o -> "APPROVED".equals(o.getStatus())).count();
        long pendingOffers = offers.stream().filter(o -> "PENDING".equals(o.getStatus())).count();

        analytics.put("totalOffers", totalOffers);
        analytics.put("offersByStatus", Map.of(
                "approved", approvedOffers,
                "pending", pendingOffers));

        // Timestamps
        analytics.put("generatedAt", LocalDateTime.now());

        // Subscription & revenue analytics
        List<Subscription> activeSubs = subscriptionRepository.findByStatus("ACTIVE");
        analytics.put("subscriptions", Map.of(
                "total", subscriptionRepository.count(),
                "active", activeSubs.size()));

        List<Payment> payments = paymentRepository.findAll();
        double totalRevenue = payments.stream()
                .filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus()))
                .mapToDouble(p -> p.getAmount() == null ? 0.0 : p.getAmount())
                .sum();

        LocalDateTime now = LocalDateTime.now();
        double revenue30 = payments.stream()
                .filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus()))
                .filter(p -> p.getPaymentDate() != null && p.getPaymentDate().isAfter(now.minusDays(30)))
                .mapToDouble(p -> p.getAmount() == null ? 0.0 : p.getAmount())
                .sum();

        double revenue365 = payments.stream()
                .filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus()))
                .filter(p -> p.getPaymentDate() != null && p.getPaymentDate().isAfter(now.minusDays(365)))
                .mapToDouble(p -> p.getAmount() == null ? 0.0 : p.getAmount())
                .sum();

        analytics.put("revenue", Map.of(
                "total", totalRevenue,
                "last30Days", revenue30,
                "last365Days", revenue365));

        return ResponseEntity.ok(analytics);
    }

    /**
     * Get visitor/engagement metrics
     */
    @GetMapping("/analytics/engagement")
    public ResponseEntity<?> getEngagementMetrics() {
        Map<String, Object> engagement = new HashMap<>();

        // These would ideally come from a tracking system or analytics table
        engagement.put("totalVisits", 0); // Placeholder - track with logging system
        engagement.put("activeUsers", userRepository.countByRole("user"));
        engagement.put("activeShopkeepers", userRepository.countByRole("shopkeeper"));
        engagement.put("totalOffers", offerRepository.count());
        engagement.put("approvedOffers", offerRepository.findByStatus("APPROVED").size());

        return ResponseEntity.ok(engagement);
    }

    @GetMapping("/offers/approved-with-plan")
    public ResponseEntity<?> getApprovedOffersWithPlan() {

        List<Offer> approvedOffers = offerRepository.findByStatus("APPROVED");

        List<Map<String, Object>> response = approvedOffers.stream().map(offer -> {
            Map<String, Object> map = new HashMap<>();

            map.put("offer", offer);

            Long shopkeeperId = offer.getShopkeeper() != null
                    ? offer.getShopkeeper().getId()
                    : null;

            String plan = "FREE";
            int limit = 0;
            int used = 0;
            int remaining = 0;

            if (shopkeeperId != null) {
                Optional<Subscription> subOpt = subscriptionRepository.findActiveSubscriptionForShopkeeper(
                        shopkeeperId,
                        LocalDateTime.now());

                if (subOpt.isPresent()) {
                    Subscription sub = subOpt.get();

                    plan = sub.getSubscriptionPackage().getName();

                    // top offers allowed from package
                    limit = sub.getSubscriptionPackage().getTopOffersAllowed() == null
                            ? 0
                            : sub.getSubscriptionPackage().getTopOffersAllowed();

                    // count current top offers of this shopkeeper
                    used = (int) offerRepository.findByShopkeeper_Id(shopkeeperId)
                            .stream()
                            .filter(Offer::isTopOffer)
                            .count();

                    remaining = Math.max(limit - used, 0);

                    map.put("subscriptionPackage", sub.getSubscriptionPackage());
                }
            }

            map.put("plan", plan);
            map.put("topOfferLimit", limit);
            map.put("used", used);
            map.put("remainingTopOffers", remaining);

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<?> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        // Quick stats
        summary.put("stats", Map.of(
                "users", userRepository.count(),
                "shops", shopRepository.count(),
                "offers", offerRepository.count(),
                "pendingOffers", offerRepository.findByStatus("PENDING").size()));

        // Recent shops
        List<Shop> recentShops = shopRepository.findAll().stream()
                .filter(s -> s.getRegistrationDate() != null)
                .sorted((s1, s2) -> s2.getRegistrationDate().compareTo(s1.getRegistrationDate()))
                .limit(5)
                .collect(Collectors.toList());
        summary.put("recentShops", recentShops);

        // Pending approvals
        summary.put("pendingApprovals", Map.of(
                "shops", shopRepository.countByRegistrationStatus("PENDING"),
                "offers", offerRepository.findByStatus("PENDING").size()));

        return ResponseEntity.ok(summary);
    }

    // Helper method to safely convert Integer to int
    private int getIntValue(Integer value) {
        return value == null ? 0 : value;
    }
} // End of AdminController class
