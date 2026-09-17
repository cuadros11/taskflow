<script setup>
import { useRouter } from 'vue-router';
import { formatDate } from '../../utils/formatDate';
import StatusBadge from '../Status/StatusBadge.vue';

const props = defineProps({
  solicitudes: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false },
});

const router = useRouter();

const idCorto = (id) => (id ? String(id).slice(-6).toUpperCase() : '—');

function verDetalle(id) {
  router.push({ name: 'detalle-solicitud', params: { id } });
}
</script>

<template>
  <div>
    <p v-if="cargando" class="texto-suave">Cargando solicitudes...</p>
    <p v-else-if="solicitudes.length === 0" class="texto-suave">
      No hay solicitudes registradas todavía.
    </p>
    <div v-else class="tabla-wrapper">
      <table class="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Solicitud</th>
            <th>Categoría</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="solicitud in solicitudes" :key="solicitud._id">
            <td>#{{ idCorto(solicitud._id) }}</td>
            <td>{{ solicitud.titulo }}</td>
            <td>{{ solicitud.categoria }}</td>
            <td>{{ solicitud.prioridad }}</td>
            <td><StatusBadge :estado="solicitud.estado" /></td>
            <td>{{ formatDate(solicitud.fechaCreacion) }}</td>
            <td>
              <button
                class="enlace-accion"
                type="button"
                @click="verDetalle(solicitud._id)"
              >
                Ver detalle
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.tabla-wrapper {
  overflow-x: auto;
}

.enlace-accion {
  border: none;
  background: transparent;
  color: var(--color-primario);
  font-weight: 600;
  padding: 0;
}

.enlace-accion:hover {
  text-decoration: underline;
}
</style>