package com.mydrive.carplatform.maintenance.dto;

import jakarta.validation.constraints.Min;

public record MaintenanceRuleUpdateRequest(@Min(1) int mileageInterval, @Min(1) int timeIntervalMonths) {
}
