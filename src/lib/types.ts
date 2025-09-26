
export interface NormalizedMetrics {
  precision_llamada?: number | null;
  precision_error_critico_cliente?: boolean | null;
  precision_error_critico_negocio?: boolean | null;
  precision_error_critico_cumplimiento?: boolean | null;
  precision_error_no_critico?: boolean | null;
}

export interface NormalizedEvaluation {
  transcripcion?: string;
  metrics: NormalizedMetrics;
  otrosCampos: Record<string, unknown>;
  categories: Record<string, unknown>;
  raw: unknown;
  hasData: boolean;
}

export interface CallEvaluation {
  id_llamada_procesada: string;
  id_cliente?: string;
  fecha_llamada?: string;
  id_original_path?: string; // Ruta GCS del audio
  evaluacion_llamada_raw?: string | null; // Cadena JSON anidada (puede venir null)
  evaluacion_llamada?: string | null; // Algunos datasets usan este nombre
  evaluacion_llamada_parsed?: NormalizedEvaluation; // Evaluación normalizada para UI y análisis
  error?: string; // Campo de error en datasets incompletos
}
