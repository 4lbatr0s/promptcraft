export const GEMINI_MODEL = 'gemini-1.5-flash';
export const MISTRAL_MODEL = 'mistral-large-latest';
export const COHERE_MODEL = 'command';

export const PROVIDER_INFOS = {
  gemini: {
    name: 'gemini',
    displayName: 'Google Gemini',
    version: '1.5-flash',
    docs: 'https://ai.google.dev/gemini-api/docs',
    temperature: 0.1,
  },
  mistral: {
    name: 'mistral',
    displayName: 'Mistral AI',
    version: 'large-latest',
    docs: 'https://docs.mistral.ai/',
    temperature: 0.1,
  },
  cohere: {
    name: 'cohere',
    displayName: 'Cohere',
    version: 'command',
    docs: 'https://docs.cohere.com/',
    temperature: 0.1,
  },
}; 