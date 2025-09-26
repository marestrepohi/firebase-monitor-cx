import type { NormalizedEvaluation } from '@/lib/types';

const ACCENT_REGEX = /[\u0300-\u036f]/g;
const NON_WORD_REGEX = /[^a-z0-9]+/g;

const METRIC_BOOLEAN_ALIASES = new Set(['si', 'sí', 'true', '1', 'x', 'ok', 'cumple']);
const METRIC_FALSE_ALIASES = new Set(['no', 'false', '0', '', 'na', 'n/a', 'null']);

function sanitizeKey(key: string): string {
  return key
    .normalize('NFD')
    .replace(ACCENT_REGEX, '')
    .toLowerCase()
    .replace(NON_WORD_REGEX, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function parseJsonValue(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function toBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return null;
    if (value === 0) return false;
    if (value === 1) return true;
    return value > 0;
  }
  const normalized = String(value)
    .trim()
    .normalize('NFD')
    .replace(ACCENT_REGEX, '')
    .toLowerCase();
  if (METRIC_BOOLEAN_ALIASES.has(normalized)) return true;
  if (METRIC_FALSE_ALIASES.has(normalized)) return false;
  return null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return null;
    return Number(value.toFixed(2));
  }
  const parsed = Number(String(value).replace(/[^0-9.,-]/g, '').replace(',', '.'));
  if (Number.isNaN(parsed)) return null;
  return Number(parsed.toFixed(2));
}

function mergeObjectArray(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    return value.reduce<Record<string, unknown>>((acc, item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.assign(acc, item as Record<string, unknown>);
      }
      return acc;
    }, {});
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
}

function cloneWithoutTranscription(raw: unknown, includeTranscription: boolean): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const clone = Array.isArray(raw) ? [...raw] : { ...(raw as Record<string, unknown>) };
  if (!includeTranscription) {
    delete (clone as Record<string, unknown>).TRANSCRIPCION;
    delete (clone as Record<string, unknown>).Transcripcion;
    delete (clone as Record<string, unknown>).transcripcion;
  }
  return clone;
}

export function normalizeEvaluation(raw: unknown): NormalizedEvaluation {
  if (raw === null || raw === undefined) {
    return {
      transcripcion: undefined,
      metrics: {},
      otrosCampos: {},
      categories: {},
      raw,
      hasData: false,
    };
  }

  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        transcripcion: undefined,
        metrics: {},
        otrosCampos: {},
        categories: {},
        raw,
        hasData: raw.trim().length > 0,
      };
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      transcripcion: undefined,
      metrics: {},
      otrosCampos: {},
      categories: {},
      raw: parsed,
      hasData: false,
    };
  }

  const sanitized = new Map<string, unknown>();
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    sanitized.set(sanitizeKey(key), parseJsonValue(value));
  }

  const metrics: NormalizedEvaluation['metrics'] = {};
  const metricValue = sanitized.get('precision_llamada');
  const boolCliente = sanitized.get('precision_error_critico_cliente') ?? sanitized.get('precision_error_critico_usuario_final');
  const boolNegocio = sanitized.get('precision_error_critico_negocio');
  const boolCumplimiento = sanitized.get('precision_error_critico_cumplimiento');
  const boolNoCritico = sanitized.get('precision_error_no_critico');

  const precisionValue = toNumber(metricValue);
  if (precisionValue !== null) metrics.precision_llamada = precisionValue;

  const clienteValue = toBoolean(boolCliente);
  if (clienteValue !== null) metrics.precision_error_critico_cliente = clienteValue;

  const negocioValue = toBoolean(boolNegocio);
  if (negocioValue !== null) metrics.precision_error_critico_negocio = negocioValue;

  const cumplimientoValue = toBoolean(boolCumplimiento);
  if (cumplimientoValue !== null) metrics.precision_error_critico_cumplimiento = cumplimientoValue;

  const noCriticoValue = toBoolean(boolNoCritico);
  if (noCriticoValue !== null) metrics.precision_error_no_critico = noCriticoValue;

  const transcriptionCandidate = sanitized.get('transcripcion') ?? sanitized.get('transcription');
  const transcripcion = typeof transcriptionCandidate === 'string' ? transcriptionCandidate : undefined;

  const otrosCampos = mergeObjectArray(sanitized.get('otros_campos'));

  const categoryAliases: Record<string, string[]> = {
    error_no_critico: ['error_no_critico'],
    error_critico_cliente: ['error_critico_de_usuario_final', 'error_critico_usuario_final', 'error_critico_de_cliente'],
    error_critico_negocio: ['error_critico_de_negocio'],
    error_critico_cumplimiento: ['error_critico_de_cumplimiento'],
  };

  const categories: Record<string, unknown> = {};
  for (const [normalizedKey, aliases] of Object.entries(categoryAliases)) {
    for (const alias of aliases) {
      if (sanitized.has(alias)) {
        const value = sanitized.get(alias);
        if (value !== undefined && value !== null)
          categories[normalizedKey] = value;
        break;
      }
    }
  }

  const hasMetrics = Object.keys(metrics).length > 0;
  const hasOtros = Object.keys(otrosCampos).length > 0;
  const hasCategories = Object.keys(categories).length > 0;
  const hasTranscripcion = !!(transcripcion && transcripcion.trim().length > 0);

  return {
    transcripcion,
    metrics,
    otrosCampos,
    categories,
    raw: parsed,
    hasData: hasMetrics || hasOtros || hasCategories || hasTranscripcion,
  };
}

export interface BuildEvaluationContextOptions {
  includeTranscription?: boolean;
  transcriptionLimit?: number;
}

export interface EvaluationContextItem {
  id: string;
  dataset?: string;
  evaluation: NormalizedEvaluation;
}

export function buildEvaluationContext(
  items: EvaluationContextItem[],
  options: BuildEvaluationContextOptions = {}
): string {
  if (!items.length) return '';

  const { includeTranscription = false, transcriptionLimit = 1600 } = options;

  return items
    .map(({ id, dataset, evaluation }) => {
      const lines: string[] = ['---', `ID: ${id}`];
      if (dataset) lines.push(`Dataset: ${dataset}`);

      const payload: Record<string, unknown> = {};
      if (Object.keys(evaluation.metrics).length) payload.metricas = evaluation.metrics;
      if (Object.keys(evaluation.otrosCampos).length) payload.otros_campos = evaluation.otrosCampos;
      if (Object.keys(evaluation.categories).length) payload.hallazgos = evaluation.categories;

      if (includeTranscription && evaluation.transcripcion) {
        const text = evaluation.transcripcion;
        payload.transcripcion = text.length > transcriptionLimit ? `${text.slice(0, transcriptionLimit)} …` : text;
      }

      if (!Object.keys(payload).length) {
        payload.evaluacion = cloneWithoutTranscription(evaluation.raw, includeTranscription);
      }

      lines.push(`Evaluación: ${JSON.stringify(payload, null, 2)}`);
      lines.push('---');
      return lines.join('\n');
    })
    .join('\n');
}
