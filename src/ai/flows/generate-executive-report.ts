'use server';

/**
 * @fileOverview Generates a comprehensive executive report from call data, answering predefined questions to provide strategic insights into call center performance.
 *
 * - generateExecutiveReport - A function that generates the executive report.
 * - GenerateExecutiveReportInput - The input type for the generateExecutiveReport function.
 * - GenerateExecutiveReportOutput - The return type for the generateExecutiveReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExecutiveReportInputSchema = z.object({
  sourceName: z.string().describe('The name of the data source for the report.'),
  reportContext: z.string().describe('The context of the call evaluations for the report.'),
  questions: z.array(z.string()).describe('A list of predefined questions to answer in the report.'),
});
export type GenerateExecutiveReportInput = z.infer<typeof GenerateExecutiveReportInputSchema>;

const GenerateExecutiveReportOutputSchema = z.string().describe('The generated executive report.');
export type GenerateExecutiveReportOutput = z.infer<typeof GenerateExecutiveReportOutputSchema>;

export async function generateExecutiveReport(input: GenerateExecutiveReportInput): Promise<GenerateExecutiveReportOutput> {
  return generateExecutiveReportFlow(input);
}

const generateExecutiveReportPrompt = ai.definePrompt({
  name: 'generateExecutiveReportPrompt',
  input: {schema: GenerateExecutiveReportInputSchema},
  output: {schema: GenerateExecutiveReportOutputSchema},
  prompt: `
    Rol y objetivo:
    Eres un **Analista Estratégico Senior de Experiencia del Cliente (CX)**. Debes generar un informe ejecutivo con hallazgos y recomendaciones accionables basándote SOLO en las evaluaciones de llamada del dataset '{sourceName}'.

    Formato del contexto:
    DATASET: <nombre> REGISTROS: <n>
    Luego bloques separados por --- con:
    ID: <id_llamada_procesada>
    otros_campos: { ... pares clave/valor relevantes }

    Contexto:
    ---
    {{{reportContext}}}
    ---

    Reglas estrictas:
    1) No inventes campos que no aparezcan en otros_campos.
    2) Si faltan datos para responder algo, escribe exactamente: "No hay información suficiente en los registros para responder con precisión." y agrega solo fragmentos parciales útiles si existen (IDs, claves presentes).
    3) Usa únicamente la evidencia disponible en el contexto.
    4) Formato de salida en Markdown válido con tablas GFM cuando corresponda.
    5) Evita repetir JSON literal completo; sintetiza claves relevantes.

    Estructura obligatoria del informe (Markdown):
    1. **Resumen Ejecutivo**: 3–4 hallazgos críticos y una recomendación principal.
    2. **Análisis Detallado por Pregunta**:
       - Responde cada pregunta listada abajo con viñetas y, cuando sea posible, cuantificaciones apoyadas en el contexto.
    3. **Tabla de Hallazgos y Recomendaciones** (Markdown): columnas "Hallazgo Clave" | "Impacto Potencial (Cliente/Negocio)" | "Recomendación Estratégica".

    Preguntas a responder en el análisis detallado:
    {{#each questions}}
    - {{{this}}}
    {{/each}}

    Genera el informe directamente, sin preámbulos innecesarios.
  `,
});

const generateExecutiveReportFlow = ai.defineFlow(
  {
    name: 'generateExecutiveReportFlow',
    inputSchema: GenerateExecutiveReportInputSchema,
    outputSchema: GenerateExecutiveReportOutputSchema,
  },
  async input => {
    const {output} = await generateExecutiveReportPrompt(input);
    if (typeof output === 'string' && output.trim().length > 0) {
      return output;
    }
    // Fallback seguro para cumplir el esquema de salida en caso de respuesta vacía
    return '## Informe no disponible\n\nNo se pudo generar contenido del informe en este intento. Por favor, vuelve a intentarlo con un conjunto de registros diferente o ajusta las preguntas.';
  }
);
