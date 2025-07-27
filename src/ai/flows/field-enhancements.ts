
'use server';
/**
 * @fileOverview A flow for generating a banner image and value-added product suggestions for a crop.
 *
 * - getFieldEnhancements - A function that returns a banner image and product list.
 * - FieldEnhancementsInput - The input type for the getFieldEnhancements function.
 * - FieldEnhancementsOutput - The return type for the getFieldEnhancements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FieldEnhancementsInputSchema = z.object({
  cropName: z.string().describe('The name of the crop.'),
});
export type FieldEnhancementsInput = z.infer<typeof FieldEnhancementsInputSchema>;

const ProductSchema = z.object({
    name: z.string().describe('The name of the value-added product.'),
    description: z.string().describe('A brief description of the product.'),
});

const FieldEnhancementsOutputSchema = z.object({
  bannerImageUrl: z.string().url().describe('A data URI of the generated banner image for the field.'),
  valueAddedProducts: z.array(ProductSchema).describe('A list of value-added products.'),
});
export type FieldEnhancementsOutput = z.infer<typeof FieldEnhancementsOutputSchema>;


export async function getFieldEnhancements(
  input: FieldEnhancementsInput
): Promise<FieldEnhancementsOutput> {
  return fieldEnhancementsFlow(input);
}


const ProductsPromptOutputSchema = z.object({
    products: z.array(ProductSchema).describe('A list of value-added products.'),
});

const productsPrompt = ai.definePrompt({
    name: 'valueAddedProductsPrompt',
    input: {schema: FieldEnhancementsInputSchema},
    output: {schema: ProductsPromptOutputSchema},
    prompt: `You are an expert in agriculture and food processing. List exactly 5 value-added products that can be created from {{cropName}}. 
    For each product, provide a name and a short, compelling description.
    Return the response in the specified JSON format.`,
});


const fieldEnhancementsFlow = ai.defineFlow(
  {
    name: 'fieldEnhancementsFlow',
    inputSchema: FieldEnhancementsInputSchema,
    outputSchema: FieldEnhancementsOutputSchema,
  },
  async ({ cropName }) => {
    
    const [imageResult, productsResult] = await Promise.all([
        ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `A high-resolution, professional photograph of a lush ${cropName} field. The image should be cinematic, inspiring, and suitable for a banner.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        }),
        productsPrompt({ cropName })
    ]);

    const bannerImageUrl = imageResult.media.url;
    if (!bannerImageUrl) {
        throw new Error('Failed to generate banner image.');
    }

    const valueAddedProducts = productsResult.output?.products;
    if (!valueAddedProducts) {
        throw new Error('Failed to generate value-added products.');
    }
    
    return {
      bannerImageUrl,
      valueAddedProducts,
    };
  }
);
