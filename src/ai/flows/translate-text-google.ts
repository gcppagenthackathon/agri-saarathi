
'use server';
/**
 * @fileOverview A flow for translating text into different languages using the Google Cloud Translation API.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The ISO 639-1 code for the target language (e.g., "ta", "hi").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translationPrompt = ai.definePrompt({
    name: 'translationPrompt',
    input: {schema: TranslateTextInputSchema},
    output: {schema: TranslateTextOutputSchema},
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: `You are an expert translator. Translate the following text into the language specified by the target language code.
    
    Text to translate: "{{text}}"
    Target language code: "{{targetLanguage}}"
    
    Return ONLY the translated text in the specified JSON format.`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextGoogleFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    if (input.targetLanguage.toLowerCase() === 'en') {
      return { translatedText: input.text };
    }

    const { output } = await translationPrompt(input);
    if (!output) {
      throw new Error('Failed to get translation from the model.');
    }
    
    return { translatedText: output.translatedText };
  }
);

