import { http } from '../plugins/axios';

export const requestService = {
  async listarSolicitudes() {
    const { data } = await http.get('/api/solicitudes');
    return data;
  },

  async obtenerSolicitud(id) {
    const { data } = await http.get(`/api/solicitudes/${id}`);
    return data;
  },

  async crearSolicitud(datos) {
    const { data } = await http.post('/api/solicitudes', datos);
    return data;
  },

  async actualizarSolicitud(id, cambios) {
    const { data } = await http.put(`/api/solicitudes/${id}`, cambios);
    return data;
  },

  async eliminarSolicitud(id) {
    const { data } = await http.delete(`/api/solicitudes/${id}`);
    return data;
  },
};

export default requestService;