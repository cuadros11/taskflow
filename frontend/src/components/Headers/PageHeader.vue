<script setup>
defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
});
</script>

<template>
  <div class="page-header">
    <div>
      <h1>{{ titulo }}</h1>
      <p v-if="subtitulo" class="texto-suave">{{ subtitulo }}</p>
    </div>
    <div class="page-header-acciones">
      <slot name="acciones" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: 1.5rem;
}

.page-header-acciones {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }
}
</style>