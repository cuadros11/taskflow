<script setup>
import { computed, onMounted, ref } from 'vue';
import PageHeader from '../components/Headers/PageHeader.vue';
import RequestsTable from '../components/Tables/RequestsTable.vue';
import { useRequests } from '../composables/useRequests';

const { solicitudes, cargandoSolicitudes, cargarSolicitudes } = useRequests();

const filtroTexto = ref('');
const filtroEstado = ref('');
const filtroCategoria = ref('');

const estados = ['PENDIENTE', 'EN COLA', 'PROCESANDO', 'RESPONDIDA', 'ERROR'];
const categorias = ['Información', 'Soporte', 'Documento', 'Consulta', 'Actualización'];

const filtradas = computed(() => {
  const texto = filtroTexto.value.trim().toLowerCase();
  return solicitudes.value.filter((s) => {
    const coincideTexto =
      !texto ||
      s.titulo.toLowerCase().includes(texto) ||
      s.descripcion.toLowerCase().includes(texto) ||
      String(s._id).toLowerCase().includes(texto);
    const coincideEstado = !filtroEstado.value || s.estado === filtroEstado.value;
    const coincideCategoria = !filtroCategoria.value || s.categoria === filtroCategoria.value;
    return coincideTexto && coincideEstado && coincideCategoria;
  });
});

onMounted(() => cargarSolicitudes().catch(() => {}));
</script>

<template>
  <div>
    <PageHeader titulo="Solicitudes" subtitulo="Listado de solicitudes registradas">
    </PageHeader>

    <div class="filtros">
      <input
        v-model="filtroTexto"
        type="search"
        placeholder="Buscar por título, descripción o ID"
        class="filtro-busqueda"
      />
      <select v-model="filtroEstado" class="filtro-select">
        <option value="">Todos los estados</option>
        <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
      </select>
      <select v-model="filtroCategoria" class="filtro-select">
        <option value="">Todas las categorías</option>
        <option v-for="categoria in categorias" :key="categoria" :value="categoria">
          {{ categoria }}
        </option>
      </select>
    </div>

    <RequestsTable :solicitudes="filtradas" :cargando="cargandoSolicitudes" />
  </div>
</template>

<style scoped>
.filtros {
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filtro-busqueda {
  flex: 1;
  min-width: 200px;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-borde);
  border-radius: 8px;
}

.filtro-select {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-borde);
  border-radius: 8px;
  background: #fff;
}
</style>