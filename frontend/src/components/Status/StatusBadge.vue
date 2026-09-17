<script setup>
import { computed } from 'vue';
import { ESTADOS, ETIQUETAS_ESTADO } from '../../utils/constantes';

const props = defineProps({
  estado: { type: String, required: true },
});

const clase = computed(() => {
  const mapa = {
    [ESTADOS.PENDIENTE]: 'badge-pendiente',
    [ESTADOS.EN_COLA]: 'badge-en-cola',
    [ESTADOS.PROCESANDO]: 'badge-procesando',
    [ESTADOS.RESPONDIDA]: 'badge-respondida',
    [ESTADOS.ERROR]: 'badge-error',
  };
  return mapa[props.estado] || 'badge-desconocido';
});

const etiqueta = computed(() => ETIQUETAS_ESTADO[props.estado] || props.estado);
</script>

<template>
  <span class="badge" :class="clase">{{ etiqueta }}</span>
</template>