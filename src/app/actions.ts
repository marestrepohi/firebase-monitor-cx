'use server';

import { answerQuestion, type AnswerQuestionOutput } from '@/ai/flows/ai-powered-question-answering';
import { generateExecutiveReport, type GenerateExecutiveReportOutput } from '@/ai/flows/generate-executive-report';
import { analyzeSentimentTrends, type SentimentAnalysisInput, type SentimentAnalysisOutput } from '@/ai/flows/sentiment-analysis-aggregation';
import { QUESTIONS_FOR_REPORTS } from '@/lib/constants';

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
