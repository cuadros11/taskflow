<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '../components/Headers/PageHeader.vue';
import PanelCard from '../components/Cards/PanelCard.vue';
import RequestForm from '../components/Requests/RequestForm.vue';
import { useRequests } from '../composables/useRequests';

const router = useRouter();
const { crearSolicitud, solicitando } = useRequests();

const exito = ref(false);
const errorMensaje = ref('');

async function enviar(datos) {
  errorMensaje.value = '';
  exito.value = false;
  try {
    await crearSolicitud(datos);
    exito.value = true;
    setTimeout(() => router.push({ name: 'solicitudes' }), 1200);
  } catch (err) {
    errorMensaje.value = err.message || 'No fue posible registrar la solicitud';
  }
}

function cancelar() {
  router.push({ name: 'solicitudes' });
}
</script>

<template>
  <div>
    <PageHeader
      titulo="Nueva solicitud"
      subtitulo="Registre una solicitud para que el sistema la procese"
    />

    <p v-if="exito" class="mensaje-exito">Solicitud registrada y enviada a la cola.</p>
    <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>

    <PanelCard titulo="Formulario de solicitud">
      <RequestForm :enviando="solicitando" @enviar="enviar" @cancelar="cancelar" />
    </PanelCard>
  </div>
</template>