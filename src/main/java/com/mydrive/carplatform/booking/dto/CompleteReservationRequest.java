package com.mydrive.carplatform.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CompleteReservationRequest(@NotNull @Min(0) Integer endMileage) {
}
