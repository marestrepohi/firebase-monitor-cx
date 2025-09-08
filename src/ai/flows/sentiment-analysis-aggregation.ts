'use server';

/**
 * @fileOverview Aggregates customer sentiment trends from call details.
 *
 * - analyzeSentimentTrends - A function that aggregates sentiment trends from call details.
 * - SentimentAnalysisInput - The input type for the analyzeSentimentTrends function.
 * - SentimentAnalysisOutput - The return type for the analyzeSentimentTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SentimentAnalysisInputSchema = z.object({
  callDetails: z.array(
    z.object({
      id_llamada_procesada: z.string().describe('Call ID'),
      evaluacion_llamada: z.string().describe('Call evaluation details'),
    })
  ).describe('Array of call details objects.'),
});
export type SentimentAnalysisInput = z.infer<typeof SentimentAnalysisInputSchema>;

const SentimentAnalysisOutputSchema = z.object({
  positiveSentimentCount: z.number().describe('Number of calls with positive sentiment.'),
  negativeSentimentCount: z.number().describe('Number of calls with negative sentiment.'),
  neutralSentimentCount: z.number().describe('Number of calls with neutral sentiment.'),
  overallSentimentTrend: z.string().describe('Overall sentiment trend description.'),
});
export type SentimentAnalysisOutput = z.infer<typeof SentimentAnalysisOutputSchema>;

export async function analyzeSentimentTrends(input: SentimentAnalysisInput): Promise<SentimentAnalysisOutput> {
  return analyzeSentimentTrendsFlow(input);
}

const sentimentAnalysisPrompt = ai.definePrompt({
  name: 'sentimentAnalysisPrompt',
  input: {schema: SentimentAnalysisInputSchema},
  output: {schema: SentimentAnalysisOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing customer sentiment trends from call evaluation details.

You will receive an array of call details, and you need to analyze the sentiment (positive, negative, or neutral) expressed in each call based on the provided \"evaluacion_llamada\" field.

Based on the sentiment analysis of individual calls, generate aggregated statistics, including the number of calls with positive sentiment, negative sentiment, and neutral sentiment.

Finally, provide an overall sentiment trend description based on the aggregated statistics.

Here are the call details:

{{#each callDetails}}
---\nCall ID: {{this.id_llamada_procesada}}\nEvaluation: {{this.evaluacion_llamada}}\n---\n{{/each}}

Ensure that the \"overallSentimentTrend\" field provides a concise and informative description of the overall sentiment trend, highlighting any significant patterns or insights.
`,
});

const analyzeSentimentTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentTrendsFlow',
    inputSchema: SentimentAnalysisInputSchema,
    outputSchema: SentimentAnalysisOutputSchema,
  },
  async input => {
    const {output} = await sentimentAnalysisPrompt(input);
    return output!;
  }
);
