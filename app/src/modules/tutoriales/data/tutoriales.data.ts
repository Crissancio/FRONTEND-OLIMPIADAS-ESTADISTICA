export interface Tutorial {
  id: string
  title: string
  module: TutorialModule
  duration: string
  driveUrl: string
  description: string
}

export type TutorialModule =
  | 'AUTH'
  | 'CONVOCATORIA'
  | 'FASE_PREPARACION'
  | 'FASE_PRUEBA'
  | 'INSCRIPCION'
  | 'RESULTADO'
  | 'MATERIAL'
  | 'COLEGIO'
  | 'ESTUDIANTE'
  | 'DIRECTOR'
  | 'AVISO'
  | 'CONTACTO'
  | 'CAMPANIA'
  | 'EMAIL_LOG'
  | 'COLABORADOR'
  | 'ADMINISTRADOR'
  | 'CATEGORIA'

export const MODULO_LABELS: Record<TutorialModule, string> = {
  AUTH:             'Seguridad y Autenticación',
  CONVOCATORIA:     'Convocatorias',
  FASE_PREPARACION: 'Fases de Preparación',
  FASE_PRUEBA:      'Fases de Prueba',
  INSCRIPCION:      'Inscripciones',
  RESULTADO:        'Resultados',
  MATERIAL:         'Materiales de Estudio',
  COLEGIO:          'Colegios',
  ESTUDIANTE:       'Estudiantes',
  DIRECTOR:         'Directores',
  AVISO:            'Avisos',
  CONTACTO:         'Contactos',
  CAMPANIA:         'Campañas',
  EMAIL_LOG:        'Email Logs',
  COLABORADOR:      'Colaboradores',
  ADMINISTRADOR:    'Administradores',
  CATEGORIA:        'Categorías',
}

