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
        **Rol y Objetivo:**
        Assume the role of a **Senior Strategic Analyst of Customer Experience (CX)**. Your objective is not just to answer questions, but to generate an executive report that reveals deep and actionable insights for the bank's management. The analysis should be based ONLY on the call evaluations from the '{sourceName}' dataset provided below.

        **Context of Analysis (Call Evaluations from '{sourceName}'):**
        ---
        {{{reportContext}}}
        ---

        **Mandatory Output Format:**
        You must structure your response following this exact format:

        1.  **Executive Summary:**
            *   An initial paragraph summarizing the 3-4 most critical findings and the main strategic recommendation. Designed so that a director can understand the situation in 60 seconds.

        2.  **Detailed Analysis by Question:**
            *   For each of the questions listed below, provide a detailed answer.
            *   Use bullet points to break down the key points of each answer.

        3.  **Table of Insights and Strategic Recommendations:**
            *   Create a table in Markdown format with three columns: \"Key Finding\", \"Potential Impact (Client/Business)\", and \"Strategic Recommendation\".
            *   In this table, summarize the most important problems or opportunities and suggest concrete actions that management could consider.

        **Analysis Instructions:**
        *   **Depth and Quantification:** Do not limit yourself to superficial answers. Whenever possible, quantify the findings (e.g. \"Competitor X was mentioned in 25% of relevant cases\", \"The main objection, 'high costs', appears in approximately 1 in 3 interactions on this topic\").
        *   **Use of Evidence:** Support your claims with concrete examples or anonymous textual quotes extracted from the context to give credibility to your findings.
        *   **Strategic Vision:** When formulating recommendations, think about the \"why\". What business strategy (retention, acquisition, operational efficiency, product improvement) does your recommendation support?
        *   **Clarity and Format:** Use **bold** to highlight key concepts. The table should be clear and easy to read.
        *   **Principle of Reality:** If the information in the context is not sufficient to answer a question or to generate an insight, explicitly state it as: \"There is not enough data in the context to determine...\". **DO NOT INVENT INFORMATION.**

        **Questions to Answer in the Detailed Analysis Section:**
        {{#each questions}}
        - {{{this}}}
        {{/each}}

        **START THE REPORT NOW.**
        **Do not generate previous messages like:**
        Of course, here is the executive report as a Senior Strategic Analyst of Customer Experience.
        Executive Report on Customer Experience: Analysis of Retention Calls
        To: Executive Management From: Senior Strategic Analyst of Customer Experience (CX) Date: October 26, 2023 Subject: Critical Findings and Strategic Recommendations of the Retention Process
        To: Executive Management From: Senior Strategic Analyst of Customer Experience (CX) Subject: Critical Findings and Strategic Recommendations Based on Call Evaluations


        The idea is to respond directly to the report format without introductory messages.
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
    return output!;
  }
);
