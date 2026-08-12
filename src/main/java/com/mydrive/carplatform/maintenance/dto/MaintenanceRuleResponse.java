package com.mydrive.carplatform.maintenance.dto;

import com.mydrive.carplatform.maintenance.MaintenanceRule;
import com.mydrive.carplatform.maintenance.ServiceType;

public record MaintenanceRuleResponse(ServiceType serviceType, int mileageInterval, int timeIntervalMonths) {

    public static MaintenanceRuleResponse from(MaintenanceRule rule) {
        return new MaintenanceRuleResponse(rule.getServiceType(), rule.getMileageInterval(), rule.getTimeIntervalMonths());
    }
}
