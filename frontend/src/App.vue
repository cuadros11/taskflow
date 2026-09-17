<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import { useRequestStore } from './store/requestStore';
import { activarSocket } from './composables/useSocket';
import { useRequests } from './composables/useRequests';

const store = useRequestStore();
const { cargarSolicitudes } = useRequests();

onMounted(() => {
  cargarSolicitudes().catch(() => {});
  store.cargarMonitor().catch(() => {});
  activarSocket();
});
</script>

<template>
  <MainLayout>
    <RouterView />
  </MainLayout>
</template>