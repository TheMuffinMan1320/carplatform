package com.mydrive.carplatform.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreatePaymentRequest(@NotNull UUID reservationId, @NotBlank @Size(max = 128) String idempotencyKey) {
}
