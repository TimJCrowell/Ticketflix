package com.moviebooking.service;

import com.moviebooking.entity.Checkout;
import com.moviebooking.entity.Seat;
import com.moviebooking.entity.Showtime;
import com.moviebooking.entity.Ticket;
import com.moviebooking.entity.User;
import com.moviebooking.dto.CheckoutRequest;
import com.moviebooking.dto.CheckoutResponse;
import com.moviebooking.repository.CheckoutRepository;
import com.moviebooking.repository.ShowtimeRepository;
import com.moviebooking.repository.TicketRepository;
import com.moviebooking.service.EmailService;
import com.moviebooking.util.SnowflakeIdGenerator;
import com.moviebooking.util.TicketPricing;
import com.moviebooking.util.CardValidationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

/**
 * Service layer for checkout creation and validation.
 *
 * <p>Builds a checkout for the authenticated customer, persists it,
 * and triggers a confirmation email.</p>
 */

@Service
public class CheckoutService
{
    /** Default status (pending) is assigned to newly created checkout. */
    private static final String STATUS_PENDING = "PENDING";

    /** Repository used to persist and query checkout entities.*/
    @Autowired
    private CheckoutRepository checkoutRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SnowflakeIdGenerator idGenerator;

    /**
     * Creates a checkout after validating request data and customer context.
     *
     * @param request incoming checkout payload
     * @param customer authenticated customer resolved from login token
     * @return persisted checkout response object
     * @throws ResponseStatusException when request data is invalid
     */
    @Transactional
    public CheckoutResponse createCheckout(CheckoutRequest request, User customer)
    {
        if(request == null)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }//end if

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Showtime not found: " + request.getShowtimeId()));
        if (!showtime.getDatetime().isAfter(LocalDateTime.now()))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Showtime has already passed");
        }//end if

        List<String> seats = request.getSeatLabels();
        if(seats == null || seats.isEmpty())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one seat is required");
        }//end if

        if (new HashSet<>(seats).size() != seats.size())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate seat labels in request");
        }//end if

        // Validate every requested seat exists and is available before claiming any of them.
        Seat[][] seatmap = showtime.getSeatmap();
        for (String label : seats)
        {
            int[] rc = parseSeatLabel(label);
            int row = rc[0], col = rc[1];
            if (row >= seatmap.length || col >= seatmap[row].length || seatmap[row][col] == null)
            {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seat does not exist: " + label);
            }//end if
            if (!Boolean.TRUE.equals(seatmap[row][col].getAvailable()))
            {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat is not available: " + label);
            }//end if
        }//end for

        for (String label : seats)
        {
            int[] rc = parseSeatLabel(label);
            seatmap[rc[0]][rc[1]].setAvailable(false);
        }//end for
        showtime.setSeatmap(seatmap);
        showtimeRepository.save(showtime);

        String pan = CardValidationUtil.normalizePan(request.getCardNumber());
        if(!CardValidationUtil.isPlausiblePanFormat(pan))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid card number.");
        }//end if

        int ticketCount = seats.size();
        BigDecimal total = TicketPricing.PRICE_PER_SEAT
                .multiply(BigDecimal.valueOf(ticketCount))
                .setScale(2, RoundingMode.HALF_UP);

        Checkout checkout = new Checkout();
        checkout.setCheckoutId(idGenerator.nextId());
        checkout.setUser(customer);
        checkout.setShowtimeId(request.getShowtimeId());
        checkout.setSeatLabels(seats);
        checkout.setTotal(total);
        checkout.setStatus(STATUS_PENDING);
        checkout.setCreatedAt(LocalDateTime.now());

        Checkout saved = checkoutRepository.save(checkout);

        List<Ticket> tickets = new ArrayList<>();
        for (String label : seats)
        {
            int[] rc = parseSeatLabel(label);
            Ticket ticket = new Ticket();
            ticket.setId(idGenerator.nextId());
            ticket.setShowtimeId(saved.getShowtimeId());
            ticket.setCheckoutId(saved.getCheckoutId());
            ticket.setSeatRow(rc[0]);
            ticket.setSeatCol(rc[1]);
            tickets.add(ticket);
        }//end for
        ticketRepository.saveAll(tickets);

        try{
            emailService.sendCheckoutConfirmation(customer, saved);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return new CheckoutResponse(
                saved.getCheckoutId(),
                customer.getUserID(),
                saved.getShowtimeId(),
                saved.getSeatLabels(),
                saved.getTotal(),
                saved.getStatus(),
                saved.getCreatedAt()
        );
    }

    /**
     * Parses a seat label such as {@code "A3"} into a {@code [row, col]} index pair.
     * Row is zero-based (A=0, B=1, …). Column is zero-based (1→0, 2→1, …).
     *
     * @param label seat label from the request
     * @return {@code int[]{row, col}}
     * @throws ResponseStatusException (400) if the label is malformed
     */
    private int[] parseSeatLabel(String label)
    {
        if (label == null || label.length() < 2)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid seat label: " + label);
        }//end if
        char rowChar = Character.toUpperCase(label.charAt(0));
        if (rowChar < 'A' || rowChar > 'Z')
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid seat label: " + label);
        }//end if
        try
        {
            int col = Integer.parseInt(label.substring(1)) - 1;
            if (col < 0)
            {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid seat label: " + label);
            }//end if
            return new int[]{ rowChar - 'A', col };
        }
        catch (NumberFormatException e)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid seat label: " + label);
        }//end try catch
    }
}