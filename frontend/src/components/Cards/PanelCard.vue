<script setup>
defineProps({
  titulo: { type: String, default: '' },
});
</script>

<template>
  <section class="panel-card">
    <header v-if="titulo" class="panel-card-header">
      <h3>{{ titulo }}</h3>
    </header>
    <div class="panel-card-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel-card {
  background: var(--color-tarjeta);
  border-radius: var(--radio);
  box-shadow: var(--sombra);
  padding: 1.1rem 1.25rem;
  margin-bottom: 1rem;
}

.panel-card-header {
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--color-borde);
}

.panel-card-header h3 {
  margin: 0;
  font-size: 1.05rem;
}
</style>