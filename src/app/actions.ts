'use server';

import { answerQuestion, type AnswerQuestionOutput } from '@/ai/flows/ai-powered-question-answering';
import { generateExecutiveReport, type GenerateExecutiveReportOutput } from '@/ai/flows/generate-executive-report';
import { analyzeSentimentTrends, type SentimentAnalysisInput, type SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';
import { QUESTIONS_FOR_REPORTS } from '@/lib/constants';
import { Storage } from '@google-cloud/storage';
import { VertexAI } from '@google-cloud/vertexai';

/**
 * Answers a user's question based on the provided evaluation context.
 */
export async function getChatResponse(
  question: string,
  evaluationContext: string
): Promise<AnswerQuestionOutput> {
  try {
    const result = await answerQuestion({ question, evaluationContext });
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
): Promise<GenerateExecutiveReportOutput> {
    const sourceName = 'Cobranzas Call';
  try {
    const result = await generateExecutiveReport({
      sourceName,
      reportContext,
      questions: QUESTIONS_FOR_REPORTS,
    });
    return result;
  } catch (error) {
    console.error('Error in getExecutiveReport:', error);
    return `## Error al Generar el Informe\n\nNo se pudo completar la generación del informe debido a un error interno. Por favor, verifica la conexión y vuelve a intentarlo.\n\n**Detalles del error:** ${error instanceof Error ? error.message : String(error)}`;
  }
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
  const prompt = `Rol: Eres un sistema de transcripción de alta fidelidad, especializado en entornos de call center complejos. Actúas como un oído entrenado, capaz de discernir entre hablantes humanos, sistemas automáticos y ruidos relevantes.  Tarea: Generar una transcripción y diarización ultra precisa del audio proporcionado, siguiendo estrictamente el protocolo de etiquetado definido, con formato de timecode.   ### Protocolo de Transcripción Detallado ###  1. Identificación de Hablantes (Etiquetas obligatorias):  Usa solo las siguientes etiquetas al inicio de cada línea:  - Agente:→ Empleado del call center.  -Cliente:→ Persona que recibe o realiza la llamada.  -Sistema:→ Mensajes automáticos, música de espera, o voces del sistema telefónico.  2. Eventos de Audio y Ruido (Detección selectiva):  Tu foco es capturar únicamente los elementos que sean relevantes para la interacción principal.  Incluye los siguientes eventos usando corchetes[]:  - [silencio prolongado]:  - Este marcador solo debe usarse cuando exista un silencio real, continuo y no justificado de al menos 20 segundos.  - NO marques pausas normales entre frases, respiraciones, búsquedas breves de información, o espacios de menos de 20 segundos.  - Muchos sistemas cometen el error de etiquetar como silencio espacios naturales del habla: tú NO debes cometer ese error.  - Si tienes duda sobre si fue un silencio real y prolongado, no lo marques.  - [suspiro], [sollozo], [risa], [tos]: Reacciones físicas o emocionales audibles. - [tecleo de computador]: Solo si es evidente y relevante. - [ininteligible]: Cuando una palabra o frase no es comprensible. - [conversaciones de fondo]: Si hay voces audibles que claramente no son parte de la conversación principal. - [transmite a encuesta]: Si el agente lo indica explícitamente. - [superposición de voces]: Cuando hay cruce simultáneo que impide entender lo dicho.  NO INCLUYAS:  - Ruidos lejanos o irrelevantes (tráfico, ambiente de oficina). - Conversaciones de fondo si no son comprensibles o no interfieren en la conversación. - Música o sonidos ambientales leves.   ### 3. Reglas de Formato de Salida (Obligatorio):  - Cada línea debe comenzar con el timecodeentre corchetes[MM:SS], seguido de la etiqueta (Agente:, Cliente:, Sistema:), un espacio y el texto. - La transcripción debe ser literal, palabra por palabra, en español colombiano. - No utilices formato Markdown. - No incluyas resúmenes ni explicaciones. - NO transcribas contenido de personas de fondo. Si se escucha gente hablando, solo indica [conversaciones de fondo]si es claramente audible, sin incluir lo que dicen. - Si la llamada termina abruptamente sin despedida del agente, asume que el cliente colgó.   ### Formato Esperado (Ejemplo literal):    ### Formato Esperado (Ejemplo literal) ###  [00:01] Agente: Buenos días, le saluda Carlos del Banco de Bogotá. ¿Hablo con la señora Ana? [00:04] Cliente: Sí, con ella. [00:07] Agente: Señora Ana, el motivo de mi llamada es sobre su tarjeta de crédito. Permítame un momento mientras valido la información. [00:11] Agente: [tecleo de computador] [00:15] Sistema: Su llamada es importante para nosotros. Gracias por su paciencia. [música de espera suave] [00:20] Cliente: [suspiro] Ok... [00:25] [conversaciones de fondo] [00:28] Agente: Gracias por la espera, señora Ana. Verifico que presenta una mora de... [00:32] [superposición de voces] [00:35] Cliente: Eh... sí, es que he tenido algunos problemas económicos. [00:41] Agente: [transmite a encuesta] La remito a una breve encuesta...  El audio corresponde a una llamada de cobranzas del Banco de Bogotá. Procede ahora con la transcripción del audio adjunto, aplicando rigurosamente las reglas anteriores.  Recuerda: marcar incorrectamente un silencio cuando no lo hay es un error crítico. Solo marca silencios prolongados reales de más de 20 segundos.`;
  
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
