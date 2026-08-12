package com.mydrive.carplatform.maintenance;

import com.mydrive.carplatform.fleet.VehicleRepository;
import com.mydrive.carplatform.fleet.VehicleStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Daily sweep catching time-based thresholds, which have no natural triggering event (a car
 * sitting unused for 6 months still needs an alert). Mileage-based thresholds are also
 * re-checked here for vehicles that didn't go through a reservation completion (e.g. mileage
 * updated by other means) -- running both through one evaluator avoids duplicating threshold
 * logic across an event listener and a scheduler.
 */
@Component
public class MaintenanceScheduler {

    private static final Logger log = LoggerFactory.getLogger(MaintenanceScheduler.class);

    private final VehicleRepository vehicleRepository;
    private final MaintenanceEvaluationService evaluationService;

    public MaintenanceScheduler(VehicleRepository vehicleRepository, MaintenanceEvaluationService evaluationService) {
        this.vehicleRepository = vehicleRepository;
        this.evaluationService = evaluationService;
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void evaluateFleet() {
        var vehicles = vehicleRepository.findByStatusNot(VehicleStatus.RETIRED);
        log.info("Running scheduled maintenance evaluation for {} vehicles", vehicles.size());
        vehicles.forEach(evaluationService::evaluate);
    }
}
