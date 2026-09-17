import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const mensaje =
      error.response?.data?.mensaje || 'No fue posible comunicarse con el backend';
    return Promise.reject(new Error(mensaje));
  }
);

export { http, baseURL };