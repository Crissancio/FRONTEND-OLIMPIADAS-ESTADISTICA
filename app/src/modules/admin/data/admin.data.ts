export type AdminConvocatoriaStatus = 'Activa' | 'Borrador' | 'Finalizada'

export interface AdminConvocatoria {
  id: string
  nombre: string
  gestion: number
  estado: AdminConvocatoriaStatus
  inscritos: number
  categorias: number
  fases: number
  descripcion: string
  inicioOlimpiada: string
  finOlimpiada: string
  inicioInscripcion: string
  finInscripcion: string
}

export interface AdminMaterial {
  id: string
  nombre: string
  descripcion: string
  tipo: 'Videos' | 'Formularios' | 'Temarios' | 'Practicas' | 'Examenes'
  convocatoria: string
  fase?: string
  enlace: string
}

export interface AdminColegio {
  id: string
  nombre: string
  tipo: 'Privado' | 'Fiscal' | 'Convenio'
  turno: 'Manana' | 'Tarde' | 'Noche'
  departamento: 'La Paz' | 'Cochabamba' | 'Santa Cruz'
  estado: 'Aprobado' | 'Pendiente' | 'Rechazado'
}

export interface AdminEstudiante {
  id: string
  nombres: string
  apellidos: string
  ci: string
  colegio: string
  curso: '4' | '5' | '6'
  departamento: 'La Paz' | 'Cochabamba' | 'Santa Cruz'
  estado: 'Activo' | 'Inactivo'
  fechaNacimiento: string
  correo: string
  telefono: string
  rude: string
}

export interface AdminAviso {
  id: string
  titulo: string
  tipo: 'Importante' | 'Urgente' | 'Informacion'
  fecha: string
  estado: 'Publicado' | 'Borrador'
  convocatoria: string
  contenido: string
}

export interface AdminColaborador {
  id: string
  nombre: string
  rol: string
  categoria: 'Personal' | 'Administrativo' | 'Colaborador'
  correo: string
  bio?: string
}

export interface AdminAuditLog {
  id: string
  admin: string
  accion: string
  modulo: string
  descripcion: string
  fecha: string
  tipo: 'create' | 'update' | 'delete' | 'critical' | 'info'
}

export const adminConvocatoriasMock: AdminConvocatoria[] = [
  {
    id: '1',
    nombre: 'XV Olimpiada de Estadistica',
    gestion: 2024,
    estado: 'Activa',
    inscritos: 1248,
    categorias: 4,
    fases: 2,
    descripcion:
      'Competencia academica orientada a estudiantes de secundaria para fortalecer pensamiento estadistico.',
    inicioOlimpiada: 'Marzo 2024',
    finOlimpiada: 'Noviembre 2024',
    inicioInscripcion: '2024-03-10',
    finInscripcion: '2024-05-15',
  },
  {
    id: '2',
    nombre: 'XIV Olimpiada de Estadistica',
    gestion: 2023,
    estado: 'Finalizada',
    inscritos: 1112,
    categorias: 3,
    fases: 2,
    descripcion:
      'Edicion anterior con participacion nacional y fase final presencial en campus UMSA.',
    inicioOlimpiada: 'Abril 2023',
    finOlimpiada: 'Octubre 2023',
    inicioInscripcion: '2023-03-20',
    finInscripcion: '2023-05-03',
  },
  {
    id: '3',
    nombre: 'XVI Olimpiada de Estadistica',
    gestion: 2025,
    estado: 'Borrador',
    inscritos: 0,
    categorias: 2,
    fases: 0,
    descripcion:
      'Convocatoria en preparacion. Falta publicacion de reglamento y cronograma final.',
    inicioOlimpiada: 'Abril 2025',
    finOlimpiada: 'Noviembre 2025',
    inicioInscripcion: '2025-03-01',
    finInscripcion: '2025-04-30',
  },
]

export const adminMaterialesMock: AdminMaterial[] = [
  {
    id: '1',
    nombre: 'Temario Oficial 2024',
    descripcion: 'Contenidos a evaluar en la primera y segunda fase.',
    tipo: 'Temarios',
    convocatoria: 'Olimpiadas 2024',
    enlace: 'https://example.com/temario',
  },
  {
    id: '2',
    nombre: 'Introduccion a la Probabilidad',
    descripcion: 'Clase grabada sobre conceptos basicos.',
    tipo: 'Videos',
    convocatoria: 'Olimpiadas 2024',
    fase: 'Fase 1',
    enlace: 'https://youtube.com/video',
  },
  {
    id: '3',
    nombre: 'Practica Nivel Secundario',
    descripcion: 'Ejercicios propuestos para la primera fase.',
    tipo: 'Practicas',
    convocatoria: 'Olimpiadas 2023',
    enlace: 'https://example.com/practica',
  },
  {
    id: '4',
    nombre: 'Examen Pasado - Final 2023',
    descripcion: 'Prueba oficial aplicada en la fase final.',
    tipo: 'Examenes',
    convocatoria: 'Olimpiadas 2023',
    fase: 'Fase Final',
    enlace: 'https://example.com/examen',
  },
]

