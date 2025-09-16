
export interface CallEvaluation {
  id_llamada_procesada: string;
  id_cliente?: string;
  fecha_llamada?: string;
  id_original_path?: string; // Ruta GCS del audio
  evaluacion_llamada_raw?: string | null; // Cadena JSON anidada (puede venir null)
  evaluacion_llamada?: string | null; // Algunos datasets usan este nombre
  evaluacion_llamada_parsed?: any; // JSON parseado
  error?: string; // Campo de error en datasets incompletos
}
