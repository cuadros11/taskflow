<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '../components/Headers/PageHeader.vue';
import PanelCard from '../components/Cards/PanelCard.vue';
import StatusBadge from '../components/Status/StatusBadge.vue';
import EstadoPaso from '../components/Status/EstadoPaso.vue';
import BaseButton from '../components/Buttons/BaseButton.vue';
import { formatDate } from '../utils/formatDate';
import { useRequestStore } from '../store/requestStore';

const route = useRoute();
const router = useRouter();
const store = useRequestStore();

const solicitud = computed(() => store.solicitudSeleccionada);
const error = ref('');

async function cargarDetalle() {
  error.value = '';
  try {
    await store.obtenerSolicitud(route.params.id);
  } catch (err) {
    error.value = err.message;
  }
}

onMounted(cargarDetalle);
watch(() => route.params.id, cargarDetalle);

function volver() {
  router.push({ name: 'solicitudes' });
}
</script>

<template>
  <div>
    <PageHeader titulo="Detalle de solicitud">
      <template #acciones>
        <BaseButton tipo="secundario" @click="volver">← Volver</BaseButton>
      </template>
    </PageHeader>

    <p v-if="error" class="mensaje-error">{{ error }}</p>
    <p v-else-if="!solicitud" class="texto-suave">Cargando solicitud...</p>

    <template v-else>
      <PanelCard>
        <div class="detalle-cabecera">
          <div>
            <h2>{{ solicitud.titulo }}</h2>
            <p class="texto-suave">ID: {{ solicitud._id }}</p>
          </div>
          <StatusBadge :estado="solicitud.estado" />
        </div>

        <div class="detalle-grid">
          <div>
            <span class="campo-etiqueta">Categoría</span>
            <span>{{ solicitud.categoria }}</span>
          </div>
          <div>
            <span class="campo-etiqueta">Prioridad</span>
            <span>{{ solicitud.prioridad }}</span>
          </div>
          <div>
            <span class="campo-etiqueta">Fecha de creación</span>
            <span>{{ formatDate(solicitud.fechaCreacion) }}</span>
          </div>
          <div>
            <span class="campo-etiqueta">Fecha de procesamiento</span>
            <span>{{ formatDate(solicitud.fechaProcesamiento) }}</span>
          </div>
          <div v-if="solicitud.fechaRespuesta">
            <span class="campo-etiqueta">Fecha de respuesta</span>
            <span>{{ formatDate(solicitud.fechaRespuesta) }}</span>
          </div>
        </div>
      </PanelCard>

      <PanelCard titulo="Ciclo de vida">
        <EstadoPaso :estado="solicitud.estado" />
      </PanelCard>

      <PanelCard titulo="Descripción">
        <p>{{ solicitud.descripcion }}</p>
      </PanelCard>

      <PanelCard titulo="Respuesta generada">
        <pre
          v-if="solicitud.respuesta"
          class="respuesta"
        >{{ solicitud.respuesta }}</pre>
        <p v-else-if="solicitud.estado === 'ERROR'" class="mensaje-error">
          {{ solicitud.errorMensaje || 'Ocurrió un error durante el procesamiento' }}
        </p>
        <p v-else class="texto-suave">
          Aún no se genera respuesta. La solicitud está en estado {{ solicitud.estado }}.
        </p>
      </PanelCard>
    </template>
  </div>
</template>

<style scoped>
.detalle-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.detalle-cabecera h2 {
  margin: 0;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.8rem;
}

.detalle-grid > div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.campo-etiqueta {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-texto-suave);
  font-weight: 600;
}

.respuesta {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  background: #f8fafc;
  border: 1px solid var(--color-borde);
  border-radius: 8px;
  padding: 1rem;
  margin: 0;
}
</style>