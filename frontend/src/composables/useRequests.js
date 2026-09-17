import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import requestService from '../services/requestService';
import { useRequestStore } from '../store/requestStore';

export function useRequests() {
  const store = useRequestStore();
  const { solicitudes, cargandoSolicitudes } = storeToRefs(store);
  const error = ref(null);
  const solicitando = ref(false);

  const cargarSolicitudes = async () => {
    error.value = null;
    await store.cargarSolicitudes();
    if (store.error) {
      error.value = store.error;
      throw new Error(error.value);
    }
  };

  const crearSolicitud = async (datos) => {
    solicitando.value = true;
    error.value = null;
    try {
      const creada = await store.registrarSolicitud(datos);
      return creada;
    } catch (err) {
      error.value = err.message || 'No fue posible registrar la solicitud';
      throw err;
    } finally {
      solicitando.value = false;
    }
  };

  const eliminarSolicitud = async (id) => {
    solicitando.value = true;
    error.value = null;
    try {
      await requestService.eliminarSolicitud(id);
      store.solicitudes = store.solicitudes.filter((s) => String(s._id) !== String(id));
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      solicitando.value = false;
    }
  };

  const obtenerSolicitud = async (id) => store.obtenerSolicitud(id);

  return {
    solicitudes,
    cargandoSolicitudes,
    solicitando,
    error,
    cargarSolicitudes,
    crearSolicitud,
    eliminarSolicitud,
    obtenerSolicitud,
  };
}

export default useRequests;