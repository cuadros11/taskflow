import { CATEGORIAS, PRIORIDADES } from './constantes';

export function validateRequest(campos) {
  const errores = {};

  if (!campos.titulo || !String(campos.titulo).trim()) {
    errores.titulo = 'El título es obligatorio';
  } else if (String(campos.titulo).length > 120) {
    errores.titulo = 'El título no puede superar 120 caracteres';
  }

  if (!campos.descripcion || !String(campos.descripcion).trim()) {
    errores.descripcion = 'La descripción es obligatoria';
  } else if (String(campos.descripcion).length < 5) {
    errores.descripcion = 'La descripción debe tener al menos 5 caracteres';
  } else if (String(campos.descripcion).length > 2000) {
    errores.descripcion = 'La descripción no puede superar 2000 caracteres';
  }

  if (!CATEGORIAS.includes(campos.categoria)) {
    errores.categoria = 'Debe seleccionar una categoría válida';
  }

  if (!PRIORIDADES.includes(campos.prioridad)) {
    errores.prioridad = 'Debe seleccionar una prioridad válida';
  }

  return { valido: Object.keys(errores).length === 0, errores };
}

export default validateRequest;