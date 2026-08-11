package com.mydrive.carplatform.fleet;

import com.mydrive.carplatform.auth.security.CurrentUser;
import com.mydrive.carplatform.common.exception.ConflictException;
import com.mydrive.carplatform.common.exception.ForbiddenException;
import com.mydrive.carplatform.common.exception.ResourceNotFoundException;
import com.mydrive.carplatform.fleet.dto.VehicleRequest;
import com.mydrive.carplatform.location.Location;
import com.mydrive.carplatform.location.LocationRepository;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final LocationRepository locationRepository;

    public VehicleService(VehicleRepository vehicleRepository, LocationRepository locationRepository) {
        this.vehicleRepository = vehicleRepository;
        this.locationRepository = locationRepository;
    }

    public Vehicle get(UUID id) {
        return vehicleRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Vehicle", id));
    }

    public Page<Vehicle> search(UUID locationId, VehicleStatus status, PricingTier tier, Pageable pageable) {
        List<Specification<Vehicle>> specs = Arrays.asList(
                VehicleSpecifications.locationId(locationId),
                VehicleSpecifications.status(status),
                VehicleSpecifications.pricingTier(tier));
        Specification<Vehicle> combined = combine(specs);
        return vehicleRepository.findAll(combined, pageable);
    }

    @Transactional
    public Vehicle create(VehicleRequest request, CurrentUser currentUser) {
        Location location = locationRepository
                .findById(request.locationId())
                .orElseThrow(() -> ResourceNotFoundException.of("Location", request.locationId()));
        requireLocationAccess(currentUser, location.getId());
        if (vehicleRepository.existsByVinIgnoreCase(request.vin())) {
            throw new ConflictException("VIN_ALREADY_REGISTERED", "A vehicle with this VIN is already registered");
        }
        Vehicle vehicle = new Vehicle(
                location,
                request.make(),
                request.model(),
                request.year(),
                request.vin().toUpperCase(),
                request.licensePlate(),
                request.mileage(),
                request.pricingTier(),
                request.dailyRate());
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle update(UUID id, VehicleRequest request, CurrentUser currentUser) {
        Vehicle vehicle = get(id);
        requireLocationAccess(currentUser, vehicle.getLocation().getId());

        if (!vehicle.getVin().equalsIgnoreCase(request.vin()) && vehicleRepository.existsByVinIgnoreCase(request.vin())) {
            throw new ConflictException("VIN_ALREADY_REGISTERED", "A vehicle with this VIN is already registered");
        }

        if (!vehicle.getLocation().getId().equals(request.locationId())) {
            Location newLocation = locationRepository
                    .findById(request.locationId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Location", request.locationId()));
            requireLocationAccess(currentUser, newLocation.getId());
            vehicle.setLocation(newLocation);
        }

        vehicle.setMake(request.make());
        vehicle.setModel(request.model());
        vehicle.setYear(request.year());
        vehicle.setVin(request.vin().toUpperCase());
        vehicle.setLicensePlate(request.licensePlate());
        vehicle.setMileage(request.mileage());
        vehicle.setPricingTier(request.pricingTier());
        vehicle.setDailyRate(request.dailyRate());
        return vehicle;
    }

    @Transactional
    public Vehicle updateStatus(UUID id, VehicleStatus status, CurrentUser currentUser) {
        Vehicle vehicle = get(id);
        requireLocationAccess(currentUser, vehicle.getLocation().getId());
        vehicle.setStatus(status);
        return vehicle;
    }

    @Transactional
    public void retire(UUID id) {
        Vehicle vehicle = get(id);
        vehicle.setStatus(VehicleStatus.RETIRED);
    }

    private void requireLocationAccess(CurrentUser currentUser, UUID locationId) {
        if (currentUser.isAdmin()) {
            return;
        }
        if (currentUser.isFleetAgent() && locationId.equals(currentUser.locationId())) {
            return;
        }
        throw new ForbiddenException("You do not have access to this location's fleet");
    }

    private static Specification<Vehicle> combine(List<Specification<Vehicle>> specs) {
        Specification<Vehicle> result = null;
        for (Specification<Vehicle> spec : specs) {
            if (spec == null) {
                continue;
            }
            result = result == null ? spec : result.and(spec);
        }
        return result;
    }
}
