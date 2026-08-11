package com.mydrive.carplatform.fleet.dto;

import com.mydrive.carplatform.fleet.PricingTier;
import com.mydrive.carplatform.fleet.Vehicle;
import com.mydrive.carplatform.fleet.VehicleStatus;
import java.math.BigDecimal;
import java.util.UUID;

public record VehicleResponse(
        UUID id,
        UUID locationId,
        String make,
        String model,
        int year,
        String vin,
        String licensePlate,
        int mileage,
        VehicleStatus status,
        PricingTier pricingTier,
        BigDecimal dailyRate) {

    public static VehicleResponse from(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getLocation().getId(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getVin(),
                vehicle.getLicensePlate(),
                vehicle.getMileage(),
                vehicle.getStatus(),
                vehicle.getPricingTier(),
                vehicle.getDailyRate());
    }
}
