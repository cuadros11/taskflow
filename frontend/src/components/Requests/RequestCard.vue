<script setup>
import { useRouter } from 'vue-router';
import { formatDate } from '../../utils/formatDate';
import StatusBadge from '../Status/StatusBadge.vue';

const props = defineProps({
  solicitud: { type: Object, required: true },
});

const router = useRouter();

const idCorto = (id) => (id ? String(id).slice(-6).toUpperCase() : '—');

function verDetalle() {
  router.push({ name: 'detalle-solicitud', params: { id: props.solicitud._id } });
}
</script>

<template>
  <article class="request-card">
    <div class="request-card-cabecera">
      <strong class="request-id">#{{ idCorto(solicitud._id) }}</strong>
      <StatusBadge :estado="solicitud.estado" />
    </div>
    <h4>{{ solicitud.titulo }}</h4>
    <p class="request-descripcion">{{ solicitud.descripcion }}</p>
    <div class="request-meta">
      <span>{{ solicitud.categoria }}</span>
      <span class="punto-separador">•</span>
      <span>Prioridad {{ solicitud.prioridad }}</span>
      <span class="punto-separador">•</span>
      <span>{{ formatDate(solicitud.fechaCreacion) }}</span>
    </div>
    <button class="request-ver" type="button" @click="verDetalle">Ver detalle →</button>
  </article>
</template>

<style scoped>
.request-card {
  background: var(--color-tarjeta);
  border-radius: var(--radio);
  box-shadow: var(--sombra);
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.request-card-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-id {
  color: var(--color-texto-suave);
  font-size: 0.8rem;
}

.request-card h4 {
  margin: 0;
  font-size: 1rem;
}

.request-descripcion {
  margin: 0;
  color: var(--color-texto-suave);
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.request-meta {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--color-texto-suave);
}

.punto-separador {
  opacity: 0.5;
}

.request-ver {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--color-primario);
  font-weight: 600;
  padding: 0;
}

.request-ver:hover {
  text-decoration: underline;
}
</style>