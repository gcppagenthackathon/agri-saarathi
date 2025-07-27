
'use server';

import { getFieldEnhancements, FieldEnhancementsOutput } from '@/ai/flows/field-enhancements';
import { createSocialPoster, CreateSocialPosterOutput } from '@/ai/flows/create-social-poster';

export async function fetchFieldEnhancements(cropName: string): Promise<FieldEnhancementsOutput | { error: string }> {
  try {
    const result = await getFieldEnhancements({ cropName });
    return result;
  } catch (e) {
    // console.error(e);
    return { error: 'Failed to fetch field enhancements. Please try again.' };
  }
}

export async function generateSocialPoster(cropName: string): Promise<CreateSocialPosterOutput | { error: string }> {
  try {
    const result = await createSocialPoster({ cropName });
    return result;
  } catch (e) {
    // console.error(e);
    return { error: 'Failed to generate social media poster. Please try again.' };
  }
}
