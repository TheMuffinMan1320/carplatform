package com.mydrive.carplatform.fleet.dto;

import com.mydrive.carplatform.fleet.PricingTier;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record VehicleRequest(
        @NotNull UUID locationId,
        @NotBlank @Size(max = 100) String make,
        @NotBlank @Size(max = 100) String model,
        @Min(1900) int year,
        @NotBlank @Size(min = 11, max = 17) String vin,
        @Size(max = 20) String licensePlate,
        @Min(0) int mileage,
        @NotNull PricingTier pricingTier,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal dailyRate) {
}
