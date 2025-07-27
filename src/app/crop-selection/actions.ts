
'use server';

import { getRegionalCrops, RegionalCropSuggestionInput, RegionalCropSuggestionOutput } from '@/ai/flows/regional-crop-suggestion';

export async function fetchRegionalCrops(input: RegionalCropSuggestionInput): Promise<RegionalCropSuggestionOutput | { error: string }> {
  try {
    const result = await getRegionalCrops(input);
    return result;
  } catch (e) {
    // console.error(e);
    return { error: 'Failed to fetch regional crops. Please try again.' };
  }
}
