import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Use a more stable model for now; allow override via env var GOOGLEAI_MODEL
const defaultModel = process.env.GOOGLEAI_MODEL || 'googleai/gemini-2.5-flash';
export const ai = genkit({
  plugins: [googleAI()],
  model: defaultModel,
});
