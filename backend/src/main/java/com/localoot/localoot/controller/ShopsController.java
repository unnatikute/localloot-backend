package com.localoot.localoot.controller;

import com.localoot.localoot.model.Shop;
import com.localoot.localoot.model.User;
import com.localoot.localoot.repository.ShopRepository;
import com.localoot.localoot.repository.UserRepository;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cloudinary.Cloudinary;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = "*")
public class ShopsController {

    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    // =========================
    // GET ALL APPROVED SHOPS
    // =========================
    @GetMapping
    public ResponseEntity<?> getShops(@RequestParam(required = false) Integer limit) {
        List<Shop> shops = shopRepository.findByRegistrationStatus("APPROVED");

        if (limit != null && limit > 0 && shops.size() > limit) {
            shops = shops.subList(0, limit);
        }

        return ResponseEntity.ok(shops);
    }

    // =========================
    // CREATE SHOP (REGISTER)
    // =========================
    @PostMapping
    public ResponseEntity<?> createShop(
            @RequestParam("shop") String shopJson,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "document", required = false) MultipartFile document) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Shop shop = mapper.readValue(shopJson, Shop.class);

            // ✅ Set default status
            shop.setRegistrationStatus("PENDING");

            // ✅ Link user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            shop.setShopkeeper(user);

            // =========================
            // 🔥 CLOUDINARY UPLOAD (ADD THIS)
            // =========================
            if (document != null && !document.isEmpty()) {

                Map uploadResult = cloudinary.uploader()
                        .upload(document.getBytes(), Map.of());

                String fileUrl = uploadResult.get("secure_url").toString();

                // ✅ Save URL in DB
                shop.setDocumentUrl(fileUrl);
            }

            // =========================

            Shop saved = shopRepository.save(shop);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ============
    // GET SHOP BY ID (ONLY APPROVED)
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<?> getShopById(@PathVariable Long id) {
        Optional<Shop> opt = shopRepository.findById(id);

        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Shop shop = opt.get();

        if (!"APPROVED".equalsIgnoreCase(shop.getRegistrationStatus())) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(shop);
    }

    // =========================
    // 🔥 GET SHOPS BY USER (CRITICAL FOR DASHBOARD)
    // =========================
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<?> getShopsByUser(@PathVariable Long userId) {
       List<Shop> shops = shopRepository.findByShopkeeper_Id(userId);
        return ResponseEntity.ok(shops);
    }
}