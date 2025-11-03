export interface Expediente {
  _id: string;
  grado: string;                    // Grado militar o académico
  apellidosNombres: string;         // Nombres y apellidos completos
  numeroPaginas: number;            // Número de páginas del expediente
  situacionMilitar: string;         // Situación militar del expediente
  cip: string;                      // Código de identificación personal
  estado: ExpedienteEstado;         // 'dentro' | 'fuera'
  ubicacion: string;                // Ubicación física del expediente
  fechaRegistro: Date;              // Fecha de registro del expediente
  fechaActualizacion: Date;         // Fecha de última actualización
  orden: number;                    // Número de orden del expediente
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export type ExpedienteEstado = 'dentro' | 'fuera';

export interface CreateExpedienteRequest {
  grado: string;
  apellidosNombres: string;
  numeroPaginas: number;
  situacionMilitar: string;
  cip: string;
  ubicacion: string;
  orden: number;
}

export interface UpdateExpedienteRequest {
  grado?: string;
  apellidosNombres?: string;
  numeroPaginas?: number;
  situacionMilitar?: string;
  cip?: string;
  estado?: ExpedienteEstado;
  ubicacion?: string;
  orden?: number;
}

export interface ExpedienteSearchParams {
  grado?: string;
  apellidosNombres?: string;
  situacionMilitar?: string;
  cip?: string;
  estado?: ExpedienteEstado;
  ubicacion?: string;
  orden?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExpedienteResponse {
  expedientes: Expediente[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}