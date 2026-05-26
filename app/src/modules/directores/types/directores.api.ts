export interface DirectorResponseDTO {
  id_director: number
  nombres: string
  paterno: string
  materno?: string | null
  id_colegio?: number | null
  telefono_1?: string | null
  telefono_2?: string | null
}

export interface DirectorMinifiedDTO {
  id_director: number
  nombres_completos: string
}

export interface DirectorCreateDTO {
  nombres: string
  paterno: string
  materno?: string | null
  id_colegio?: number | null
  telefono_1?: string | null
  telefono_2?: string | null
}

export interface DirectorUpdateDTO {
  id_colegio?: number | null
  telefono_1?: string | null
  telefono_2?: string | null
  nombres?: string
  paterno?: string
  materno?: string | null
}

export interface DirectorCSVImportDTO {
  nombres: string
  paterno: string
  materno?: string | null
  telefono_1?: string | null
  telefono_2?: string | null
}