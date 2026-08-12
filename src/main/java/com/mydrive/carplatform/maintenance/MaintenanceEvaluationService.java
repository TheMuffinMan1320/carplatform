package com.mydrive.carplatform.maintenance;

import com.mydrive.carplatform.fleet.Vehicle;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Evaluates a vehicle against every maintenance rule (mileage- and time-based thresholds) and
 * opens an alert when either is exceeded. Called both from the daily {@link MaintenanceScheduler}
 * sweep and synchronously right after a reservation completes and updates a vehicle's mileage
 * (see ReservationService.complete), so a mileage-crossing threshold surfaces immediately
 * rather than waiting for the next sweep.
 */
@Service
public class MaintenanceEvaluationService {

    private final MaintenanceRuleRepository ruleRepository;
    private final MaintenanceRecordRepository recordRepository;
    private final MaintenanceAlertRepository alertRepository;

    public MaintenanceEvaluationService(
            MaintenanceRuleRepository ruleRepository,
            MaintenanceRecordRepository recordRepository,
            MaintenanceAlertRepository alertRepository) {
        this.ruleRepository = ruleRepository;
        this.recordRepository = recordRepository;
        this.alertRepository = alertRepository;
    }

    @Transactional
    public void evaluate(Vehicle vehicle) {
        for (MaintenanceRule rule : ruleRepository.findAll()) {
            evaluateRule(vehicle, rule);
        }
    }

    private void evaluateRule(Vehicle vehicle, MaintenanceRule rule) {
        var lastRecord = recordRepository.findFirstByVehicleIdAndServiceTypeOrderByPerformedAtDesc(
                vehicle.getId(), rule.getServiceType());

        int mileageBaseline = lastRecord.map(MaintenanceRecord::getMileageAtService).orElse(0);
        LocalDate dateBaseline = lastRecord
                .map(MaintenanceRecord::getPerformedAt)
                .orElseGet(() -> vehicle.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate());

        int mileageSinceLast = vehicle.getMileage() - mileageBaseline;
        long monthsSinceLast = ChronoUnit.MONTHS.between(dateBaseline, LocalDate.now());

        boolean mileageDue = mileageSinceLast >= rule.getMileageInterval();
        boolean timeDue = monthsSinceLast >= rule.getTimeIntervalMonths();

        if (mileageDue || timeDue) {
            ensureOpenAlert(vehicle, rule, mileageBaseline, dateBaseline);
        }
    }

    private void ensureOpenAlert(Vehicle vehicle, MaintenanceRule rule, int mileageBaseline, LocalDate dateBaseline) {
        boolean alreadyOpen = alertRepository
                .findFirstByVehicleIdAndServiceTypeAndStatus(vehicle.getId(), rule.getServiceType(), AlertStatus.OPEN)
                .isPresent();
        if (alreadyOpen) {
            return;
        }
        Integer dueMileage = mileageBaseline + rule.getMileageInterval();
        LocalDate dueDate = dateBaseline.plusMonths(rule.getTimeIntervalMonths());
        alertRepository.save(new MaintenanceAlert(vehicle, rule.getServiceType(), dueMileage, dueDate));
    }
}
