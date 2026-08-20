export const AYUDA_ANALITICA: Record<string, string> = {
  vistas:
    'Páginas vistas por visitantes en la ventana. Una persona que navega 5 páginas suma 5 vistas. La ventana son días completos que terminan ayer.',
  usuarios:
    'Personas distintas que visitaron el sitio, deduplicadas por navegador. Una persona puede tener varias sesiones y decenas de vistas.',
  sesiones:
    'Visitas: períodos de actividad continua. Una sesión termina tras 30 minutos de inactividad, al cambiar el día o al llegar de una fuente nueva.',
  rebote:
    'Porcentaje de sesiones que entraron, vieron una sola página y se fueron sin interactuar (abandonos rápidos).',
  duracion:
    'Tiempo promedio que dura una sesión, desde el primer hasta el último evento.',
  trafico:
    'Serie diaria de vistas y usuarios en la ventana seleccionada.',
  realtime:
    'Vistas en los últimos 30 minutos, en vivo. Se actualiza cada 60 segundos.',
  fuentes:
    'De dónde llegan los visitantes: Directo (escribieron la URL), Orgánico (Google), Referido (otros sitios, ej. Wompi) y Redes sociales (incluye el blog). Toggle: Vistas (páginas vistas) o Sesiones (visitas).',
  dispositivos:
    'Desde qué tipo de dispositivo navegan: móvil, escritorio o tablet.',
  paises:
    'Desde qué país navegan, según la ubicación de su IP. Toggle: Vistas (cuánto consumen) o Usuarios (cuánta gente es).',
  horas:
    "Actividad por hora del día, en hora de Colombia. 'Total' suma toda la ventana; 'Promedio por día' divide entre los días.",
  topPaginas:
    'Las rutas más vistas de la ventana. Incluye la home (/). Se excluyen las rutas internas /admin.',
  embudo:
    'Recorrido de compra: vieron producto → agregaron al carrito → iniciaron checkout → compra real (pedidos pagados en la base de datos).',
}