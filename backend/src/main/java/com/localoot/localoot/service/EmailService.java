package com.localoot.localoot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String from;

  public void sendMail(String to, String subject, String body) {
    try {
        System.out.println("📤 Trying to send email to: " + to);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);

        System.out.println("✅ Email sent from Spring Boot");
    } catch (Exception e) {
        System.out.println("❌ EMAIL FAILED: " + e.getMessage());
        e.printStackTrace();
    }
}
    
}