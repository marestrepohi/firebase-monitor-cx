
'use server';

import { answerQuestion, type AnswerQuestionOutput } from '@/ai/flows/ai-powered-question-answering';
import { generateExecutiveReport, type GenerateExecutiveReportOutput } from '@/ai/flows/generate-executive-report';
import { analyzeSentimentTrends, type SentimentAnalysisInput, type SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';
import { QUESTIONS_FOR_REPORTS, DATASET_CONFIG } from '@/lib/constants';
import fs from 'node:fs/promises';
import path from 'node:path';

// Historial en memoria (se reinicia en cada cold start del serverless/runtime)
let chatHistory: { role: 'user' | 'assistant'; content: string }[] = [];
import { Storage } from '@google-cloud/storage';
import { VertexAI } from '@google-cloud/vertexai';

/**
 * Answers a user's question based on the provided evaluation context.
 */
export async function getChatResponse(
  question: string,
  opts: { datasetName?: string; limit?: number; rawContext?: string; reset?: boolean }
): Promise<AnswerQuestionOutput> {
  try {
    let evaluationContext = opts.rawContext || '';
    if (opts.reset) chatHistory = [];
    // Si se provee datasetName reconstruimos el contexto enriquecido cuando no se pasa rawContext
    if (!evaluationContext && opts.datasetName) {
      const fileName = DATASET_CONFIG[opts.datasetName];
      if (fileName) {
        try {
          const jsonPath = path.join(process.cwd(), 'public', fileName);
          const fileRaw = await fs.readFile(jsonPath, 'utf-8');
          const data: any[] = JSON.parse(fileRaw);
          // Tomar todos los registros, sin filtrar por 'error', como en Auditbot
          const limit = Math.min(opts.limit ?? 200, data.length);
          const limited = data.slice(0, limit);
          // Parse y extracción únicamente de campos requeridos
          const blocks: string[] = [];
          for (const call of limited) {
            let parsed: any = {};
            // Priorizar evaluacion_llamada; _raw no se usa para el contexto del informe/chat
            const raw = call.evaluacion_llamada;
            if (typeof raw === 'string') { try { parsed = JSON.parse(raw); } catch {} }
            else if (raw && typeof raw === 'object') { parsed = raw; }
            const otros = parsed && parsed.otros_campos ? parsed.otros_campos : {};
            blocks.push(`ID: ${call.id_llamada_procesada}\notros_campos: ${JSON.stringify(otros)}`);
          }
          evaluationContext = `DATASET: ${opts.datasetName} REGISTROS: ${limited.length}\n` + blocks.join('\n---\n');
        } catch (e) {
          console.warn('No se pudo cargar dataset para contexto Auditbot', e);
        }
      }
    }
      // Incluir historial de conversación reciente (últimos 6 turnos) recortado
      const historyFragment = chatHistory.slice(-12).map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join('\n');
      if (historyFragment) {
        evaluationContext = `${historyFragment}\n---\n${evaluationContext}`.trim();
      }
      if (!evaluationContext) {
        evaluationContext = 'No hay evaluaciones estructuradas disponibles.';
      }
      chatHistory.push({ role: 'user', content: question });
    const result = await answerQuestion({ question, evaluationContext });
      chatHistory.push({ role: 'assistant', content: result.answer });
    return result;
  } catch (error) {
    console.error('Error in getChatResponse:', error);
    return { answer: 'Lo siento, ocurrió un error al procesar tu pregunta. Por favor, intenta de nuevo.' };
  }
}

/**
 * Generates an executive report based on the provided context.
 */
export async function getExecutiveReport(
  reportContext: string,
  datasetName?: string,
  questions?: string[],
): Promise<GenerateExecutiveReportOutput> {
  const sourceName = datasetName || 'Cobranzas Call';
  const isTransientError = (e: any) => {
    const status = (e && (e.status || e.code)) ?? undefined;
    const msg = (e && (e.message || e.originalMessage || String(e)))?.toString().toLowerCase?.() || '';
    return (
      status === 503 ||
      /503|service unavailable|overloaded|deadline|unavailable|rate|quota/.test(msg)
    );
  };
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const payload = {
    sourceName,
    reportContext,
    questions: (questions && questions.length > 0) ? questions : QUESTIONS_FOR_REPORTS,
  };

  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await generateExecutiveReport(payload);
      return result;
    } catch (error) {
      const last = attempt === MAX_ATTEMPTS;
      if (!last && isTransientError(error)) {
        const backoff = 800 * Math.pow(2, attempt - 1);
        console.warn(`getExecutiveReport transient error (attempt ${attempt}/${MAX_ATTEMPTS}). Retrying in ${backoff}ms...`, error);
        await delay(backoff);
        continue;
      }
      console.error('Error in getExecutiveReport:', error);
      return `## Error al Generar el Informe\n\nEl servicio de modelo se encuentra temporalmente no disponible o ocurrió un error. Por favor, intenta nuevamente en unos momentos.\n\n**Detalles:** ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  // Fallback imposible de alcanzar, pero requerido por TS
  return '## Error al Generar el Informe\n\nNo se pudo generar el informe.';
}

/**
 * Analyzes and aggregates sentiment trends from call details.
 */
export async function getSentimentAnalysis(
  input: SentimentAnalysisInput
): Promise<SentimentAnalysisOutput> {
  try {
    const result = await analyzeSentimentTrends(input);
    return result;
  } catch (error) {
    console.error('Error in getSentimentAnalysis:', error);
    // Return a default error state
    return {
      positiveSentimentCount: 0,
      negativeSentimentCount: 0,
      neutralSentimentCount: 0,
      overallSentimentTrend: 'No se pudo analizar el sentimiento debido a un error.',
    };
  }
}

/**
 * Fetches an audio file from Google Cloud Storage and returns it as a data URI.
 * @param gcsUri The GS URI of the audio file (e.g., 'gs://bucket-name/audio.mp3').
 * @returns A data URI string for the audio, or null if an error occurs.
 */
export async function getAudioUrl(gcsUri: string): Promise<string | null> {
  try {
    const match = gcsUri.match(/gs:\/\/([^\/]+)\/(.+)/);
    if (!match) {
      throw new Error('Invalid GCS URI format.');
    }

    const [, bucketName, blobName] = match;
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(blobName);

    const [exists] = await file.exists();
    if (!exists) {
        console.warn(`File not found in GCS: ${gcsUri}`);
        return null;
    }

    const [buffer] = await file.download();
    const audioData = buffer.toString('base64');
    
    let mimeType = 'audio/mpeg'; // Default to mp3
    if (blobName.endsWith('.wav')) {
      mimeType = 'audio/wav';
    } else if (blobName.endsWith('.ogg')) {
      mimeType = 'audio/ogg';
    }
    
    return `data:${mimeType};base64,${audioData}`;

  } catch (error) {
    console.error(`Failed to fetch audio from GCS: ${gcsUri}`, error);
    return null;
  }
}

export async function transcribeAudio(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file uploaded.");
  }

  const storage = new Storage();
  const bucketName = "augusta-bbog-dev-sandbox";
  const filePath = `casos-uso/monitor-cobranzas/cobranzas-transcripcion/${file.name}`;
  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(filePath);

  const buffer = Buffer.from(await file.arrayBuffer());
  await blob.save(buffer, {
    metadata: {
      contentType: file.type,
    },
  });

  const uri = `gs://${bucketName}/${filePath}`;
  const prompt = `Rol: Eres un sistema de transcripción de alta fidelidad, especializado en entornos de call center complejos. Actúas como un oído entrenado, capaz de discernir entre hablantes humanos, sistemas automáticos y ruidos relevantes.  Tarea: Generar una transcripción y diarización ultra precisa del audio proporcionado, siguiendo estrictamente el protocolo de etiquetado definido, con formato de timecode.   ### Protocolo de Transcripción Detallado ###  1. Identificación de Hablantes (Etiquetas obligatorias):  Usa solo las siguientes etiquetas al inicio de cada línea:  - Agente:→ Empleado del call center.  -Cliente:→ Persona que recibe o realiza la llamada.  -Sistema:→ Mensajes automáticos, música de espera, o voces del sistema telefónico.  2. Eventos de Audio y Ruido (Detección selectiva):  Tu foco es capturar únicamente los elementos que sean relevantes para la interacción principal.  Incluye los siguientes eventos usando corchetes[]:  - [silencio prolongado]:  - Este marcador solo debe usarse cuando exista un silencio real, continuo y no justificado de al menos 20 segundos.  - NO marques pausas normales entre frases, respiraciones, búsquedas breves de información, o espacios de menos de 20 segundos.  - Muchos sistemas cometen el error de etiquetar como silencio espacios naturales del habla: tú NO debes cometer ese error.  - Si tienes duda sobre si fue un silencio real y prolongado, no lo marques.  - [suspiro], [sollozo], [risa], [tos]: Reacciones físicas o emocionales audibles. - [tecleo de computador]: Solo si es evidente y relevante. - [ininteligible]: Cuando una palabra o frase no es comprensible. - [conversaciones de fondo]: Si hay voces audibles que claramente no son parte de la conversación principal. - [transmite a encuesta]: Si el agente lo indica explícitamente. - [superposición de voces]: Cuando hay cruce simultáneo que impide entender lo dicho.  NO INCLUYAS:  - Ruidos lejanos o irrelevantes (tráfico, ambiente de oficina). - Conversaciones de fondo si no son comprensibles o no interfieren en la conversación. - Música o sonidos ambientales leves.   ### 3. Reglas de Formato de Salida (Obligatorio):  - Cada línea debe comenzar con el timecodeentre corchetes[MM:SS], seguido de la etiqueta (Agente:, Cliente:, Sistema:), un espacio y el texto. - La transcripción debe ser literal, palabra por palabra, en español colombiano. - No utilices formato Markdown. - No incluyas resúmenes ni explicaciones. - NO transcribas contenido de personas de fondo. Si se escucha gente hablando, solo indica [conversaciones de fondo]si es claramente audible, sin incluir lo que dicen. - Si la llamada termina abruptly sin despedida del agente, asume que el cliente colgó.   ### Formato Esperado (Ejemplo literal):    ### Formato Esperado (Ejemplo literal) ###  [00:01] Agente: Buenos días, le saluda Carlos del Banco de Bogotá. ¿Hablo con la señora Ana? [00:04] Cliente: Sí, con ella. [00:07] Agente: Señora Ana, el motivo de mi llamada es sobre su tarjeta de crédito. Permítame un momento mientras valido la información. [00:11] Agente: [tecleo de computador] [00:15] Sistema: Su llamada es importante para nosotros. Gracias por su paciencia. [música de espera suave] [00:20] Cliente: [suspiro] Ok... [00:25] [conversaciones de fondo] [00:28] Agente: Gracias por la espera, señora Ana. Verifico que presenta una mora de... [00:32] [superposición de voces] [00:35] Cliente: Eh... sí, es que he tenido algunos problemas económicos. [00:41] Agente: [transmite a encuesta] La remito a una breve encuesta...  El audio corresponde a una llamada de cobranzas del Banco de Bogotá. Procede ahora con la transcripción del audio adjunto, aplicando rigurosamente las reglas anteriores.  Recuerda: marcar incorrectamente un silencio cuando no lo hay es un error crítico. Solo marca silencios prolongados reales de más de 20 segundos.`;
  
  const vertexAI = new VertexAI({ project: process.env.GOOGLE_CLOUD_PROJECT || '', location: 'us-central1' });
  const model = 'gemini-1.5-pro-latest';

  const generativeModel = vertexAI.getGenerativeModel({ model });

  const request = {
    contents: [{
        role: 'user',
        parts: [
            { fileData: { mimeType: file.type, fileUri: uri } },
            { text: prompt }
        ]
    }],
    generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.6,
        topP: 0.99,
        responseMimeType: "text/plain",
    }
  };

  try {
    const resp = await generativeModel.generateContent(request);
    if (resp.response.candidates && resp.response.candidates.length > 0) {
        const content = resp.response.candidates[0].content;
        if (content && content.parts && content.parts.length > 0) {
            return content.parts[0].text || "";
        }
    }
    throw new Error("No se recibió una respuesta válida del modelo de IA.");
  } catch (error) {
    console.error('Error during Vertex AI generateContent:', error);
    throw new Error('Error al conectar con el modelo de IA en Vertex AI. Verifica la configuración y permisos.');
  } finally {
    try {
      await blob.delete();
    } catch (error) {
      console.error('Failed to delete file from GCS:', error);
    }
  }
}
