package com.moviebooking.service;

import com.moviebooking.entity.Checkout;
import com.moviebooking.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.StringJoiner;

@Service
public class EmailService
{
    @Autowired
    private JavaMailSender mailSender;

    public void sendCheckoutConfirmation(User user, Checkout checkout)
    {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom("no-reply@ticketflix.local");
        msg.setTo(user.getEmail());
        msg.setSubject("Ticketflix Purchase Confirmation");

        StringJoiner seats = new StringJoiner(", ");
        for(String seat: checkout.getSeatLabels())
        {
            seats.add(seat);
        }//end for

        msg.setText(
                "Hi " + user.getFirstName() + "\n\n" +
                "Thank you for purchasing at Ticketflix!\n" +
                "Checkout ID: " + checkout.getCheckoutId() + "\n" +
                "Seats: " + seats + "\n" +
                "Total: " + checkout.getTotal() + "\n" +
                "Status: " + checkout.getStatus() + "\n" +
                "Ticketflix"
        );//end of email message

        mailSender.send(msg);
    }//end SendCheckoutConfirmation()
}//end EmailService class