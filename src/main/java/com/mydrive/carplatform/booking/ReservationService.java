package com.mydrive.carplatform.booking;

import com.mydrive.carplatform.auth.User;
import com.mydrive.carplatform.auth.UserRepository;
import com.mydrive.carplatform.auth.security.CurrentUser;
import com.mydrive.carplatform.booking.dto.ReservationRequest;
import com.mydrive.carplatform.booking.state.ReservationStateMachine;
import com.mydrive.carplatform.common.exception.ConflictException;
import com.mydrive.carplatform.common.exception.ForbiddenException;
import com.mydrive.carplatform.common.exception.ResourceNotFoundException;
import com.mydrive.carplatform.fleet.Vehicle;
import com.mydrive.carplatform.fleet.VehicleRepository;
import com.mydrive.carplatform.fleet.VehicleStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final ReservationStateMachine stateMachine;

    public ReservationService(
            ReservationRepository reservationRepository,
            VehicleRepository vehicleRepository,
            UserRepository userRepository,
            ReservationStateMachine stateMachine) {
        this.reservationRepository = reservationRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.stateMachine = stateMachine;
    }

    @Transactional(readOnly = true)
    public Reservation get(UUID id, CurrentUser currentUser) {
        Reservation reservation = find(id);
        requireViewAccess(reservation, currentUser);
        return reservation;
    }

    public Page<Reservation> list(CurrentUser currentUser, ReservationStatus status, Pageable pageable) {
        List<Specification<Reservation>> specs;
        if (currentUser.isAdmin()) {
            specs = Arrays.asList(ReservationSpecifications.status(status));
        } else if (currentUser.isFleetAgent()) {
            specs = Arrays.asList(
                    ReservationSpecifications.locationId(currentUser.locationId()), ReservationSpecifications.status(status));
        } else {
            specs = Arrays.asList(ReservationSpecifications.customerId(currentUser.userId()), ReservationSpecifications.status(status));
        }
        return reservationRepository.findAll(combine(specs), pageable);
    }

    public boolean isAvailable(UUID vehicleId, LocalDate startDate, LocalDate endDate) {
        return !reservationRepository.existsOverlapping(vehicleId, startDate, endDate);
    }

    @Transactional
    public Reservation create(ReservationRequest request, CurrentUser currentUser) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new ConflictException("INVALID_DATE_RANGE", "endDate must not be before startDate");
        }
        Vehicle vehicle = vehicleRepository
                .findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicle", request.vehicleId()));
        if (vehicle.getStatus() == VehicleStatus.RETIRED || vehicle.getStatus() == VehicleStatus.OUT_OF_SERVICE) {
            throw new ConflictException("VEHICLE_NOT_BOOKABLE", "This vehicle is not available for booking");
        }
        User customer = userRepository
                .findById(currentUser.userId())
                .orElseThrow(() -> ResourceNotFoundException.of("User", currentUser.userId()));

        // Fast, friendly pre-check. The database exclusion constraint (see V6 migration) is
        // the real concurrency-safe guard; DataIntegrityViolationException from a race is
        // caught below and turned into the same 409.
        if (!isAvailable(vehicle.getId(), request.startDate(), request.endDate())) {
            throw new ConflictException("VEHICLE_NOT_AVAILABLE", "This vehicle is already booked for the requested dates");
        }

        long days = ChronoUnit.DAYS.between(request.startDate(), request.endDate()) + 1;
        BigDecimal totalAmount = vehicle.getDailyRate().multiply(BigDecimal.valueOf(days));

        Reservation reservation = new Reservation(customer, vehicle, request.startDate(), request.endDate(), totalAmount);
        try {
            return reservationRepository.saveAndFlush(reservation);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("VEHICLE_NOT_AVAILABLE", "This vehicle is already booked for the requested dates");
        }
    }

    @Transactional
    public Reservation activate(UUID id, CurrentUser currentUser) {
        Reservation reservation = find(id);
        requireStaffAccess(reservation, currentUser);
        stateMachine.validateTransition(reservation.getStatus(), ReservationStatus.ACTIVE);
        reservation.setStatus(ReservationStatus.ACTIVE);
        reservation.getVehicle().setStatus(VehicleStatus.RENTED);
        return reservation;
    }

    @Transactional
    public Reservation complete(UUID id, int endMileage, CurrentUser currentUser) {
        Reservation reservation = find(id);
        requireStaffAccess(reservation, currentUser);
        stateMachine.validateTransition(reservation.getStatus(), ReservationStatus.COMPLETED);
        reservation.setStatus(ReservationStatus.COMPLETED);
        Vehicle vehicle = reservation.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        if (endMileage > vehicle.getMileage()) {
            vehicle.setMileage(endMileage);
        }
        return reservation;
    }

    @Transactional
    public Reservation cancel(UUID id, CurrentUser currentUser) {
        Reservation reservation = find(id);
        if (currentUser.isCustomer()) {
            if (!reservation.getCustomer().getId().equals(currentUser.userId())) {
                throw new ForbiddenException("You do not have access to this reservation");
            }
            if (reservation.getStatus() != ReservationStatus.RESERVED) {
                throw new ConflictException(
                        "CANNOT_CANCEL_ACTIVE_RESERVATION", "Only a RESERVED (not yet picked up) reservation can be self-cancelled");
            }
        } else {
            requireStaffAccess(reservation, currentUser);
        }
        stateMachine.validateTransition(reservation.getStatus(), ReservationStatus.CANCELLED);
        boolean wasActive = reservation.getStatus() == ReservationStatus.ACTIVE;
        reservation.setStatus(ReservationStatus.CANCELLED);
        if (wasActive) {
            reservation.getVehicle().setStatus(VehicleStatus.AVAILABLE);
        }
        return reservation;
    }

    private Reservation find(UUID id) {
        return reservationRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Reservation", id));
    }

    private void requireViewAccess(Reservation reservation, CurrentUser currentUser) {
        if (currentUser.isAdmin()) {
            return;
        }
        if (currentUser.isFleetAgent()
                && reservation.getVehicle().getLocation().getId().equals(currentUser.locationId())) {
            return;
        }
        if (currentUser.isCustomer() && reservation.getCustomer().getId().equals(currentUser.userId())) {
            return;
        }
        throw new ForbiddenException("You do not have access to this reservation");
    }

    private void requireStaffAccess(Reservation reservation, CurrentUser currentUser) {
        if (currentUser.isAdmin()) {
            return;
        }
        if (currentUser.isFleetAgent()
                && reservation.getVehicle().getLocation().getId().equals(currentUser.locationId())) {
            return;
        }
        throw new ForbiddenException("You do not have access to this reservation");
    }

    private static Specification<Reservation> combine(List<Specification<Reservation>> specs) {
        Specification<Reservation> result = null;
        for (Specification<Reservation> spec : specs) {
            if (spec == null) {
                continue;
            }
            result = result == null ? spec : result.and(spec);
        }
        return result;
    }
}
