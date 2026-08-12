package com.mydrive.carplatform.maintenance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mydrive.carplatform.fleet.PricingTier;
import com.mydrive.carplatform.fleet.Vehicle;
import com.mydrive.carplatform.location.Location;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class MaintenanceEvaluationServiceTest {

    private static final MaintenanceRule OIL_CHANGE_RULE = new MaintenanceRule(ServiceType.OIL_CHANGE, 5000, 6);

    private MaintenanceRuleRepository ruleRepository;
    private MaintenanceRecordRepository recordRepository;
    private MaintenanceAlertRepository alertRepository;
    private MaintenanceEvaluationService evaluationService;

    @BeforeEach
    void setUp() {
        ruleRepository = mock(MaintenanceRuleRepository.class);
        recordRepository = mock(MaintenanceRecordRepository.class);
        alertRepository = mock(MaintenanceAlertRepository.class);
        evaluationService = new MaintenanceEvaluationService(ruleRepository, recordRepository, alertRepository);
        when(ruleRepository.findAll()).thenReturn(List.of(OIL_CHANGE_RULE));
    }

    @Test
    void opensAlertWhenMileageThresholdExceededWithNoPriorRecord() throws Exception {
        Vehicle vehicle = vehicleWithMileage(5200, Instant.now().minus(10, ChronoUnit.DAYS));
        when(recordRepository.findFirstByVehicleIdAndServiceTypeOrderByPerformedAtDesc(vehicle.getId(), ServiceType.OIL_CHANGE))
                .thenReturn(Optional.empty());
        when(alertRepository.findFirstByVehicleIdAndServiceTypeAndStatus(vehicle.getId(), ServiceType.OIL_CHANGE, AlertStatus.OPEN))
                .thenReturn(Optional.empty());

        evaluationService.evaluate(vehicle);

        verify(alertRepository).save(any(MaintenanceAlert.class));
    }

    @Test
    void opensAlertWhenTimeThresholdExceededEvenIfMileageIsLow() throws Exception {
        // Vehicle sat idle: created 7 months ago, no maintenance record, mileage barely moved.
        Vehicle vehicle = vehicleWithMileage(50, Instant.now().minus(210, ChronoUnit.DAYS));
        when(recordRepository.findFirstByVehicleIdAndServiceTypeOrderByPerformedAtDesc(vehicle.getId(), ServiceType.OIL_CHANGE))
                .thenReturn(Optional.empty());
        when(alertRepository.findFirstByVehicleIdAndServiceTypeAndStatus(vehicle.getId(), ServiceType.OIL_CHANGE, AlertStatus.OPEN))
                .thenReturn(Optional.empty());

        evaluationService.evaluate(vehicle);

        verify(alertRepository).save(any(MaintenanceAlert.class));
    }

    @Test
    void doesNotOpenAlertWhenNeitherThresholdExceeded() throws Exception {
        Vehicle vehicle = vehicleWithMileage(1000, Instant.now().minus(10, ChronoUnit.DAYS));
        when(recordRepository.findFirstByVehicleIdAndServiceTypeOrderByPerformedAtDesc(vehicle.getId(), ServiceType.OIL_CHANGE))
                .thenReturn(Optional.empty());

        evaluationService.evaluate(vehicle);

        verify(alertRepository, never()).save(any());
    }

    @Test
    void doesNotDuplicateAlertWhenOneIsAlreadyOpen() throws Exception {
        Vehicle vehicle = vehicleWithMileage(5200, Instant.now().minus(10, ChronoUnit.DAYS));
        when(recordRepository.findFirstByVehicleIdAndServiceTypeOrderByPerformedAtDesc(vehicle.getId(), ServiceType.OIL_CHANGE))
                .thenReturn(Optional.empty());
        when(alertRepository.findFirstByVehicleIdAndServiceTypeAndStatus(vehicle.getId(), ServiceType.OIL_CHANGE, AlertStatus.OPEN))
                .thenReturn(Optional.of(mock(MaintenanceAlert.class)));

        evaluationService.evaluate(vehicle);

        verify(alertRepository, never()).save(any());
    }

    @Test
    void usesLastServiceRecordAsBaselineNotVehicleCreation() throws Exception {
        Vehicle vehicle = vehicleWithMileage(9000, Instant.now().minus(2, ChronoUnit.DAYS));
        MaintenanceRecord lastRecord = mock(MaintenanceRecord.class);
        when(lastRecord.getMileageAtService()).thenReturn(8000);
        when(lastRecord.getPerformedAt()).thenReturn(LocalDate.now().minusMonths(1));
        when(recordRepository.findFirstByVehicleIdAndServiceTypeOrderByPerformedAtDesc(vehicle.getId(), ServiceType.OIL_CHANGE))
                .thenReturn(Optional.of(lastRecord));
        when(alertRepository.findFirstByVehicleIdAndServiceTypeAndStatus(vehicle.getId(), ServiceType.OIL_CHANGE, AlertStatus.OPEN))
                .thenReturn(Optional.empty());

        // mileageSinceLast = 9000 - 8000 = 1000, well under the 5000 threshold; not due yet.
        evaluationService.evaluate(vehicle);
        verify(alertRepository, never()).save(any());
    }

    @Test
    void alertDueMileageIsBaselinePlusInterval() throws Exception {
        Vehicle vehicle = vehicleWithMileage(5000, Instant.now().minus(10, ChronoUnit.DAYS));
        when(recordRepository.findFirstByVehicleIdAndServiceTypeOrderByPerformedAtDesc(vehicle.getId(), ServiceType.OIL_CHANGE))
                .thenReturn(Optional.empty());
        when(alertRepository.findFirstByVehicleIdAndServiceTypeAndStatus(vehicle.getId(), ServiceType.OIL_CHANGE, AlertStatus.OPEN))
                .thenReturn(Optional.empty());

        evaluationService.evaluate(vehicle);

        ArgumentCaptor<MaintenanceAlert> captor = ArgumentCaptor.forClass(MaintenanceAlert.class);
        verify(alertRepository).save(captor.capture());
        assertThat(captor.getValue().getDueMileage()).isEqualTo(5000);
        assertThat(captor.getValue().getServiceType()).isEqualTo(ServiceType.OIL_CHANGE);
    }

    private static Vehicle vehicleWithMileage(int mileage, Instant createdAt) throws Exception {
        Location location = new Location("Loc", "1 St", null, "City", "ST", "00000", "USA", null);
        setId(location, UUID.randomUUID());
        Vehicle vehicle = new Vehicle(
                location, "Make", "Model", 2023, randomVin(), "PLATE", mileage, PricingTier.STANDARD, new BigDecimal("50.00"));
        setId(vehicle, UUID.randomUUID());
        setCreatedAt(vehicle, createdAt);
        return vehicle;
    }

    private static String randomVin() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 17).toUpperCase();
    }

    private static void setId(Object entity, UUID id) throws Exception {
        Field field = entity.getClass().getSuperclass().getDeclaredField("id");
        field.setAccessible(true);
        field.set(entity, id);
    }

    private static void setCreatedAt(Object entity, Instant createdAt) throws Exception {
        Field field = entity.getClass().getSuperclass().getDeclaredField("createdAt");
        field.setAccessible(true);
        field.set(entity, createdAt);
    }
}
