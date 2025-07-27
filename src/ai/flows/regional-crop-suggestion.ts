
'use server';
/**
 * @fileOverview A flow for suggesting crops based on the user's geographical location.
 *
 * - getRegionalCrops - A function that suggests crops for a given latitude and longitude.
 * - RegionalCropSuggestionInput - The input type for the getRegionalCrops function.
 * - RegionalCropSuggestionOutput - The return type for the getRegionalCrops function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegionalCropSuggestionInputSchema = z.object({
  latitude: z.number().describe('The latitude of the user\'s location.'),
  longitude: z.number().describe('The longitude of the user\'s location.'),
});
export type RegionalCropSuggestionInput = z.infer<typeof RegionalCropSuggestionInputSchema>;


const CropSchema = z.object({
    id: z.string().describe('A unique ID for the crop, in lowercase snake_case format (e.g., "paddy_rice").'),
    label: z.string().describe('The display name of the crop (e.g., "Paddy Rice").'),
});

const RegionalCropSuggestionOutputSchema = z.object({
  crops: z.array(CropSchema).describe('An array of crop objects suitable for the given location.'),
});
export type RegionalCropSuggestionOutput = z.infer<typeof RegionalCropSuggestionOutputSchema>;


export async function getRegionalCrops(
  input: RegionalCropSuggestionInput
): Promise<RegionalCropSuggestionOutput> {
  return regionalCropSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regionalCropSuggestionPrompt',
  input: {schema: RegionalCropSuggestionInputSchema},
  output: {schema: RegionalCropSuggestionOutputSchema},
  prompt: `You are an agricultural expert. Based on the provided latitude and longitude, list the 8 most common and suitable crops for that region.
  
  Latitude: {{{latitude}}}
  Longitude: {{{longitude}}}

  For each crop, you must provide:
  - A unique ID in lowercase snake_case format (e.g., "paddy_rice", "sugar_cane", "soy_bean").
  - A short, user-friendly display label (e.g., "Paddy Rice").
  
  Return the response in the specified JSON format.`,
});


const regionalCropSuggestionFlow = ai.defineFlow(
  {
    name: 'regionalCropSuggestionFlow',
    inputSchema: RegionalCropSuggestionInputSchema,
    outputSchema: RegionalCropSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('Failed to get crop suggestions.');
    }
    return output;
  }
);
