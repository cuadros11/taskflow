<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import PageHeader from '../components/Headers/PageHeader.vue';
import StatCard from '../components/StatCard.vue';
import PanelCard from '../components/Cards/PanelCard.vue';
import RequestCard from '../components/Requests/RequestCard.vue';
import BaseButton from '../components/Buttons/BaseButton.vue';
import { useRequestStore } from '../store/requestStore';
import { useRequests } from '../composables/useRequests';

const router = useRouter();
const store = useRequestStore();
const { solicitando } = useRequests();

const { solicitudes, monitor } = storeToRefs(store);
const contadores = computed(() => monitor.value.contadores);

onMounted(() => {
  store.cargarSolicitudes().catch(() => {});
  store.cargarMonitor().catch(() => {});
});

const recientes = computed(() => solicitudes.value.slice(0, 5));

function irNuevaSolicitud() {
  router.push({ name: 'nueva-solicitud' });
}
</script>

<template>
  <div>
    <PageHeader titulo="Dashboard" subtitulo="Visión general del estado del sistema">
      <template #acciones>
        <BaseButton tipo="primario" @click="irNuevaSolicitud">+ Nueva solicitud</BaseButton>
      </template>
    </PageHeader>

    <div class="grid-estadisticas">
      <StatCard etiqueta="Total" :valor="contadores.total" variante="total" />
      <StatCard etiqueta="Pendientes" :valor="contadores.pendiente" variante="pendiente" />
      <StatCard etiqueta="En cola" :valor="contadores.enCola" variante="enCola" />
      <StatCard etiqueta="Procesando" :valor="contadores.procesando" variante="procesando" />
      <StatCard etiqueta="Respondidas" :valor="contadores.respondida" variante="respondida" />
      <StatCard etiqueta="Con error" :valor="contadores.error" variante="error" />
    </div>

    <PanelCard titulo="Solicitudes recientes">
      <p v-if="solicitando" class="texto-suave">Cargando solicitudes...</p>
      <div v-else-if="recientes.length === 0" class="sin-resultados">
        <p class="texto-suave">Aún no se registran solicitudes.</p>
        <BaseButton tipo="primario" @click="irNuevaSolicitud">Crear la primera solicitud</BaseButton>
      </div>
      <div v-else class="grid-recientes">
        <RequestCard v-for="solicitud in recientes" :key="solicitud._id" :solicitud="solicitud" />
      </div>
    </PanelCard>
  </div>
</template>

<style scoped>
.grid-recientes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.sin-resultados {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
}
</style>