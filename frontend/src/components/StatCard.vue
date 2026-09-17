<script setup>
defineProps({
  etiqueta: { type: String, required: true },
  valor: { type: [Number, String], default: 0 },
  variante: { type: String, default: '' },
});
</script>

<template>
  <div class="stat-card" :class="`stat-${variante}`">
    <p class="stat-etiqueta">{{ etiqueta }}</p>
    <p class="stat-valor">{{ valor }}</p>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--color-tarjeta);
  border-radius: var(--radio);
  box-shadow: var(--sombra);
  padding: 1rem 1.2rem;
  border-left: 4px solid var(--color-borde);
}

.stat-etiqueta {
  margin: 0 0 0.35rem;
  font-size: 0.82rem;
  color: var(--color-texto-suave);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-valor {
  margin: 0;
  font-size: 1.9rem;
  font-weight: 700;
}

.stat-total {
  border-left-color: var(--color-primario);
}

.stat-pendiente {
  border-left-color: var(--color-pendiente);
}

.stat-enCola {
  border-left-color: var(--color-en-cola);
}

.stat-procesando {
  border-left-color: var(--color-procesando);
}

.stat-respondida {
  border-left-color: var(--color-respondida);
}

.stat-error {
  border-left-color: var(--color-error);
}
</style>