const { CATEGORIAS } = require('../utils/constantes');

const MARCADOR_ERROR = '[SIMULAR ERROR]';

const PLANTILLAS = {
  'Información': {
    titulo: 'Información general',
    cuerpo: (s) =>
      `Hola, gracias por contactar a TASKFLOW.\n\n` +
      `Atendiendo su solicitud "${s.titulo}", le compartimos la información general solicitada:\n` +
      `- Nosotros le invitamos a consultar la sección de preguntas frecuentes.\n` +
      `- Nuestro horario de atención es de lunes a viernes de 8:00 a 17:00.\n` +
      `- Para más detalles, puede comunicarse al correo oficial de soporte.\n\n` +
      `Si requiere información adicional, no dude en responder esta solicitud.`,
  },
  'Soporte': {
    titulo: 'Soporte técnico',
    cuerpo: (s) =>
      `Hola, recibimos su solicitud de soporte: "${s.titulo}".\n\n` +
      `Nuestro equipo técnico revisó el problema descrito.\n` +
      `Recomendamos verificar la conexión, reiniciar el equipo e intentar nuevamente.\n` +
      `El caso ha sido escalado al nivel de soporte correspondiente.\n\n` +
      `Si el inconveniente persiste, por favor proporcione capturas de pantalla.`,
  },
  'Documento': {
    titulo: 'Entrega de documento',
    cuerpo: (s) =>
      `Hola, su solicitud "${s.titulo}" fue atendida.\n\n` +
      `El documento solicitado ha sido generado y está disponible para descarga.\n` +
      `Debe verificar que sus datos personales estén correctamente registrados.\n\n` +
      `En caso de inconsistencias, solicite una actualización antes de la entrega final.`,
  },
  'Consulta': {
    titulo: 'Estado del proceso',
    cuerpo: (s) =>
      `Hola, recibimos su consulta sobre "${s.titulo}".\n\n` +
      `Luego de revisar el estado de su proceso, le informamos que el trámite se encuentra activo y en seguimiento.\n` +
      `Los tiempos de respuesta estimados son de hasta 3 días hábiles.\n\n` +
      `Puede consultar el avance desde el panel de TASKFLOW.`,
  },
  'Actualización': {
    titulo: 'Actualización de información',
    cuerpo: (s) =>
      `Hola, su solicitud de actualización "${s.titulo}" fue procesada.\n\n` +
      `La información indicada ha sido actualizada correctamente en el sistema.\n` +
      `Los cambios quedarán reflejados en los próximos minutos.\n\n` +
      `Verifique que los nuevos datos sean correctos desde el detalle de la solicitud.`,
  },
};

const REGLA_GENERICA = {
  titulo: 'Respuesta genérica',
  cuerpo: (s) =>
    `Hola, gracias por su solicitud "${s.titulo}".\n\n` +
    `Lamentablemente no fue posible identificar una regla específica para la categoría "${s.categoria}".\n` +
    `Hemos enviado su solicitud al equipo humano para su revisión.\n\n` +
    `Recibirá una respuesta en un plazo máximo de 3 días hábiles.`,
};

const REGLAS = Object.freeze(
  CATEGORIAS.reduce((acum, categoria) => {
    acum[categoria] = PLANTILLAS[categoria] || null;
    return acum;
  }, {})
);

function generarRespuesta(solicitud) {
  if (
    String(solicitud.titulo || '').includes(MARCADOR_ERROR) ||
    String(solicitud.descripcion || '').includes(MARCADOR_ERROR)
  ) {
    throw new Error(
      'Error controlado: se simuló una falla durante el procesamiento (marque una solicitud con [SIMULAR ERROR]).'
    );
  }

  const regla = REGLAS[solicitud.categoria] || REGLA_GENERICA;
  return {
    respuesta: `[${regla.titulo}]\n\n${regla.cuerpo(solicitud)}`,
    reglaAplicada: regla.titulo,
  };
}

module.exports = { generarRespuesta, REGLAS, REGLA_GENERICA, MARCADOR_ERROR };