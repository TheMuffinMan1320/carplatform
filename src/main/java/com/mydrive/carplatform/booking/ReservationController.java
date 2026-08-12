package com.mydrive.carplatform.booking;

import com.mydrive.carplatform.auth.security.CurrentUser;
import com.mydrive.carplatform.booking.dto.CompleteReservationRequest;
import com.mydrive.carplatform.booking.dto.ReservationRequest;
import com.mydrive.carplatform.booking.dto.ReservationResponse;
import com.mydrive.carplatform.common.web.PageResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping("/reservations")
    public PageResponse<ReservationResponse> list(
            @RequestParam(required = false) ReservationStatus status,
            Pageable pageable,
            @AuthenticationPrincipal CurrentUser currentUser) {
        return PageResponse.of(reservationService.list(currentUser, status, pageable), ReservationResponse::from);
    }

    @GetMapping("/reservations/{id}")
    public ReservationResponse get(@PathVariable UUID id, @AuthenticationPrincipal CurrentUser currentUser) {
        return ReservationResponse.from(reservationService.get(id, currentUser));
    }

    @PostMapping("/reservations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReservationResponse> create(
            @Valid @RequestBody ReservationRequest request, @AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ReservationResponse.from(reservationService.create(request, currentUser)));
    }

    @PostMapping("/reservations/{id}/activate")
    @PreAuthorize("hasAnyRole('FLEET_AGENT','ADMIN')")
    public ReservationResponse activate(@PathVariable UUID id, @AuthenticationPrincipal CurrentUser currentUser) {
        return ReservationResponse.from(reservationService.activate(id, currentUser));
    }

    @PostMapping("/reservations/{id}/complete")
    @PreAuthorize("hasAnyRole('FLEET_AGENT','ADMIN')")
    public ReservationResponse complete(
            @PathVariable UUID id,
            @Valid @RequestBody CompleteReservationRequest request,
            @AuthenticationPrincipal CurrentUser currentUser) {
        return ReservationResponse.from(reservationService.complete(id, request.endMileage(), currentUser));
    }

    @PostMapping("/reservations/{id}/cancel")
    public ReservationResponse cancel(@PathVariable UUID id, @AuthenticationPrincipal CurrentUser currentUser) {
        return ReservationResponse.from(reservationService.cancel(id, currentUser));
    }

    @GetMapping("/vehicles/{vehicleId}/availability")
    public Map<String, Boolean> checkAvailability(
            @PathVariable UUID vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Map.of("available", reservationService.isAvailable(vehicleId, startDate, endDate));
    }
}
