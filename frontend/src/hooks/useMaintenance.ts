import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as maintenanceApi from '../api/maintenance'
import type {
  MaintenanceAlertListParams,
  MaintenanceRecordRequest,
  MaintenanceRuleUpdateRequest,
  ServiceType,
} from '../types/maintenance'

export function useMaintenanceRecords(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ['maintenance-records', vehicleId],
    queryFn: () => maintenanceApi.listMaintenanceRecords(vehicleId!),
    enabled: !!vehicleId,
  })
}

export function useCreateMaintenanceRecord(vehicleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: MaintenanceRecordRequest) => maintenanceApi.createMaintenanceRecord(vehicleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records', vehicleId] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] })
    },
  })
}

export function useMaintenanceAlerts(params: MaintenanceAlertListParams) {
  return useQuery({
    queryKey: ['maintenance-alerts', params],
    queryFn: () => maintenanceApi.listMaintenanceAlerts(params),
  })
}

export function useDismissMaintenanceAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => maintenanceApi.dismissMaintenanceAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] }),
  })
}

export function useMaintenanceRules() {
  return useQuery({
    queryKey: ['maintenance-rules'],
    queryFn: () => maintenanceApi.listMaintenanceRules(),
  })
}

export function useUpdateMaintenanceRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ serviceType, body }: { serviceType: ServiceType; body: MaintenanceRuleUpdateRequest }) =>
      maintenanceApi.updateMaintenanceRule(serviceType, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance-rules'] }),
  })
}
