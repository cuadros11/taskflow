<script setup>
defineProps({
  tipo: { type: String, default: 'primario' },
  desactivado: { type: Boolean, default: false },
});

defineEmits(['click']);
</script>

<template>
  <button
    class="base-boton"
    :class="`base-boton-${tipo}`"
    :disabled="desactivado"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-boton {
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.1rem;
  font-weight: 600;
  transition: background 0.15s ease, opacity 0.15s ease;
}

.base-boton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-boton-primario {
  background: var(--color-primario);
  color: #fff;
}

.base-boton-primario:hover:not(:disabled) {
  background: var(--color-primario-oscuro);
}

.base-boton-secundario {
  background: #fff;
  color: var(--color-texto);
  border: 1px solid var(--color-borde);
}

.base-boton-secundario:hover:not(:disabled) {
  background: #f8fafc;
}

.base-boton-peligro {
  background: var(--color-error);
  color: #fff;
}

.base-boton-peligro:hover:not(:disabled) {
  background: #dc2626;
}
</style>