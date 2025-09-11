
export interface CallEvaluation {
  id_llamada_procesada: string;
  id_cliente: string;
  fecha_llamada: string;
  id_original_path?: string; // Optional field for GCS audio path
  evaluacion_llamada_raw: string; // The raw, nested JSON string
  evaluacion_llamada_parsed?: any; // Parsed data will be stored here
}
