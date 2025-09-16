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
    Actúa como un Analista Estratégico Senior de Experiencia del Cliente especializado en cobranzas bancarias.

    **CONTEXTO DE DATOS:**
    Fuente: {{{sourceName}}}
    {{{reportContext}}}

    **PREGUNTAS A RESPONDER:**
    {{#each questions}}
    - {{{this}}}
    {{/each}}

    **FORMATO DEL INFORME (Markdown OBLIGATORIO):**

    ## 📊 RESUMEN EJECUTIVO

    ### Hallazgos Clave
    - [Punto clave 1 extraído de los datos]
    - [Punto clave 2 extraído de los datos]
    - [Punto clave 3 extraído de los datos]

    ### Recomendaciones Prioritarias
    1. **[Recomendación 1 accionable y basada en hallazgos]**
    2. **[Recomendación 2 accionable y basada en hallazgos]**
    3. **[Recomendación 3 accionable y basada en hallazgos]**

    ## 📈 ANÁLISIS DETALLADO

    [A continuación, responde cada una de las preguntas listadas arriba. Para cada una, proporciona un análisis profundo, utilizando datos específicos y métricas del contexto. Estructura cada respuesta con claridad.]

    **INSTRUCCIONES ESTRICTAS:**
    - Usa **únicamente** los datos específicos proporcionados en el contexto. No inventes información.
    - Incluye métricas cuantificables (porcentajes, conteos, promedios) siempre que sea posible para respaldar tus afirmaciones.
    - Si para alguna pregunta no hay datos suficientes en el contexto para dar una respuesta precisa, indica claramente: "No hay información suficiente en los registros para responder con precisión."
    - La salida debe ser exclusivamente en formato Markdown.
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
