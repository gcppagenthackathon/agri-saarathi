
'use server';

import { getPersonalizedContent, PersonalizedContentInput, PersonalizedContentOutput } from '@/ai/flows/personalized-content';
import { getSpokenResponse, SpokenResponseOutput } from '@/ai/flows/spoken-response';

export async function fetchPersonalizedContent(input: PersonalizedContentInput): Promise<PersonalizedContentOutput | { error: string }> {
  try {
    const result = await getPersonalizedContent(input);
    return result;
  } catch (e) {
    // console.error(e);
    return { error: 'Failed to fetch personalized content. Please try again.' };
  }
}

export async function fetchSpokenResponse(query: string): Promise<SpokenResponseOutput | { error: string }> {
    try {
        if (!query) {
            return { error: 'Query is missing.' };
        }
        const result = await getSpokenResponse(query);
        return result;
    } catch (e) {
        // console.error(e);
        return { error: 'Failed to generate spoken response. Please try again.' };
    }
}
