import { onMounted, onBeforeUnmount, ref } from 'vue';
import socket from '../plugins/socket';
import { useRequestStore } from '../store/requestStore';

let inicializado = false;

export function activarSocket() {
  const store = useRequestStore();
  if (socket.on && !inicializado) {
    store.iniciarListenersSocket();
    inicializado = true;
  }
}

export function useSocket() {
  const conectado = ref(socket.connected);

  const conectar = () => socket.connect();
  const desconectar = () => socket.disconnect();

  const alConectar = (callback) => socket.on('connect', callback);
  const alDesconectar = (callback) => socket.on('disconnect', callback);

  onMounted(() => {
    conectado.value = socket.connected;
    const onConnect = () => (conectado.value = true);
    const onDisconnect = () => (conectado.value = false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    onBeforeUnmount(() => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    });
  });

  return { socket, conectado, conectar, desconectar, alConectar, alDesconectar };
}

export default useSocket;