package com.mydrive.carplatform.fleet;

import com.mydrive.carplatform.auth.security.CurrentUser;
import com.mydrive.carplatform.common.web.PageResponse;
import com.mydrive.carplatform.fleet.dto.VehicleRequest;
import com.mydrive.carplatform.fleet.dto.VehicleResponse;
import com.mydrive.carplatform.fleet.dto.VehicleStatusUpdateRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public PageResponse<VehicleResponse> search(
            @RequestParam(required = false) UUID locationId,
            @RequestParam(required = false) VehicleStatus status,
            @RequestParam(required = false) PricingTier pricingTier,
            Pageable pageable) {
        return PageResponse.of(vehicleService.search(locationId, status, pricingTier, pageable), VehicleResponse::from);
    }

    @GetMapping("/{id}")
    public VehicleResponse get(@PathVariable UUID id) {
        return VehicleResponse.from(vehicleService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_AGENT','ADMIN')")
    public ResponseEntity<VehicleResponse> create(
            @Valid @RequestBody VehicleRequest request, @AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(VehicleResponse.from(vehicleService.create(request, currentUser)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_AGENT','ADMIN')")
    public VehicleResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal CurrentUser currentUser) {
        return VehicleResponse.from(vehicleService.update(id, request, currentUser));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FLEET_AGENT','ADMIN')")
    public VehicleResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleStatusUpdateRequest request,
            @AuthenticationPrincipal CurrentUser currentUser) {
        return VehicleResponse.from(vehicleService.updateStatus(id, request.status(), currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> retire(@PathVariable UUID id) {
        vehicleService.retire(id);
        return ResponseEntity.noContent().build();
    }
}
