package com.localoot.localoot.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.localoot.localoot.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cloudinary.Cloudinary;
import com.localoot.localoot.model.*;
import com.localoot.localoot.repository.*;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "http://localhost:5173")
public class OfferController {

    @Autowired
    private EmailService emailService;
    @Autowired
    private OfferRepository offerRepository;
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    @Autowired
    private AdminSettingsRepository settingsRepository;
    @Autowired
    private OfferHistoryRepository historyRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    @GetMapping("/top")
    public ResponseEntity<List<Offer>> getTopOffers() {

        LocalDateTime now = LocalDateTime.now();

        List<Offer> topOffers = offerRepository
                .findTop5ByTopOfferTrueAndStatusOrderByPinnedRankAsc("APPROVED")
                .stream()
                .filter(o -> o.getExpiryDate() == null || o.getExpiryDate().isAfter(now)) // ✅ filter expired
                .collect(Collectors.toList());

        return ResponseEntity.ok(topOffers);
    }

    @GetMapping("/flash")
    public List<Offer> getFlashDeals() {
        LocalDateTime now = LocalDateTime.now();

        return offerRepository.findByStatus("APPROVED")
                .stream()
                .filter(o -> o.getValidUntil() != null &&
                        o.getValidUntil().isAfter(now) &&
                        o.getValidUntil().isBefore(now.plusHours(6))) // 🔥 expires soon
                .collect(Collectors.toList());
    }

    @GetMapping("/trending")
    public List<Offer> getTrendingOffers() {

        return offerRepository.findByStatus("APPROVED")
                .stream()
                .sorted((a, b) -> Integer.compare(
                        b.getLikes() == null ? 0 : b.getLikes(),
                        a.getLikes() == null ? 0 : a.getLikes()))
                .limit(10)
                .collect(Collectors.toList());
    }

