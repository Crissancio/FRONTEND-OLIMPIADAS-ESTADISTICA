import { customInstance } from '@/app/api/mutator';
import type {
  ColegioFilters,
  PaginatedColegioResponse,
  ColegioCreateDTO,
  ColegioUpdateDTO,
  ColegioResponse,
  ColegioDetailResponse,
  GeneralDictResponse,
  BodySubirCsvColegios,
  CSVUploadWrapperResponse,
  ColegioCSVImportDTO,
  CSVImportDBWrapperResponse
} from '../types/colegios.api';

export const colegiosService = {
  // ================= LECTURA =================
  listarColegios(params?: ColegioFilters) {
    return customInstance<PaginatedColegioResponse>({
      url: '/api/v1/colegios',
      method: 'GET',
      params
    });
  },

  obtenerColegioPorId(id: number) {
    return customInstance<ColegioDetailResponse>({
      url: `/api/v1/colegios/${id}`,
      method: 'GET'
    });
  },

  // ================= ESCRITURA =================
  crearColegio(data: ColegioCreateDTO) {
    return customInstance<ColegioResponse>({
      url: '/api/v1/colegios',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data
    });
  },

  actualizarColegio(id: number, data: ColegioUpdateDTO) {
    return customInstance<ColegioResponse>({
      url: `/api/v1/colegios/${id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data
    });
  },

  // ================= ESTADOS Y ELIMINACIÓN =================
  bajaLogicaColegio(id: number) {
    return customInstance<ColegioResponse>({
      url: `/api/v1/colegios/${id}/baja`,
      method: 'PATCH'
    });
  },

  altaLogicaColegio(id: number) {
    return customInstance<ColegioResponse>({
      url: `/api/v1/colegios/${id}/alta`,
      method: 'PATCH'
    });
  },

  eliminarColegio(id: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/colegios/${id}`,
      method: 'DELETE'
    });
  },

  // ================= CARGA MASIVA (CSV) =================
  subirCsvColegios(data: BodySubirCsvColegios) {
    const formData = new FormData();
    formData.append('departamento', data.departamento);
    formData.append('file', data.file);

    return customInstance<CSVUploadWrapperResponse>({
      url: '/api/v1/colegios/subir-csv',
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData
    });
  },

  descargarCsvError(filename: string) {
    return customInstance<Blob>({
      url: `/api/v1/colegios/csv-error/${filename}`,
      method: 'GET',
      responseType: 'blob' // Importante para manejar descargas de archivos
    });
  },

  importarColegiosCsv(data: ColegioCSVImportDTO[]) {
    return customInstance<CSVImportDBWrapperResponse>({
      url: '/api/v1/colegios/csv',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data
    });
  }
};