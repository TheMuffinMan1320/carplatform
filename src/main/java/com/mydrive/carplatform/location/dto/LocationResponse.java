package com.mydrive.carplatform.location.dto;

import com.mydrive.carplatform.location.Location;
import java.util.UUID;

public record LocationResponse(
        UUID id,
        String name,
        String addressLine1,
        String addressLine2,
        String city,
        String region,
        String postalCode,
        String country,
        String phone,
        boolean active) {

    public static LocationResponse from(Location location) {
        return new LocationResponse(
                location.getId(),
                location.getName(),
                location.getAddressLine1(),
                location.getAddressLine2(),
                location.getCity(),
                location.getRegion(),
                location.getPostalCode(),
                location.getCountry(),
                location.getPhone(),
                location.isActive());
    }
}
