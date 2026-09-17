<script setup>
import { reactive, ref } from 'vue';
import { CATEGORIAS, PRIORIDADES } from '../../utils/constantes';
import { validateRequest } from '../../utils/validateRequest';
import BaseButton from '../Buttons/BaseButton.vue';

const props = defineProps({
  enviando: { type: Boolean, default: false },
  inicial: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['enviar', 'cancelar']);

const form = reactive({
  categoria: props.inicial.categoria || '',
  titulo: props.inicial.titulo || '',
  descripcion: props.inicial.descripcion || '',
  prioridad: props.inicial.prioridad || 'Media',
});

const errores = ref({});
const errorGeneral = ref('');

function validar() {
  const resultado = validateRequest(form);
  errores.value = resultado.errores;
  errorGeneral.value = resultado.valido ? '' : 'Por favor corrija los errores marcados.';
  return resultado.valido;
}

function enviar() {
  if (!validar()) return;
  emit('enviar', { ...form });
}

function cancelar() {
  emit('cancelar');
}
</script>

<template>
  <form class="request-form" novalidate @submit.prevent="enviar">
    <p v-if="errorGeneral" class="mensaje-error">{{ errorGeneral }}</p>

    <div class="campo">
      <label for="titulo">Título *</label>
      <input
        id="titulo"
        v-model.trim="form.titulo"
        type="text"
        :maxlength="120"
        placeholder="Resumen breve de la solicitud"
      />
      <p v-if="errores.titulo" class="campo-error">{{ errores.titulo }}</p>
    </div>

    <div class="campo">
      <label for="categoria">Categoría *</label>
      <select id="categoria" v-model="form.categoria">
        <option value="" disabled>Seleccione una categoría</option>
        <option v-for="cat in CATEGORIAS" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <p v-if="errores.categoria" class="campo-error">{{ errores.categoria }}</p>
    </div>

    <div class="campo">
      <label for="prioridad">Prioridad *</label>
      <select id="prioridad" v-model="form.prioridad">
        <option v-for="prioridad in PRIORIDADES" :key="prioridad" :value="prioridad">
          {{ prioridad }}
        </option>
      </select>
      <p v-if="errores.prioridad" class="campo-error">{{ errores.prioridad }}</p>
    </div>

    <div class="campo">
      <label for="descripcion">Descripción *</label>
      <textarea
        id="descripcion"
        v-model.trim="form.descripcion"
        rows="5"
        :maxlength="2000"
        placeholder="Detalle completo de la solicitud"
      ></textarea>
      <p v-if="errores.descripcion" class="campo-error">{{ errores.descripcion }}</p>
    </div>

    <div class="acciones">
      <BaseButton tipo="secundario" :desactivado="enviando" @click="cancelar">
        Cancelar
      </BaseButton>
      <BaseButton tipo="primario" :desactivado="enviando" @click="enviar">
        {{ enviando ? 'Enviando...' : 'Enviar solicitud' }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.request-form {
  max-width: 640px;
}

.campo {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.campo label {
  font-weight: 600;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
}

.campo input,
.campo select,
.campo textarea {
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--color-borde);
  border-radius: 8px;
  background: #fff;
}

.campo input:focus,
.campo select:focus,
.campo textarea:focus {
  outline: 2px solid #bfdbfe;
  border-color: var(--color-primario);
}

.campo-error {
  color: var(--color-error);
  font-size: 0.82rem;
  margin: 0.3rem 0 0;
}

.acciones {
  display: flex;
  gap: 0.7rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>