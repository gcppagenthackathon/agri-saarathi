
'use server';
/**
 * @fileOverview A flow for providing plantation advice to farmers.
 *
 * - getPlantationAdvice - Provides a step-by-step planting guide.
 * - PlantationAdvisorInput - The input type for the getPlantationAdvice function.
 * - PlantationAdvisorOutput - The return type for the getPlantationAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlantationAdvisorInputSchema = z.object({
  cropName: z.string().describe('The name of the crop to be planted (e.g., "Tomato").'),
  cropVariety: z.string().describe('The specific variety of the crop (e.g., "Bangalore Tomato").'),
});
export type PlantationAdvisorInput = z.infer<typeof PlantationAdvisorInputSchema>;

const PlantationStepSchema = z.object({
    stepNumber: z.number().describe('The sequential number of the step.'),
    title: z.string().describe('A short title for the plantation step (e.g., "Field Cleaning").'),
    description: z.string().describe('A detailed description of the tasks involved in this step.'),
    videoUrl: z.string().url().describe('An example URL to a relevant YouTube video for this step.'),
});

const PlantationAdvisorOutputSchema = z.object({
  plantationSteps: z.array(PlantationStepSchema).describe('A list of step-by-step instructions for planting.'),
});
export type PlantationAdvisorOutput = z.infer<typeof PlantationAdvisorOutputSchema>;

export async function getPlantationAdvice(
  input: PlantationAdvisorInput
): Promise<PlantationAdvisorOutput | { error: string }> {
  try {
    const result = await plantationAdvisorFlow(input);
    return result;
  } catch (error: any) {
    // console.error(error);
    return { error: 'An unexpected error occurred in the plantation advisor flow.' };
  }
}

const prompt = ai.definePrompt({
  name: 'plantationAdvisorPrompt',
  input: {schema: PlantationAdvisorInputSchema},
  output: {schema: PlantationAdvisorOutputSchema},
  prompt: `You are an expert agronomist providing advice to a farmer. The farmer wants to plant {{cropVariety}} (a variety of {{cropName}}).

Your task is to generate a comprehensive, step-by-step plantation guide.
*   Create a detailed, step-by-step guide for planting {{cropVariety}}.
*   Include at least 5 key steps, covering the entire lifecycle from field preparation and sowing to continuous monitoring, cultivation, and pre-harvest activities.
*   For each step, provide a 'stepNumber', 'title', a detailed 'description' of the tasks, and a 'videoUrl'.
*   The 'videoUrl' should be a plausible YouTube search URL that would lead to a relevant instructional video. For example: 'https://www.youtube.com/results?search_query=how+to+prepare+soil+for+tomato+planting'. Make sure the URL is properly encoded.

Return the response in the specified JSON format.`,
});

const getFallbackData = (crop: string): PlantationAdvisorOutput => {
  const encodedCrop = encodeURIComponent(crop);
  return {
    plantationSteps: [
      {
        stepNumber: 1,
        title: 'Field Preparation',
        description: `Clear the field of all previous crop residues, weeds, and stones. This ensures a clean slate for your new ${crop} crop.`,
        videoUrl: `https://www.youtube.com/results?search_query=field+preparation+for+${encodedCrop}`,
      },
      {
        stepNumber: 2,
        title: 'Ploughing and Tilling',
        description: 'Plough the land 2-3 times to achieve a fine tilth. This improves soil aeration, water absorption, and root penetration.',
        videoUrl: `https://www.youtube.com/results?search_query=ploughing+for+${encodedCrop}`,
      },
      {
        stepNumber: 3,
        title: 'Soil Fertilization',
        description: 'Incorporate well-decomposed farmyard manure or compost into the soil to enrich its organic matter and nutrient content.',
        videoUrl: `https://www.youtube.com/results?search_query=soil+fertilization+for+${encodedCrop}`,
      },
      {
        stepNumber: 4,
        title: 'Seed Sowing or Transplanting',
        description: `Sow the ${crop} seeds or transplant seedlings at the recommended spacing and depth. Ensure proper moisture in the soil during this stage.`,
        videoUrl: `https://www.youtube.com/results?search_query=sowing+${encodedCrop}+seeds`,
      },
      {
        stepNumber: 5,
        title: 'Continuous Monitoring & Weeding',
        description: 'Regularly monitor the field for weeds, pests, and diseases. Perform weeding operations as necessary to prevent competition for nutrients and water.',
        videoUrl: `https://www.youtube.com/results?search_query=weeding+and+pest+control+for+${encodedCrop}`,
      },
       {
        stepNumber: 6,
        title: 'Pre-Harvest Assessment',
        description: 'About 1-2 weeks before the expected harvest date, assess the maturity and quality of the crop. Check for any signs of last-minute disease or pest infestation.',
        videoUrl: `https://www.youtube.com/results?search_query=crop+harvest+assessment+for+${encodedCrop}`,
      },
    ],
  };
};

const plantationAdvisorFlow = ai.defineFlow(
  {
    name: 'plantationAdvisorFlow',
    inputSchema: PlantationAdvisorInputSchema,
    outputSchema: PlantationAdvisorOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        if (!output || !output.plantationSteps || output.plantationSteps.length === 0) {
          throw new Error('No valid output from prompt.');
        }
        return output;
    } catch (error) {
        // Returning fallback data on error.
        return getFallbackData(input.cropName);
    }
  }
);
