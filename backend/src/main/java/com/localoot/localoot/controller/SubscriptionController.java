package com.localoot.localoot.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.localoot.localoot.service.EmailService;
import com.localoot.localoot.model.AdminSettings;
import com.localoot.localoot.model.Payment;
import com.localoot.localoot.model.Subscription;
import com.localoot.localoot.model.SubscriptionPackage;
import com.localoot.localoot.model.User;
import com.localoot.localoot.repository.AdminSettingsRepository;
import com.localoot.localoot.repository.PaymentRepository;
import com.localoot.localoot.repository.SubscriptionPackageRepository;
import com.localoot.localoot.repository.SubscriptionRepository;
import com.localoot.localoot.repository.UserRepository;


@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    @Autowired
    private SubscriptionPackageRepository packageRepository;
@Autowired
private EmailService emailService;
    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AdminSettingsRepository settingsRepository;

    @Autowired
    private UserRepository userRepository;

   

    // ============= SUBSCRIPTION PACKAGES =============

    @GetMapping("/packages")
    public ResponseEntity<List<SubscriptionPackage>> getAllPackages(
            @RequestParam(required = false) Boolean active) {

        if (active != null && active) {
            return ResponseEntity.ok(
                    packageRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
        }

        return ResponseEntity.ok(packageRepository.findAll());
    }

    @PostMapping("/packages")
    public ResponseEntity<SubscriptionPackage> createPackage(
            @RequestBody SubscriptionPackage pkg) {
        return ResponseEntity.ok(packageRepository.save(pkg));
    }

    @PutMapping("/packages/{id}")
    public ResponseEntity<SubscriptionPackage> updatePackage(
            @PathVariable Long id,
            @RequestBody SubscriptionPackage pkg) {

        packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        pkg.setId(id);
        pkg.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(packageRepository.save(pkg));
    }

    // ============= MY SUBSCRIPTION =============

    @GetMapping("/my-subscription")
    public ResponseEntity<?> getMySubscription(@RequestParam Long shopkeeperId) {
        Optional<Subscription> sub = subscriptionRepository
                .findActiveSubscriptionForShopkeeper(shopkeeperId, LocalDateTime.now());

        if (sub.isPresent()) {
            Subscription s = sub.get();

            Map<String, Object> response = new HashMap<>();
            response.put("subscription", s);
            response.put("package", s.getSubscriptionPackage());
            response.put("offersUsed", s.getOffersUsedThisPeriod());

            response.put("offersLimit",
                    "MONTHLY".equalsIgnoreCase(s.getDurationType())
                            ? s.getSubscriptionPackage().getMonthlyOfferLimit()
                            : s.getSubscriptionPackage().getYearlyOfferLimit());

            response.put("daysRemaining",
                    java.time.temporal.ChronoUnit.DAYS.between(
                            LocalDateTime.now(), s.getEndDate()));

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(
                Map.of("subscription", null, "message", "No active subscription"));
    }

    // ============= SUBSCRIBE =============

    @PostMapping("/subscribe")
    public ResponseEntity<?> createSubscription(
            @RequestBody SubscriptionRequest request) {

        User shopkeeper = userRepository.findById(request.getShopkeeperId())
                .orElseThrow(() -> new RuntimeException("Shopkeeper not found"));

        SubscriptionPackage pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found"));

        Optional<Subscription> existing = subscriptionRepository
                .findActiveSubscriptionForShopkeeper(
                        request.getShopkeeperId(), LocalDateTime.now());

        if (existing.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Active subscription already exists"));
        }

        Subscription subscription = new Subscription();
        subscription.setShopkeeper(shopkeeper);
        subscription.setSubscriptionPackage(pkg);
        subscription.setDurationType(request.getDurationType());
        subscription.setStartDate(LocalDateTime.now());

        if ("MONTHLY".equalsIgnoreCase(request.getDurationType())) {
            subscription.setEndDate(LocalDateTime.now().plusMonths(1));
        } else {
            subscription.setEndDate(LocalDateTime.now().plusYears(1));
        }

        subscription.setStatus("ACTIVE");
        subscription.setOffersUsedThisPeriod(0);
        subscription.setLastResetDate(LocalDateTime.now());

        Subscription saved = subscriptionRepository.save(subscription);

        Payment payment = new Payment();
        payment.setShopkeeper(shopkeeper);
        payment.setSubscription(saved);
        payment.setSubscriptionPackage(pkg);
        payment.setAmount(
                "MONTHLY".equalsIgnoreCase(request.getDurationType())
                        ? pkg.getMonthlyPrice()
                        : pkg.getYearlyPrice());
        payment.setStatus("COMPLETED");
        payment.setPeriodStart(saved.getStartDate());
        payment.setPeriodEnd(saved.getEndDate());
        payment.setPaymentDate(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);
        emailService.sendMail(
    shopkeeper.getEmail(),
    "Subscription Activated",
    "Your " + pkg.getName() + " subscription has been activated successfully."
);

        return ResponseEntity.ok(Map.of(
                "subscription", saved,
                "payment", savedPayment,
                "message", "Subscription created successfully"
        ));
    }

    // ============= RENEW =============

    @PostMapping("/renew")
    public ResponseEntity<?> renewSubscription(
            @RequestBody RenewalRequest request) {

        if (request.getShopkeeperId() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "shopkeeperId is required"));
        }

        if (request.getDurationType() == null
                || request.getDurationType().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "durationType is required"));
        }

        User shopkeeper = userRepository.findById(request.getShopkeeperId())
                .orElseThrow(() -> new RuntimeException("Shopkeeper not found"));

        Optional<Subscription> activeOpt = subscriptionRepository
                .findActiveSubscriptionForShopkeeper(
                        request.getShopkeeperId(), LocalDateTime.now());

        Subscription subscription;
        SubscriptionPackage pkg;

        if (activeOpt.isPresent()) {
            subscription = activeOpt.get();
            pkg = subscription.getSubscriptionPackage();
        } else {
            if (request.getPackageId() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "packageId is required when no active subscription exists"));
            }

            pkg = packageRepository.findById(request.getPackageId())
                    .orElseThrow(() -> new RuntimeException("Package not found"));

            subscription = new Subscription();
            subscription.setShopkeeper(shopkeeper);
            subscription.setSubscriptionPackage(pkg);
            subscription.setStartDate(LocalDateTime.now());
            subscription.setStatus("ACTIVE");
            subscription.setOffersUsedThisPeriod(0);
            subscription.setLastResetDate(LocalDateTime.now());
        }

        subscription.setDurationType(request.getDurationType());

        LocalDateTime base =
                subscription.getEndDate() != null
                        && subscription.getEndDate().isAfter(LocalDateTime.now())
                                ? subscription.getEndDate()
                                : LocalDateTime.now();

        if ("MONTHLY".equalsIgnoreCase(request.getDurationType())) {
            subscription.setEndDate(base.plusMonths(1));
        } else {
            subscription.setEndDate(base.plusYears(1));
        }

        subscription.setStatus("ACTIVE");
        subscription.setUpdatedAt(LocalDateTime.now());
        subscription.setOffersUsedThisPeriod(0);
        subscription.setLastResetDate(LocalDateTime.now());

        Subscription saved = subscriptionRepository.save(subscription);

        Payment payment = new Payment();
        payment.setShopkeeper(shopkeeper);
        payment.setSubscription(saved);
        payment.setSubscriptionPackage(pkg);
        payment.setAmount(
                "MONTHLY".equalsIgnoreCase(request.getDurationType())
                        ? pkg.getMonthlyPrice()
                        : pkg.getYearlyPrice());
        payment.setStatus("COMPLETED");
        payment.setPeriodStart(LocalDateTime.now());
        payment.setPeriodEnd(saved.getEndDate());
        payment.setPaymentDate(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);
        emailService.sendMail(
    shopkeeper.getEmail(),
    "Subscription Renewed",
    "Your subscription has been renewed successfully."
);

        return ResponseEntity.ok(Map.of(
                "subscription", saved,
                "payment", savedPayment,
                "message", "Subscription renewed successfully"
        ));
    }

    // ============= HISTORY =============

    @GetMapping("/history")
    public ResponseEntity<List<Subscription>> getSubscriptionHistory(
            @RequestParam Long shopkeeperId) {
        return ResponseEntity.ok(
                subscriptionRepository.findByShopkeeperId(shopkeeperId));
    }

    // ============= PAYMENTS =============

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getPayments(
            @RequestParam Long shopkeeperId,
            @RequestParam(required = false) String period) {

        List<Payment> payments =
                paymentRepository.findByShopkeeperId(shopkeeperId);

        if (period != null) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime start;

            if ("month".equalsIgnoreCase(period)) {
                start = now.minusMonths(1);
            } else if ("year".equalsIgnoreCase(period)) {
                start = now.minusYears(1);
            } else {
                return ResponseEntity.ok(payments);
            }

            payments = paymentRepository.findPaymentsByShopkeeperAndPeriod(
                    shopkeeperId, start, now);
        }

        return ResponseEntity.ok(payments);
    }

    @GetMapping("/payments/{paymentId}/invoice.pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @PathVariable Long paymentId) throws IOException {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        byte[] pdfBytes = buildInvoicePdf(payment);

        String filename =
                payment.getInvoiceNumber() != null
                        && !payment.getInvoiceNumber().isBlank()
                                ? payment.getInvoiceNumber() + ".pdf"
                                : "invoice-" + paymentId + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(pdfBytes);
    }

    private byte[] buildInvoicePdf(Payment payment) throws IOException {
        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs =
                         new PDPageContentStream(doc, page)) {

                float margin = 50;
                float y = page.getMediaBox().getHeight() - margin;
                float leading = 16;

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 18);
                cs.newLineAtOffset(margin, y);
                cs.showText("LocalLoot Invoice");
                cs.endText();

                y -= 30;

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 12);
                cs.newLineAtOffset(margin, y);

                cs.showText("Invoice Number: " + safe(payment.getInvoiceNumber()));
                cs.newLineAtOffset(0, -leading);

                cs.showText("Date: " +
                        (payment.getPaymentDate() != null
                                ? payment.getPaymentDate().toLocalDate().toString()
                                : ""));
                cs.newLineAtOffset(0, -leading);

                cs.showText("Shopkeeper: " +
                        (payment.getShopkeeper() != null
                                ? safe(payment.getShopkeeper().getName())
                                : ""));
                cs.newLineAtOffset(0, -leading);

                cs.showText("Email: " +
                        (payment.getShopkeeper() != null
                                ? safe(payment.getShopkeeper().getEmail())
                                : ""));
                cs.newLineAtOffset(0, -leading);

                cs.showText("Package: " +
                        (payment.getSubscriptionPackage() != null
                                ? safe(payment.getSubscriptionPackage().getName())
                                : ""));
                cs.newLineAtOffset(0, -leading);

                cs.showText("Amount: " +
                        safe(payment.getCurrency()) + " " +
                        (payment.getAmount() != null ? payment.getAmount() : ""));
                cs.newLineAtOffset(0, -leading);

                cs.showText("Status: " + safe(payment.getStatus()));
                cs.newLineAtOffset(0, -leading);

                if (payment.getPeriodStart() != null
                        && payment.getPeriodEnd() != null) {
                    cs.showText("Period: "
                            + payment.getPeriodStart().toLocalDate()
                            + " to "
                            + payment.getPeriodEnd().toLocalDate());
                }

                cs.endText();
            }

            doc.save(out);
            return out.toByteArray();
        }
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }

    // ============= ADMIN SETTINGS =============

    @GetMapping("/admin/settings")
    public ResponseEntity<AdminSettings> getSettings() {
        AdminSettings settings = settingsRepository.findFirstByOrderByIdAsc();

        if (settings == null) {
            settings = settingsRepository.save(new AdminSettings());
        }

        return ResponseEntity.ok(settings);
    }

    @PutMapping("/admin/settings")
    public ResponseEntity<AdminSettings> updateSettings(
            @RequestBody AdminSettings newSettings) {

        AdminSettings existing = settingsRepository.findFirstByOrderByIdAsc();

        if (existing == null) {
            existing = new AdminSettings();
        }

        newSettings.setId(existing.getId());
        newSettings.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(settingsRepository.save(newSettings));
    }

    // ============= DTOs =============

    public static class SubscriptionRequest {
        private Long shopkeeperId;
        private Long packageId;
        private String durationType;

        public Long getShopkeeperId() {
            return shopkeeperId;
        }

        public void setShopkeeperId(Long shopkeeperId) {
            this.shopkeeperId = shopkeeperId;
        }

        public Long getPackageId() {
            return packageId;
        }

        public void setPackageId(Long packageId) {
            this.packageId = packageId;
        }

        public String getDurationType() {
            return durationType;
        }

        public void setDurationType(String durationType) {
            this.durationType = durationType;
        }
    }

    public static class RenewalRequest {
        private Long shopkeeperId;
        private Long packageId;
        private String durationType;

        public Long getShopkeeperId() {
            return shopkeeperId;
        }

        public void setShopkeeperId(Long shopkeeperId) {
            this.shopkeeperId = shopkeeperId;
        }

        public Long getPackageId() {
            return packageId;
        }

        public void setPackageId(Long packageId) {
            this.packageId = packageId;
        }

        public String getDurationType() {
            return durationType;
        }

        public void setDurationType(String durationType) {
            this.durationType = durationType;
        }
    }
}