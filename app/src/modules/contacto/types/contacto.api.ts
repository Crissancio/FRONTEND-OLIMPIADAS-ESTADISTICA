import type { ResponseBase } from '@/modules/convocatorias/types/convocatorias.api'

export interface ContactoRequestDTO {
  nombre_completo: string;
  correo_electronico: string;
  asunto: string;
  mensaje: string;
  username_hp: string;
  cf_turnstile_response: string;
}

export type PublicInscripcionResponse = ResponseBase<ContactoRequestDTO>