export const TUTORIALES: Tutorial[] = [
  {
    id: '1',
    title: 'Creación de Campaña',
    module: 'CAMPANIA',
    duration: '08:02',
    driveUrl: 'https://drive.google.com/file/d/1jslqPbuPMGhC2S8ZQ6isp-IAe2HWRk6i/view?usp=sharing',
    description: 'Aprende a crear y configurar una campaña de comunicación desde cero, definiendo destinatarios, asunto y contenido del mensaje.',
  },
  {
    id: '2',
    title: 'Responder Contactos',
    module: 'CONTACTO',
    duration: '03:55',
    driveUrl: 'https://drive.google.com/file/d/1ImioLmOSlFfgU9mjMVIwJwqaF8O5MFfY/view?usp=sharing',
    description: 'Cómo gestionar y responder los mensajes recibidos a través del formulario de contacto del sistema.',
  },
  {
    id: '3',
    title: 'Creación de Convocatoria',
    module: 'CONVOCATORIA',
    duration: '00:00',
    driveUrl: 'https://drive.google.com/file/d/1c9e-YsfLer8WvB6bvyHKw_L7yJJVVxbe/view?usp=sharing',
    description: 'Guía completa para crear una nueva convocatoria, configurar sus datos generales y asociarle categorías y fases.',
  },
  {
    id: '4',
    title: 'Creación de Fase de Preparación',
    module: 'FASE_PREPARACION',
    duration: '03:27',
    driveUrl: 'https://drive.google.com/file/d/1bM8RiALlfJvY3CyehSdpgYgjhMkCCT8i/view?usp=sharing',
    description: 'Cómo agregar una fase de preparación a una convocatoria existente, definiendo fechas y materiales asociados.',
  },
  {
    id: '5',
    title: 'Creación de Fase de Prueba',
    module: 'FASE_PRUEBA',
    duration: '03:31',
    driveUrl: 'https://drive.google.com/file/d/1CC9uGfMGR93BWcnjTbBbRWQjSfHjFLxv/view?usp=sharing',
    description: 'Pasos para crear una fase de prueba dentro de una convocatoria, incluyendo la configuración de fecha, lugar y modalidad.',
  },
  {
    id: '6',
    title: 'Creación de Fase de Prueba Final',
    module: 'FASE_PRUEBA',
    duration: '01:30',
    driveUrl: 'https://drive.google.com/file/d/1v1giYazg1icQl2eREMdXRYrCMCc04SOr/view?usp=sharing',
    description: 'Configuración específica de la fase final de una prueba, con sus particularidades respecto a fases intermedias.',
  },
  {
    id: '7',
    title: 'Publicación de Convocatoria',
    module: 'CONVOCATORIA',
    duration: '02:29',
    driveUrl: 'https://drive.google.com/file/d/1-mEj7ZvNIgfz2mbTFQHpz1N_XfjTfEwu/view?usp=sharing',
    description: 'Cómo publicar una convocatoria para que sea visible a estudiantes y colegios, y cómo revertir su estado si es necesario.',
  },
  {
    id: '8',
    title: 'Administración de Colegios',
    module: 'COLEGIO',
    duration: '04:10',
    driveUrl: 'https://drive.google.com/file/d/1eXiyXAA_6SCYhnNi0G7qgOYLjnTe2DqE/view?usp=sharing',
    description: 'Registro y gestión de colegios en el sistema: creación, edición de datos institucionales y asignación de directores.',
  },
  {
    id: '9',
    title: 'Administración de Estudiantes',
    module: 'ESTUDIANTE',
    duration: '02:45',
    driveUrl: 'https://drive.google.com/file/d/1yaM4fvf1fLrIvR29F-n2Inthl8l_-sTK/view?usp=sharing',
    description: 'Cómo registrar, editar y administrar estudiantes en el sistema, incluyendo la vinculación a su colegio correspondiente.',
  },
  {
    id: '10',
    title: 'Exportación de Inscritos',
    module: 'INSCRIPCION',
    duration: '01:18',
    driveUrl: 'https://drive.google.com/file/d/1RlCqKbKGnViUr3bzR8TOqpAvXAs4etIq/view?usp=sharing',
    description: 'Cómo exportar el listado de estudiantes inscritos en una convocatoria en formato Excel para su procesamiento externo.',
  },
  {
    id: '11',
    title: 'Exportación de Resultados',
    module: 'RESULTADO',
    duration: '01:08',
    driveUrl: 'https://drive.google.com/file/d/1LLRLKBDktiBQhmrXwkTqObYYVzTuqgom/view?usp=sharing',
    description: 'Descarga los resultados de una fase en formato Excel para compartirlos o archivarlos fuera del sistema.',
  },
  {
    id: '12',
    title: 'Exportar Estudiantes',
    module: 'ESTUDIANTE',
    duration: '02:07',
    driveUrl: 'https://drive.google.com/file/d/1tptcILPYF4Z-TgScaff_fMbnl5FqWjdd/view?usp=sharing',
    description: 'Exporta el directorio completo de estudiantes registrados en el sistema en un archivo Excel.',
  },
  {
    id: '13',
    title: 'Importación de Inscripciones CSV',
    module: 'INSCRIPCION',
    duration: '02:21',
    driveUrl: 'https://drive.google.com/file/d/1Yus_-UDNwkZxm72nFlv9UV_lzB4TKRL5/view?usp=sharing',
    description: 'Carga masiva de inscripciones mediante un archivo CSV, con validación de datos y manejo de errores de importación.',
  },
  {
    id: '14',
    title: 'Importar Colegios',
    module: 'COLEGIO',
    duration: '02:09',
    driveUrl: 'https://drive.google.com/file/d/1gY-daZ4EtNIiFSvanxzvU8KEvHial0t2/view?usp=sharing',
    description: 'Importación masiva de colegios al sistema desde un archivo CSV con la estructura requerida.',
  },
  {
    id: '15',
    title: 'Aprobación y Rechazo de Inscripciones',
    module: 'INSCRIPCION',
    duration: '01:49',
    driveUrl: 'https://drive.google.com/file/d/10dgEdai62D3DBvz5ZRlQUYpxcsWNbobc/view?usp=sharing',
    description: 'Flujo de revisión de inscripciones pendientes: cómo aprobar o rechazar solicitudes y notificar al colegio correspondiente.',
  },
  {
    id: '16',
    title: 'Creación de Inscripción',
    module: 'INSCRIPCION',
    duration: '03:42',
    driveUrl: 'https://drive.google.com/file/d/1VpuERsApkajQ02EloLgKYsueMIxWEA69/view?usp=sharing',
    description: 'Registro manual de una inscripción desde el panel de administración, seleccionando convocatoria, categoría y estudiante.',
  },
  {
    id: '17',
    title: 'Material de Convocatoria',
    module: 'MATERIAL',
    duration: '02:25',
    driveUrl: 'https://drive.google.com/file/d/1Ann6csYHP8CmoSDkuS3CAtp-e3gf4GGN/view?usp=sharing',
    description: 'Cómo agregar y gestionar materiales de estudio específicos para una convocatoria (documentos, enlaces, archivos).',
  },
  {
    id: '18',
    title: 'Material General',
    module: 'MATERIAL',
    duration: '02:15',
    driveUrl: 'https://drive.google.com/file/d/1NRFJXVil_xpY9qLX_mnFagAjZHjEdqNN/view?usp=sharing',
    description: 'Administración del material general del sistema: carga, edición y eliminación de recursos disponibles para todos.',
  },
  {
    id: '19',
    title: 'Material Externo en Convocatoria',
    module: 'MATERIAL',
    duration: '01:57',
    driveUrl: 'https://drive.google.com/file/d/1LAYTYcsCNQVb9YceDRsxjDQm-q4M78vy/view?usp=sharing',
    description: 'Vinculación de material externo ya existente en el sistema a una convocatoria específica sin duplicar archivos.',
  },
  {
    id: '20',
    title: 'Material de Fase',
    module: 'MATERIAL',
    duration: '02:37',
    driveUrl: 'https://drive.google.com/file/d/1oxXR1hrCDrPHjgahkezPNI3RlWX6MzBP/view?usp=sharing',
    description: 'Asociación de materiales de estudio a una fase específica de la convocatoria para orientar la preparación del estudiante.',
  },
  {
    id: '21',
    title: 'Administración de Resultados',
    module: 'RESULTADO',
    duration: '04:34',
    driveUrl: 'https://drive.google.com/file/d/1HeiPWR67QifGN_Vo5hThlEeUpxZVzcAY/view?usp=sharing',
    description: 'Gestión completa de resultados: carga de notas, revisión de puntajes y administración del estado de cada participante.',
  },
  {
    id: '22',
    title: 'Configuración de Resultados con Fase Anterior',
    module: 'RESULTADO',
    duration: '03:20',
    driveUrl: 'https://drive.google.com/file/d/1xgknGxy18Jwb6bN711mg2vy_PpZTBLR6/view?usp=sharing',
    description: 'Cómo configurar los resultados de una fase tomando como base los clasificados de la fase de prueba anterior.',
  },
  {
    id: '23',
    title: 'Publicación y Ocultado de Resultados',
    module: 'RESULTADO',
    duration: '01:41',
    driveUrl: 'https://drive.google.com/file/d/1gIEGwnwc2Uu1d3-Hi2yuUzqq17AouY_J/view?usp=sharing',
    description: 'Control de visibilidad de resultados: cómo publicarlos para que los estudiantes los vean y cómo ocultarlos si es necesario.',
  },
  {
    id: '24',
    title: 'Cambio de Contraseña',
    module: 'AUTH',
    duration: '01:08',
    driveUrl: 'https://drive.google.com/file/d/1tCfcDajX2dbXyk5G6IcpvontRTR4Opg4/view?usp=sharing',
    description: 'Pasos para actualizar la contraseña de acceso al panel de administración de forma segura.',
  },
  {
    id: '25',
    title: 'Uso de Auditoría',
    module: 'AUTH',
    duration: '01:27',
    driveUrl: 'https://drive.google.com/file/d/1cisFR7fri2r5oMjHFi4C7p-JNrSTotcd/view?usp=sharing',
    description: 'Cómo utilizar el módulo de auditoría para revisar el historial de acciones realizadas en el sistema por los administradores.',
  },
  {
    id: '26',
    title: 'Administración de Avisos',
    module: 'AVISO',
    duration: '03:26',
    driveUrl: 'https://drive.google.com/file/d/1JhYs-NCPMfRN3jrK11EEiKxT7xTlrooH/view?usp=sharing',
    description: 'Creación, edición y eliminación de avisos informativos que se muestran a los estudiantes en la plataforma pública.',
  },
  {
    id: '27',
    title: 'Administración de Colaboradores',
    module: 'COLABORADOR',
    duration: '02:58',
    driveUrl: 'https://drive.google.com/file/d/1iu6luzuqna-m_4rNNFKJQQlHoWf6W27k/view?usp=sharing',
    description: 'Registro y gestión de colaboradores del sistema: creación de cuentas, asignación de roles y administración de accesos.',
  },
  {
    id: '28',
    title: 'Administración de Usuarios Admin',
    module: 'ADMINISTRADOR',
    duration: '03:22',
    driveUrl: 'https://drive.google.com/file/d/16JlAsxgutdE8vowwjORmYIztGSQNGlkh/view?usp=sharing',
    description: 'Gestión de cuentas de administrador del sistema: creación, edición de permisos y desactivación de usuarios.',
  },
]

export const MODULOS_TUTORIALES = [...new Set(TUTORIALES.map((t) => t.module))] as TutorialModule[]

export function getDriveEmbedUrl(driveUrl: string): string {
  const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (!match) return ''
  const fileId = match[1]
  return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal&hd=1`
}