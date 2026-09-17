import { computed } from 'vue';
import { ESTADOS, ETIQUETAS_ESTADO } from '../utils/constantes';

export function useRequestStatus(estado) {
  const etiqueta = computed(() => ETIQUETAS_ESTADO[estado.value] || estado.value || 'Desconocido');

  const claseBadge = computed(() => {
    const mapa = {
      [ESTADOS.PENDIENTE]: 'badge-pendiente',
      [ESTADOS.EN_COLA]: 'badge-en-cola',
      [ESTADOS.PROCESANDO]: 'badge-procesando',
      [ESTADOS.RESPONDIDA]: 'badge-respondida',
      [ESTADOS.ERROR]: 'badge-error',
    };
    return mapa[estado.value] || 'badge-desconocido';
  });

  const color = computed(() => claseBadge.value.replace('badge-', ''));

  return { etiqueta, claseBadge, color };
}

export default useRequestStatus;