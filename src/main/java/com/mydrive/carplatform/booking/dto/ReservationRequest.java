package com.mydrive.carplatform.booking.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record ReservationRequest(
        @NotNull UUID vehicleId, @NotNull @FutureOrPresent LocalDate startDate, @NotNull LocalDate endDate) {
}
