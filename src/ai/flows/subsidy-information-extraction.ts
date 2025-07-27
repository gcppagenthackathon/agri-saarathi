'use server';
/**
 * @fileOverview A flow for extracting and summarizing agricultural subsidy information.
 *
 * - getSubsidyInformation - A function that handles the subsidy information extraction process.
 * - GetSubsidyInformationInput - The input type for the getSubsidyInformation function.
 * - GetSubsidyInformationOutput - The return type for the getSubsidyInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetSubsidyInformationInputSchema = z.object({
  query: z.string().describe('The question about agricultural subsidies.'),
});
export type GetSubsidyInformationInput = z.infer<
  typeof GetSubsidyInformationInputSchema
>;

const GetSubsidyInformationOutputSchema = z.object({
  answer: z.string().describe('The answer to the subsidy question.'),
});
export type GetSubsidyInformationOutput = z.infer<
  typeof GetSubsidyInformationOutputSchema
>;

export async function getSubsidyInformation(
  input: GetSubsidyInformationInput
): Promise<GetSubsidyInformationOutput> {
  return subsidyInformationExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'subsidyInformationExtractionPrompt',
  input: {schema: GetSubsidyInformationInputSchema},
  output: {schema: GetSubsidyInformationOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an expert in agricultural subsidies provided by the government.

  A farmer will ask a question about subsidies. Your task is to use your knowledge to find the most accurate and up-to-date information to answer the question.

  When providing the answer:
  - Be clear and concise.
  - If you know of a specific government scheme, mention its name.
  - If there are eligibility criteria, list the main ones.
  - If you have information about the application process, briefly describe it.

  Question: {{{query}}}`,
});

const subsidyInformationExtractionFlow = ai.defineFlow(
  {
    name: 'subsidyInformationExtractionFlow',
    inputSchema: GetSubsidyInformationInputSchema,
    outputSchema: GetSubsidyInformationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to get subsidy information from the model.');
    }
    return output;
  }
);
