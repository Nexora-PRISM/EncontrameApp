import { useMutation } from '@tanstack/react-query';

import { getEmergencyRepository } from '@/services/emergency/emergency.repository';
import type { EmergencyAlertPayload } from '@/services/emergency/emergency.types';

/** Envia o alerta de emergência. Sem nova tentativa automática: a tela oferece "Tentar de novo". */
export function useSendEmergencyAlertMutation() {
  return useMutation({
    retry: false,
    mutationFn: (payload: EmergencyAlertPayload) => getEmergencyRepository().sendAlert(payload),
  });
}
