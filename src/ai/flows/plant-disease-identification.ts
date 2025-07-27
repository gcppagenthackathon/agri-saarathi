
'use server';
/**
 * @fileOverview A plant disease identification AI agent.
 *
 * - identifyPlantDisease - A function that handles the plant disease identification process.
 * - IdentifyPlantDiseaseInput - The input type for the identifyPlantdisease function.
 * - IdentifyPlantDiseaseOutput - The return type for the identifyPlantDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPlantDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type IdentifyPlantDiseaseInput = z.infer<typeof IdentifyPlantDiseaseInputSchema>;

const TreatmentDaySchema = z.object({
    day: z.number().describe('The day number of the treatment plan.'),
    tasks: z.array(z.object({
        id: z.string().describe('A unique ID for the task.'),
        description: z.string().describe('A description of the task to be performed.'),
    })).describe('A list of tasks for this day.'),
});

const IdentifyPlantDiseaseOutputSchema = z.object({
  plantName: z.string().describe('The name of the crop or plant. If no plant is found, return "Unknown".'),
  diseaseName: z.string().describe('The identified disease name. Return "None" if healthy or if no plant is found.'),
  summary: z.string().describe('A brief summary of the findings. If no plant is detected, state that clearly.'),
  treatmentSummary: z.string().describe('A brief summary of the treatment steps. Should be empty if no disease is found.'),
  treatmentPlan: z.array(TreatmentDaySchema).describe('A day-wise treatment plan. Should be empty if no disease is found.'),
});
export type IdentifyPlantDiseaseOutput = z.infer<typeof IdentifyPlantDiseaseOutputSchema>;

export async function identifyPlantDisease(input: IdentifyPlantDiseaseInput): Promise<IdentifyPlantDiseaseOutput> {
  return identifyPlantDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPlantDiseasePrompt',
  input: {schema: IdentifyPlantDiseaseInputSchema},
  output: {schema: IdentifyPlantDiseaseOutputSchema},
  prompt: `You are an expert in plant pathology. Analyze the provided image and respond in JSON format.

Your tasks are:
1.  **Identify the plant:** Determine the common name of the plant in the image. If you cannot identify a plant, set 'plantName' to "Unknown".
2.  **Diagnose the plant's health:**
    *   **If a disease is present:** Identify the disease name. Provide a 'summary' describing the visual symptoms you see in the image that lead to your diagnosis. Provide a brief 'treatmentSummary' outlining the overall approach. Then, create a detailed, day-by-day 'treatmentPlan' with specific, actionable tasks. Each task must have a unique 'id' and a 'description'.
    *   **If the plant is healthy:** Set 'diseaseName' to "None". The 'summary' should confirm the plant appears healthy. The 'treatmentSummary' and 'treatmentPlan' should be empty.
    *   **If no plant is found:** Set 'plantName' to "Unknown" and 'diseaseName' to "None". The 'summary' should state that you could not detect a plant or crop in the image. 'treatmentSummary' and 'treatmentPlan' should be empty.

Here is the plant leaf image: {{media url=photoDataUri}}`,
});

const identifyPlantDiseaseFlow = ai.defineFlow(
  {
    name: 'identifyPlantDiseaseFlow',
    inputSchema: IdentifyPlantDiseaseInputSchema,
    outputSchema: IdentifyPlantDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Could not get a response from the disease identification model.');
    }
    return output;
  }
);
