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

export const convocatoriasMock: Convocatoria[] = [
  {
    id: "1",
    nombre: "Olimpiada Paceña de Estadística",
    gestion: 2024,
    estado: "ACTIVA",
    descripcionBreve: "Convocatoria oficial de la olimpiada de estadística.",
    descripcionCompleta: "Participa en la Olimpiada Paceña de Estadística y fortalece tus habilidades de análisis de datos.",
    fechas: "2024",
    categorias: [],
    materialGeneral: [],
  },
  {
    id: "2",
    nombre: "Olimpiada Paceña de Estadística 2023",
    gestion: 2023,
    estado: "FINALIZADA",
    descripcionBreve: "Histórico de la gestión 2023.",
    descripcionCompleta: "Consulta la información histórica de la convocatoria finalizada.",
    fechas: "2023",
    categorias: [],
    materialGeneral: [],
  },
];

export const resultadosMock = [
  { id: "1", nombre: "Ana López Torrez", ci: "1234567 LP", categoria: "Nivel Secundaria", nota: "98/100", pos: 1 },
  { id: "2", nombre: "Carlos Mamani Quispe", ci: "7654321 LP", categoria: "Nivel Secundaria", nota: "95/100", pos: 2 },
  { id: "3", nombre: "Maria Gonzales V.", ci: "4567890 OR", categoria: "Nivel Secundaria", nota: "91/100", pos: 3 },
  { id: "4", nombre: "Juan Perez M.", ci: "9876543 CB", categoria: "Nivel Secundaria", nota: "88/100", pos: 4 },
  { id: "5", nombre: "Roberto Choque J.", ci: "1122334 PT", categoria: "Nivel Secundaria", nota: "85/100", pos: 5 },
];