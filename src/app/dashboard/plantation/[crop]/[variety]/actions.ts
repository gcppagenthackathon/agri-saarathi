
'use server';

import { getPlantationAdvice, PlantationAdvisorInput, PlantationAdvisorOutput } from '@/ai/flows/plantation-advisor';

export async function fetchPlantationAdvice(input: PlantationAdvisorInput): Promise<PlantationAdvisorOutput | { error: string }> {
  try {
    const result = await getPlantationAdvice(input);
    if ('error' in result) {
      // This will happen if the flow itself returns an error object (e.g., from a catch block)
      return { error: result.error };
    }
    return result;
  } catch (e: any) {
    // This will catch unexpected errors during the action's execution
    return { error: e.message || 'Failed to fetch plantation advice. Please try again.' };
  }
}
