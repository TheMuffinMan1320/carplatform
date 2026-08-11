package com.mydrive.carplatform.location;

import com.mydrive.carplatform.common.exception.ResourceNotFoundException;
import com.mydrive.carplatform.location.dto.LocationRequest;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public Location get(UUID id) {
        return locationRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Location", id));
    }

    @Transactional
    public Location create(LocationRequest request) {
        Location location = new Location(
                request.name(),
                request.addressLine1(),
                request.addressLine2(),
                request.city(),
                request.region(),
                request.postalCode(),
                request.country(),
                request.phone());
        return locationRepository.save(location);
    }

    @Transactional
    public Location update(UUID id, LocationRequest request) {
        Location location = get(id);
        location.setName(request.name());
        location.setAddressLine1(request.addressLine1());
        location.setAddressLine2(request.addressLine2());
        location.setCity(request.city());
        location.setRegion(request.region());
        location.setPostalCode(request.postalCode());
        location.setCountry(request.country());
        location.setPhone(request.phone());
        return location;
    }

    @Transactional
    public void deactivate(UUID id) {
        Location location = get(id);
        location.setActive(false);
    }
}
