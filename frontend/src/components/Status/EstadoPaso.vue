<script setup>
import { computed } from 'vue';
import { ESTADOS } from '../../utils/constantes';

const props = defineProps({
  estado: { type: String, required: true },
});

const pasos = ['PENDIENTE', 'EN COLA', 'PROCESANDO', 'RESPONDIDA'];

const indiceActual = computed(() => {
  if (props.estado === ESTADOS.ERROR) return -1;
  return pasos.indexOf(props.estado);
});

const esError = computed(() => props.estado === ESTADOS.ERROR);

function estadoPaso(indice) {
  if (esError.value) return 'paso-error';
  if (indice < indiceActual.value) return 'paso-completado';
  if (indice === indiceActual.value) return 'paso-actual';
  return 'paso-futuro';
}

const etiquetas = {
  PENDIENTE: 'Pendiente',
  'EN COLA': 'En cola',
  PROCESANDO: 'Procesando',
  RESPONDIDA: 'Respondida',
};
</script>

<template>
  <div class="pasos" :class="{ 'pasos-error': esError }">
    <template v-if="esError">
      <div class="paso paso-error">
        <span class="paso-numero">✕</span>
        <span>{{ estado }}</span>
      </div>
    </template>
    <template v-else>
      <div
        v-for="(paso, indice) in pasos"
        :key="paso"
        class="paso"
        :class="estadoPaso(indice)"
      >
        <span class="paso-numero">{{ indice + 1 }}</span>
        <span class="paso-etiqueta">{{ etiquetas[paso] }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pasos {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.paso {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.paso-numero {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  background: var(--color-borde);
  color: var(--color-texto-suave);
}

.paso-completado {
  background: #d1fae5;
  color: #065f46;
}

.paso-completado .paso-numero {
  background: var(--color-respondida);
  color: #fff;
}

.paso-actual {
  background: #eff6ff;
  color: var(--color-primario);
  outline: 2px solid #bfdbfe;
}

.paso-actual .paso-numero {
  background: var(--color-primario);
  color: #fff;
}

.paso-futuro {
  background: #f8fafc;
  color: var(--color-texto-suave);
}

.paso-error {
  background: #fee2e2;
  color: #991b1b;
  font-weight: 700;
}

.paso-error .paso-numero {
  background: var(--color-error);
  color: #fff;
}
</style>