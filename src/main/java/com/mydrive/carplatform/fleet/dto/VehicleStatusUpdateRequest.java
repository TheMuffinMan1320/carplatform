package com.mydrive.carplatform.fleet.dto;

import com.mydrive.carplatform.fleet.VehicleStatus;
import jakarta.validation.constraints.NotNull;

public record VehicleStatusUpdateRequest(@NotNull VehicleStatus status) {
}
