package com.mydrive.carplatform.booking.dto;

import com.mydrive.carplatform.booking.Reservation;
import com.mydrive.carplatform.booking.ReservationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ReservationResponse(
        UUID id,
        UUID customerId,
        UUID vehicleId,
        LocalDate startDate,
        LocalDate endDate,
        ReservationStatus status,
        BigDecimal totalAmount) {

    public static ReservationResponse from(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getCustomer().getId(),
                reservation.getVehicle().getId(),
                reservation.getStartDate(),
                reservation.getEndDate(),
                reservation.getStatus(),
                reservation.getTotalAmount());
    }
}
