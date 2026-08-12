package com.mydrive.carplatform.payment;

import com.mydrive.carplatform.auth.security.CurrentUser;
import com.mydrive.carplatform.payment.dto.CreatePaymentRequest;
import com.mydrive.carplatform.payment.dto.PaymentResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/payments")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> create(
            @Valid @RequestBody CreatePaymentRequest request, @AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.create(request, currentUser));
    }

    @GetMapping("/payments/{id}")
    public PaymentResponse get(@PathVariable UUID id, @AuthenticationPrincipal CurrentUser currentUser) {
        return PaymentResponse.from(paymentService.get(id, currentUser));
    }

    @GetMapping("/reservations/{reservationId}/payments")
    public List<PaymentResponse> listForReservation(
            @PathVariable UUID reservationId, @AuthenticationPrincipal CurrentUser currentUser) {
        return paymentService.listForReservation(reservationId, currentUser).stream()
                .map(PaymentResponse::from)
                .toList();
    }
}
