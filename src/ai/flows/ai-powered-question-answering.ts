'use server';
/**
 * @fileOverview An AI-powered question answering flow for call data.
 *
 * - answerQuestion - A function that answers questions about call data.
 * - AnswerQuestionInput - The input type for the answerQuestion function.
 * - AnswerQuestionOutput - The return type for the answerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe('The question to answer about the call data.'),
  evaluationContext: z
    .string()
    .describe(
      'Context of previous evaluations, concatenated from call data records.'
    ),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the call data.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: AnswerQuestionInputSchema},
  output: {schema: AnswerQuestionOutputSchema},
  prompt: `Eres un analista de calidad de llamadas. Responde SOLO con la información del contexto y formatea la salida en Markdown. Usa negrillas para conceptos clave y listas cuando ayuden a la claridad.

Formato del contexto:
DATASET: <nombre> REGISTROS: <n>
Luego bloques separados por --- con:
ID: <id_llamada_procesada>
otros_campos: { ... pares clave/valor relevantes }

Contexto:
{{{evaluationContext}}}

Pregunta:
{{{question}}}

Reglas:
1. No inventes campos que no aparezcan en otros_campos.
2. Si se pide un análisis y faltan datos, indica exactamente: "No hay información suficiente en los registros para responder con precisión." pero añade cualquier fragmento parcial útil disponible (IDs relacionados, campos presentes) si existe.
3. Si se menciona un ID específico, prioriza ese bloque.
4. Responde máximo en ~6 líneas salvo que se pida detalle.
5. No repitas JSON literal completo; sintetiza claves relevantes.
6. Formato: Markdown válido (puedes usar **negritas**, listas con -, y tablas si hay métricas claras).

Respuesta:`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
