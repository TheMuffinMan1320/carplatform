package com.mydrive.carplatform.maintenance.dto;

import com.mydrive.carplatform.maintenance.ServiceType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MaintenanceRecordRequest(
        @NotNull ServiceType serviceType,
        @NotNull @PastOrPresent LocalDate performedAt,
        @Min(0) int mileageAtService,
        @DecimalMin(value = "0.0") BigDecimal cost,
        @Size(max = 2000) String notes) {
}
