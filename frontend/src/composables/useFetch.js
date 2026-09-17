import { onMounted, ref } from 'vue';

export function useFetch(callback, opciones = {}) {
  const { inmediato = true } = opciones;
  const datos = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const ejecutar = async (...args) => {
    cargando.value = true;
    error.value = null;
    try {
      datos.value = await callback(...args);
      return datos.value;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  };

  if (inmediato) onMounted(() => ejecutar());

  return { datos, cargando, error, ejecutar };
}

export default useFetch;