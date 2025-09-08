'use server';

import { answerQuestion, type AnswerQuestionOutput } from '@/ai/flows/ai-powered-question-answering';
import { generateExecutiveReport, type GenerateExecutiveReportOutput } from '@/ai/flows/generate-executive-report';
import { analyzeSentimentTrends, type SentimentAnalysisInput, type SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';
import { QUESTIONS_FOR_REPORTS } from '@/lib/constants';
import { Storage } from '@google-cloud/storage';

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
