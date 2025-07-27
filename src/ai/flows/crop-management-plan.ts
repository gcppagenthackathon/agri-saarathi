
'use server';
/**
 * @fileOverview A flow for generating a crop management plan with images.
 *
 * - getCropManagementPlan - A function that returns fertilizer and disease management plans.
 * - CropManagementPlanInput - The input type for the getCropManagementPlan function.
 * - CropManagementPlanOutput - The return type for the getCropManagementPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropManagementPlanInputSchema = z.object({
  cropName: z.string().describe('The name of the crop.'),
});
export type CropManagementPlanInput = z.infer<typeof CropManagementPlanInputSchema>;

const StageChecklistSchema = z.object({
    stageName: z.string().describe('The name of the growth stage (e.g., "Vegetative Stage").'),
    description: z.string().describe('A brief description of what to do in this stage.'),
    checklist: z.array(z.string()).describe('A list of tasks or items for this stage.'),
    imageUrl: z.string().url().describe('A data URI of a relevant image for this stage.'),
});

const DiseaseInfoSchema = z.object({
    stageName: z.string().describe('The name of the growth stage when the disease might appear.'),
    diseaseName: z.string().describe('The name of the potential disease.'),
    symptoms: z.string().describe('A brief description of the disease symptoms.'),
    guidance: z.string().describe('Guidance on how to prevent or fix the issue.'),
    imageUrl: z.string().url().describe('A data URI of a relevant image for this disease.'),
});

const CropManagementPlanOutputSchema = z.object({
  fertilizerPlan: z.array(StageChecklistSchema).describe('A stage-wise fertilizer checklist with images.'),
  diseasePlan: z.array(DiseaseInfoSchema).describe('A stage-wise guide for potential diseases with images.'),
});
export type CropManagementPlanOutput = z.infer<typeof CropManagementPlanOutputSchema>;


export async function getCropManagementPlan(
  input: CropManagementPlanInput
): Promise<CropManagementPlanOutput> {
  return cropManagementPlanFlow(input);
}

const PromptPlanOutputSchema = z.object({
    fertilizerPlan: z.array(StageChecklistSchema.omit({imageUrl: true})),
    diseasePlan: z.array(DiseaseInfoSchema.omit({imageUrl: true})),
});

const prompt = ai.definePrompt({
    name: 'cropManagementPlanPrompt',
    input: {schema: CropManagementPlanInputSchema},
    output: {schema: PromptPlanOutputSchema},
    prompt: `You are an expert agronomist. Generate a detailed crop management plan for {{cropName}}.
    
    The plan should include two main sections:
    1. A stage-wise fertilizer checklist ("fertilizerPlan"). For each major growth stage, provide a name, a brief description, and a checklist of required fertilizers or nutrients.
    2. A stage-wise guide for potential diseases ("diseasePlan"). For each major growth stage, list common diseases that might attack the crop. For each disease, provide the name, common symptoms, and guidance for prevention and treatment.

    Provide a plan with at least 3 stages for both fertilizer and disease sections.
    Return the response in the specified JSON format. Do not include image URLs.`,
});


const cropManagementPlanFlow = ai.defineFlow(
  {
    name: 'cropManagementPlanFlow',
    inputSchema: CropManagementPlanInputSchema,
    outputSchema: CropManagementPlanOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate crop management plan.');
    }
    
    const fertilizerPlanWithImages = Promise.all(
        output.fertilizerPlan.map(async (stage) => {
            const {media} = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: `A clear, high-quality photograph of ${input.cropName} during the ${stage.stageName}.`,
                config: { responseModalities: ['TEXT', 'IMAGE'] },
            });
            return { ...stage, imageUrl: media.url! };
        })
    );

    const diseasePlanWithImages = Promise.all(
        output.diseasePlan.map(async (disease) => {
            const {media} = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: `A clear, high-quality photograph showing the symptoms of ${disease.diseaseName} on a ${input.cropName} plant.`,
                config: { responseModalities: ['TEXT', 'IMAGE'] },
            });
            return { ...disease, imageUrl: media.url! };
        })
    );
    
    const [fertilizerPlan, diseasePlan] = await Promise.all([fertilizerPlanWithImages, diseasePlanWithImages]);
    
    return {
      fertilizerPlan,
      diseasePlan,
    };
  }
);