    @GetMapping("/rated")
    public List<Offer> getHighlyRatedOffers() {

        return offerRepository.findByStatus("APPROVED")
                .stream()
                .filter(o -> o.getLikes() != null && o.getLikes() >= 10)
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeOffer(@PathVariable Long id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        Integer likes = offer.getLikes() == null ? 0 : offer.getLikes();
        offer.setLikes(likes + 1);

        offerRepository.save(offer);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikeOffer(@PathVariable Long id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        Integer likes = offer.getLikes() == null ? 0 : offer.getLikes();

        if (likes > 0) {
            offer.setLikes(likes - 1);
        }

        offerRepository.save(offer);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<?> bookmarkOffer(@PathVariable Long id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<?> unbookmarkOffer(@PathVariable Long id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        return ResponseEntity.ok().build();
    }

    // =========================
    // CREATE OFFER (WITH IMAGE)
    // =========================
    @PostMapping("/create")
    public ResponseEntity<?> createOffer(
            @RequestParam("image") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("area") String area,
            @RequestParam("description") String description,
            @RequestParam("googleMapUrl") String googleMapUrl,
            @RequestParam("shopkeeperId") Long shopkeeperId,
            @RequestParam(required = false) String validFrom,
            @RequestParam(required = false) String validUntil) {
        try {
            // ✅ IMAGE VALIDATION
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("Image is required");
            }

            // ✅ UPLOAD TO CLOUDINARY
            Map uploadResult = cloudinary.uploader()
                    .upload(file.getBytes(), Map.of());

            String imageUrl = uploadResult.get("secure_url").toString();

            // ✅ CREATE OFFER
            Offer offer = new Offer();
            offer.setTitle(title);
            offer.setCategory(category);
            offer.setArea(area);
            offer.setDescription(description);
            offer.setGoogleMapUrl(googleMapUrl);
            offer.setImageUrl(imageUrl);

            // ✅ SET SHOPKEEPER
            User user = userRepository.findById(shopkeeperId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            offer.setShopkeeper(user);
            Subscription subscription = subscriptionRepository
                    .findActiveSubscriptionForShopkeeper(
                            shopkeeperId,
                            LocalDateTime.now())
                    .orElse(null);

           if (subscription == null) {
    return ResponseEntity.badRequest()
            .body("No active subscription found.");
}
            // =========================
            // ✅ DATE HANDLING
            // =========================
            if (validFrom == null || validFrom.isEmpty() ||
                    validUntil == null || validUntil.isEmpty()) {
                return ResponseEntity.badRequest().body("Dates required");
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

            LocalDateTime from = LocalDateTime.parse(validFrom, formatter);
            LocalDateTime until = LocalDateTime.parse(validUntil, formatter);

            if (until.isBefore(from)) {
                return ResponseEntity.badRequest().body("End date must be after start date");
            }

            offer.setValidFrom(from);
            offer.setValidUntil(until);

            // =========================
            // ✅ DEFAULT VALUES (IMPORTANT FOR DB)
            // =========================
            offer.setPrice(0.0);
            offer.setOriginalPrice(0.0);
            offer.setDiscount(0);

            // =========================
            // ✅ STATUS
            // =========================
            offer.setStatus("PENDING");

            Offer saved = offerRepository.save(offer);

            subscription.setOffersUsedThisPeriod(
                    subscription.getOffersUsedThisPeriod() + 1);

            subscriptionRepository.save(subscription);

            // =========================
            // ✅ HISTORY
            // =========================
            OfferHistory history = new OfferHistory();
            history.setOffer(saved);
            history.setShopkeeper(user);
            history.setAction("SUBMITTED");
            history.setNewStatus("PENDING");
            history.setActionDate(LocalDateTime.now());

            historyRepository.save(history);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage()); // 🔥 SHOW REAL ERROR
        }
    }

    // =========================
    // GET PENDING OFFERS (ADMIN)
    // =========================
    @GetMapping("/admin/pending")
    public List<Offer> getPendingOffers() {
        return offerRepository.findByStatus("PENDING");
    }

    @PutMapping("/admin/top5")
    public ResponseEntity<?> updateTop5Offers(@RequestBody List<Long> offerIds) {
        List<Offer> approvedOffers = offerRepository.findByStatus("APPROVED");

        for (Offer offer : approvedOffers) {
            offer.setTopOffer(false);
            offer.setPinnedRank(null);
        }

        offerRepository.saveAll(approvedOffers);

        for (int i = 0; i < offerIds.size(); i++) {
            Offer offer = offerRepository.findById(offerIds.get(i))
                    .orElseThrow(() -> new RuntimeException("Offer not found"));

            if (!"APPROVED".equalsIgnoreCase(offer.getStatus())) {
                return ResponseEntity.badRequest()
                        .body("Only approved offers can be marked as top offers");
            }

            offer.setTopOffer(true);
            offer.setPinnedRank(i + 1);
            offerRepository.save(offer);
        }

        return ResponseEntity.ok("Top 5 offers updated successfully");
    }

    // =========================
    // APPROVE OFFER
    // =========================
    @PutMapping("/admin/approve/{id}")
    public ResponseEntity<?> approveOffer(@PathVariable Long id) {

        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        offer.setStatus("APPROVED");
        offer.setApprovedAt(LocalDateTime.now());

        Offer saved = offerRepository.save(offer);

        OfferHistory history = new OfferHistory();
        history.setOffer(saved);
        history.setShopkeeper(saved.getShopkeeper());
        history.setAction("APPROVED");
        history.setPreviousStatus("PENDING");
        history.setNewStatus("APPROVED");
        history.setActionDate(LocalDateTime.now());

        historyRepository.save(history);
        emailService.sendMail(
                saved.getShopkeeper().getEmail(),
                "Offer Approved",
                "Your offer \"" + saved.getTitle() + "\" has been approved.");

        return ResponseEntity.ok(saved);
    }

    // =========================
    // REJECT OFFER
    // =========================
    @PutMapping("/admin/reject/{id}")
    public Offer rejectOffer(@PathVariable Long id) {

        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        offer.setStatus("REJECTED");
        offer.setRejectedAt(LocalDateTime.now());
        emailService.sendMail(
                offer.getShopkeeper().getEmail(),
                "Offer Rejected",
                "Your offer \"" + offer.getTitle() + "\" has been rejected.");
        return offerRepository.save(offer);
    }

    // =========================
    // SHOPKEEPER OFFERS
    // =========================
    @GetMapping("/shopkeeper/{id}")
    public List<Offer> getShopkeeperOffers(@PathVariable Long id) {
        return offerRepository.findByShopkeeper_Id(id);
    }

    // =========================
    // ACTIVE OFFERS
    // =========================
    @GetMapping("/active")
    public List<Offer> getActiveOffers(
            @RequestParam String area,
            @RequestParam String category) {

        return offerRepository
                .findByStatusAndAreaAndCategory("APPROVED", area, category)
                .stream()
                .filter(this::isOfferActive)
                .collect(Collectors.toList());
    }

    // =========================
    // GET ALL OFFERS
    // =========================
    @GetMapping
    public ResponseEntity<List<Offer>> listOffers() {
        return ResponseEntity.ok(offerRepository.findAll());
    }

    // =========================
    // GET SINGLE OFFER
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<Offer> getOffer(@PathVariable Long id) {
        return offerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================
    // HELPER
    // =========================
    private boolean isOfferActive(Offer offer) {
        LocalDateTime now = LocalDateTime.now();

        if (!"APPROVED".equalsIgnoreCase(offer.getStatus()))
            return false;

        if (offer.getValidFrom() != null && now.isBefore(offer.getValidFrom()))
            return false;

        if (offer.getValidUntil() != null && now.isAfter(offer.getValidUntil()))
            return false;

        return true;
    }
}