'use server';
/**
 * @fileOverview A flow for verifying treatment progress from an image.
 *
 * - verifyTreatmentProgress - Verifies the treatment progress.
 * - VerifyTreatmentProgressInput - Input schema for the verification flow.
 * - VerifyTreatmentProgressOutput - Output schema for the verification flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyTreatmentProgressInputSchema = z.object({
  image: z.string().describe("A photo of the plant showing treatment progress, as a data URI."),
  task: z.string().describe("The specific task that the user claims to have completed."),
  disease: z.string().describe("The disease being treated."),
});
export type VerifyTreatmentProgressInput = z.infer<typeof VerifyTreatmentProgressInputSchema>;

const VerifyTreatmentProgressOutputSchema = z.object({
  verified: z.boolean().describe("Whether the AI has verified the completion of the task."),
  feedback: z.string().describe("Feedback or further suggestions for the user based on the image."),
});
export type VerifyTreatmentProgressOutput = z.infer<typeof VerifyTreatmentProgressOutputSchema>;


export async function verifyTreatmentProgress(input: VerifyTreatmentProgressInput): Promise<VerifyTreatmentProgressOutput> {
    return verifyTreatmentProgressFlow(input);
}

const prompt = ai.definePrompt({
    name: 'verifyTreatmentProgressPrompt',
    input: {schema: VerifyTreatmentProgressInputSchema},
    output: {schema: VerifyTreatmentProgressOutputSchema},
    prompt: `You are an expert plant pathologist. A farmer is treating a plant for '{{disease}}' and has completed the task: '{{task}}'.
    
    Based on the provided image, please verify if the task appears to be completed correctly and if the plant's condition is improving.
    
    Image of progress: {{media url=image}}
    
    Provide a boolean 'verified' status and concise 'feedback' for the farmer. If the image doesn't clearly show the task is done, set verified to false and explain what you need to see.`,
});


const verifyTreatmentProgressFlow = ai.defineFlow(
  {
    name: 'verifyTreatmentProgressFlow',
    inputSchema: VerifyTreatmentProgressInputSchema,
    outputSchema: VerifyTreatmentProgressOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
