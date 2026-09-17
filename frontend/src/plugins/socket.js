import { io } from 'socket.io-client';

const url = import.meta.env.VITE_API_URL || undefined;

const socket = io(url, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => console.log('[socket.io] conectado al backend'));
socket.on('disconnect', (razon) => console.log('[socket.io] desconectado:', razon));
socket.on('connect_error', (err) => console.error('[socket.io] error de conexión:', err.message));

export default socket;