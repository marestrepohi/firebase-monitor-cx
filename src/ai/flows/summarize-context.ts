"use server";

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeContextInput = z.object({
  context: z.string().describe('Texto largo de evaluaciones de llamadas.'),
  maxChars: z.number().default(4000).describe('Longitud objetivo aproximada del resumen.'),
});
export type SummarizeContextInput = z.infer<typeof SummarizeContextInput>;

const SummarizeContextOutput = z.object({
  summary: z.string().describe('Resumen condensado del contexto manteniendo señales clave.'),
});
export type SummarizeContextOutput = z.infer<typeof SummarizeContextOutput>;

const summarizePrompt = ai.definePrompt({
  name: 'summarizeContextPrompt',
  input: { schema: SummarizeContextInput },
  output: { schema: SummarizeContextOutput },
  prompt: `Actúa como un analista de datos de calidad de llamadas. Resume el siguiente contexto conservando:
- IDs representativos (máx 5 ejemplos)
- Métricas numéricas si aparecen (precisión, porcentajes, sentimientos)
- Patrones repetidos (citas breves si existen)
- Indica si faltan evaluaciones estructuradas.
No inventes información. Longitud objetivo: {{{maxChars}}} caracteres.
---
{{{context}}}
---
Devuelve solo el resumen.`,
});

export const summarizeContextFlow = ai.defineFlow({
  name: 'summarizeContextFlow',
  inputSchema: SummarizeContextInput,
  outputSchema: SummarizeContextOutput,
}, async (input) => {
  const { output } = await summarizePrompt(input);
  return output!;
});

export async function summarizeContext(context: string, maxChars = 4000): Promise<string> {
  const { summary } = await summarizeContextFlow({ context, maxChars });
  return summary;
}
