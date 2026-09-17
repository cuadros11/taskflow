import { defineStore } from 'pinia';
import requestService from '../services/requestService';
import monitorService from '../services/monitorService';
import { useSocket } from '../composables/useSocket';

export const useRequestStore = defineStore('requests', {
  state: () => ({
    solicitudes: [],
    solicitudSeleccionada: null,
    monitor: {
      servicios: { express: false, mongodb: false, redis: false, worker: false },
      redis: { activo: false, latenciaMs: null },
      contadores: {
        total: 0,
        pendiente: 0,
        enCola: 0,
        procesando: 0,
        respondida: 0,
        error: 0,
      },
    },
    cargandoSolicitudes: false,
    cargandoMonitor: false,
    error: null,
  }),

  getters: {
    contadores: (state) => state.monitor.contadores,
  },

  actions: {
    async cargarSolicitudes() {
      this.cargandoSolicitudes = true;
      this.error = null;
      try {
        const respuesta = await requestService.listarSolicitudes();
        const datos = respuesta.datos || respuesta;
        this.solicitudes = datos;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.cargandoSolicitudes = false;
      }
    },

    async obtenerSolicitud(id) {
      this.error = null;
      try {
        this.solicitudSeleccionada = await requestService.obtenerSolicitud(id);
        return this.solicitudSeleccionada;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async registrarSolicitud(datos) {
      this.error = null;
      const solicitud = await requestService.crearSolicitud(datos);
      await this.cargarSolicitudes();
      await this.cargarMonitor();
      return solicitud;
    },

    async cargarMonitor() {
      this.cargandoMonitor = true;
      try {
        this.monitor = await monitorService.obtenerEstado();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.cargandoMonitor = false;
      }
    },

    aplicarEvento(evento) {
      const tipo = evento.tipo || evento.data?.tipo;

      if (evento.contadores) {
        this.monitor.contadores = { ...this.monitor.contadores, ...evento.contadores };
      }

      const id = evento.data?.id || evento.id;
      if (id) {
        const indice = this.solicitudes.findIndex((s) => String(s._id) === String(id));
        const estado = evento.data?.estado;
        const respuesta = evento.data?.respuesta;

        const datosRelacionados = {};
        if (estado) datosRelacionados.estado = estado;
        if (respuesta) datosRelacionados.respuesta = respuesta;

        if (Object.keys(datosRelacionados).length) {
          if (indice >= 0) {
            this.solicitudes[indice] = {
              ...this.solicitudes[indice],
              ...datosRelacionados,
            };
          }
          if (this.solicitudSeleccionada && String(this.solicitudSeleccionada._id) === String(id)) {
            this.solicitudSeleccionada = {
              ...this.solicitudSeleccionada,
              ...datosRelacionados,
            };
          }
        }
      }
    },

    iniciarListenersSocket() {
      const socket = useSocket();

      const eventos = [
        'solicitud-creada',
        'solicitud-encolada',
        'solicitud-procesando',
        'solicitud-respondida',
        'solicitud-error',
        'cola-actualizada',
        'monitor-actualizado',
      ];

      eventos.forEach((evento) => socket.on(evento, (datos) => this.aplicarEvento(datos)));
    },
  },
});