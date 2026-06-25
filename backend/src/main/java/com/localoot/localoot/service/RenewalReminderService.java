package com.localoot.localoot.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.localoot.localoot.model.Subscription;
import com.localoot.localoot.repository.SubscriptionRepository;

@Service
public class RenewalReminderService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private EmailService emailService;

    // runs every day at 10 AM
    @Scheduled(cron = "0 0 10 * * ?")
    public void sendRenewalReminders() {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime targetDate = now.plusDays(3);

        // 🔥 USE YOUR QUERY (BEST PRACTICE)
        List<Subscription> expiring = subscriptionRepository.findExpiringSubscriptions(targetDate);

        for (Subscription sub : expiring) {

            if (sub.getShopkeeper() == null)
                continue;
            if (sub.getShopkeeper().getEmail() == null)
                continue;

            String email = sub.getShopkeeper().getEmail();
            String name = sub.getShopkeeper().getName();

            emailService.sendMail(
                    email,
                    "⚠️ Renewal Reminder - Localoot Subscription",
                    "Hello " + name + ",\n\n" +
                            "Your subscription will expire on: " + sub.getEndDate() + "\n\n" +
                            "Please renew to continue posting offers without interruption.\n\n" +
                            "Thank you,\nLocaloot Team");
        }
    }
}