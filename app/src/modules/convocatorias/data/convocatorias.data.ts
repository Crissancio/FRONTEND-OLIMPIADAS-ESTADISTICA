export type TipoAviso = "Importante" | "Urgente" | "Info";
export type EstadoConvocatoria = "ACTIVA" | "FINALIZADA";

export interface Aviso {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoAviso;
  fecha: string;
}

export interface Material {
  id: string;
  nombre: string;
  url: string;
  tipo: "PDF" | "Video" | "Enlace" | "Documento";
  tamano?: string;
}

export interface Fase {
  id: string;
  nombre: string;
  tipo: "Preparación" | "Prueba";
  fechas: string;
  descripcion: string;
  modalidad?: "Virtual" | "Presencial" | "Híbrida";
  subtipo?: "Parcial" | "Final";
  materiales?: Material[];
}

export interface Categoria {
  id: string;
  nombre: string;
  fases: Fase[];
  recursos?: { nombre: string; url: string }[];
}

export interface Convocatoria {
  id: string;
  nombre: string;
  gestion: number;
  estado: EstadoConvocatoria;
  descripcionBreve: string;
  descripcionCompleta: string;
  fechas: string;
  categorias: Categoria[];
  materialGeneral?: Material[];
}

export const avisosMock: Aviso[] = [];

export const convocatoriasMock: Convocatoria[] = [
  {
    id: "1",
    nombre: "XV Olimpiada de Estadística",
    gestion: 2024,
    estado: "ACTIVA",
    descripcionBreve: "Edición actual de la olimpiada orientada a estudiantes de secundaria y nivel universitario inicial.",
    descripcionCompleta: "La XV Olimpiada de Estadística de la UMSA tiene como objetivo principal fomentar el pensamiento lógico, matemático y estadístico en la juventud paceña y boliviana. A través de problemas y casos prácticos, buscamos despertar el interés científico.",
    fechas: "Marzo - Junio 2024",
    materialGeneral: [
      { id: "mg1", nombre: "Reglamento Oficial XV Olimpiada", tipo: "PDF", tamano: "2.4 MB", url: "#" },
      { id: "mg2", nombre: "Cronograma Completo 2024", tipo: "Documento", tamano: "1.1 MB", url: "#" },
      { id: "mg3", nombre: "Video Introductorio y Bienvenida", tipo: "Video", url: "#" }
    ],
    categorias: [
      {
        id: "c1",
        nombre: "Nivel Secundaria (4to a 6to)",
        fases: [
          {
            id: "f1",
            nombre: "Talleres de Preparación",
            tipo: "Preparación",
            fechas: "01 al 30 de Mayo",
            descripcion: "Sesiones virtuales de introducción a estadística descriptiva y probabilidad.",
            modalidad: "Virtual",
            materiales: [
              { id: "m1", nombre: "Guía de Estudio - Estadística Básica", tipo: "PDF", tamano: "1.5 MB", url: "#" },
              { id: "m2", nombre: "Ejercicios Prácticos Nivel 1", tipo: "Documento", tamano: "800 KB", url: "#" },
              { id: "m3", nombre: "Grabación Taller Semana 1", tipo: "Video", url: "#" }
            ]
          },
          {
            id: "f2",
            nombre: "Primera Fase - Prueba Clasificatoria",
            tipo: "Prueba",
            subtipo: "Parcial",
            fechas: "15 de Junio",
            descripcion: "Examen teórico práctico con selección múltiple.",
            modalidad: "Virtual",
            materiales: [
              { id: "m4", nombre: "Formato de Examen Clasificatorio", tipo: "PDF", tamano: "500 KB", url: "#" },
              { id: "m5", nombre: "Instrucciones para la plataforma virtual", tipo: "Enlace", url: "#" }
            ]
          }
        ]
      },
      {
        id: "c2",
        nombre: "Nivel Universitario (1er Año)",
        fases: [
          {
            id: "f3",
            nombre: "Prueba Final",
            tipo: "Prueba",
            subtipo: "Final",
            fechas: "25 de Junio",
            descripcion: "Examen presencial de resolución de problemas estadísticos.",
            modalidad: "Presencial",
            materiales: [
              { id: "m6", nombre: "Temario Universitario Nivel Avanzado", tipo: "PDF", tamano: "3.2 MB", url: "#" },
              { id: "m7", nombre: "Banco de Problemas de Referencia", tipo: "Documento", tamano: "1.8 MB", url: "#" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "2",
    nombre: "XIV Olimpiada de Estadística",
    gestion: 2023,
    estado: "FINALIZADA",
    descripcionBreve: "Competencia anual de estadística del año pasado con gran participación a nivel nacional.",
    descripcionCompleta: "Edición 2023 que reunió a más de 1500 estudiantes de todo el país. Se premió a los ganadores con becas y reconocimientos institucionales.",
    fechas: "Marzo - Julio 2023",
    materialGeneral: [
      { id: "mg4", nombre: "Memoria Anual 2023", tipo: "PDF", tamano: "5.5 MB", url: "#" }
    ],
    categorias: [
      {
        id: "c1-23",
        nombre: "Nivel Secundaria",
        recursos: [
          { nombre: "Examen Oficial Primera Fase", url: "#" },
          { nombre: "Solucionario Fase Final", url: "#" },
        ],
        fases: [
          {
            id: "f-old-1",
            nombre: "Fase Final",
            tipo: "Prueba",
            subtipo: "Final",
            fechas: "15 Julio 2023",
            descripcion: "Evaluación presencial.",
            modalidad: "Presencial"
          }
        ]
      }
    ]
  }
];

export const resultadosMock = [
  { id: "1", nombre: "Ana López Torrez", ci: "1234567 LP", categoria: "Nivel Secundaria", nota: "98/100", pos: 1 },
  { id: "2", nombre: "Carlos Mamani Quispe", ci: "7654321 LP", categoria: "Nivel Secundaria", nota: "95/100", pos: 2 },
  { id: "3", nombre: "Maria Gonzales V.", ci: "4567890 OR", categoria: "Nivel Secundaria", nota: "91/100", pos: 3 },
  { id: "4", nombre: "Juan Perez M.", ci: "9876543 CB", categoria: "Nivel Secundaria", nota: "88/100", pos: 4 },
  { id: "5", nombre: "Roberto Choque J.", ci: "1122334 PT", categoria: "Nivel Secundaria", nota: "85/100", pos: 5 },
];
