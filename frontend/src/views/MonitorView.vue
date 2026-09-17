<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import PageHeader from '../components/Headers/PageHeader.vue';
import PanelCard from '../components/Cards/PanelCard.vue';
import StatCard from '../components/StatCard.vue';
import { useRequestStore } from '../store/requestStore';

const store = useRequestStore();
const { monitor, cargandoMonitor } = storeToRefs(store);

const servicios = [
  { llave: 'express', nombre: 'Express' },
  { llave: 'mongodb', nombre: 'MongoDB' },
  { llave: 'redis', nombre: 'Redis' },
  { llave: 'worker', nombre: 'Worker' },
];

function estadoServicio(llave) {
  return monitor.value.servicios[llave];
}

onMounted(() => store.cargarMonitor().catch(() => {}));
</script>

<template>
  <div>
    <PageHeader
      titulo="Monitor de procesamiento"
      subtitulo="Estado en tiempo real de los servicios de TASKFLOW"
    />

    <p v-if="cargandoMonitor" class="texto-suave">Consultando el estado de los servicios...</p>

    <div class="monitor-grid">
      <PanelCard titulo="Estado de servicios">
        <ul class="lista-servicios">
          <li v-for="servicio in servicios" :key="servicio.llave" class="servicio">
            <span>{{ servicio.nombre }}</span>
            <span class="servicio-estado" :class="estadoServicio(servicio.llave) ? 'ok' : 'no'">
              {{ estadoServicio(servicio.llave) ? '✓ Disponible' : '✕ No disponible' }}
            </span>
          </li>
        </ul>
        <p v-if="monitor.redis.activo" class="texto-suave">
          Latencia Redis: {{ monitor.redis.latenciaMs }} ms
        </p>
      </PanelCard>

      <PanelCard titulo="Contadores de procesamiento">
        <div class="grid-estadisticas">
          <StatCard etiqueta="En cola" :valor="monitor.contadores.enCola" variante="enCola" />
          <StatCard
            etiqueta="Procesando"
            :valor="monitor.contadores.procesando"
            variante="procesando"
          />
          <StatCard
            etiqueta="Respondidas"
            :valor="monitor.contadores.respondida"
            variante="respondida"
          />
          <StatCard etiqueta="Errores" :valor="monitor.contadores.error" variante="error" />
        </div>
      </PanelCard>
    </div>

    <p class="nota-realtime">
      <span class="punto"></span> Los indicadores se actualizan en tiempo real mediante Socket.IO.
    </p>
  </div>
</template>

<style scoped>
.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

.lista-servicios {
  list-style: none;
  padding: 0;
  margin: 0;
}

.servicio {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-borde);
  font-weight: 500;
}

.servicio:last-child {
  border-bottom: none;
}

.servicio-estado.ok {
  color: var(--color-respondida);
  font-weight: 600;
}

.servicio-estado.no {
  color: var(--color-error);
  font-weight: 600;
}

.nota-realtime {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-texto-suave);
  font-size: 0.9rem;
}

.punto {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-en-cola);
}
</style>