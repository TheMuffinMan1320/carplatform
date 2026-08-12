package com.mydrive.carplatform.maintenance;

import com.mydrive.carplatform.auth.User;
import com.mydrive.carplatform.auth.UserRepository;
import com.mydrive.carplatform.auth.security.CurrentUser;
import com.mydrive.carplatform.common.exception.ForbiddenException;
import com.mydrive.carplatform.common.exception.ResourceNotFoundException;
import com.mydrive.carplatform.fleet.Vehicle;
import com.mydrive.carplatform.fleet.VehicleRepository;
import com.mydrive.carplatform.maintenance.dto.MaintenanceRecordRequest;
import com.mydrive.carplatform.maintenance.dto.MaintenanceRuleUpdateRequest;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MaintenanceService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final MaintenanceRecordRepository recordRepository;
    private final MaintenanceAlertRepository alertRepository;
    private final MaintenanceRuleRepository ruleRepository;

    public MaintenanceService(
            VehicleRepository vehicleRepository,
            UserRepository userRepository,
            MaintenanceRecordRepository recordRepository,
            MaintenanceAlertRepository alertRepository,
            MaintenanceRuleRepository ruleRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.recordRepository = recordRepository;
        this.alertRepository = alertRepository;
        this.ruleRepository = ruleRepository;
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRecord> listRecords(UUID vehicleId, CurrentUser currentUser) {
        Vehicle vehicle = findVehicle(vehicleId);
        requireLocationAccess(currentUser, vehicle.getLocation().getId());
        return recordRepository.findByVehicleIdOrderByPerformedAtDesc(vehicleId);
    }

    @Transactional
    public MaintenanceRecord addRecord(UUID vehicleId, MaintenanceRecordRequest request, CurrentUser currentUser) {
        Vehicle vehicle = findVehicle(vehicleId);
        requireLocationAccess(currentUser, vehicle.getLocation().getId());
        User performedBy = userRepository.findById(currentUser.userId()).orElse(null);

        MaintenanceRecord saved = recordRepository.save(new MaintenanceRecord(
                vehicle,
                request.serviceType(),
                request.performedAt(),
                request.mileageAtService(),
                request.cost(),
                request.notes(),
                performedBy));

        alertRepository
                .findFirstByVehicleIdAndServiceTypeAndStatus(vehicleId, request.serviceType(), AlertStatus.OPEN)
                .ifPresent(alert -> {
                    alert.setStatus(AlertStatus.RESOLVED);
                    alert.setResolvedByRecordId(saved.getId());
                });

        return saved;
    }

    @Transactional(readOnly = true)
    public Page<MaintenanceAlert> listAlerts(AlertStatus status, UUID locationId, CurrentUser currentUser, Pageable pageable) {
        UUID effectiveLocationId = currentUser.isFleetAgent() ? currentUser.locationId() : locationId;
        List<Specification<MaintenanceAlert>> specs = Arrays.asList(
                MaintenanceAlertSpecifications.status(status), MaintenanceAlertSpecifications.locationId(effectiveLocationId));
        return alertRepository.findAll(combine(specs), pageable);
    }

    @Transactional
    public MaintenanceAlert dismissAlert(UUID id, CurrentUser currentUser) {
        MaintenanceAlert alert = alertRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("MaintenanceAlert", id));
        requireLocationAccess(currentUser, alert.getVehicle().getLocation().getId());
        alert.setStatus(AlertStatus.DISMISSED);
        return alert;
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRule> listRules() {
        return ruleRepository.findAll();
    }

    @Transactional
    public MaintenanceRule updateRule(ServiceType serviceType, MaintenanceRuleUpdateRequest request) {
        MaintenanceRule rule = ruleRepository
                .findById(serviceType)
                .orElseThrow(() -> ResourceNotFoundException.of("MaintenanceRule", serviceType));
        rule.setMileageInterval(request.mileageInterval());
        rule.setTimeIntervalMonths(request.timeIntervalMonths());
        return rule;
    }

    private Vehicle findVehicle(UUID vehicleId) {
        return vehicleRepository.findById(vehicleId).orElseThrow(() -> ResourceNotFoundException.of("Vehicle", vehicleId));
    }

    private void requireLocationAccess(CurrentUser currentUser, UUID locationId) {
        if (currentUser.isAdmin()) {
            return;
        }
        if (currentUser.isFleetAgent() && locationId.equals(currentUser.locationId())) {
            return;
        }
        throw new ForbiddenException("You do not have access to this vehicle's maintenance data");
    }

    private static Specification<MaintenanceAlert> combine(List<Specification<MaintenanceAlert>> specs) {
        Specification<MaintenanceAlert> result = null;
        for (Specification<MaintenanceAlert> spec : specs) {
            if (spec == null) {
                continue;
            }
            result = result == null ? spec : result.and(spec);
        }
        return result;
    }
}
