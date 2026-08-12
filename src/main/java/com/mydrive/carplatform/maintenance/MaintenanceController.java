package com.mydrive.carplatform.maintenance;

import com.mydrive.carplatform.auth.security.CurrentUser;
import com.mydrive.carplatform.common.web.PageResponse;
import com.mydrive.carplatform.maintenance.dto.MaintenanceAlertResponse;
import com.mydrive.carplatform.maintenance.dto.MaintenanceRecordRequest;
import com.mydrive.carplatform.maintenance.dto.MaintenanceRecordResponse;
import com.mydrive.carplatform.maintenance.dto.MaintenanceRuleResponse;
import com.mydrive.carplatform.maintenance.dto.MaintenanceRuleUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping("/vehicles/{vehicleId}/maintenance-records")
    @PreAuthorize("hasAnyRole('FLEET_AGENT','ADMIN')")
    public List<MaintenanceRecordResponse> listRecords(
            @PathVariable UUID vehicleId, @AuthenticationPrincipal CurrentUser currentUser) {
        return maintenanceService.listRecords(vehicleId, currentUser).stream()
                .map(MaintenanceRecordResponse::from)
                .toList();
    }

    @PostMapping("/vehicles/{vehicleId}/maintenance-records")
    @PreAuthorize("hasAnyRole('FLEET_AGENT','ADMIN')")
    public ResponseEntity<MaintenanceRecordResponse> addRecord(
            @PathVariable UUID vehicleId,
            @Valid @RequestBody MaintenanceRecordRequest request,
            @AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(MaintenanceRecordResponse.from(maintenanceService.addRecord(vehicleId, request, currentUser)));
    }

    @GetMapping("/maintenance-alerts")
    @PreAuthorize("hasAnyRole('FLEET_AGENT','ADMIN')")
    public PageResponse<MaintenanceAlertResponse> listAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) UUID locationId,
            Pageable pageable,
            @AuthenticationPrincipal CurrentUser currentUser) {
        return PageResponse.of(
                maintenanceService.listAlerts(status, locationId, currentUser, pageable), MaintenanceAlertResponse::from);
    }

    @PatchMapping("/maintenance-alerts/{id}/dismiss")
    @PreAuthorize("hasAnyRole('FLEET_AGENT','ADMIN')")
    public MaintenanceAlertResponse dismissAlert(@PathVariable UUID id, @AuthenticationPrincipal CurrentUser currentUser) {
        return MaintenanceAlertResponse.from(maintenanceService.dismissAlert(id, currentUser));
    }

    @GetMapping("/maintenance-rules")
    public List<MaintenanceRuleResponse> listRules() {
        return maintenanceService.listRules().stream().map(MaintenanceRuleResponse::from).toList();
    }

    @PutMapping("/maintenance-rules/{serviceType}")
    @PreAuthorize("hasRole('ADMIN')")
    public MaintenanceRuleResponse updateRule(
            @PathVariable ServiceType serviceType, @Valid @RequestBody MaintenanceRuleUpdateRequest request) {
        return MaintenanceRuleResponse.from(maintenanceService.updateRule(serviceType, request));
    }
}
