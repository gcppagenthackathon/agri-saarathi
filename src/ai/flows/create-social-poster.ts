
'use server';
/**
 * @fileOverview A flow for generating a promotional poster for social media.
 *
 * - createSocialPoster - A function that returns a URL for a generated poster image.
 * - CreateSocialPosterInput - The input type for the createSocialPoster function.
 * - CreateSocialPosterOutput - The return type for the createSocialPoster function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateSocialPosterInputSchema = z.object({
  cropName: z.string().describe('The name of the crop to be featured in the poster.'),
});
export type CreateSocialPosterInput = z.infer<typeof CreateSocialPosterInputSchema>;


const CreateSocialPosterOutputSchema = z.object({
  imageUrl: z.string().url().describe('A data URI of the generated poster image.'),
});
export type CreateSocialPosterOutput = z.infer<typeof CreateSocialPosterOutputSchema>;


export async function createSocialPoster(
  input: CreateSocialPosterInput
): Promise<CreateSocialPosterOutput> {
  return createSocialPosterFlow(input);
}


const createSocialPosterFlow = ai.defineFlow(
  {
    name: 'createSocialPosterFlow',
    inputSchema: CreateSocialPosterInputSchema,
    outputSchema: CreateSocialPosterOutputSchema,
  },
  async ({ cropName }) => {
    
    const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Create an eye-catching promotional poster for a Facebook or Instagram post. The poster is for selling fresh "${cropName}". It must include the phone number "+91-9894312621" in a clear and readable way. The style should be vibrant, professional, and appealing to attract customers. The image should be in a square aspect ratio. Do not include any other text except the crop name and the phone number.`,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media.url) {
        throw new Error('Failed to generate poster image.');
    }
    
    return {
      imageUrl: media.url,
    };
  }
);
