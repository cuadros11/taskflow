import { http } from '../plugins/axios';

export const monitorService = {
  async obtenerEstado() {
    const { data } = await http.get('/api/monitor');
    return data;
  },
};

export default monitorService;