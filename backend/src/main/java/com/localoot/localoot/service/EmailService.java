package com.localoot.localoot.service;

import com.sendgrid.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    @Value("${SENDGRID_API_KEY}")
    private String apiKey;

    @Value("${APP_EMAIL_FROM}")
    private String fromEmail;

    public void sendMail(String to, String subject, String body) {
        try {
            Email from = new Email(fromEmail);
            Email toEmail = new Email(to);
            Content content = new Content("text/plain", body);
            Mail mail = new Mail(from, subject, toEmail, content);

            SendGrid sg = new SendGrid(apiKey);
            Request request = new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            System.out.println("📧 Email status: " + response.getStatusCode());

        } catch (IOException e) {
            System.out.println("❌ SendGrid error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}