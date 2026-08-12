package com.mydrive.carplatform.payment;

import com.mydrive.carplatform.auth.security.CurrentUser;
import com.mydrive.carplatform.booking.Reservation;
import com.mydrive.carplatform.booking.ReservationRepository;
import com.mydrive.carplatform.booking.ReservationStatus;
import com.mydrive.carplatform.common.exception.ConflictException;
import com.mydrive.carplatform.common.exception.ForbiddenException;
import com.mydrive.carplatform.common.exception.IdempotencyConflictException;
import com.mydrive.carplatform.common.exception.ResourceNotFoundException;
import com.mydrive.carplatform.payment.dto.CreatePaymentRequest;
import com.mydrive.carplatform.payment.dto.PaymentResponse;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private static final String DEFAULT_CURRENCY = "usd";

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final StripeGateway stripeGateway;

    public PaymentService(
            PaymentRepository paymentRepository, ReservationRepository reservationRepository, StripeGateway stripeGateway) {
        this.paymentRepository = paymentRepository;
        this.reservationRepository = reservationRepository;
        this.stripeGateway = stripeGateway;
    }

    @Transactional(readOnly = true)
    public Payment get(UUID id, CurrentUser currentUser) {
        Payment payment = find(id);
        requireAccess(payment.getReservation(), currentUser);
        return payment;
    }

    @Transactional(readOnly = true)
    public List<Payment> listForReservation(UUID reservationId, CurrentUser currentUser) {
        Reservation reservation = reservationRepository
                .findById(reservationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Reservation", reservationId));
        requireAccess(reservation, currentUser);
        return paymentRepository.findByReservationId(reservationId);
    }

    /**
     * Deliberately NOT wrapped in a single @Transactional: it calls out to Stripe (an external
     * network call), and a request that fails after the PENDING row is inserted must still
     * leave that row (now marked FAILED) committed -- otherwise a request that reaches Stripe
     * but then errors on our side would roll back its own audit trail. Each state change below
     * is persisted with its own explicit save, each in its own short transaction (Spring Data's
     * repository methods are individually transactional). This also avoids holding a DB
     * transaction open for the duration of a network call, which is bad practice regardless.
     */
    public PaymentResponse create(CreatePaymentRequest request, CurrentUser currentUser) {
        Reservation reservation = reservationRepository
                .findById(request.reservationId())
                .orElseThrow(() -> ResourceNotFoundException.of("Reservation", request.reservationId()));
        if (!reservation.getCustomer().getId().equals(currentUser.userId())) {
            throw new ForbiddenException("You do not have access to this reservation");
        }
        if (reservation.getStatus() != ReservationStatus.RESERVED && reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new ConflictException("RESERVATION_NOT_PAYABLE", "This reservation is not in a payable state");
        }
        if (paymentRepository.existsByReservationIdAndStatus(reservation.getId(), PaymentStatus.SUCCEEDED)) {
            throw new ConflictException("ALREADY_PAID", "This reservation has already been paid for");
        }

        var existing = paymentRepository.findByIdempotencyKey(request.idempotencyKey());
        if (existing.isPresent()) {
            return replayIdempotentRequest(existing.get(), reservation.getId());
        }

        // Amount always comes from the reservation server-side, never from the client, so a
        // tampered request body can't change what gets charged.
        Payment payment = new Payment(reservation, reservation.getTotalAmount(), DEFAULT_CURRENCY, request.idempotencyKey());
        try {
            payment = paymentRepository.saveAndFlush(payment);
        } catch (DataIntegrityViolationException e) {
            // Lost the race on the idempotency-key unique constraint: someone else's request
            // with the same key won. Treat it the same as finding it up front.
            Payment winner = paymentRepository
                    .findByIdempotencyKey(request.idempotencyKey())
                    .orElseThrow(() -> e);
            return replayIdempotentRequest(winner, reservation.getId());
        }

        StripeGateway.PaymentIntentResult result;
        try {
            result = stripeGateway.createPaymentIntent(payment.getAmount(), payment.getCurrency(), payment.getIdempotencyKey());
        } catch (RuntimeException e) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(e.getMessage());
            paymentRepository.save(payment);
            throw e;
        }
        payment.setStripePaymentIntentId(result.paymentIntentId());
        paymentRepository.save(payment);
        return PaymentResponse.from(payment, result.clientSecret());
    }

    @Transactional
    public void handleStripeEvent(String eventType, String paymentIntentId, String failureReason) {
        paymentRepository.findByStripePaymentIntentId(paymentIntentId).ifPresentOrElse(
                payment -> applyWebhookUpdate(payment, eventType, failureReason),
                () -> log.warn("Received Stripe webhook for unknown PaymentIntent {}", paymentIntentId));
    }

    private void applyWebhookUpdate(Payment payment, String eventType, String failureReason) {
        if (payment.isTerminal()) {
            // Stripe may redeliver webhooks; once a payment reaches a terminal state, further
            // events for it are a no-op rather than a state-machine violation.
            return;
        }
        switch (eventType) {
            case "payment_intent.succeeded" -> payment.setStatus(PaymentStatus.SUCCEEDED);
            case "payment_intent.payment_failed" -> {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason(failureReason);
            }
            case "payment_intent.canceled" -> payment.setStatus(PaymentStatus.CANCELED);
            case "payment_intent.requires_action" -> payment.setStatus(PaymentStatus.REQUIRES_ACTION);
            default -> log.debug("Ignoring unhandled Stripe event type {}", eventType);
        }
    }

    private PaymentResponse replayIdempotentRequest(Payment payment, UUID expectedReservationId) {
        if (!payment.getReservation().getId().equals(expectedReservationId)) {
            throw new IdempotencyConflictException(
                    "This idempotency key was already used for a different reservation");
        }
        String clientSecret = payment.getStripePaymentIntentId() == null
                ? null
                : stripeGateway.retrieveClientSecret(payment.getStripePaymentIntentId());
        return PaymentResponse.from(payment, clientSecret);
    }

    private Payment find(UUID id) {
        return paymentRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Payment", id));
    }

    private void requireAccess(Reservation reservation, CurrentUser currentUser) {
        if (currentUser.isAdmin()) {
            return;
        }
        if (currentUser.isFleetAgent()
                && reservation.getVehicle().getLocation().getId().equals(currentUser.locationId())) {
            return;
        }
        if (currentUser.isCustomer() && reservation.getCustomer().getId().equals(currentUser.userId())) {
            return;
        }
        throw new ForbiddenException("You do not have access to this payment");
    }
}
