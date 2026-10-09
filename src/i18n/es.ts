// Español. Misma estructura que en.ts (TypeScript avisa si falta una clave).
import type { Dict } from './en.ts';

const es: Dict = {
  meta: {
    lang: 'es',
    ogLocale: 'es_ES',
    title: 'Elyndra — Lanzador de juegos con alma de consola para Android',
    description:
      'Elyndra reúne tus juegos de Android y tus ROMs de emuladores en una biblioteca con alma de consola, pensada para mandos, con Masha, una asistente holográfica en 3D. Descarga gratis para Android 8.0+.',
    privacyTitle: 'Privacidad — Elyndra',
    privacyDescription:
      'Qué envían la app Elyndra y esta web, a qué servicio y cuándo. Sin anuncios, sin analítica, sin rastreadores.',
    notFoundTitle: 'Página no encontrada — Elyndra',
  },
  a11y: {
    skip: 'Saltar al contenido',
    nav: 'Secciones',
    langSwitch: 'Idioma',
    soundOn: 'Sonidos de la interfaz: activados',
    soundOff: 'Sonidos de la interfaz: desactivados',
    palette: 'Paleta de firma',
    close: 'Cerrar',
    prev: 'Anterior',
    next: 'Siguiente',
    openImage: 'Abrir captura',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  nav: {
    features: 'Funciones',
    masha: 'Masha',
    systems: 'Sistemas',
    gallery: 'Galería',
    install: 'Instalar',
    faq: 'Preguntas',
    download: 'Descargar',
  },
  hero: {
    eyebrow: 'Lanzador de juegos para Android',
    title: 'Tus juegos. <span class="grad">Una consola.</span>',
    lead:
      'Elyndra reúne tus juegos de Android instalados y tus ROMs de emuladores en una sola biblioteca que se siente como una consola, pensada para mandos y para el tacto.',
    cta: 'Descargar para Android',
    ctaDesktop: 'Llévalo a tu móvil',
    secondary: 'Código en GitHub',
    reqs: 'Android 8.0 o posterior · Gratis para uso personal',
    noJs: 'Abre la página de Releases de GitHub.',
    shotAlt:
      'Biblioteca de Elyndra con el diseño Meridian: una rueda vertical de juegos a la izquierda y el arte del juego elegido a la derecha',
  },
  pad: {
    connected: 'Mando conectado',
    a: 'Seleccionar',
    b: 'Atrás',
    lbrb: 'Sección',
    dpad: 'Mover',
  },
  features: {
    eyebrow: 'Funciones',
    title: 'Un lanzador que se juega como una consola',
    lead: 'Desplázate, usa las flechas o un mando para girar la rueda.',
    counterLabel: 'Función {n} de {total}',
    items: [
      {
        id: 'library',
        title: 'Una biblioteca para todo',
        body:
          'Los juegos de Android instalados y las carpetas de ROMs conviven en la misma lista, con filtros (Todo, Android, Emuladores), orden y búsqueda.',
        shot: 'meridian-library',
      },
      {
        id: 'layouts',
        title: 'Meridian y Clásico',
        body:
          '<em>Meridian</em> es una rueda vertical con un hero grande, en horizontal. <em>Clásico</em> es un carrusel horizontal, que se usa siempre en vertical y en ventanas estrechas.',
        shot: 'settings-appearance',
      },
      {
        id: 'gamepad',
        title: 'Hecho para mandos',
        body:
          'Toda la app funciona con cruceta y sticks: mandos de Xbox, PlayStation, Switch Pro, genéricos y los integrados de las consolas portátiles, y mandos de TV. El tacto también funciona en todas partes.',
        shot: 'meridian-add',
      },
      {
        id: 'emulators',
        title: 'Unos 130 perfiles de emulador',
        body:
          'Cada ROM va al emulador que elegiste para su carpeta, con el intent exacto de ese emulador, basado en la configuración Android de ES-DE. Si falta, Elyndra te ofrece instalarlo o elegir otro.',
        shot: 'add-rom-folder',
      },
      {
        id: 'folders',
        title: 'Carpetas de ROMs sin permiso de almacenamiento',
        body:
          'Las carpetas se añaden con el selector de archivos de Android (Storage Access Framework). El sistema se detecta por el nombre de la carpeta, y los discos de varias pistas y las carpetas de PS3 se agrupan bien.',
        shot: 'add-rom-folder',
      },
      {
        id: 'metadata',
        title: 'Metadatos automáticos',
        body:
          'Carátulas, logos, capturas, descripciones, fechas, géneros y logros de ScreenScraper, IGDB, SteamGridDB y RetroAchievements con tus propias cuentas, y fuentes sin clave: las fichas de Google Play y de la tienda de Steam y las miniaturas de libretro. Tú eliges la prioridad.',
        shot: 'game-details',
      },
      {
        id: 'translate',
        title: 'Traducción en el dispositivo',
        body:
          'Las descripciones de los juegos se traducen en el propio dispositivo con ML Kit. Cada idioma se descarga una vez, solo cuando lo necesitas.',
        shot: 'game-details',
      },
      {
        id: 'playtime',
        title: 'Tiempo de juego real',
        body:
          'Con el acceso de uso (opcional), Elyndra cuenta el tiempo que el juego estuvo de verdad en primer plano. Sin él, desde que lo abres hasta que vuelves.',
        shot: 'masha',
      },
      {
        id: 'look',
        title: 'Liquid glass, tus colores',
        body:
          'Paletas de firma, colores de acento, halo y partículas en la selección, una intro animada, fondo de vídeo o imagen opcional, sonidos de la interfaz y música.',
        shot: 'settings-palettes',
      },
      {
        id: 'widget',
        title: 'Widget de inicio',
        body: 'Un widget para la pantalla de inicio con lo que Masha te propone ahora, y algún recordatorio suyo de vez en cuando.',
        shot: 'portrait-library',
      },
      {
        id: 'languages',
        title: 'Seis idiomas',
        body: 'Inglés, español, portugués, francés, alemán y japonés, y se cambia sin reiniciar.',
        shot: 'settings-display',
      },
      {
        id: 'updates',
        title: 'Actualizaciones desde la app',
        body:
          'Elyndra consulta GitHub Releases, descarga el APK adecuado para tu dispositivo, comprueba su SHA-256 y abre el diálogo de instalación de Android.',
        shot: 'settings-updates-about',
      },
    ],
  },
  palettes: {
    title: 'Hazlo tuyo',
    lead:
      'Las cinco paletas de firma de la app tiñen el foco, el halo de la selección, las partículas y la intro. Pruébalas aquí: esta página las sigue.',
    names: { plasma: 'Plasma', ember: 'Ember', aurora: 'Aurora', neon_rose: 'Neon Rose', solar: 'Solar' },
  },
  masha: {
    eyebrow: 'Conoce a Masha',
    title: 'Una asistente que conoce tu biblioteca',
    lead:
      'Masha es un avatar holográfico en 3D con sincronía de labios y expresiones, chat y entrada por voz. Vive dentro de Elyndra.',
    points: [
      { t: 'Elige el mejor emulador', d: 'Para cada juego, el emulador que mejor lo mueve en <em>este</em> dispositivo.' },
      { t: 'Recuerda cómo juegas', d: 'A qué juegas, cuánto tiempo y cómo te gusta.' },
      { t: 'Revisa tu biblioteca', d: 'Duplicados, discos que faltan y nombres raros.' },
      { t: 'Planea sesiones cortas', d: 'Dile «tengo 30–40 minutos» y elige lo que cabe.' },
      {
        t: 'Una voz natural en el dispositivo',
        d: 'En dispositivos de 64 bits, tras una descarga única de unos 145 MB. En los demás, la voz de texto a voz del sistema. La voz es sintética (generada por IA).',
      },
      {
        t: 'Funciona sin conexión',
        d: 'Sin red o con la IA apagada, los planes, listas, lanzamientos y estadísticas siguen funcionando con tus datos locales. Solo la charla libre necesita la IA en línea.',
      },
    ],
    aiNote:
      'La charla libre usa DeepSeek. Solo se envían títulos, sistemas, tiempo de juego, estado del dispositivo, los recuerdos de Masha y la conversación; nunca rutas de archivos, carpetas, nombres de cuenta ni credenciales. <a href="{privacy}">Detalles de privacidad</a>.',
    load3d: 'Ver a Masha en 3D',
    loading3d: 'Cargando holograma…',
    failed3d: 'La vista 3D no pudo arrancar en este dispositivo. Aquí la tienes en la app.',
    posterAlt:
      'Masha en la app: una mujer holográfica en 3D dentro de un anillo de luz, con tarjetas de tiempo de juego y sugerencias de chat',
    canvasLabel: 'Masha, la asistente holográfica, en 3D. Arrastra para girarla.',
    modelNote: 'Modelo web hecho con recursos CC0 de MakeHuman. Aquí la animación es procedural.',
  },
  systems: {
    eyebrow: 'Sistemas y emuladores',
    title: 'Señala tus carpetas. Del resto se encarga ella.',
    lead:
      'Elyndra reconoce {count} sistemas y unos 130 perfiles de emulador, entre ellos los núcleos de RetroArch y los juegos de PC con Windows mediante entornos tipo Winlator. <strong>Solo indexa y lanza</strong>: nunca emula nada.',
    groups: {
      nintendo: 'Nintendo',
      sony: 'Sony',
      microsoft: 'Microsoft',
      sega: 'Sega',
      snk: 'SNK',
      nec: 'NEC',
      atari: 'Atari',
      bandai: 'Bandai',
      other: 'Arcade, ordenadores y más',
    },
    disclaimer:
      'Elyndra no incluye juegos, ROMs, archivos BIOS ni emuladores. Usa juegos que hayas obtenido legalmente e instala los emuladores desde sus desarrolladores. Elyndra no está afiliada, respaldada ni patrocinada por ningún fabricante de consolas, desarrollador de emuladores ni editor de juegos. Los nombres de sistemas solo se usan para describir la compatibilidad.',
  },
  gallery: {
    eyebrow: 'Galería',
    title: 'Mírala en marcha',
    note:
      'Capturas hechas en una tableta Lenovo Legion Y700. Los nombres, logos y carátulas de los juegos pertenecen a sus dueños.',
    items: [
      { shot: 'meridian-library', cap: 'Diseño Meridian', alt: 'Biblioteca con el diseño Meridian: la rueda vertical, el dial y el arte del juego elegido' },
      { shot: 'portrait-library', cap: 'En vertical', alt: 'Biblioteca en vertical: el hero sobre el carrusel de carátulas', portrait: true },
      { shot: 'intro', cap: 'Intro animada', alt: 'La intro ELYNDRA: el rótulo metálico aparece en un estallido de luz dorada' },
      { shot: 'masha', cap: 'Masha', alt: 'Masha, la asistente holográfica en 3D, con estadísticas de juego y sugerencias de chat' },
      { shot: 'meridian-add', cap: 'Añadir a la biblioteca', alt: 'Meridian con la fila Añadir seleccionada: un escenario vacío con órbitas de luz y el botón para añadir juegos o ROMs' },
      { shot: 'game-details', cap: 'Ficha del juego', alt: 'Ficha del juego con descripción, desarrollador, valoración y fuentes de metadatos' },
      { shot: 'add-rom-folder', cap: 'Añadir una carpeta de ROMs', alt: 'Añadir a la biblioteca: tres pasos para añadir una carpeta de ROMs (carpeta, sistema, emulador)' },
      { shot: 'settings-palettes', cap: 'Paletas de firma', alt: 'Ajustes de apariencia: paletas de firma y colores de acento' },
      { shot: 'settings-display', cap: 'Pantalla y tema', alt: 'Ajustes de pantalla y tema en modo oscuro: color de la intro, fotogramas y fluidez de Masha' },
      { shot: 'settings-updates-about', cap: 'Actualizaciones y Acerca de', alt: 'Ajustes, Acerca de: actualizaciones con versión, botón de comprobar e interruptores' },
    ],
  },
  download: {
    eyebrow: 'Descarga',
    title: 'Consigue Elyndra',
    lead: 'Las versiones oficiales se publican en GitHub Releases. Esta web nunca aloja el APK: cada botón lo descarga directamente de GitHub.',
    beta: 'Beta',
    stable: 'Estable',
    version: 'Versión',
    published: 'Publicada',
    size: 'Tamaño',
    file: 'Archivo',
    sha: 'SHA-256',
    shaMissing: 'GitHub no publicó una suma de comprobación para este archivo.',
    button: 'Descargar APK',
    buttonFor: 'Descargar {abi}',
    universal: 'universal, funciona en todos los dispositivos',
    arm64: 'arm64-v8a, casi todos los dispositivos actuales',
    otherFiles: 'Otros archivos de esta versión',
    notes: 'Notas de la versión',
    allReleases: 'Todas las versiones en GitHub',
    loading: 'Buscando la última versión…',
    fromSnapshot: 'Se muestra la lista de versiones guardada al construir esta web; ahora mismo no se pudo contactar con GitHub.',
    failed: 'No se pudo cargar la lista de versiones. Puedes descargar Elyndra desde la página de Releases de GitHub.',
    noRelease: 'Todavía no hay ninguna versión publicada. Mira la página de Releases de GitHub.',
    desktopTitle: 'En tu móvil o tableta',
    desktopBody: 'Escanea el código para abrir esta página en tu Android y descargar desde allí.',
    desktopDirect: 'O descarga el APK aquí',
    qrAlt: 'Código QR que abre esta página',
    detected: 'Elegido para tu dispositivo',
    pickedUniversal: 'No pudimos saber el procesador de tu dispositivo, así que es la versión universal.',
  },
  install: {
    eyebrow: 'Cómo instalar',
    title: 'Tres pasos, sin tienda',
    steps: [
      {
        t: 'Descarga el APK',
        d: 'Usa el botón de arriba. <code>…-arm64-v8a.apk</code> sirve para casi todos los móviles, tabletas y consolas portátiles actuales; <code>…-universal.apk</code> funciona en todos si no estás seguro (pesa más).',
      },
      {
        t: 'Permite esta fuente',
        d: 'Abre el APK. Android te pide permitir instalar apps desde la app con la que lo abriste (el navegador o el gestor de archivos): activa <strong>Permitir desde esta fuente</strong> y vuelve atrás.',
      },
      {
        t: 'Instala',
        d: 'Si Google Play Protect te pide analizar la app, puedes dejar que la analice o abrir <strong>Más detalles</strong> para instalarla sin analizar.',
      },
    ],
    verifyTitle: 'Comprueba la descarga',
    verifyBody:
      'Compara el SHA-256 del archivo con el que aparece arriba (GitHub lo publica para cada archivo). En un ordenador:',
    verifyAuto: 'El actualizador de la app hace esta comprobación por ti en cada actualización.',
  },
  updates: {
    eyebrow: 'Actualizaciones',
    title: 'Las actualizaciones llegan solas',
    body:
      'Elyndra consulta GitHub Releases por su cuenta al abrirse, como mucho una vez al día, y te ofrece las versiones nuevas con sus notas. Elige <strong>Actualizar</strong> y descarga el APK adecuado para tu dispositivo, comprueba su SHA-256 y abre el diálogo de instalación de Android.',
    points: [
      'Busca a mano o apaga la búsqueda automática en <strong>Ajustes → Acerca de → Actualizaciones</strong>.',
      'Las versiones beta son opcionales.',
      'La búsqueda solo descarga la lista pública de versiones de GitHub. No se envía ningún dato personal.',
      'Las versiones nuevas también aparecen solas en esta página, sin esperar a que se reconstruya la web.',
    ],
  },
  faq: {
    eyebrow: 'Preguntas',
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Elyndra es gratis?',
        a: 'Sí. Puedes descargar, instalar y usar gratis las versiones oficiales para uso personal y no comercial. Consulta la <a href="https://github.com/jefer02/Elyndra/blob/main/LICENSE">licencia</a>.',
      },
      {
        q: '¿Trae juegos, ROMs, BIOS o emuladores?',
        a: 'No. Elyndra indexa y lanza lo que ya tienes. Las ROMs van al emulador que elijas para cada carpeta; instala los emuladores desde sus desarrolladores.',
      },
      {
        q: '¿En qué dispositivos funciona?',
        a: 'Android 8.0 (API 26) o posterior, probado sobre todo en Android 15. Móviles, tabletas, consolas portátiles y TV boxes Android con mando. La voz natural de Masha necesita un dispositivo de 64 bits.',
      },
      {
        q: '¿Necesito un mando?',
        a: 'No. El mando es opcional: el tacto funciona en todas partes.',
      },
      {
        q: '¿Necesita internet?',
        a: 'Solo para los metadatos, la IA en línea de Masha, las traducciones y las actualizaciones. Todo lo demás funciona sin conexión.',
      },
      {
        q: '¿Por qué Android me avisa al instalarla?',
        a: 'Las apps instaladas fuera de una tienda necesitan tu permiso una vez por cada app de origen (navegador o gestor de archivos). Es lo normal con cualquier APK. Play Protect también puede ofrecerte analizarla.',
      },
      {
        q: '¿Conservo mi biblioteca al actualizar?',
        a: 'Sí: las actualizaciones se instalan encima de la app. Solo funcionan entre versiones firmadas con la misma clave, así que una versión que compiles tú no se puede actualizar desde Releases.',
      },
      {
        q: '¿Es de código abierto?',
        a: 'No. El código fuente es público en GitHub para leerlo, pero todos los derechos están reservados. Copiarlo, modificarlo o redistribuirlo requiere permiso por escrito. Los componentes de terceros mantienen sus propias licencias.',
      },
    ],
  },
  privacyTeaser: {
    eyebrow: 'Privacidad',
    title: 'Sin anuncios, sin analítica, sin rastreadores',
    body:
      'Tu biblioteca, tus carpetas y tu tiempo de juego se quedan en tu dispositivo. Elyndra solo se conecta para los metadatos, la IA en línea de Masha, las traducciones y las actualizaciones, y puedes apagar cada una.',
    link: 'Lee exactamente qué se envía y adónde',
  },
  footer: {
    tagline: 'Un lanzador de juegos con alma de consola para Android.',
    product: 'Elyndra',
    legal: 'Legal',
    source: 'Código fuente',
    releases: 'Versiones',
    license: 'Licencia',
    notices: 'Avisos de terceros',
    privacy: 'Privacidad',
    author: 'Autor',
    credits:
      'Hecha con las fuentes Poppins y Cinzel (SIL OFL 1.1), three.js y uqr (MIT). El modelo web de Masha sale de recursos CC0 de MakeHuman.',
    voice:
      'La voz natural de Masha usa los pesos del modelo Supertonic 3 de Supertone Inc., bajo la licencia BigScience <a href="https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE">OpenRAIL-M</a>. La voz es sintética (generada por IA); al usarla aceptas no emplearla para ninguno de los usos restringidos del Anexo A de esa licencia.',
    disclaimer:
      'Elyndra no incluye juegos, ROMs, archivos BIOS ni emuladores, y no está afiliada a ningún fabricante de consolas, desarrollador de emuladores ni editor de juegos. Todas las marcas pertenecen a sus dueños.',
    copyright: '© 2026 <a href="https://github.com/jefer02">Jeferson Manuel Morillo Vallejo</a>. Todos los derechos reservados.',
  },
  privacy: {
    title: 'Privacidad',
    updated: 'Última actualización: 8 de octubre de 2026',
    intro:
      'Esta página explica qué envían por la red la app Elyndra y esta web, a quién y cuándo. Elyndra no tiene cuentas propias, ni anuncios, ni analítica, ni rastreadores.',
    appTitle: 'La app Elyndra',
    localTitle: 'Lo que se queda en tu dispositivo',
    local:
      'Tu biblioteca, tus carpetas de ROMs, el tiempo de juego, los ajustes, los recuerdos de Masha y su conversación se guardan en tu dispositivo. Las cuentas y claves de servicios que introduces se cifran con una clave del Android Keystore. Las copias de seguridad de la app están desactivadas.',
    servicesTitle: 'Servicios con los que habla la app',
    servicesLead: 'Cada uno se usa solo para la función de su fila. Su contenido pertenece a sus dueños.',
    thService: 'Servicio',
    thWhen: 'Cuándo',
    thWhat: 'Qué se envía',
    services: [
      {
        s: 'ScreenScraper',
        w: 'Metadatos de ROMs, si añades tu cuenta',
        d: 'El nombre del archivo de la ROM, su tamaño y sus sumas de comprobación (CRC, MD5, SHA-1), su sistema y tu cuenta de ScreenScraper.',
      },
      {
        s: 'IGDB (Twitch), SteamGridDB',
        w: 'Metadatos y arte, si añades tu cuenta',
        d: 'Los títulos de los juegos que se buscan y tus claves de esos servicios.',
      },
      {
        s: 'RetroAchievements',
        w: 'Logros, si añades tu cuenta',
        d: 'Identificadores de juego o hashes de ROM, y tu usuario y clave de RetroAchievements.',
      },
      {
        s: 'Fichas de Google Play y de la tienda de Steam, miniaturas de libretro',
        w: 'Metadatos sin clave, si esas fuentes están activadas',
        d: 'Títulos de juegos o nombres de paquete de Android, dentro de la dirección de la página o de la imagen. Sin cuenta.',
      },
      {
        s: 'DeepSeek',
        w: 'La charla libre de Masha, con la IA activada',
        d: 'Títulos, sistemas, tiempo de juego, estado del dispositivo, los recuerdos de Masha y la conversación. Nunca rutas de archivos, carpetas, nombres de cuenta ni credenciales.',
      },
      {
        s: 'Hugging Face',
        w: 'Una vez, si activas la voz natural de Masha',
        d: 'Una descarga normal del modelo de voz (unos 145 MB). Nada sobre ti.',
      },
      {
        s: 'Google ML Kit',
        w: 'Cuando traduces descripciones',
        d: 'Descarga una vez el modelo del idioma. La traducción se hace en el dispositivo.',
      },
      {
        s: 'GitHub',
        w: 'Búsqueda de actualizaciones, como mucho una vez al día (se puede apagar)',
        d: 'Una petición de la lista pública de versiones, y el APK cuando decides actualizar. Ningún dato personal ni del dispositivo.',
      },
    ],
    permsTitle: 'Permisos',
    perms: [
      '<strong>Micrófono</strong>: solo cuando hablas con Masha. La voz la reconoce el servicio de voz de tu dispositivo (por ejemplo, el de Google), con sus propias condiciones de privacidad.',
      '<strong>Acceso de uso</strong> (opcional): mide el tiempo de juego exacto. Lo activas en los ajustes del sistema, desde Ajustes → Masha.',
      '<strong>Carpetas</strong>: eliges cada carpeta de ROMs con el selector de archivos de Android. Elyndra no tiene permiso de almacenamiento.',
      '<strong>Instalar apps</strong>: permite al actualizador abrir el diálogo de instalación de Android. Android te lo pregunta la primera vez.',
      '<strong>Notificaciones</strong>: el progreso de los metadatos y los recordatorios de Masha.',
    ],
    controlTitle: 'Tú decides',
    control: [
      'La IA en línea de Masha se apaga en Ajustes → Masha. Ella sigue funcionando sin conexión.',
      '«Olvidar todo lo que sabe Masha» borra sus recuerdos, la conversación y la caché.',
      'Cada fuente de metadatos se puede apagar, y también la búsqueda automática de actualizaciones.',
    ],
    siteTitle: 'Esta web',
    site: [
      'Sin cookies, sin analítica, sin rastreadores, sin fuentes ni scripts de terceros.',
      'Para mostrar la última versión, tu navegador pide a la API pública de GitHub la lista de versiones de Elyndra (api.github.com). GitHub recibe esa petición como cualquier petición web, según la <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement">declaración de privacidad de GitHub</a>.',
      'Las descargas vienen directamente de GitHub Releases. Esta web no aloja el APK.',
      'La web la sirve Cloudflare, que procesa las peticiones para entregarla.',
      'Tu navegador guarda solo en tu dispositivo unas pocas preferencias: idioma, paleta, sonido y una copia breve de la lista de versiones.',
    ],
    contactTitle: 'Preguntas',
    contact: 'Abre una incidencia en <a href="https://github.com/jefer02/Elyndra/issues">github.com/jefer02/Elyndra</a> o contacta con el autor en <a href="https://github.com/jefer02">github.com/jefer02</a>.',
    back: 'Volver al inicio',
  },
  notFound: {
    title: 'Señal perdida',
    body: 'Esta página no existe. La biblioteca está por aquí.',
    home: 'Ir al inicio',
  },
  runtime: {
    mb: 'MB',
  },
};

export default es;
