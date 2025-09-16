import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Use the same model as Auditbot; allow override via env var GOOGLEAI_MODEL
const defaultModel = process.env.GOOGLEAI_MODEL || 'googleai/gemini-1.5-flash-latest';
export const ai = genkit({
  plugins: [googleAI()],
  model: defaultModel,
});
