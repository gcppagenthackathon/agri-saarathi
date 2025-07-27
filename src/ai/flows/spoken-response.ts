
'use server';
/**
 * @fileOverview A flow for generating a spoken response to a user query.
 *
 * - getSpokenResponse - Takes a query, gets an answer, and converts it to speech.
 * - SpokenResponseInput - The input type for the getSpokenResponse function.
 * - SpokenResponseOutput - The return type for the getSpokenResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { textToSpeech } from './text-to-speech';
import { summarizeText } from './summarize-text';

const SpokenResponseInputSchema = z.string().describe('The user\'s spoken query.');
export type SpokenResponseInput = z.infer<typeof SpokenResponseInputSchema>;

const SpokenResponseOutputSchema = z.object({
  spokenAnswer: z.string().describe('The audio data URI of the spoken answer.'),
  writtenAnswer: z.string().describe('The text version of the answer.'),
});
export type SpokenResponseOutput = z.infer<typeof SpokenResponseOutputSchema>;


export async function getSpokenResponse(
  input: SpokenResponseInput
): Promise<SpokenResponseOutput> {
  return spokenResponseFlow(input);
}

const answerPrompt = ai.definePrompt({
    name: 'answerPrompt',
    input: {schema: z.string()},
    output: {schema: z.string()},
    prompt: `You are a helpful AI assistant for farmers named AgriSaarathi. A farmer has asked you a question. Provide a clear and concise answer.

Question: "{{prompt}}"
`,
});


const spokenResponseFlow = ai.defineFlow(
  {
    name: 'spokenResponseFlow',
    inputSchema: SpokenResponseInputSchema,
    outputSchema: SpokenResponseOutputSchema,
  },
  async (query) => {
    // Get an answer from the LLM
    const { output: rawAnswer } = await answerPrompt(query);

    if (!rawAnswer) {
        throw new Error("Could not get an answer from the model.");
    }
    
    // Summarize the answer
    const { summary } = await summarizeText({ textToSummarize: rawAnswer });

    // Convert the summary to speech
    const { media } = await textToSpeech(summary);
    
    return {
      spokenAnswer: media,
      writtenAnswer: summary,
    };
  }
);