export const adminColegiosMock: AdminColegio[] = [
  {
    id: '1',
    nombre: 'Colegio San Ignacio',
    tipo: 'Privado',
    turno: 'Manana',
    departamento: 'La Paz',
    estado: 'Aprobado',
  },
  {
    id: '2',
    nombre: 'Unidad Educativa Simon Bolivar',
    tipo: 'Fiscal',
    turno: 'Tarde',
    departamento: 'Cochabamba',
    estado: 'Aprobado',
  },
  {
    id: '3',
    nombre: 'Colegio Don Bosco',
    tipo: 'Convenio',
    turno: 'Manana',
    departamento: 'Santa Cruz',
    estado: 'Pendiente',
  },
  {
    id: '4',
    nombre: 'Colegio Don Bosco (Duplicado)',
    tipo: 'Convenio',
    turno: 'Manana',
    departamento: 'Santa Cruz',
    estado: 'Pendiente',
  },
  {
    id: '5',
    nombre: 'Liceo La Paz',
    tipo: 'Fiscal',
    turno: 'Manana',
    departamento: 'La Paz',
    estado: 'Rechazado',
  },
]

export const adminEstudiantesMock: AdminEstudiante[] = [
  {
    id: '1',
    nombres: 'Ana Maria',
    apellidos: 'Lopez Mamani',
    ci: '1234567',
    colegio: 'Colegio San Ignacio',
    curso: '5',
    departamento: 'La Paz',
    estado: 'Activo',
    fechaNacimiento: '2007-04-15',
    correo: 'ana.lopez@email.com',
    telefono: '76543210',
    rude: '8073001234',
  },
  {
    id: '2',
    nombres: 'Carlos',
    apellidos: 'Quispe Choque',
    ci: '7654321',
    colegio: 'Unidad Educativa Simon Bolivar',
    curso: '6',
    departamento: 'Cochabamba',
    estado: 'Activo',
    fechaNacimiento: '2006-09-11',
    correo: 'carlos.quispe@email.com',
    telefono: '70112233',
    rude: '8073002345',
  },
  {
    id: '3',
    nombres: 'Lucia',
    apellidos: 'Fernandez Cruz',
    ci: '9876543',
    colegio: 'Colegio Don Bosco',
    curso: '4',
    departamento: 'Santa Cruz',
    estado: 'Inactivo',
    fechaNacimiento: '2008-01-20',
    correo: 'lucia.fernandez@email.com',
    telefono: '73445566',
    rude: '8073003456',
  },
]

export const adminAvisosMock: AdminAviso[] = [
  {
    id: '1',
    titulo: 'Ampliacion de inscripciones',
    tipo: 'Importante',
    fecha: '15 Oct 2024',
    estado: 'Publicado',
    convocatoria: 'Olimpiadas 2024',
    contenido: 'Se amplian las inscripciones hasta el 21 de octubre.',
  },
  {
    id: '2',
    titulo: 'Revisar correos electronicos',
    tipo: 'Urgente',
    fecha: '10 Oct 2024',
    estado: 'Publicado',
    convocatoria: 'Olimpiadas 2024',
    contenido: 'Revisar bandeja principal y spam para notificaciones.',
  },
  {
    id: '3',
    titulo: 'Nueva modalidad de examen',
    tipo: 'Informacion',
    fecha: '05 Oct 2024',
    estado: 'Borrador',
    convocatoria: 'Olimpiadas 2024',
    contenido: 'Se evaluara en dos bloques con intervalo controlado.',
  },
]

export const adminColaboradoresMock: AdminColaborador[] = [
  {
    id: '1',
    nombre: 'Dr. Roberto Silva',
    rol: 'Director de Carrera',
    categoria: 'Personal',
    correo: 'rsilva@umsa.bo',
  },
  {
    id: '2',
    nombre: 'Lic. Maria Fernandez',
    rol: 'Coordinadora General',
    categoria: 'Administrativo',
    correo: 'mfernandez@umsa.bo',
  },
  {
    id: '3',
    nombre: 'Univ. Carlos Mamani',
    rol: 'Apoyo Logistico',
    categoria: 'Colaborador',
    correo: 'cmamani@umsa.bo',
  },
]

export const adminAuditLogsMock: AdminAuditLog[] = [
  {
    id: '1',
    admin: 'Admin System',
    accion: 'CREAR_CONVOCATORIA',
    modulo: 'Convocatorias',
    descripcion: "Creo 'XVI Olimpiada 2025'",
    fecha: '20/10/2024 14:30',
    tipo: 'create',
  },
  {
    id: '2',
    admin: 'Admin System',
    accion: 'FUSION_COLEGIO',
    modulo: 'Colegios',
    descripcion: "Fusiono 'Colegio Don Bosco (Duplicado)'",
    fecha: '20/10/2024 11:15',
    tipo: 'critical',
  },
  {
    id: '3',
    admin: 'Supervisor',
    accion: 'PUBLICAR_AVISO',
    modulo: 'Avisos',
    descripcion: 'Publico aviso ID: 45',
    fecha: '19/10/2024 09:00',
    tipo: 'update',
  },
  {
    id: '4',
    admin: 'Admin System',
    accion: 'BAJA_ESTUDIANTE',
    modulo: 'Estudiantes',
    descripcion: 'Baja logica CI: 1234567',
    fecha: '18/10/2024 16:45',
    tipo: 'delete',
  },
]
